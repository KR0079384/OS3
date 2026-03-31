import typer
import requests
import json
import time
import sys
import subprocess
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / "backend"

VENV_DIR = BACKEND_DIR / "venv"

if os.name == "nt":
    PYTHON_PATH = VENV_DIR / "Scripts" / "python.exe"
else:
    PYTHON_PATH = VENV_DIR / "bin" / "python"


from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.tree import Tree

app = typer.Typer()
console = Console()

API_URL = "http://127.0.0.1:8000/api/scan-package"


# ------------------------------------------------
# BACKEND AUTO START
# ------------------------------------------------


def ensure_backend_running():

    # ✅ Check if Python is installed
    try:
        subprocess.run(
            ["python", "--version"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True
        )
    except:
        console.print("\n[bold red]❌ Python is not installed[/bold red]")
        console.print("[yellow]👉 Please install Python 3.10+ from https://python.org[/yellow]\n")
        raise typer.Exit()

    # ✅ Check if backend already running
    try:
        requests.get("http://127.0.0.1:8000/docs", timeout=2)
        return
    except:
        console.print("[yellow]Starting OS³ backend server...[/yellow]")

    backend_dir = str(BACKEND_DIR)
    venv_dir = str(VENV_DIR)

    # OS-specific python path
    if os.name == "nt":
        venv_python = os.path.join(venv_dir, "Scripts", "python.exe")
    else:
        venv_python = os.path.join(venv_dir, "bin", "python")

    # -------------------------
    # STEP 1 — Create venv
    # -------------------------
    if not os.path.exists(venv_dir):
        console.print("[cyan]Creating backend virtual environment...[/cyan]")

        subprocess.run(
            [sys.executable, "-m", "venv", "venv"],
            cwd=backend_dir,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True
        )

    # -------------------------
    # STEP 2 — Install deps
    # -------------------------
    if not os.path.exists(venv_python):
        console.print("[red]Backend Python not found[/red]")
        raise typer.Exit()

    flag_file = os.path.join(venv_dir, ".installed")

    if not os.path.exists(flag_file):
        console.print("[cyan]Installing backend dependencies...[/cyan]")

        subprocess.run(
            [venv_python, "-m", "pip", "install", "-r", "requirements.txt"],
            cwd=backend_dir,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True
        )

        with open(flag_file, "w") as f:
            f.write("done")

    # -------------------------
    # STEP 3 — Start backend
    # -------------------------
    console.print("[cyan]Launching backend server...[/cyan]")

    subprocess.Popen(
        [
            venv_python,
            "-m",
            "uvicorn",
            "main:app",
            "--port",
            "8000"
        ],
        cwd=backend_dir,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )

    # -------------------------
    # STEP 4 — Wait for server
    # -------------------------
    for _ in range(15):
        try:
            requests.get("http://127.0.0.1:8000/docs", timeout=2)
            console.print("[green]Backend started successfully[/green]")
            return
        except:
            time.sleep(1)

    console.print("[red]Backend failed to start[/red]")
    raise typer.Exit()

# ------------------------------------------------
# API CALL
# ------------------------------------------------

def fetch_scan(package: str):

    ensure_backend_running()

    # 🔥 NEW — suspicious warning
    if is_suspicious_package(package):
        console.print("\n[yellow]⚠ Warning: This package looks suspicious or invalid[/yellow]\n")

    try:
        response = requests.post(
            API_URL,
            json={"package_name": package},
            timeout=60
        )

    except requests.exceptions.RequestException as e:
        console.print(f"[bold red]API connection error:[/bold red] {e}")
        raise typer.Exit()

    # 🔥 IMPROVED ERROR
    if response.status_code != 200:
        console.print("[bold red]❌ Package not found or invalid[/bold red]")
        raise typer.Exit()

    data = response.json()

    if "error" in data:
        console.print(f"[bold red]❌ {data.get('message')}[/bold red]")
        raise typer.Exit()

    return data

def fetch_npm_info(package: str):
    try:
        res = requests.get(f"https://registry.npmjs.org/{package}", timeout=5)

        if res.status_code != 200:
            return None

        data = res.json()

        latest_version = data.get("dist-tags", {}).get("latest")
        versions = data.get("versions", {})

        return {
            "latest_version": latest_version,
            "version_count": len(versions),
            "time": data.get("time", {})
        }

    except:
        return None

def fetch_downloads(package: str):
    try:
        res = requests.get(
            f"https://api.npmjs.org/downloads/point/last-week/{package}",
            timeout=5
        )
        if res.status_code == 200:
            return res.json().get("downloads", 0)
    except:
        return 0

    return 0

def evaluate_package(package: str):

    npm_info = fetch_npm_info(package)
    downloads = fetch_downloads(package)

    if not npm_info:
        return "❌ Not found on npm", 0

    score = 100

    # Low downloads → suspicious
    if downloads < 100:
        score -= 40
    elif downloads < 1000:
        score -= 20

    # Very few versions → immature
    if npm_info["version_count"] < 5:
        score -= 20

    # Final verdict
    if score < 40:
        return "🚨 HIGH RISK (Possible fake package)", score
    elif score < 70:
        return "⚠ Moderate Risk", score
    else:
        return "✅ Trusted Package", score


# ------------------------------------------------
# SECURITY SCORE MODEL
# ------------------------------------------------

def calculate_score(dependencies, critical, high, medium, low, attack_paths):

    vulnerability_penalty = (
        critical * 10 +
        high * 7 +
        medium * 4 +
        low * 1
    )

    attack_penalty = len(attack_paths) * 3
    dependency_penalty = int(len(dependencies) / 8)

    score = 100 - (vulnerability_penalty + attack_penalty + dependency_penalty)

    return max(0, score), vulnerability_penalty, attack_penalty, dependency_penalty


def risk_level(score):

    if score >= 80:
        return "[green]SECURE[/green]"
    elif score >= 60:
        return "[yellow]MODERATE RISK[/yellow]"
    elif score >= 40:
        return "[orange3]HIGH RISK[/orange3]"
    else:
        return "[red]CRITICAL RISK[/red]"


# ------------------------------------------------
# REPORT GENERATOR
# ------------------------------------------------

def generate_report(
    filename,
    package,
    dependencies,
    critical,
    high,
    medium,
    low,
    attack_paths,
    score,
    status
):

    report_data = {
        "package": package,
        "dependencies": len(dependencies),
        "severity": {
            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low
        },
        "attack_paths": attack_paths,
        "security_score": score,
        "risk_level": status
    }

    if filename.endswith(".json"):

        with open(filename, "w") as f:
            json.dump(report_data, f, indent=4)

    else:

        content = f"""
OS3 SECURITY AUDIT REPORT
=========================

Package: {package}

Dependencies: {len(dependencies)}

Severity
--------
Critical: {critical}
High: {high}
Medium: {medium}
Low: {low}

Attack Paths
------------
"""

        for path in attack_paths[:10]:
            content += " -> ".join(path) + "\n"

        content += f"""

Security Score: {score}/100
Risk Level: {status}

Recommendations
---------------
Upgrade vulnerable dependencies
Patch high severity packages
Avoid vulnerable transitive dependencies
"""

        with open(filename, "w") as f:
            f.write(content)


# ------------------------------------------------
# MAIN SCAN COMMAND
# ------------------------------------------------

@app.command()
def scan(package: str, report: str = typer.Option(None, help="Export report file")):

    start_time = time.time()

    console.rule("[bold cyan]OS³ Supply Chain Security Scanner")

    console.print(f"\n[bold cyan]Scanning package:[/bold cyan] {package}\n")

    # 🔥 NEW — NPM TRUST FIRST (better UX)
    status_msg, trust_score = evaluate_package(package)

    console.print(Panel(
        f"{status_msg}\nTrust Score: {trust_score}/100",
        title="NPM Trust Analysis",
        border_style="cyan"
    ))

    # 🚨 Suspicious names warning
    if package.lower() in ["test", "example", "demo"]:
        console.print("[yellow]⚠ This package name is commonly used and may be unsafe[/yellow]\n")

    data = fetch_scan(package)

    dependencies = data.get("dependencies", [])
    vulnerabilities = data.get("vulnerability_details", [])
    attack_paths = data.get("attack_paths", [])

    # 🚨 Low-quality package warning
    if len(dependencies) < 5:
        console.print("[yellow]⚠ Low dependency ecosystem — possible low-quality package[/yellow]\n")

    # remove duplicate vulnerabilities
    seen_ids = set()
    unique_vulns = []

    for v in vulnerabilities:
        vid = v.get("id") or v.get("summary")
        if vid not in seen_ids:
            seen_ids.add(vid)
            unique_vulns.append(v)

    vulnerabilities = unique_vulns

    critical = high = medium = low = 0

    for vuln in vulnerabilities:

        severity = vuln.get("database_specific", {}).get("severity", "").upper()

        if severity == "CRITICAL":
            critical += 1
        elif severity == "HIGH":
            high += 1
        elif severity in ["MEDIUM", "MODERATE"]:
            medium += 1
        elif severity == "LOW":
            low += 1

    total_vulns = critical + high + medium + low

    score, vulnerability_penalty, attack_penalty, dependency_penalty = calculate_score(
        dependencies,
        critical,
        high,
        medium,
        low,
        attack_paths
    )

    status = risk_level(score)

    # ---------------- TABLE ----------------
    table = Table(title=f"OS³ Security Report — {package}")
    table.add_column("Metric", style="cyan")
    table.add_column("Value", style="magenta")

    table.add_row("Dependencies Found", str(len(dependencies)))
    table.add_row("Total Vulnerabilities", str(total_vulns))
    table.add_row("Critical", str(critical))
    table.add_row("High", str(high))
    table.add_row("Medium", str(medium))
    table.add_row("Low", str(low))
    table.add_row("Attack Paths", str(len(attack_paths)))
    table.add_row("Security Score", f"{score}/100")
    table.add_row("Risk Level", status)

    console.print(table)

    # ---------------- BREAKDOWN ----------------
    console.print("\n[bold yellow]Security Score Breakdown[/bold yellow]\n")

    breakdown = Table()
    breakdown.add_column("Factor")
    breakdown.add_column("Penalty")

    breakdown.add_row("Critical Vulnerabilities", f"-{critical*10}")
    breakdown.add_row("High Vulnerabilities", f"-{high*7}")
    breakdown.add_row("Medium Vulnerabilities", f"-{medium*4}")
    breakdown.add_row("Low Vulnerabilities", f"-{low*1}")
    breakdown.add_row("Attack Paths", f"-{attack_penalty}")
    breakdown.add_row("Dependency Complexity", f"-{dependency_penalty}")

    console.print(breakdown)

    # ---------------- ATTACK PATHS ----------------
    if attack_paths:

        console.print("\n[bold red]Potential Attack Paths[/bold red]\n")

        for path in attack_paths[:5]:
            console.print(" → ".join(path))

    else:
        console.print("\n[green]No attack paths detected.[/green]")

    # ---------------- VULNERABILITIES ----------------
    if vulnerabilities:

        console.print("\n[bold yellow]Top Vulnerabilities[/bold yellow]\n")

        for vuln in vulnerabilities[:5]:

            summary = vuln.get("summary", "No description")
            severity = vuln.get("database_specific", {}).get("severity", "UNKNOWN")
            pkg = vuln.get("package", "dependency")

            console.print(
                Panel(
                    summary,
                    title=f"{pkg} | Severity: {severity}",
                    expand=False
                )
            )

    # ---------------- REPORT ----------------
    if report:

        generate_report(
            report,
            package,
            dependencies,
            critical,
            high,
            medium,
            low,
            attack_paths,
            score,
            status
        )

        console.print(f"\n[bold green]Report saved to:[/bold green] {report}")

    end_time = time.time()
    console.print(f"\n[dim]Scan completed in {round(end_time-start_time,2)} seconds[/dim]")


# ------------------------------------------------
# GRAPH COMMAND
# ------------------------------------------------

@app.command()
def graph(package: str):

    console.print(f"\n[bold cyan]Dependency Graph:[/bold cyan] {package}\n")

    data = fetch_scan(package)

    dependencies = data.get("dependencies", [])

    tree = Tree(package)

    for dep in dependencies[:15]:
        tree.add(dep)

    console.print(tree)


@app.command()
def check_python_installed():
    try:
        subprocess.run(
            ["python", "--version"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True
        )
    except:
        console.print("\n[bold red]❌ Python is not installed[/bold red]")
        console.print("[yellow]👉 Please install Python 3.10+ from https://python.org[/yellow]\n")
        raise typer.Exit()

def is_suspicious_package(package: str):
    suspicious_keywords = ["test", "example", "demo", "fake"]

    if package.lower() in suspicious_keywords:
        return True

    if len(package) < 2:
        return True

    return False

# ------------------------------------------------
# INSTALL CHECK
# ------------------------------------------------

@app.command()
def check_install(package: str):

    console.print(f"\n[bold cyan]Checking package before install:[/bold cyan] {package}")

    data = fetch_scan(package)

    score = data.get("security_score", 0)

    if score < 40:
        console.print("\n[bold red]⚠ Security Warning[/bold red]")
        console.print("Package has serious vulnerabilities")

    elif score < 70:
        console.print("\n[yellow]⚠ Moderate risk detected[/yellow]")

    else:
        console.print("\n[green]Package appears safe[/green]")




if __name__ == "__main__":
    app()
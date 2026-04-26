import typer
import requests
import json
import time
import subprocess

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.tree import Tree

from os3.scan import run_package_scan
from os3.engine.osv import count_severity

app = typer.Typer()
console = Console()


# ------------------------------------------------
# LOCAL SCAN (no backend)
# ------------------------------------------------


def load_scan_result(package: str):
    if is_suspicious_package(package):
        console.print("\n[yellow]⚠ Warning: This package looks suspicious or invalid[/yellow]\n")

    data = run_package_scan(package)
    if data.get("error") == "package_not_found":
        console.print(f"[bold red]❌ {data.get('message', 'Package not found')}[/bold red]")
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
            "time": data.get("time", {}),
        }

    except Exception:
        return None


def fetch_downloads(package: str):
    try:
        res = requests.get(
            f"https://api.npmjs.org/downloads/point/last-week/{package}",
            timeout=5,
        )
        if res.status_code == 200:
            return res.json().get("downloads", 0)
    except Exception:
        return 0

    return 0


def evaluate_package(package: str):

    npm_info = fetch_npm_info(package)
    downloads = fetch_downloads(package)

    if not npm_info:
        return "❌ Not found on npm", 0

    score = 100

    if downloads < 100:
        score -= 40
    elif downloads < 1000:
        score -= 20

    if npm_info["version_count"] < 5:
        score -= 20

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
    total = critical + high + medium + low

    if total > 0:
        critical_ratio = critical / total
        high_ratio = high / total
        medium_ratio = medium / total
        low_ratio = low / total

        vuln_penalty = (
            critical_ratio * 40
            + high_ratio * 25
            + medium_ratio * 15
            + low_ratio * 5
        )
    else:
        vuln_penalty = 0

    dep_count = len(dependencies)

    if dep_count > 50:
        dep_penalty = 10
    elif dep_count > 20:
        dep_penalty = 5
    else:
        dep_penalty = 0

    attack_penalty = min(len(attack_paths) * 2, 10)

    score = 100 - vuln_penalty - dep_penalty - attack_penalty

    trust_boost = 5 if dep_count > 20 else 0
    score += trust_boost

    score = min(max(score, 20), 100)

    return int(round(score)), vuln_penalty, attack_penalty, dep_penalty, trust_boost


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
    status,
):

    report_data = {
        "package": package,
        "dependencies": len(dependencies),
        "severity": {
            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low,
        },
        "attack_paths": attack_paths,
        "security_score": score,
        "risk_level": status,
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

    status_msg, trust_score = evaluate_package(package)

    console.print(
        Panel(
            f"{status_msg}\nTrust Score: {trust_score}/100",
            title="NPM Trust Analysis",
            border_style="cyan",
        )
    )

    if package.lower() in ["test", "example", "demo"]:
        console.print("[yellow]⚠ This package name is commonly used and may be unsafe[/yellow]\n")

    data = load_scan_result(package)

    dependencies = data.get("dependencies", [])
    vulnerabilities = data.get("vulnerability_details", [])
    attack_paths = data.get("attack_paths", [])

    if len(dependencies) < 5:
        console.print("[yellow]⚠ Low dependency ecosystem — possible low-quality package[/yellow]\n")

    sev = count_severity(vulnerabilities)
    critical = sev["CRITICAL"]
    high = sev["HIGH"]
    medium = sev["MEDIUM"]
    low = sev["LOW"]
    total_vulns = len(vulnerabilities)

    score, vuln_penalty, attack_penalty, dep_penalty, trust_boost = calculate_score(
        dependencies,
        critical,
        high,
        medium,
        low,
        attack_paths,
    )

    status = risk_level(score)

    table = Table(title=f"OS³ Security Report — {package}")
    table.add_column("Metric", style="cyan")
    table.add_column("Value", style="magenta")

    table.add_row("Dependencies Found", str(len(dependencies)))
    table.add_row("Total Vulnerabilities", str(total_vulns))
    table.add_row("Critical / High / Med / Low", f"{critical} / {high} / {medium} / {low}")
    table.add_row("Attack Paths (count)", str(len(attack_paths)))
    table.add_row("Security Score", f"{score}/100")
    table.add_row("Risk Level", status)

    console.print(table)

    console.print("\n[bold yellow]Security Score Breakdown[/bold yellow]\n")

    breakdown = Table(show_header=True, header_style="bold")
    breakdown.add_column("Component", style="cyan", no_wrap=True)
    breakdown.add_column("Effect", style="magenta")

    breakdown.add_row("Total vulnerabilities", str(total_vulns))
    breakdown.add_row(
        "Severity breakdown (C / H / M / L)",
        f"{critical} / {high} / {medium} / {low}",
    )
    breakdown.add_row(
        "Vulnerability penalty (ratio-based)",
        f"-{vuln_penalty:.1f}",
    )
    breakdown.add_row("Dependency penalty (capped)", f"-{dep_penalty}")
    breakdown.add_row("Attack path penalty (capped)", f"-{attack_penalty}")
    if trust_boost > 0:
        breakdown.add_row("Trust boost (large ecosystem)", f"+{trust_boost}")
    else:
        breakdown.add_row("Trust boost (large ecosystem)", "—")

    console.print(breakdown)

    if attack_paths:

        console.print("\n[bold red]Potential Attack Paths[/bold red]\n")

        for path in attack_paths[:5]:
            console.print(" → ".join(path))

    else:
        console.print("\n[green]No attack paths detected.[/green]")

    if vulnerabilities:

        console.print("\n[bold yellow]Top 3 vulnerabilities[/bold yellow]\n")

        for vuln in vulnerabilities[:3]:
            vid = vuln.get("id", "unknown")
            summary = vuln.get("summary", "No description")
            sev_label = vuln.get("severity", "LOW")
            console.print(
                Panel(
                    summary,
                    title=f"{vid} | {sev_label}",
                    expand=False,
                )
            )

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
            status,
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

    data = load_scan_result(package)

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
            check=True,
        )
    except Exception:
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

    data = load_scan_result(package)

    vulns = data.get("vulnerability_details", [])
    sev = count_severity(vulns)
    deps = data.get("dependencies", [])
    paths = data.get("attack_paths", [])
    score, _, _, _, _ = calculate_score(
        deps,
        sev["CRITICAL"],
        sev["HIGH"],
        sev["MEDIUM"],
        sev["LOW"],
        paths,
    )

    if score < 40:
        console.print("\n[bold red]⚠ Security Warning[/bold red]")
        console.print("Package has serious vulnerabilities")

    elif score < 70:
        console.print("\n[yellow]⚠ Moderate risk detected[/yellow]")

    else:
        console.print("\n[green]Package appears safe[/green]")


if __name__ == "__main__":
    app()

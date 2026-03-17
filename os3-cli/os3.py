import typer
import requests
import json
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.tree import Tree

app = typer.Typer()
console = Console()

API_URL = "http://127.0.0.1:8000/api/scan-package"


def fetch_scan(package: str):

    try:
        response = requests.post(
            API_URL,
            json={"package_name": package},
            timeout=120
        )
    except requests.exceptions.RequestException as e:
        console.print(f"[bold red]API connection error:[/bold red] {e}")
        raise typer.Exit()

    if response.status_code != 200:
        console.print(f"[bold red]API Error:[/bold red] {response.text}")
        raise typer.Exit()

    return response.json()


def calculate_score(dependencies, critical, high, medium, low, attack_paths):

    vulnerability_penalty = (
        critical * 15 +
        high * 10 +
        medium * 5 +
        low * 2
    )

    attack_penalty = len(attack_paths) * 5
    dependency_penalty = int(len(dependencies) / 5)

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

    # JSON REPORT
    if filename.endswith(".json"):

        with open(filename, "w") as f:
            json.dump(report_data, f, indent=4)

    # TEXT REPORT
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

    console.rule("[bold cyan]OS³ Supply Chain Security Scanner")

    console.print(f"\n[bold cyan]Scanning package:[/bold cyan] {package}\n")

    data = fetch_scan(package)

    dependencies = data.get("dependencies", [])
    vulnerabilities = data.get("vulnerability_details", [])
    attack_paths = data.get("attack_paths", [])

    critical = 0
    high = 0
    medium = 0
    low = 0

    dependency_risk = {}

    for vuln in vulnerabilities:

        severity = vuln.get("database_specific", {}).get("severity", "").upper()
        package_name = vuln.get("package", "unknown")

        dependency_risk.setdefault(package_name, "LOW")

        if severity == "CRITICAL":
            critical += 1
            dependency_risk[package_name] = "CRITICAL"

        elif severity == "HIGH":
            high += 1
            dependency_risk[package_name] = "HIGH"

        elif severity in ["MEDIUM", "MODERATE"]:
            medium += 1
            dependency_risk[package_name] = "MEDIUM"

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

    # --------------------------------
    # SCORE BREAKDOWN
    # --------------------------------

    console.print("\n[bold yellow]Security Score Breakdown[/bold yellow]\n")

    breakdown = Table()
    breakdown.add_column("Factor")
    breakdown.add_column("Penalty")

    breakdown.add_row("Critical Vulnerabilities", f"-{critical*15}")
    breakdown.add_row("High Vulnerabilities", f"-{high*10}")
    breakdown.add_row("Medium Vulnerabilities", f"-{medium*5}")
    breakdown.add_row("Low Vulnerabilities", f"-{low*2}")
    breakdown.add_row("Attack Paths", f"-{attack_penalty}")
    breakdown.add_row("Dependency Complexity", f"-{dependency_penalty}")

    console.print(breakdown)

    # --------------------------------
    # ATTACK PATHS
    # --------------------------------

    if attack_paths:

        console.print("\n[bold red]Potential Attack Paths[/bold red]\n")

        for path in attack_paths[:5]:
            console.print(" → ".join(path))

    else:

        console.print("\n[green]No attack paths detected.[/green]")

    # --------------------------------
    # VULNERABILITIES
    # --------------------------------

    if vulnerabilities:

        console.print("\n[bold yellow]Top Vulnerabilities[/bold yellow]\n")

        for vuln in vulnerabilities[:5]:

            summary = vuln.get("summary", "No description")
            severity = vuln.get("database_specific", {}).get("severity", "UNKNOWN")

            console.print(
                Panel(
                    summary,
                    title=f"Severity: {severity}",
                    expand=False
                )
            )

    # --------------------------------
    # REPORT EXPORT
    # --------------------------------

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


# ------------------------------------------------
# INSTALL CHECK COMMAND
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
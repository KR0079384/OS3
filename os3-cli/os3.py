import typer
import requests
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

app = typer.Typer()
console = Console()

API_URL = "http://127.0.0.1:8000/api/scan-package"


@app.command()
def scan(package: str):

    console.print(f"[bold cyan]Scanning package:[/bold cyan] {package}")

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

    data = response.json()

    dependencies = data.get("dependencies", [])
    vulnerabilities = data.get("vulnerability_details", [])
    attack_paths = data.get("attack_paths", [])

    critical = 0
    high = 0
    medium = 0
    low = 0

    for vuln in vulnerabilities:

        severity = vuln.get(
            "database_specific",
            {}
        ).get("severity", "").upper()

        if severity == "CRITICAL":
            critical += 1
        elif severity == "HIGH":
            high += 1
        elif severity in ["MODERATE", "MEDIUM"]:
            medium += 1
        elif severity == "LOW":
            low += 1

    total_vulns = critical + high + medium + low

    # -----------------------------
    # STANDARDIZED SCORING ENGINE
    # -----------------------------

    vulnerability_penalty = (
        critical * 15 +
        high * 10 +
        medium * 5 +
        low * 2
    )

    attack_penalty = len(attack_paths) * 5

    dependency_penalty = int(len(dependencies) / 5)

    security_score = 100 - (
        vulnerability_penalty +
        attack_penalty +
        dependency_penalty
    )

    security_score = max(0, security_score)

    # -----------------------------
    # RISK LEVEL
    # -----------------------------

    if security_score >= 80:
        status = "Secure"
    elif security_score >= 60:
        status = "Moderate Risk"
    elif security_score >= 40:
        status = "High Risk"
    else:
        status = "Critical Risk"

    table = Table(title=f"OS³ Security Report — {package}")

    table.add_column("Metric", style="cyan")
    table.add_column("Value", style="magenta")

    table.add_row("Dependencies Found", str(len(dependencies)))
    table.add_row("Total Vulnerabilities", str(total_vulns))
    table.add_row("Critical", str(critical))
    table.add_row("High", str(high))
    table.add_row("Medium", str(medium))
    table.add_row("Low", str(low))
    table.add_row("Attack Paths Found", str(len(attack_paths)))
    table.add_row("Security Score", f"{security_score}/100")
    table.add_row("Risk Level", status)

    console.print(table)

    # -----------------------------
    # SCORE BREAKDOWN
    # -----------------------------

    console.print("\n[bold yellow]Security Score Breakdown:[/bold yellow]\n")

    breakdown = Table()

    breakdown.add_column("Factor")
    breakdown.add_column("Penalty")

    breakdown.add_row("Critical Vulnerabilities", f"-{critical * 15}")
    breakdown.add_row("High Vulnerabilities", f"-{high * 10}")
    breakdown.add_row("Medium Vulnerabilities", f"-{medium * 5}")
    breakdown.add_row("Low Vulnerabilities", f"-{low * 2}")
    breakdown.add_row("Attack Paths", f"-{attack_penalty}")
    breakdown.add_row("Dependency Complexity", f"-{dependency_penalty}")

    console.print(breakdown)

    # -----------------------------
    # ATTACK PATHS
    # -----------------------------

    if attack_paths:

        console.print("\n[bold red]Potential Attack Paths:[/bold red]\n")

        for path in attack_paths[:5]:
            console.print(" → ".join(path))

    else:

        console.print("\n[green]No attack paths detected.[/green]")

    # -----------------------------
    # TOP VULNERABILITIES
    # -----------------------------

    if vulnerabilities:

        console.print("\n[bold yellow]Top Vulnerabilities:[/bold yellow]\n")

        for vuln in vulnerabilities[:5]:

            summary = vuln.get("summary", "No description")

            severity = vuln.get(
                "database_specific",
                {}
            ).get("severity", "UNKNOWN")

            console.print(
                Panel(
                    summary,
                    title=f"Severity: {severity}",
                    expand=False
                )
            )


if __name__ == "__main__":
    app()
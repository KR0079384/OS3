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
        severity = vuln.get("database_specific", {}).get("severity", "").upper()

        if severity == "CRITICAL":
            critical += 1
        elif severity == "HIGH":
            high += 1
        elif severity in ["MODERATE", "MEDIUM"]:
            medium += 1
        elif severity == "LOW":
            low += 1

    total_vulns = critical + high + medium + low

    # Improved scoring formula
    risk = (
        critical * 10 +
        high * 5 +
        medium * 3 +
        low * 1
    )

    security_score = max(5, 100 - risk)

    # Determine risk level
    if security_score >= 80:
        status = "Low Risk"
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

    # Attack paths section
    if attack_paths:
        console.print("\n[bold red]Potential Attack Paths:[/bold red]\n")

        for path in attack_paths[:5]:
            console.print(" → ".join(path))

    else:
        console.print("\n[green]No attack paths detected.[/green]")

    # Top vulnerabilities section
    if vulnerabilities:
        console.print("\n[bold yellow]Top Vulnerabilities:[/bold yellow]\n")

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


if __name__ == "__main__":
    app()
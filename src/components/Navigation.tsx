import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/scan", label: "Scan" },
  { path: "/dashboard", label: "Dashboard" },
  { path: "/graph", label: "Dependency Graph" },
  { path: "/vulnerabilities", label: "Vulnerabilities" },
  { path: "/copilot", label: "AI Copilot" },
  { path: "/recommendations", label: "Recommendations" },
];

export const Navigation = () => {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/30 glow-blue">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-foreground">OS³</span>
            <span className="text-[10px] text-muted-foreground leading-none">Security Score</span>
          </div>
        </Link>

        <nav className="flex items-center gap-0.5">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-all rounded-md",
                location.pathname === item.path
                  ? "text-primary bg-primary/10 border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

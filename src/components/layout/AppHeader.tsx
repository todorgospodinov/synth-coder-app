import { Link } from "@tanstack/react-router";
import { HeaderAuth } from "./HeaderAuth";

type NavItem = { label: string; to?: "/" | "/python" | "/java" | "/sql" };

const NAV_ITEMS: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Python", to: "/python" },
  { label: "Java", to: "/java" },
  { label: "SQL", to: "/sql" },
  { label: "AI Assist" },
  { label: "Pricing" },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-[13px] font-bold text-primary-foreground">
        &lt;/&gt;
      </span>
      <span className="text-[17px] font-semibold tracking-tight">
        CodeTrainer
      </span>
    </Link>
  );
}

export function AppHeader() {
  return (
    <header className="sticky top-4 z-20 mx-auto w-[min(1120px,92%)] rise">
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-3 shadow-glass backdrop-blur-xl">
        <Logo />

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          {NAV_ITEMS.map((item) =>
            item.to ? (
              <Link
                key={item.label}
                to={item.to}
                activeOptions={{ exact: true, includeSearch: false }}
                className="transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={item.label}
                title="Coming soon"
                className="cursor-default transition-colors hover:text-foreground"
              >
                {item.label}
              </span>
            ),
          )}
        </nav>

        <HeaderAuth />
      </div>
    </header>
  );
}

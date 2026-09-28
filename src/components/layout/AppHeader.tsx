import { Link } from "@tanstack/react-router";

const NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "Tasks" },
  { label: "AI Assist" },
  { label: "Pricing" },
] as const;

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

        <div className="flex items-center gap-3">
          <button
            type="button"
            title="Coming soon"
            className="hidden cursor-default text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Sign in
          </button>
          <button
            type="button"
            title="Coming soon"
            className="cursor-default rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
          >
            Get started
          </button>
        </div>
      </div>
    </header>
  );
}

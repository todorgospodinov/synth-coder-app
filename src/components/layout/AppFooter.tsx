const FOOTER_LINKS = ["Tasks", "AI Assist", "Pricing", "Docs"] as const;

export function AppFooter() {
  return (
    <footer className="relative z-10 border-t border-border bg-card backdrop-blur-xl">
      <div className="mx-auto w-[min(1120px,92%)] py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-[11px] font-bold text-primary-foreground">
              &lt;/&gt;
            </span>
            <span className="text-sm font-medium">CodeTrainer</span>
          </div>

          <nav className="flex items-center gap-6 text-xs text-muted-foreground">
            {FOOTER_LINKS.map((label) => (
              <span
                key={label}
                title="Coming soon"
                className="cursor-default transition-colors hover:text-foreground"
              >
                {label}
              </span>
            ))}
          </nav>

          <span className="font-mono text-[11px] text-muted-foreground">
            © 2026 CodeTrainer
          </span>
        </div>
      </div>
    </footer>
  );
}

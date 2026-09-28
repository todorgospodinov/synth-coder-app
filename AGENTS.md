<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture decisions

- **App shell in `src/routes/__root.tsx`** renders `BackgroundGlow`, `AppHeader`, `<Outlet />`, `AppFooter` around every route; shell pieces live as modular components in `src/components/layout/` — keeps pages focused on content and the chrome consistent.
- **Design system only in `src/styles.css`** ("Cool glass depth": dark navy, indigo `--primary`, cyan `--accent`, violet `--violet`, frosted `--card`; Sora + JetBrains Mono loaded via `<link>` in `__root`). Never hardcode colors in components.
- **Multi-page structure**: each screen is its own route file under `src/routes/` (TanStack file-based routing); no SPA page-switcher.
- **Supabase is planned but not connected yet** — no backend code until the user asks for a step that needs persistence.

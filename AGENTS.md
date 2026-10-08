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

- **Auth via Lovable Cloud email/password**; profile data (full_name) lives only in auth `user_metadata` — no profiles table, per user requirement. Protected pages go under `src/routes/_authenticated/` (gate redirects to `/login`).
- **Python runs in the browser via Pyodide (WebAssembly, CDN-loaded in `src/lib/python-runner.ts`)** — the server runtime can't run a real Python process, and this keeps user code off the server.
- **AI solution check = `checkSolution` server fn (signed-in only) calling Lovable AI Gateway with `google/gemini-3-flash-preview`** — user asked for Gemini; auth gate limits AI cost abuse.
- **Admins = `app_metadata.is_admin === true`** (no roles table, per user requirement; app_metadata is only writable server-side). Admin pages live under `_authenticated/` with a `beforeLoad` isAdmin check.
- **First-admin bootstrap = `createFirstAdmin` server fn (not an edge function — stack rule)**; refuses when any user has `app_metadata.is_admin`, so it's one-time by construction. Button hides via `getAdminSetupStatus`.
- **Tasks live in `public.tasks` with `status` (for_review|published|rejected) + nullable `author_id`; `is_published` deprecated**. Users insert own for_review rows via RLS; admin publish/reject + list via `task-publishing.functions.ts` (claims is_admin check, then service client); public reads via publishable-key server fns in `src/lib/tasks.functions.ts` (RLS: published only). Home `/` is the task browser (3 recent / `?all` / `?q=`); details at `/tasks/$taskId` with a pre-filled Workspace.

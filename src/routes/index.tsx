import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CodeTrainer — Python tasks with AI assistance" },
      {
        name: "description",
        content:
          "Publish and solve Python programming tasks online, with an AI assistant that creates tasks and checks your solutions.",
      },
      {
        property: "og:title",
        content: "CodeTrainer — Python tasks with AI assistance",
      },
      {
        property: "og:description",
        content:
          "Publish and solve Python programming tasks online, with an AI assistant that creates tasks and checks your solutions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

/**
 * Home page — intentionally empty for now.
 * A single tagline placeholder marks the spot where content will land
 * in the next build step.
 */
function Index() {
  return (
    <main className="mx-auto flex w-[min(1120px,92%)] flex-1 flex-col items-center justify-center py-24 text-center">
      <div className="rise inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs text-muted-foreground">
        <span className="size-1.5 rounded-full bg-accent" />
        Workspace ready · Python
      </div>

      <h1 className="rise mt-6 max-w-[20ch] text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
        One clean editor, blinking on line one.
        <span className="caret-blink ml-0.5 inline-block h-[0.95em] w-[3px] translate-y-[2px] rounded-sm bg-accent" />
      </h1>

      <p className="rise mt-5 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
        CodeTrainer is being built — Python tasks and AI-assisted checking
        will appear here soon.
      </p>
    </main>
  );
}

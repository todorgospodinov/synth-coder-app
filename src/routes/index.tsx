import { createFileRoute } from "@tanstack/react-router";
import { FirstAdminSetup } from "@/components/admin/FirstAdminSetup";
import { Workspace } from "@/components/workspace/Workspace";

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

function Index() {
  return (
    <>
      <FirstAdminSetup />
      <Workspace />
    </>
  );
}

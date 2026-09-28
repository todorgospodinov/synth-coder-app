import { createFileRoute } from "@tanstack/react-router";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — CodeTrainer" },
      { name: "description", content: "Edit your CodeTrainer profile and change your password." },
      { property: "og:title", content: "Your profile — CodeTrainer" },
      { property: "og:description", content: "Edit your CodeTrainer profile and change your password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = Route.useRouteContext();
  return (
    <main className="mx-auto flex w-[min(1120px,92%)] flex-1 flex-col items-center gap-6 py-16">
      <EditProfileForm user={user} />
      <ChangePasswordForm email={user.email ?? ""} />
    </main>
  );
}

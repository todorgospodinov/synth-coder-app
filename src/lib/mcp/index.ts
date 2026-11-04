import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchTasks from "./tools/search-tasks";
import getTask from "./tools/get-task";
import listMyTasks from "./tools/list-my-tasks";
import submitTask from "./tools/submit-task";

// Vite inlines the stable ref; the published SUPABASE_URL may be a proxy.
const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "code-trainer-studio",
  title: "Code Trainer Studio",
  version: "0.1.0",
  instructions:
    "Tools for CodeTrainer, a platform of Python, Java and SQL programming exercises. Search and read published tasks, see your own submitted tasks, and submit new tasks for admin review.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchTasks, getTask, listMyTasks, submitTask],
});

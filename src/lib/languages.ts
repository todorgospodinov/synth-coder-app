export type Language = "python" | "java";

export const LANGUAGES: Record<Language, { label: string; file: string; path: "/python" | "/java" }> = {
  python: { label: "Python", file: "main.py · Python 3", path: "/python" },
  java: { label: "Java", file: "Main.java · Java 8", path: "/java" },
};

export function asLanguage(v: unknown): Language {
  return v === "java" ? "java" : "python";
}

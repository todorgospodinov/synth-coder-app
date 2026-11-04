export type Language = "python" | "java" | "sql";

export const LANGUAGES: Record<Language, { label: string; file: string; path: "/python" | "/java" | "/sql" }> = {
  python: { label: "Python", file: "main.py · Python 3", path: "/python" },
  java: { label: "Java", file: "Main.java · Java 8", path: "/java" },
  sql: { label: "SQL", file: "query.sql · SQLite", path: "/sql" },
};

export function asLanguage(v: unknown): Language {
  return v === "java" || v === "sql" ? v : "python";
}

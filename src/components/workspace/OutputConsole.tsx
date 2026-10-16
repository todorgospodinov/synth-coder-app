import type { RunResult } from "@/lib/python-runner";

/** Program output + stdin input, like an online interpreter's console. */
export function OutputConsole({
  result,
  running,
  stdin,
  onStdin,
}: {
  result: RunResult | null;
  running: boolean;
  stdin: string;
  onStdin: (v: string) => void;
}) {
  return (
    <div className="grid gap-px bg-border md:grid-cols-[1fr_260px]">
      <div className="min-h-[180px] bg-code p-4 font-mono text-[13px] leading-6">
        <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Output</div>
        {running && <div className="text-muted-foreground">Running…</div>}
        {!running && !result && <div className="text-muted-foreground">Press Run (Ctrl+Enter) to execute your code.</div>}
        {!running && result && (
          <>
            <pre className="whitespace-pre-wrap text-code-foreground">{result.stdout}</pre>
            {result.stderr && <pre className="whitespace-pre-wrap text-destructive">{result.stderr}</pre>}
            <div className="mt-2 text-xs text-muted-foreground">
              ...Program finished {result.ok ? "successfully" : "with errors"} in {result.ms} ms
            </div>
          </>
        )}
      </div>
      <label className="flex flex-col bg-code p-4">
        <span className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Input (stdin)</span>
        <textarea
          value={stdin}
          onChange={(e) => onStdin(e.target.value)}
          placeholder="Input lines read by your program"
          spellCheck={false}
          className="flex-1 resize-none rounded-md border border-input bg-transparent p-2 font-mono text-[13px] text-code-foreground outline-none focus:border-ring"
        />
      </label>
    </div>
  );
}

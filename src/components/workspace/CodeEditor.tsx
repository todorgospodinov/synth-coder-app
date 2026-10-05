import { useRef, type KeyboardEvent } from "react";

/** Lightweight code editor: line numbers, Tab = 4 spaces, Ctrl/Cmd+Enter runs. */
export function CodeEditor({
  value,
  onChange,
  onRun,
}: {
  value: string;
  onChange: (v: string) => void;
  onRun: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const gutter = useRef<HTMLDivElement>(null);
  const lineCount = value.split("\n").length;

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onRun();
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const { selectionStart: s, selectionEnd: end } = el;
      onChange(value.slice(0, s) + "    " + value.slice(end));
      requestAnimationFrame(() => el.setSelectionRange(s + 4, s + 4));
    }
  }

  return (
    <div className="flex h-full min-h-[360px] overflow-hidden bg-code font-mono text-[13.5px] leading-6 text-code-foreground">
      <div ref={gutter} aria-hidden className="select-none overflow-hidden border-r border-border px-3 py-3 text-right text-muted-foreground/60">
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        ref={ref}
        aria-label="Python code"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onScroll={(e) => {
          if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop;
        }}
        className="flex-1 resize-none whitespace-pre bg-transparent px-4 py-3 outline-none"
      />
    </div>
  );
}

/**
 * Browser-side Python interpreter (CPython compiled to WebAssembly via Pyodide).
 * Loaded lazily from CDN the first time code is run.
 */
const PYODIDE_VERSION = "0.27.2";
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

type Pyodide = {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (o: { batched: (s: string) => void }) => void;
  setStderr: (o: { batched: (s: string) => void }) => void;
  setStdin: (o: { stdin: () => string | undefined }) => void;
  version: string;
};

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<Pyodide>;
  }
}

let pyodidePromise: Promise<Pyodide> | null = null;

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load the Python interpreter."));
    document.head.appendChild(s);
  });
}

export function getPython(): Promise<Pyodide> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      if (!window.loadPyodide) await loadScript(`${PYODIDE_URL}pyodide.js`);
      return window.loadPyodide!({ indexURL: PYODIDE_URL });
    })().catch((e) => {
      pyodidePromise = null;
      throw e;
    });
  }
  return pyodidePromise;
}

export type RunResult = { stdout: string; stderr: string; ok: boolean; ms: number };

/** Runs Python code; `stdin` lines feed input() calls. */
export async function runPython(code: string, stdin: string): Promise<RunResult> {
  const py = await getPython();
  let stdout = "";
  let stderr = "";
  const lines = stdin.split("\n");
  let idx = 0;
  py.setStdout({ batched: (s) => (stdout += s + "\n") });
  py.setStderr({ batched: (s) => (stderr += s + "\n") });
  py.setStdin({ stdin: () => (idx < lines.length ? lines[idx++] : undefined) });
  const start = performance.now();
  let ok = true;
  try {
    // Fresh globals per run so runs don't leak state.
    await py.runPythonAsync(
      `import sys\n__ns = {"__name__": "__main__"}\nexec(compile(${JSON.stringify(code)}, "main.py", "exec"), __ns)`,
    );
  } catch (e) {
    ok = false;
    const msg = e instanceof Error ? e.message : String(e);
    // Trim Pyodide-internal frames; keep the user's traceback.
    const i = msg.indexOf('File "main.py"');
    stderr += i >= 0 ? "Traceback (most recent call last):\n  " + msg.slice(i) : msg;
  }
  return { stdout, stderr, ok, ms: Math.round(performance.now() - start) };
}

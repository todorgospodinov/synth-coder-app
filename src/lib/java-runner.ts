/**
 * Browser-side Java: CheerpJ (a JVM in WebAssembly) runs the real javac from tools.jar,
 * then a small runner class executes the compiled program with stdin/stdout redirected to files.
 */
import toolsJar from "@/assets/tools.jar.asset.json";
import type { RunResult } from "./python-runner";

const LOADER = "https://cjrtnc.leaningtech.com/4.3/loader.js";
const CP = "/str/tools.jar:/files/";

declare global {
  interface Window {
    cheerpjInit?: (o?: object) => Promise<void>;
    cheerpjRunMain?: (cls: string, cp: string, ...args: string[]) => Promise<number>;
    cheerpOSAddStringFile?: (path: string, data: string | Uint8Array) => void;
    cjFileBlob?: (path: string) => Promise<Blob>;
  }
}

const RUNNER = `import java.io.*; import java.net.*; import java.lang.reflect.*;
public class CTRunner {
  public static void main(String[] a) throws Exception {
    String dir = a[0];
    new File(dir).mkdirs();
    String srcPath = dir + a[1] + ".java";
    try (InputStream si = new FileInputStream(a[3]); OutputStream so = new FileOutputStream(srcPath)) {
      byte[] buf = new byte[8192]; int n; while ((n = si.read(buf)) > 0) so.write(buf, 0, n);
    }
    PrintWriter cerr = new PrintWriter(new OutputStreamWriter(new FileOutputStream(dir + "cerr.txt"), "UTF-8"));
    int rc = com.sun.tools.javac.Main.compile(new String[]{ srcPath, "-d", dir }, cerr);
    cerr.close();
    if (rc != 0) return;
    PrintStream out = new PrintStream(new FileOutputStream(dir + "out.txt"), true, "UTF-8");
    PrintStream err = new PrintStream(new FileOutputStream(dir + "err.txt"), true, "UTF-8");
    PrintStream oo = System.out, oe = System.err; InputStream oi = System.in;
    System.setOut(out); System.setErr(err); System.setIn(new FileInputStream(a[2]));
    try {
      URLClassLoader cl = new URLClassLoader(new URL[]{ new File(dir).toURI().toURL() }, CTRunner.class.getClassLoader().getParent());
      Method m = cl.loadClass(a[1]).getMethod("main", String[].class);
      m.invoke(null, (Object) new String[0]);
    } catch (InvocationTargetException e) { e.getCause().printStackTrace(); }
    catch (Throwable t) { t.printStackTrace(); }
    finally { out.flush(); err.flush(); out.close(); err.close(); System.setOut(oo); System.setErr(oe); System.setIn(oi); }
  }
}`;

let ready: Promise<void> | null = null;
let runId = 0;

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load the Java runtime."));
    document.head.appendChild(s);
  });
}

function consoleEl(): HTMLElement {
  let el = document.getElementById("console");
  if (!el) {
    el = document.createElement("pre");
    el.id = "console";
    el.style.display = "none";
    document.body.appendChild(el);
  }
  return el;
}

async function readFile(path: string): Promise<string> {
  try {
    return await (await window.cjFileBlob!(path)).text();
  } catch {
    return "";
  }
}

function getJava(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      consoleEl();
      if (!window.cheerpjInit) await loadScript(LOADER);
      await window.cheerpjInit!({ status: "none" });
      const jar = new Uint8Array(await (await fetch(toolsJar.url)).arrayBuffer());
      window.cheerpOSAddStringFile!("/str/tools.jar", jar);
      window.cheerpOSAddStringFile!("/str/CTRunner.java", RUNNER);
      const code = await window.cheerpjRunMain!("com.sun.tools.javac.Main", CP, "/str/CTRunner.java", "-d", "/files/");
      if (code !== 0) throw new Error("Could not prepare the Java compiler.");
    })().catch((e) => {
      ready = null;
      throw e;
    });
  }
  return ready;
}

/** Compiles and runs Java source; the public class (usually Main) is the entry point. */
export async function runJava(code: string, stdin: string): Promise<RunResult> {
  await getJava();
  const start = performance.now();
  const id = ++runId + "_" + Date.now();
  const cls = code.match(/public\s+(?:final\s+)?class\s+(\w+)/)?.[1] ?? "Main";
  const src = `/str/src${id}.txt`;
  const dir = `/files/r${id}/`;
  window.cheerpOSAddStringFile!(src, code);
  window.cheerpOSAddStringFile!(`/str/in${id}.txt`, stdin);
  await window.cheerpjRunMain!("CTRunner", CP, dir, cls, `/str/in${id}.txt`, src);
  const cerr = (await readFile(dir + "cerr.txt")).split(dir).join("").trim();
  if (cerr && !(await readFile(dir + "out.txt")) && /error/.test(cerr)) {
    return { stdout: "", stderr: cerr, ok: false, ms: Math.round(performance.now() - start) };
  }
  const stdout = await readFile(dir + "out.txt");
  const stderr = (await readFile(dir + "err.txt"))
    .split("\n")
    .filter((l) => !/CTRunner|sun\.reflect|java\.lang\.reflect/.test(l))
    .join("\n")
    .trim();
  return { stdout, stderr, ok: !stderr, ms: Math.round(performance.now() - start) };
}

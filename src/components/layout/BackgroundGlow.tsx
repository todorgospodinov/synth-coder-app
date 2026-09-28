/**
 * Full-page ambient background: slow-drifting blurred color glows over the
 * deep navy surface. Purely decorative, rendered once behind all routes.
 */
export function BackgroundGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="drift absolute -top-40 -left-32 h-[560px] w-[560px] rounded-full bg-primary/25 blur-[130px]" />
      <div
        className="drift absolute top-1/4 right-[-10%] h-[520px] w-[520px] rounded-full bg-accent/20 blur-[130px]"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="drift absolute bottom-[-20%] left-1/4 h-[480px] w-[480px] rounded-full bg-violet/20 blur-[120px]"
        style={{ animationDelay: "-11s" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(255,255,255,0.06),transparent_60%)]" />
    </div>
  );
}

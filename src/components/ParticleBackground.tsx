/**
 * Linear/Vercel-style ambient background:
 * - Subtle radial glow at top
 * - Faint dot grid
 * - Two slow-drifting indigo "spotlights"
 * No canvas, no JS particles — purely CSS for max perf.
 */
const ParticleBackground = () => {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-background"
    >
      {/* Top hero glow */}
      <div
        className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--primary) / 0.18), transparent 75%)",
          filter: "blur(40px)",
        }}
      />

      {/* Ambient drifting blobs */}
      <div
        className="glow-spot glow-spot-primary w-[480px] h-[480px] -top-24 -left-24 animate-float-slow"
        style={{ opacity: 0.35 }}
      />
      <div
        className="glow-spot glow-spot-primary w-[520px] h-[520px] top-[40%] -right-32 animate-float-slow"
        style={{ opacity: 0.25, animationDelay: "2s" }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--muted-foreground) / 0.5) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 10%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 10%, transparent 70%)",
        }}
      />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, hsl(var(--background)) 100%)",
        }}
      />
    </div>
  );
};

export default ParticleBackground;

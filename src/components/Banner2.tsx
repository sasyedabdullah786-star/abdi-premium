import { Banner } from "@/hooks/useBanners";
import { ArrowRight, X } from "lucide-react";

interface Props {
  banner: Banner;
  onDismiss?: () => void;
}

/**
 * Banner2 — large hero-style animated banner.
 * Bigger surface, image on the left, big title/subtitle,
 * prominent CTA button, animated shine + border glow.
 */
const Banner2 = ({ banner: b, onDismiss }: Props) => {
  const animClass =
    b.animation === "fade" ? "animate-fade-in" :
    b.animation === "scale" ? "animate-scale-in" :
    "animate-slide-in-right";

  const gradient = b.bg_color?.startsWith("from-")
    ? `bg-gradient-to-r ${b.bg_color}`
    : "";
  const inlineBg = !gradient && b.bg_color ? { background: b.bg_color } : undefined;

  return (
    <div className="container mx-auto px-4 pt-4">
      <div
        className={`relative overflow-hidden rounded-3xl ${gradient} ${animClass} shadow-md border border-border/50`}
        style={{ ...inlineBg, color: b.text_color || "#fff" }}

      >
        {/* Animated shine sweep */}
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -inset-y-16 -left-1/3 w-1/3 rotate-12 bg-white/25 blur-2xl animate-[slide-in-right_3.5s_ease-in-out_infinite]" />
        </div>
        {/* Soft glow orb */}
        <div className="pointer-events-none absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/20 blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-center gap-4 md:gap-6 p-5 md:p-7">
          {b.image_url && (
            <img
              src={b.image_url}
              alt=""
              className="w-full md:w-40 h-32 md:h-28 object-cover rounded-xl ring-1 ring-white/30 shrink-0"
            />
          )}
          <div className="flex-1 min-w-0 text-center md:text-left">
            <h3 className="font-display text-xl md:text-3xl font-bold leading-tight">
              {b.title}
            </h3>
            {b.subtitle && (
              <p className="mt-1 text-sm md:text-base opacity-90 line-clamp-2">
                {b.subtitle}
              </p>
            )}
          </div>
          {b.link_url && (
            <a
              href={b.link_url}
              target={b.link_url.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm md:text-base font-semibold bg-white text-black hover:bg-white/90 px-5 py-2.5 rounded-full shrink-0 transition-transform hover:scale-105 shadow-md"
            >
              {b.cta_label || "Learn more"} <ArrowRight className="w-4 h-4" />
            </a>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              aria-label="Dismiss"
              className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Banner2;

import { useEffect, useState } from "react";
import { useBanners } from "@/hooks/useBanners";
import { X, ArrowRight } from "lucide-react";
import Banner2 from "./Banner2";

const BannerStrip = () => {
  const { banners, loading } = useBanners(true);
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const visible = banners.filter(b => !dismissed.includes(b.id));

  useEffect(() => {
    if (visible.length <= 1) return;
    const t = setInterval(() => setIndex(i => (i + 1) % visible.length), 6000);
    return () => clearInterval(t);
  }, [visible.length]);

  if (loading || visible.length === 0) return null;
  const b = visible[index % visible.length];
  if (!b) return null;

  // Route to hero-style Banner2 when variant is 'hero'
  if (b.variant === "hero") {
    return <Banner2 banner={b} onDismiss={() => setDismissed(d => [...d, b.id])} />;
  }

  const animClass =
    b.animation === "fade" ? "animate-fade-in" :
    b.animation === "scale" ? "animate-scale-in" :
    "animate-slide-in-right";

  const gradient = b.bg_color?.startsWith("from-")
    ? `bg-gradient-to-r ${b.bg_color}`
    : "";
  const inlineBg = !gradient && b.bg_color ? { background: b.bg_color } : undefined;

  return (
    <div className="relative">
      <div
        key={b.id}
        className={`relative overflow-hidden ${gradient} ${animClass}`}
        style={{ ...inlineBg, color: b.text_color || "#fff" }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -inset-y-8 -left-1/3 w-1/3 rotate-12 bg-white/20 blur-2xl animate-[slide-in-right_3s_ease-in-out_infinite]" />
        </div>

        <div className="container mx-auto px-4 py-2.5 flex items-center gap-3 relative">
          {b.image_url && (
            <img
              src={b.image_url}
              alt=""
              className="w-8 h-8 rounded-md object-cover shrink-0 ring-1 ring-white/30"
            />
          )}
          <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-3 gap-y-0.5">
            <span className="font-semibold text-sm truncate">{b.title}</span>
            {b.subtitle && (
              <span className="text-xs opacity-90 truncate">{b.subtitle}</span>
            )}
          </div>
          {b.link_url && (
            <a
              href={b.link_url}
              target={b.link_url.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium bg-white/20 hover:bg-white/30 backdrop-blur px-3 py-1 rounded-full shrink-0 transition-colors"
            >
              {b.cta_label || "Learn more"} <ArrowRight className="w-3 h-3" />
            </a>
          )}
          <button
            onClick={() => setDismissed(d => [...d, b.id])}
            aria-label="Dismiss"
            className="p-1 rounded-md hover:bg-white/20 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerStrip;

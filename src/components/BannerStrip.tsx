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

  const dots = visible.length > 1 && (
    <div className="mt-2 flex items-center justify-center gap-1.5">
      {visible.map((v, i) => (
        <button
          key={v.id}
          onClick={() => setIndex(i)}
          aria-label={`Show banner ${i + 1}`}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === index % visible.length
              ? "w-6 bg-primary"
              : "w-1.5 bg-border hover:bg-muted-foreground/50"
          }`}
        />
      ))}
    </div>
  );

  // Hero-style variant
  if (b.variant === "hero") {
    return (
      <div className="pb-2">
        <Banner2 banner={b} onDismiss={() => setDismissed(d => [...d, b.id])} />
        {dots}
      </div>
    );
  }

  const gradient = b.bg_color?.startsWith("from-")
    ? `bg-gradient-to-r ${b.bg_color}`
    : "";
  const inlineBg = !gradient && b.bg_color ? { background: b.bg_color } : undefined;

  return (
    <div className="container mx-auto px-4 pt-4 pb-2">
      <div
        key={b.id}
        className={`group relative overflow-hidden rounded-2xl border border-border/60 shadow-sm animate-fade-in ${gradient}`}
        style={{ ...inlineBg, color: b.text_color || undefined }}
      >
        {/* soft sweep */}
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -inset-y-8 -left-1/3 w-1/3 rotate-12 bg-white/25 blur-2xl transition-transform duration-700 group-hover:translate-x-6" />
        </div>

        <div className="relative flex items-center gap-3 px-4 py-3 sm:px-5">
          {b.image_url && (
            <img
              src={b.image_url}
              alt=""
              className="w-10 h-10 rounded-xl object-cover shrink-0 ring-1 ring-white/30"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm sm:text-[15px] truncate">{b.title}</p>
            {b.subtitle && (
              <p className="text-xs sm:text-sm opacity-80 truncate">{b.subtitle}</p>
            )}
          </div>
          {b.link_url && (
            <a
              href={b.link_url}
              target={b.link_url.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 backdrop-blur px-3.5 py-1.5 rounded-full shrink-0 transition-colors active:scale-[0.97]"
            >
              {b.cta_label || "Learn more"} <ArrowRight className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={() => setDismissed(d => [...d, b.id])}
            aria-label="Dismiss"
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors shrink-0 opacity-70 hover:opacity-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {dots}
    </div>
  );
};

export default BannerStrip;

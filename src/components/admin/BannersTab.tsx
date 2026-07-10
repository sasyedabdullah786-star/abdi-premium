import { useState } from "react";
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff, Sparkles } from "lucide-react";
import { useBanners, Banner } from "@/hooks/useBanners";
import { useToast } from "@/hooks/use-toast";
import MediaUpload from "@/components/MediaUpload";

const gradientPresets = [
  { label: "Indigo → Pink", value: "from-indigo-500 to-pink-500" },
  { label: "Emerald → Cyan", value: "from-emerald-500 to-cyan-500" },
  { label: "Amber → Rose", value: "from-amber-500 to-rose-500" },
  { label: "Violet → Fuchsia", value: "from-violet-600 to-fuchsia-500" },
  { label: "Slate → Zinc", value: "from-slate-800 to-zinc-700" },
  { label: "Primary → Accent", value: "from-primary to-accent" },
];

const emptyForm: Partial<Banner> = {
  title: "",
  subtitle: "",
  image_url: "",
  link_url: "",
  cta_label: "Learn more",
  bg_color: "from-indigo-500 to-pink-500",
  text_color: "#ffffff",
  animation: "slide",
  is_active: true,
  priority: 0,
};

const BannersTab = () => {
  const { banners, loading, createBanner, updateBanner, deleteBanner } = useBanners();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Partial<Banner> | null>(null);

  const save = async () => {
    if (!editing?.title) return toast({ title: "Title required", variant: "destructive" });
    const res = editing.id
      ? await updateBanner(editing.id, editing)
      : await createBanner(editing);
    if (res.success) {
      toast({ title: editing.id ? "Banner updated" : "Banner created" });
      setEditing(null);
    } else {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-bold">Top Banners</h2>
          <p className="text-muted-foreground text-sm">Animated announcement strips shown at the top of every page.</p>
        </div>
        <button className="btn-gradient flex items-center gap-2" onClick={() => setEditing({ ...emptyForm })}>
          <Plus className="w-4 h-4" /> New Banner
        </button>
      </div>

      {editing && (
        <div className="glass-card p-5 space-y-4 border-primary/30">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> {editing.id ? "Edit Banner" : "New Banner"}</h3>
            <button onClick={() => setEditing(null)} className="p-1.5 rounded-md hover:bg-muted"><X className="w-4 h-4" /></button>
          </div>

          {/* Live preview */}
          <div className="rounded-lg overflow-hidden border border-border">
            <div className={`bg-gradient-to-r ${editing.bg_color?.startsWith("from-") ? editing.bg_color : "from-primary to-accent"} px-4 py-2.5 flex items-center gap-3`} style={{ color: editing.text_color || "#fff" }}>
              {editing.image_url && <img src={editing.image_url} className="w-8 h-8 rounded-md object-cover" alt="" />}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{editing.title || "Banner title"}</div>
                {editing.subtitle && <div className="text-xs opacity-90 truncate">{editing.subtitle}</div>}
              </div>
              {editing.link_url && <span className="text-xs bg-white/20 px-3 py-1 rounded-full">{editing.cta_label}</span>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Title</label>
              <input className="input-glass" value={editing.title || ""} onChange={e => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Subtitle</label>
              <input className="input-glass" value={editing.subtitle || ""} onChange={e => setEditing({ ...editing, subtitle: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Link URL</label>
              <input className="input-glass" placeholder="/courses or https://..." value={editing.link_url || ""} onChange={e => setEditing({ ...editing, link_url: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Button Label</label>
              <input className="input-glass" value={editing.cta_label || ""} onChange={e => setEditing({ ...editing, cta_label: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Animation</label>
              <select className="input-glass" value={editing.animation || "slide"} onChange={e => setEditing({ ...editing, animation: e.target.value })}>
                <option value="slide">Slide</option>
                <option value="fade">Fade</option>
                <option value="scale">Scale</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Priority (higher first)</label>
              <input type="number" className="input-glass" value={editing.priority ?? 0} onChange={e => setEditing({ ...editing, priority: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Background Preset</label>
              <select className="input-glass" value={editing.bg_color || ""} onChange={e => setEditing({ ...editing, bg_color: e.target.value })}>
                {gradientPresets.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Text Color</label>
              <input type="color" className="input-glass h-10" value={editing.text_color || "#ffffff"} onChange={e => setEditing({ ...editing, text_color: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block">Banner Image (optional)</label>
            <MediaUpload
              kind="image"
              value={editing.image_url || ""}
              onChange={(url) => setEditing({ ...editing, image_url: url })}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!editing.is_active} onChange={e => setEditing({ ...editing, is_active: e.target.checked })} />
              Active
            </label>
            <button onClick={save} className="btn-gradient flex items-center gap-2 ml-auto"><Save className="w-4 h-4" /> Save Banner</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading && <p className="text-muted-foreground text-sm">Loading...</p>}
        {!loading && banners.length === 0 && (
          <div className="glass-card p-8 text-center text-muted-foreground">No banners yet. Create your first animated banner above.</div>
        )}
        {banners.map(b => (
          <div key={b.id} className="glass-card p-4 flex items-center gap-3 flex-wrap">
            <div className={`w-24 h-10 rounded-md bg-gradient-to-r ${b.bg_color?.startsWith("from-") ? b.bg_color : "from-primary to-accent"} shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate flex items-center gap-2">
                {b.title}
                {!b.is_active && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">off</span>}
              </div>
              {b.subtitle && <div className="text-xs text-muted-foreground truncate">{b.subtitle}</div>}
            </div>
            <button
              onClick={() => updateBanner(b.id, { is_active: !b.is_active })}
              className="p-2 rounded-md hover:bg-muted"
              title={b.is_active ? "Disable" : "Enable"}
            >
              {b.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
            </button>
            <button onClick={() => setEditing(b)} className="p-2 rounded-md hover:bg-muted"><Edit className="w-4 h-4" /></button>
            <button
              onClick={async () => {
                if (!confirm("Delete this banner?")) return;
                const res = await deleteBanner(b.id);
                if (res.success) toast({ title: "Deleted" });
              }}
              className="p-2 rounded-md hover:bg-destructive/10 text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BannersTab;

import { Save, Palette, Sparkles } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useToast } from "@/hooks/use-toast";
import MediaUpload from "@/components/MediaUpload";

const FONT_OPTIONS = [
  "Inter", "Poppins", "Roboto", "Open Sans", "Lato", "Montserrat", 
  "Source Sans Pro", "Nunito", "Raleway", "Ubuntu"
];

type Preset = {
  name: string;
  description: string;
  swatches: string[];
  values: {
    background_color: string;
    card_color: string;
    primary_color: string;
  };
};

const PRESETS: Preset[] = [
  {
    name: "Editorial Cream",
    description: "Warm paper background, deep navy ink, amber accent",
    swatches: ["hsl(40 20% 96%)", "hsl(220 40% 22%)", "hsl(35 80% 55%)"],
    values: {
      background_color: "40 20% 96%",
      card_color: "0 0% 100%",
      primary_color: "220 40% 22%",
    },
  },
  {
    name: "Vibrant Violet",
    description: "Cream paper with electric violet accents",
    swatches: ["hsl(42 60% 97%)", "hsl(262 78% 55%)", "hsl(340 82% 60%)"],
    values: {
      background_color: "42 60% 97%",
      card_color: "0 0% 100%",
      primary_color: "262 78% 55%",
    },
  },
];

const AppearanceTab = () => {
  const { settings, updateSettings } = useSiteSettings();
  const { toast } = useToast();

  const applyPreset = (preset: Preset) => {
    updateSettings(preset.values);
    toast({ title: `Applied "${preset.name}" theme` });
  };

  const handleSave = () => {
    toast({ title: "Appearance settings saved!" });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-display text-2xl font-bold">Appearance</h2>
        <p className="text-muted-foreground">Customize colors, fonts, and visual style</p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="font-medium flex items-center gap-2"><Sparkles className="w-4 h-4" /> Theme Presets</h3>
        <p className="text-xs text-muted-foreground">One-click apply a curated palette to background, surface, text, primary, accent and border.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="text-left p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                {preset.swatches.map((s, i) => (
                  <span key={i} className="w-6 h-6 rounded-full border border-border" style={{ background: s }} />
                ))}
              </div>
              <div className="font-medium text-sm">{preset.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="font-medium flex items-center gap-2"><Palette className="w-4 h-4" /> Colors (HSL Format)</h3>
        <p className="text-xs text-muted-foreground">Use HSL values like "190 100% 50%" for colors</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Primary Color</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={settings.primary_color} 
                onChange={(e) => updateSettings({ primary_color: e.target.value })} 
                className="input-glass flex-1" 
                placeholder="190 100% 50%" 
              />
              <div 
                className="w-10 h-10 rounded-lg border border-border" 
                style={{ backgroundColor: `hsl(${settings.primary_color})` }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Background Color</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={settings.background_color} 
                onChange={(e) => updateSettings({ background_color: e.target.value })} 
                className="input-glass flex-1" 
                placeholder="222 47% 11%"
              />
              <div 
                className="w-10 h-10 rounded-lg border border-border" 
                style={{ backgroundColor: `hsl(${settings.background_color})` }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Card Color</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={settings.card_color} 
                onChange={(e) => updateSettings({ card_color: e.target.value })} 
                className="input-glass flex-1" 
                placeholder="217 33% 17%"
              />
              <div 
                className="w-10 h-10 rounded-lg border border-border" 
                style={{ backgroundColor: `hsl(${settings.card_color})` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="font-medium">Typography</h3>
        <div>
          <label className="block text-sm font-medium mb-2">Font Family</label>
          <select 
            value={settings.font_family} 
            onChange={(e) => updateSettings({ font_family: e.target.value })} 
            className="input-glass bg-card"
          >
            {FONT_OPTIONS.map(font => <option key={font} value={font}>{font}</option>)}
          </select>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="font-medium">Branding</h3>
        <div>
          <label className="block text-sm font-medium mb-2">Logo</label>
          <p className="text-xs text-muted-foreground mb-2">Upload directly — applied to header, footer & every logo across the site.</p>
          <MediaUpload
            value={settings.logo_url || ""}
            onChange={(url) => updateSettings({ logo_url: url })}
            kind="image"
            folder="branding"
            allowUrl
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Footer Text</label>
          <input 
            type="text" 
            value={settings.footer_text} 
            onChange={(e) => updateSettings({ footer_text: e.target.value })} 
            className="input-glass" 
          />
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="font-medium">Navigation Labels</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Home</label>
            <input 
              type="text" 
              value={settings.nav_home_label} 
              onChange={(e) => updateSettings({ nav_home_label: e.target.value })} 
              className="input-glass" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Courses</label>
            <input 
              type="text" 
              value={settings.nav_courses_label} 
              onChange={(e) => updateSettings({ nav_courses_label: e.target.value })} 
              className="input-glass" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Blog</label>
            <input 
              type="text" 
              value={settings.nav_blog_label} 
              onChange={(e) => updateSettings({ nav_blog_label: e.target.value })} 
              className="input-glass" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Contact</label>
            <input 
              type="text" 
              value={settings.nav_contact_label} 
              onChange={(e) => updateSettings({ nav_contact_label: e.target.value })} 
              className="input-glass" 
            />
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="btn-gradient flex items-center gap-2">
        <Save className="w-4 h-4" /> Save Appearance
      </button>
    </div>
  );
};

export default AppearanceTab;

import { Save } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useInstitution } from "@/hooks/useInstitution";
import { useToast } from "@/hooks/use-toast";

const GeneralTab = () => {
  const { settings, updateSettings } = useSiteSettings();
  const { institution, updateInstitution } = useInstitution();
  const { toast } = useToast();

  const handleSave = () => {
    toast({ title: "Settings saved!" });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-display text-2xl font-bold">General Settings</h2>
        <p className="text-muted-foreground">Configure basic site information</p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Institution Name</label>
          <input 
            type="text" 
            value={institution?.name || ""} 
            onChange={(e) => updateInstitution({ name: e.target.value })} 
            className="input-glass" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea 
            value={institution?.description || ""} 
            onChange={(e) => updateInstitution({ description: e.target.value })} 
            className="input-glass min-h-[100px]" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Mission Statement</label>
          <textarea 
            value={institution?.mission || ""} 
            onChange={(e) => updateInstitution({ mission: e.target.value })} 
            className="input-glass min-h-[80px]" 
          />
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="font-medium">Hero Section</h3>
        <div>
          <label className="block text-sm font-medium mb-2">Hero Title</label>
          <input 
            type="text" 
            value={settings.hero_title} 
            onChange={(e) => updateSettings({ hero_title: e.target.value })} 
            className="input-glass" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Hero Subtitle</label>
          <input 
            type="text" 
            value={settings.hero_subtitle} 
            onChange={(e) => updateSettings({ hero_subtitle: e.target.value })} 
            className="input-glass" 
          />
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="font-medium">SEO Settings</h3>
        <div>
          <label className="block text-sm font-medium mb-2">SEO Title</label>
          <input 
            type="text" 
            value={settings.seo_title} 
            onChange={(e) => updateSettings({ seo_title: e.target.value })} 
            className="input-glass" 
            placeholder="Page title for search engines"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">SEO Description</label>
          <textarea 
            value={settings.seo_description} 
            onChange={(e) => updateSettings({ seo_description: e.target.value })} 
            className="input-glass min-h-[80px]" 
            placeholder="Description shown in search results"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">SEO Keywords</label>
          <input 
            type="text" 
            value={settings.seo_keywords} 
            onChange={(e) => updateSettings({ seo_keywords: e.target.value })} 
            className="input-glass" 
            placeholder="Comma-separated keywords"
          />
        </div>
      </div>

      <button onClick={handleSave} className="btn-gradient flex items-center gap-2">
        <Save className="w-4 h-4" /> Save All Settings
      </button>
    </div>
  );
};

export default GeneralTab;

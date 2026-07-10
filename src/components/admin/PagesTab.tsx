import { useState, useEffect } from "react";
import { Eye, EyeOff, Clock, FileText, BookOpen, Mail, Building2, Save, Sparkles, Brain, Zap, Trophy, User, Boxes } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useToast } from "@/hooks/use-toast";

interface PageSetting {
  enabled: boolean;
  coming_soon: boolean;
}

interface PageSettings {
  courses: PageSetting;
  blog: PageSetting;
  contact: PageSetting;
  institution: PageSetting;
  hub: PageSetting;
  companion: PageSetting;
  nexus: PageSetting;
  ai_tools: PageSetting;
  leaderboard: PageSetting;
  profile: PageSetting;
}

const defaultPageSettings: PageSettings = {
  courses: { enabled: true, coming_soon: false },
  blog: { enabled: true, coming_soon: false },
  contact: { enabled: true, coming_soon: false },
  institution: { enabled: true, coming_soon: false },
  hub: { enabled: true, coming_soon: false },
  companion: { enabled: true, coming_soon: false },
  nexus: { enabled: true, coming_soon: false },
  ai_tools: { enabled: true, coming_soon: false },
  leaderboard: { enabled: true, coming_soon: false },
  profile: { enabled: true, coming_soon: false }
};

const PagesTab = () => {
  const { settings, updateSettings } = useSiteSettings();
  const { toast } = useToast();

  const [pageSettings, setPageSettings] = useState<PageSettings>(defaultPageSettings);

  useEffect(() => {
    if (settings.page_settings) {
      setPageSettings({
        ...defaultPageSettings,
        ...(settings.page_settings as PageSettings)
      });
    }
  }, [settings.page_settings]);

  const pages = [
    { key: 'courses' as keyof PageSettings, label: 'Courses', icon: BookOpen, path: '/courses', description: 'Browse and explore all courses' },
    { key: 'blog' as keyof PageSettings, label: 'Blog', icon: FileText, path: '/blog', description: 'Blog posts and articles' },
    { key: 'contact' as keyof PageSettings, label: 'Contact', icon: Mail, path: '/contact', description: 'Contact information and form' },
    { key: 'institution' as keyof PageSettings, label: 'About Us', icon: Building2, path: '/institution', description: 'Institution information and mission' },
    { key: 'hub' as keyof PageSettings, label: 'Holographic Hub', icon: Boxes, path: '/hub', description: '3D immersive dashboard' },
    { key: 'companion' as keyof PageSettings, label: 'Study Companion', icon: Brain, path: '/companion', description: 'AI adaptive quiz & flashcards' },
    { key: 'nexus' as keyof PageSettings, label: 'AB3D Nexus', icon: Sparkles, path: '/nexus', description: 'AI workspace & project builder' },
    { key: 'ai_tools' as keyof PageSettings, label: 'AI Tools', icon: Zap, path: '/ai-tools', description: 'Path generator, quiz, image studio' },
    { key: 'leaderboard' as keyof PageSettings, label: 'Leaderboard', icon: Trophy, path: '/leaderboard', description: 'Top learners ranking' },
    { key: 'profile' as keyof PageSettings, label: 'Profile', icon: User, path: '/profile', description: 'Student profile & progress' }
  ];

  const handleToggleEnabled = async (key: keyof PageSettings) => {
    const newSettings = {
      ...pageSettings,
      [key]: { ...pageSettings[key], enabled: !pageSettings[key].enabled }
    };
    setPageSettings(newSettings);
    const result = await updateSettings({ page_settings: newSettings });
    if (result.success) {
      toast({ title: newSettings[key].enabled ? `${key} page enabled` : `${key} page disabled` });
    }
  };

  const handleToggleComingSoon = async (key: keyof PageSettings) => {
    const newSettings = {
      ...pageSettings,
      [key]: { ...pageSettings[key], coming_soon: !pageSettings[key].coming_soon }
    };
    setPageSettings(newSettings);
    const result = await updateSettings({ page_settings: newSettings });
    if (result.success) {
      toast({ title: newSettings[key].coming_soon ? `${key} page set to coming soon` : `${key} page active` });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Page Control</h2>
        <p className="text-muted-foreground">Enable, disable, or set pages to "Coming Soon"</p>
      </div>

      <div className="space-y-3">
        {pages.map((page) => {
          const setting = pageSettings[page.key];
          const isEnabled = setting?.enabled ?? true;
          const isComingSoon = setting?.coming_soon ?? false;

          return (
            <div 
              key={page.key}
              className={`glass-card p-4 flex items-center justify-between transition-all ${
                !isEnabled ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  isEnabled ? (isComingSoon ? 'bg-warning/20' : 'bg-primary/20') : 'bg-muted/20'
                }`}>
                  <page.icon className={`w-6 h-6 ${
                    isEnabled ? (isComingSoon ? 'text-warning' : 'text-primary') : 'text-muted-foreground'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{page.label}</h3>
                    <span className="text-xs text-muted-foreground">{page.path}</span>
                    {isComingSoon && isEnabled && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-warning/20 text-warning flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Coming Soon
                      </span>
                    )}
                    {!isEnabled && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-destructive/20 text-destructive">Disabled</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{page.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleComingSoon(page.key)}
                  disabled={!isEnabled}
                  className={`p-2 rounded-lg transition-colors ${
                    isComingSoon && isEnabled
                      ? 'bg-warning/20 text-warning hover:bg-warning/30' 
                      : 'bg-muted/20 text-muted-foreground hover:bg-muted/30'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title="Toggle Coming Soon"
                >
                  <Clock className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleToggleEnabled(page.key)}
                  className={`p-2 rounded-lg transition-colors ${
                    isEnabled 
                      ? 'bg-success/20 text-success hover:bg-success/30' 
                      : 'bg-muted/20 text-muted-foreground hover:bg-muted/30'
                  }`}
                  title={isEnabled ? "Disable page" : "Enable page"}
                >
                  {isEnabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-4 bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Note:</strong> Disabled pages will show a 404 error. 
          "Coming Soon" pages will display a placeholder message instead of the actual content.
        </p>
      </div>
    </div>
  );
};

export default PagesTab;

import { 
  Eye, 
  EyeOff, 
  Megaphone, 
  TrendingUp, 
  Tag, 
  MessageSquare, 
  BarChart3,
  Zap,
  GripVertical
} from "lucide-react";
import { useSiteSettings, HomepageSections } from "@/hooks/useSiteSettings";
import { useToast } from "@/hooks/use-toast";

const SectionsTab = () => {
  const { settings, updateHomepageSections } = useSiteSettings();
  const { toast } = useToast();

  const sections = [
    { 
      key: 'announcements' as keyof HomepageSections, 
      label: 'Announcements Banner', 
      icon: Megaphone,
      description: 'Show important announcements at the top of the page'
    },
    { 
      key: 'stats' as keyof HomepageSections, 
      label: 'Statistics Section', 
      icon: BarChart3,
      description: 'Display course count, students, and ratings'
    },
    { 
      key: 'trending' as keyof HomepageSections, 
      label: 'Trending Courses', 
      icon: TrendingUp,
      description: 'Showcase featured/trending courses'
    },
    { 
      key: 'categories' as keyof HomepageSections, 
      label: 'Categories', 
      icon: Tag,
      description: 'Show course categories for easy navigation'
    },
    { 
      key: 'features' as keyof HomepageSections, 
      label: 'Features Section', 
      icon: Zap,
      description: 'Highlight platform features and benefits'
    },
    { 
      key: 'testimonials' as keyof HomepageSections, 
      label: 'Testimonials', 
      icon: MessageSquare,
      description: 'Show student reviews and feedback'
    }
  ];

  const handleToggle = async (key: keyof HomepageSections) => {
    const newValue = !settings.homepage_sections[key];
    const result = await updateHomepageSections({ [key]: newValue });
    if (result.success) {
      toast({ 
        title: `${newValue ? 'Enabled' : 'Disabled'} ${key}`,
        description: 'Homepage section updated'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Homepage Sections</h2>
        <p className="text-muted-foreground">Control which sections appear on your homepage</p>
      </div>

      <div className="space-y-3">
        {sections.map((section) => {
          const isEnabled = settings.homepage_sections[section.key];
          
          return (
            <div 
              key={section.key}
              className={`glass-card p-4 flex items-center justify-between transition-all ${
                isEnabled ? 'border-primary/30' : 'opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-muted-foreground cursor-move">
                  <GripVertical className="w-5 h-5" />
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isEnabled ? 'bg-primary/20 text-primary' : 'bg-muted/20 text-muted-foreground'
                }`}>
                  <section.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium">{section.label}</h3>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              </div>
              
              <button
                onClick={() => handleToggle(section.key)}
                className={`p-2 rounded-lg transition-colors ${
                  isEnabled 
                    ? 'bg-success/20 text-success hover:bg-success/30' 
                    : 'bg-muted/20 text-muted-foreground hover:bg-muted/30'
                }`}
              >
                {isEnabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-4 bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Tip:</strong> Disabling sections doesn't delete their content. 
          You can re-enable them anytime and all data will be preserved.
        </p>
      </div>
    </div>
  );
};

export default SectionsTab;

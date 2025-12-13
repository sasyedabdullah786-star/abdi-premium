import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Rocket, 
  Atom, 
  BookOpen, 
  Save, 
  Trash2, 
  Plus,
  LogOut,
  Menu,
  X,
  Settings,
  Users
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface InstituteData {
  id: string;
  label: string;
  subtitle: string;
  link: string;
  icon: typeof Rocket;
}

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [institutes, setInstitutes] = useState<InstituteData[]>([
    { id: "1", label: "Next Toppers", subtitle: "Excellence in Education", link: "/nexttoppers", icon: Rocket },
    { id: "2", label: "Physics Wallah", subtitle: "Master Physics & Chemistry", link: "/physicswallah", icon: Atom },
    { id: "3", label: "Padhle Akshay", subtitle: "Learn Smart, Score High", link: "/padhleakshay", icon: BookOpen },
  ]);

  const handleSave = (id: string) => {
    toast({
      title: "Changes Saved",
      description: "Your changes have been saved successfully.",
    });
  };

  const handleRemove = (id: string) => {
    setInstitutes(institutes.filter(inst => inst.id !== id));
    toast({
      title: "Institute Removed",
      description: "The institute has been removed from the list.",
      variant: "destructive",
    });
  };

  const handleAddNew = () => {
    const newId = Date.now().toString();
    setInstitutes([...institutes, {
      id: newId,
      label: "New Institute",
      subtitle: "Add description",
      link: "/new-institute",
      icon: Rocket,
    }]);
    toast({
      title: "Institute Added",
      description: "A new institute card has been added.",
    });
  };

  const updateInstitute = (id: string, field: keyof InstituteData, value: string) => {
    setInstitutes(institutes.map(inst => 
      inst.id === id ? { ...inst, [field]: value } : inst
    ));
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 sidebar-glass
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-display text-2xl font-bold gradient-text">
              ABD"I Admin
            </h1>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <a 
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium"
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </a>
            <a 
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            >
              <Users className="w-5 h-5" />
              Users
            </a>
            <a 
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            >
              <Settings className="w-5 h-5" />
              Settings
            </a>
          </nav>
        </div>

        {/* Logout */}
        <div className="absolute bottom-6 left-6 right-6">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Header */}
        <header className="glass-card rounded-none border-x-0 border-t-0 p-4 lg:p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-display text-xl font-bold text-foreground">
              Institute Management
            </h2>
          </div>
          <button
            onClick={handleAddNew}
            className="btn-gradient flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Institute
          </button>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-6">
          <div className="grid gap-6">
            {institutes.map((institute, index) => (
              <div 
                key={institute.id}
                className="glass-card p-6 opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="icon-gradient">
                    <institute.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-bold text-foreground mb-1">
                      {institute.label}
                    </h3>
                    <p className="text-muted-foreground text-sm">{institute.subtitle}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Label
                    </label>
                    <input
                      type="text"
                      value={institute.label}
                      onChange={(e) => updateInstitute(institute.id, 'label', e.target.value)}
                      className="input-glass"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={institute.subtitle}
                      onChange={(e) => updateInstitute(institute.id, 'subtitle', e.target.value)}
                      className="input-glass"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Internal Link
                    </label>
                    <input
                      type="text"
                      value={institute.link}
                      onChange={(e) => updateInstitute(institute.id, 'link', e.target.value)}
                      className="input-glass"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-6 border-t border-border/50">
                  <button
                    onClick={() => handleSave(institute.id)}
                    className="btn-gradient flex items-center gap-2 text-sm"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={() => handleRemove(institute.id)}
                    className="btn-glass flex items-center gap-2 text-sm text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Settings, Palette, BookOpen, FileText, Mail, Plus, Trash2, Save, Edit3, Play, X, ArrowLeft, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useInstitution } from "@/hooks/useInstitution";
import { useCourses } from "@/hooks/useCourses";
import { useLessons } from "@/hooks/useLessons";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useContactInfo } from "@/hooks/useContactInfo";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { settings, updateSettings } = useSiteSettings();
  const { institution, updateInstitution } = useInstitution();
  const { courses, createCourse, updateCourse, deleteCourse } = useCourses();
  const { lessons, createLesson, updateLesson, deleteLesson } = useLessons();
  const { posts, createPost, updatePost, deletePost } = useBlogPosts();
  const { contactInfo, updateContactInfo } = useContactInfo();
  
  const [activeTab, setActiveTab] = useState<"general" | "appearance" | "courses" | "blog" | "contact">("general");
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [newCourse, setNewCourse] = useState({ title: "", description: "", thumbnail_url: "" });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, isAdmin, authLoading, navigate]);

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-muted-foreground">Loading...</div></div>;
  if (!isAdmin) return null;

  const handleAddCourse = async () => {
    if (!newCourse.title) return;
    const result = await createCourse({ ...newCourse, institution_id: institution?.id || null, is_published: true });
    if (result.success) { setNewCourse({ title: "", description: "", thumbnail_url: "" }); toast({ title: "Course added!" }); }
  };

  const tabs = [
    { id: "general" as const, label: "General", icon: Settings },
    { id: "appearance" as const, label: "Appearance", icon: Palette },
    { id: "courses" as const, label: "Courses", icon: BookOpen },
    { id: "blog" as const, label: "Blog", icon: FileText },
    { id: "contact" as const, label: "Contact", icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-card rounded-none border-x-0 border-t-0 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></Link>
            <h1 className="font-display text-xl font-bold"><span className="gradient-text">Admin Dashboard</span></h1>
          </div>
          <Link to="/" className="btn-gradient text-sm">View Site</Link>
        </div>
      </header>
      <div className="flex">
        <aside className="w-64 min-h-[calc(100vh-73px)] glass-card rounded-none border-y-0 border-l-0 p-4">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === tab.id ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-primary/5"}`}>
                <tab.icon className="w-5 h-5" /><span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-6">
          {activeTab === "general" && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="font-display text-2xl font-bold">General Settings</h2>
              <div className="glass-card p-6 space-y-4">
                <div><label className="block text-sm font-medium mb-2">Institution Name</label><input type="text" value={institution?.name || ""} onChange={(e) => updateInstitution({ name: e.target.value })} className="input-glass" /></div>
                <div><label className="block text-sm font-medium mb-2">Description</label><textarea value={institution?.description || ""} onChange={(e) => updateInstitution({ description: e.target.value })} className="input-glass min-h-[100px]" /></div>
                <div><label className="block text-sm font-medium mb-2">Mission</label><textarea value={institution?.mission || ""} onChange={(e) => updateInstitution({ mission: e.target.value })} className="input-glass min-h-[80px]" /></div>
                <div><label className="block text-sm font-medium mb-2">Hero Title</label><input type="text" value={settings.hero_title} onChange={(e) => updateSettings({ hero_title: e.target.value })} className="input-glass" /></div>
                <div><label className="block text-sm font-medium mb-2">Hero Subtitle</label><input type="text" value={settings.hero_subtitle} onChange={(e) => updateSettings({ hero_subtitle: e.target.value })} className="input-glass" /></div>
                <button onClick={() => toast({ title: "Settings saved!" })} className="btn-gradient flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
              </div>
            </div>
          )}
          {activeTab === "appearance" && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="font-display text-2xl font-bold">Appearance</h2>
              <div className="glass-card p-6 space-y-4">
                <div><label className="block text-sm font-medium mb-2">Primary Color (HSL)</label><input type="text" value={settings.primary_color} onChange={(e) => updateSettings({ primary_color: e.target.value })} className="input-glass" placeholder="190 100% 50%" /></div>
                <div><label className="block text-sm font-medium mb-2">Background Color (HSL)</label><input type="text" value={settings.background_color} onChange={(e) => updateSettings({ background_color: e.target.value })} className="input-glass" /></div>
                <div><label className="block text-sm font-medium mb-2">Footer Text</label><input type="text" value={settings.footer_text} onChange={(e) => updateSettings({ footer_text: e.target.value })} className="input-glass" /></div>
                <button onClick={() => toast({ title: "Appearance saved!" })} className="btn-gradient flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
              </div>
            </div>
          )}
          {activeTab === "courses" && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold">Manage Courses</h2>
              <div className="glass-card p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Course</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input placeholder="Title" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} className="input-glass" />
                  <input placeholder="Description" value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} className="input-glass" />
                  <button onClick={handleAddCourse} className="btn-gradient">Add Course</button>
                </div>
              </div>
              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course.id} className="glass-card p-6">
                    <div className="flex items-center justify-between">
                      <div><h3 className="font-display text-xl font-bold">{course.title}</h3><p className="text-muted-foreground text-sm">{course.description}</p></div>
                      <button onClick={() => { deleteCourse(course.id); toast({ title: "Deleted" }); }} className="p-2 text-destructive"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === "blog" && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold">Blog Posts</h2>
              <p className="text-muted-foreground">Manage your blog posts here. Add, edit, or delete posts.</p>
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="glass-card p-6 flex justify-between items-center">
                    <div><h3 className="font-bold">{post.title}</h3><p className="text-muted-foreground text-sm line-clamp-1">{post.content}</p></div>
                    <button onClick={() => { deletePost(post.id); toast({ title: "Deleted" }); }} className="p-2 text-destructive"><Trash2 className="w-5 h-5" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === "contact" && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="font-display text-2xl font-bold">Contact Info</h2>
              <div className="glass-card p-6 space-y-4">
                <div><label className="block text-sm font-medium mb-2">Address</label><input type="text" value={contactInfo?.address || ""} onChange={(e) => updateContactInfo({ address: e.target.value })} className="input-glass" /></div>
                <div><label className="block text-sm font-medium mb-2">Phone</label><input type="text" value={contactInfo?.phone || ""} onChange={(e) => updateContactInfo({ phone: e.target.value })} className="input-glass" /></div>
                <div><label className="block text-sm font-medium mb-2">Email</label><input type="email" value={contactInfo?.email || ""} onChange={(e) => updateContactInfo({ email: e.target.value })} className="input-glass" /></div>
                <button onClick={() => toast({ title: "Contact info saved!" })} className="btn-gradient flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

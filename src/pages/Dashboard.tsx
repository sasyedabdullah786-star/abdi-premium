import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Settings, Palette, BookOpen, FileText, Mail, Plus, Trash2, Save, Edit3, Play, X, ArrowLeft, ChevronDown, ChevronUp, Megaphone, Star, Tag, TrendingUp, Award, Check, Eye, EyeOff, BarChart3, Layout, Construction, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useInstitution } from "@/hooks/useInstitution";
import { useCourses } from "@/hooks/useCourses";
import { useLessons, Lesson, RESOURCE_TYPES, ResourceType } from "@/hooks/useLessons";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useContactInfo } from "@/hooks/useContactInfo";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useTestimonials } from "@/hooks/useTestimonials";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import SectionsTab from "@/components/admin/SectionsTab";
import MaintenanceTab from "@/components/admin/MaintenanceTab";
import ReviewsTab from "@/components/admin/ReviewsTab";

const Dashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { settings, updateSettings } = useSiteSettings();
  const { institution, updateInstitution } = useInstitution();
  const { courses, createCourse, updateCourse, deleteCourse } = useCourses();
  const { lessons, createLesson, updateLesson, deleteLesson, refetch: refetchLessons } = useLessons();
  const { posts, createPost, updatePost, deletePost } = useBlogPosts();
  const { contactInfo, updateContactInfo } = useContactInfo();
  const { announcements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncements();
  const { testimonials, createTestimonial, updateTestimonial, deleteTestimonial } = useTestimonials();
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  
  const [activeTab, setActiveTab] = useState<"analytics" | "general" | "appearance" | "sections" | "maintenance" | "courses" | "blog" | "contact" | "announcements" | "testimonials" | "categories" | "reviews">("analytics");
  const [newCourse, setNewCourse] = useState({ title: "", description: "", thumbnail_url: "", category: "general", price: "Free", duration: "", certificates_enabled: false });
  const [newPost, setNewPost] = useState({ title: "", content: "", image_url: "" });
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [newLesson, setNewLesson] = useState({ title: "", video_url: "", notes: "", pdf_url: "", resource_type: "video" as ResourceType });
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editPostData, setEditPostData] = useState({ title: "", content: "", image_url: "" });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "", priority: 0 });
  const [newTestimonial, setNewTestimonial] = useState({ student_name: "", content: "", rating: 5, course_name: "", student_image: "" });
  const [newCategory, setNewCategory] = useState({ name: "", icon: "BookOpen", color: "primary", sort_order: 0 });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, isAdmin, authLoading, navigate]);

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-muted-foreground">Loading...</div></div>;
  if (!isAdmin) return null;

  const handleAddCourse = async () => {
    if (!newCourse.title) {
      toast({ title: "Please enter a course title", variant: "destructive" });
      return;
    }
    const result = await createCourse({ 
      title: newCourse.title,
      description: newCourse.description,
      thumbnail_url: newCourse.thumbnail_url,
      institution_id: institution?.id || null, 
      is_published: true,
      is_featured: false,
      category: newCourse.category,
      certificates_enabled: newCourse.certificates_enabled,
      price: newCourse.price,
      duration: newCourse.duration || null
    });
    if (result.success) {
      setNewCourse({ title: "", description: "", thumbnail_url: "", category: "general", price: "Free", duration: "", certificates_enabled: false });
      toast({ title: "Course added successfully!" });
    } else {
      toast({ title: "Failed to add course", variant: "destructive" });
    }
  };

  const handleAddPost = async () => {
    if (!newPost.title) {
      toast({ title: "Please enter a post title", variant: "destructive" });
      return;
    }
    const result = await createPost({ ...newPost, is_published: true });
    if (result.success) {
      setNewPost({ title: "", content: "", image_url: "" });
      toast({ title: "Blog post added successfully!" });
    } else {
      toast({ title: "Failed to add blog post", variant: "destructive" });
    }
  };

  const handleUpdatePost = async (id: string) => {
    const result = await updatePost(id, editPostData);
    if (result.success) {
      setEditingPost(null);
      toast({ title: "Blog post updated!" });
    } else {
      toast({ title: "Failed to update post", variant: "destructive" });
    }
  };

  const handleAddLesson = async (courseId: string) => {
    if (!newLesson.title) {
      toast({ title: "Please enter a lesson title", variant: "destructive" });
      return;
    }
    const courseLessons = lessons.filter(l => l.course_id === courseId);
    const result = await createLesson({
      course_id: courseId,
      title: newLesson.title,
      video_url: newLesson.video_url || null,
      notes: newLesson.notes || null,
      pdf_url: newLesson.pdf_url || null,
      sort_order: courseLessons.length,
      resource_type: newLesson.resource_type
    });
    if (result.success) {
      setNewLesson({ title: "", video_url: "", notes: "", pdf_url: "", resource_type: "video" });
      refetchLessons();
      toast({ title: "Lesson added successfully!" });
    } else {
      toast({ title: "Failed to add lesson", variant: "destructive" });
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    const result = await deleteLesson(lessonId);
    if (result.success) {
      toast({ title: "Lesson deleted" });
    } else {
      toast({ title: "Failed to delete lesson", variant: "destructive" });
    }
  };

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.title) {
      toast({ title: "Please enter announcement title", variant: "destructive" });
      return;
    }
    const result = await createAnnouncement({ ...newAnnouncement, is_active: true });
    if (result.success) {
      setNewAnnouncement({ title: "", content: "", priority: 0 });
      toast({ title: "Announcement added!" });
    }
  };

  const handleAddTestimonial = async () => {
    if (!newTestimonial.student_name || !newTestimonial.content) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    const result = await createTestimonial({ 
      ...newTestimonial, 
      is_featured: false, 
      is_approved: true,
      student_image: newTestimonial.student_image || null,
      course_name: newTestimonial.course_name || null
    });
    if (result.success) {
      setNewTestimonial({ student_name: "", content: "", rating: 5, course_name: "", student_image: "" });
      toast({ title: "Testimonial added!" });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast({ title: "Please enter category name", variant: "destructive" });
      return;
    }
    const result = await createCategory(newCategory);
    if (result.success) {
      setNewCategory({ name: "", icon: "BookOpen", color: "primary", sort_order: 0 });
      toast({ title: "Category added!" });
    }
  };

  const tabs = [
    { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
    { id: "general" as const, label: "General", icon: Settings },
    { id: "appearance" as const, label: "Appearance", icon: Palette },
    { id: "sections" as const, label: "Sections", icon: Layout },
    { id: "maintenance" as const, label: "Maintenance", icon: Construction },
    { id: "courses" as const, label: "Courses", icon: BookOpen },
    { id: "categories" as const, label: "Categories", icon: Tag },
    { id: "announcements" as const, label: "Announcements", icon: Megaphone },
    { id: "testimonials" as const, label: "Testimonials", icon: Star },
    { id: "reviews" as const, label: "Reviews", icon: MessageSquare },
    { id: "blog" as const, label: "Blog", icon: FileText },
    { id: "contact" as const, label: "Contact", icon: Mail },
  ];

  const getCourseLessons = (courseId: string) => lessons.filter(l => l.course_id === courseId);

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
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === "analytics" && <AnalyticsTab />}
          
          {activeTab === "sections" && <SectionsTab />}
          
          {activeTab === "maintenance" && <MaintenanceTab />}
          
          {activeTab === "reviews" && <ReviewsTab />}

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
              
              {/* Add New Course */}
              <div className="glass-card p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add New Course</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input placeholder="Course Title *" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} className="input-glass" />
                  <input placeholder="Description" value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} className="input-glass" />
                  <input placeholder="Thumbnail URL" value={newCourse.thumbnail_url} onChange={(e) => setNewCourse({ ...newCourse, thumbnail_url: e.target.value })} className="input-glass" />
                  <select value={newCourse.category} onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })} className="input-glass bg-card">
                    <option value="general">General</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <input placeholder="Price (e.g., Free, ₹499)" value={newCourse.price} onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })} className="input-glass" />
                  <input placeholder="Duration (e.g., 10 hours)" value={newCourse.duration} onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })} className="input-glass" />
                </div>
                <div className="flex items-center gap-6 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={newCourse.certificates_enabled} onChange={(e) => setNewCourse({ ...newCourse, certificates_enabled: e.target.checked })} className="w-4 h-4 accent-primary" />
                    <span className="text-sm">Enable Certificate</span>
                  </label>
                  <button onClick={handleAddCourse} className="btn-gradient">Add Course</button>
                </div>
              </div>

              {/* Course List */}
              <div className="space-y-4">
                {courses.length === 0 ? (
                  <div className="glass-card p-8 text-center text-muted-foreground">No courses yet. Add your first course above.</div>
                ) : (
                  courses.map((course) => (
                    <div key={course.id} className="glass-card overflow-hidden">
                      <div className="p-6 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-display text-xl font-bold">{course.title}</h3>
                            {course.is_featured && <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Trending</span>}
                            {course.certificates_enabled && <span className="px-2 py-0.5 text-xs rounded-full bg-success/20 text-success flex items-center gap-1"><Award className="w-3 h-3" /> Certificate</span>}
                          </div>
                          <p className="text-muted-foreground text-sm">{course.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="px-2 py-0.5 rounded bg-secondary/10">{course.category || 'General'}</span>
                            {course.price && <span>{course.price}</span>}
                            {course.duration && <span>{course.duration}</span>}
                            <span>{getCourseLessons(course.id).length} lessons</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => updateCourse(course.id, { is_featured: !course.is_featured })}
                            className={`p-2 rounded-lg transition-colors ${course.is_featured ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-primary/10'}`}
                            title="Toggle Trending"
                          >
                            <TrendingUp className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => updateCourse(course.id, { certificates_enabled: !course.certificates_enabled })}
                            className={`p-2 rounded-lg transition-colors ${course.certificates_enabled ? 'bg-success/20 text-success' : 'text-muted-foreground hover:bg-success/10'}`}
                            title="Toggle Certificate"
                          >
                            <Award className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => updateCourse(course.id, { is_published: !course.is_published })}
                            className={`p-2 rounded-lg transition-colors ${course.is_published ? 'bg-success/20 text-success' : 'text-muted-foreground hover:bg-muted/10'}`}
                            title={course.is_published ? "Published" : "Draft"}
                          >
                            {course.is_published ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                          </button>
                          <button 
                            onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)} 
                            className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                          >
                            {expandedCourse === course.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                          <button onClick={() => { deleteCourse(course.id); toast({ title: "Course deleted" }); }} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {expandedCourse === course.id && (
                        <div className="border-t border-border/50 bg-background/30 p-6">
                          <h4 className="font-medium mb-4 flex items-center gap-2"><Play className="w-4 h-4" /> Lessons & Content</h4>
                          
                          <div className="glass-card p-4 mb-4 bg-primary/5">
                            <h5 className="text-sm font-medium mb-3 flex items-center gap-2"><Plus className="w-3 h-3" /> Add New Content</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
                              <select value={newLesson.resource_type} onChange={(e) => setNewLesson({ ...newLesson, resource_type: e.target.value as ResourceType })} className="input-glass text-sm bg-card">
                                {RESOURCE_TYPES.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
                              </select>
                              <input placeholder="Title *" value={newLesson.title} onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })} className="input-glass text-sm" />
                              <input placeholder="Video/Link URL" value={newLesson.video_url} onChange={(e) => setNewLesson({ ...newLesson, video_url: e.target.value })} className="input-glass text-sm" />
                              <input placeholder="PDF URL" value={newLesson.pdf_url} onChange={(e) => setNewLesson({ ...newLesson, pdf_url: e.target.value })} className="input-glass text-sm" />
                              <input placeholder="Notes" value={newLesson.notes} onChange={(e) => setNewLesson({ ...newLesson, notes: e.target.value })} className="input-glass text-sm" />
                              <button onClick={() => handleAddLesson(course.id)} className="btn-gradient text-sm">Add</button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {getCourseLessons(course.id).length === 0 ? (
                              <p className="text-muted-foreground text-sm py-4 text-center">No content yet. Add lessons above.</p>
                            ) : (
                              getCourseLessons(course.id).map((lesson, index) => (
                                <div key={lesson.id} className="glass-card p-4 flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">{index + 1}</span>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h5 className="font-medium">{lesson.title}</h5>
                                        <span className="px-2 py-0.5 text-xs rounded-full bg-secondary/20 text-secondary capitalize">
                                          {RESOURCE_TYPES.find(rt => rt.value === lesson.resource_type)?.label || lesson.resource_type}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                        {lesson.video_url && <span className="flex items-center gap-1"><Play className="w-3 h-3" /> Link</span>}
                                        {lesson.pdf_url && <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> PDF</span>}
                                        {lesson.notes && <span className="flex items-center gap-1"><Edit3 className="w-3 h-3" /> Notes</span>}
                                      </div>
                                    </div>
                                  </div>
                                  <button onClick={() => handleDeleteLesson(lesson.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "categories" && (
            <div className="space-y-6 max-w-3xl">
              <h2 className="font-display text-2xl font-bold">Manage Categories</h2>
              
              <div className="glass-card p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input placeholder="Category Name *" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} className="input-glass" />
                  <input placeholder="Icon (e.g., BookOpen)" value={newCategory.icon} onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })} className="input-glass" />
                  <select value={newCategory.color} onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })} className="input-glass bg-card">
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="accent">Accent</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                  </select>
                  <button onClick={handleAddCategory} className="btn-gradient">Add</button>
                </div>
              </div>

              <div className="space-y-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="glass-card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className={`w-10 h-10 rounded-lg bg-${cat.color}/20 flex items-center justify-center`}>
                        <Tag className={`w-5 h-5 text-${cat.color}`} />
                      </span>
                      <div>
                        <h4 className="font-medium">{cat.name}</h4>
                        <p className="text-xs text-muted-foreground">Icon: {cat.icon} | Color: {cat.color}</p>
                      </div>
                    </div>
                    <button onClick={() => { deleteCategory(cat.id); toast({ title: "Category deleted" }); }} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "announcements" && (
            <div className="space-y-6 max-w-3xl">
              <h2 className="font-display text-2xl font-bold">Announcements</h2>
              
              <div className="glass-card p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Announcement</h3>
                <div className="space-y-4">
                  <input placeholder="Announcement Title *" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} className="input-glass" />
                  <textarea placeholder="Content" value={newAnnouncement.content} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} className="input-glass min-h-[80px]" />
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-sm text-muted-foreground">Priority (higher = shown first)</label>
                      <input type="number" value={newAnnouncement.priority} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: parseInt(e.target.value) || 0 })} className="input-glass" />
                    </div>
                    <button onClick={handleAddAnnouncement} className="btn-gradient">Add Announcement</button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {announcements.map((ann) => (
                  <div key={ann.id} className="glass-card p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{ann.title}</h4>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${ann.is_active ? 'bg-success/20 text-success' : 'bg-muted/20 text-muted-foreground'}`}>
                          {ann.is_active ? 'Active' : 'Hidden'}
                        </span>
                        <span className="text-xs text-muted-foreground">Priority: {ann.priority}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{ann.content}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateAnnouncement(ann.id, { is_active: !ann.is_active })}
                        className={`p-2 rounded-lg ${ann.is_active ? 'bg-success/20 text-success' : 'text-muted-foreground hover:bg-muted/10'}`}
                      >
                        {ann.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button onClick={() => { deleteAnnouncement(ann.id); toast({ title: "Announcement deleted" }); }} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "testimonials" && (
            <div className="space-y-6 max-w-3xl">
              <h2 className="font-display text-2xl font-bold">Student Testimonials</h2>
              
              <div className="glass-card p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Testimonial</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input placeholder="Student Name *" value={newTestimonial.student_name} onChange={(e) => setNewTestimonial({ ...newTestimonial, student_name: e.target.value })} className="input-glass" />
                  <input placeholder="Course Name" value={newTestimonial.course_name} onChange={(e) => setNewTestimonial({ ...newTestimonial, course_name: e.target.value })} className="input-glass" />
                  <input placeholder="Student Image URL" value={newTestimonial.student_image} onChange={(e) => setNewTestimonial({ ...newTestimonial, student_image: e.target.value })} className="input-glass" />
                  <select value={newTestimonial.rating} onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value) })} className="input-glass bg-card">
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </div>
                <textarea placeholder="Testimonial Content *" value={newTestimonial.content} onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })} className="input-glass min-h-[80px] mt-4" />
                <button onClick={handleAddTestimonial} className="btn-gradient mt-4">Add Testimonial</button>
              </div>

              <div className="space-y-2">
                {testimonials.map((test) => (
                  <div key={test.id} className="glass-card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                        {test.student_image ? <img src={test.student_image} alt="" className="w-full h-full object-cover" /> : <Star className="w-6 h-6 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">{test.student_name}</h4>
                          <div className="flex items-center gap-0.5">
                            {[...Array(test.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-primary text-primary" />)}
                          </div>
                          {test.is_featured && <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">Featured</span>}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{test.content}</p>
                        {test.course_name && <p className="text-xs text-primary mt-1">{test.course_name}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateTestimonial(test.id, { is_featured: !test.is_featured })}
                        className={`p-2 rounded-lg ${test.is_featured ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-primary/10'}`}
                        title="Toggle Featured"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button onClick={() => { deleteTestimonial(test.id); toast({ title: "Testimonial deleted" }); }} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "blog" && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold">Manage Blog Posts</h2>
              
              <div className="glass-card p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add New Blog Post</h3>
                <div className="space-y-4">
                  <input placeholder="Post Title *" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} className="input-glass" />
                  <textarea placeholder="Post Content" value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} className="input-glass min-h-[120px]" />
                  <div className="flex gap-4">
                    <input placeholder="Image URL (optional)" value={newPost.image_url} onChange={(e) => setNewPost({ ...newPost, image_url: e.target.value })} className="input-glass flex-1" />
                    <button onClick={handleAddPost} className="btn-gradient">Add Post</button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="glass-card p-8 text-center text-muted-foreground">No blog posts yet. Add your first post above.</div>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="glass-card p-6">
                      {editingPost === post.id ? (
                        <div className="space-y-4">
                          <input value={editPostData.title} onChange={(e) => setEditPostData({ ...editPostData, title: e.target.value })} className="input-glass" />
                          <textarea value={editPostData.content} onChange={(e) => setEditPostData({ ...editPostData, content: e.target.value })} className="input-glass min-h-[100px]" />
                          <input placeholder="Image URL" value={editPostData.image_url} onChange={(e) => setEditPostData({ ...editPostData, image_url: e.target.value })} className="input-glass" />
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdatePost(post.id)} className="btn-gradient text-sm">Save</button>
                            <button onClick={() => setEditingPost(null)} className="btn-glass text-sm">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{post.title}</h3>
                            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{post.content}</p>
                            {post.image_url && <p className="text-xs text-primary mt-2">Has image</p>}
                            <p className="text-xs text-muted-foreground mt-2">{new Date(post.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setEditingPost(post.id); setEditPostData({ title: post.title, content: post.content || "", image_url: post.image_url || "" }); }} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => { deletePost(post.id); toast({ title: "Post deleted" }); }} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
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

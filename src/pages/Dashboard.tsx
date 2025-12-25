import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Settings, Palette, BookOpen, FileText, Mail, Plus, Trash2, Save, Edit3, Play, X, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useInstitution } from "@/hooks/useInstitution";
import { useCourses } from "@/hooks/useCourses";
import { useLessons, Lesson } from "@/hooks/useLessons";
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
  const { lessons, createLesson, updateLesson, deleteLesson, refetch: refetchLessons } = useLessons();
  const { posts, createPost, updatePost, deletePost } = useBlogPosts();
  const { contactInfo, updateContactInfo } = useContactInfo();
  
  const [activeTab, setActiveTab] = useState<"general" | "appearance" | "courses" | "blog" | "contact">("general");
  const [newCourse, setNewCourse] = useState({ title: "", description: "", thumbnail_url: "" });
  const [newPost, setNewPost] = useState({ title: "", content: "", image_url: "" });
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [newLesson, setNewLesson] = useState({ title: "", video_url: "", notes: "", pdf_url: "" });
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editPostData, setEditPostData] = useState({ title: "", content: "", image_url: "" });

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
    const result = await createCourse({ ...newCourse, institution_id: institution?.id || null, is_published: true });
    if (result.success) {
      setNewCourse({ title: "", description: "", thumbnail_url: "" });
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
      sort_order: courseLessons.length
    });
    if (result.success) {
      setNewLesson({ title: "", video_url: "", notes: "", pdf_url: "" });
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

  const tabs = [
    { id: "general" as const, label: "General", icon: Settings },
    { id: "appearance" as const, label: "Appearance", icon: Palette },
    { id: "courses" as const, label: "Courses & Lessons", icon: BookOpen },
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
              <h2 className="font-display text-2xl font-bold">Manage Courses & Lessons</h2>
              
              {/* Add New Course */}
              <div className="glass-card p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add New Course</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input placeholder="Course Title" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} className="input-glass" />
                  <input placeholder="Description" value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} className="input-glass" />
                  <input placeholder="Thumbnail URL (optional)" value={newCourse.thumbnail_url} onChange={(e) => setNewCourse({ ...newCourse, thumbnail_url: e.target.value })} className="input-glass" />
                  <button onClick={handleAddCourse} className="btn-gradient">Add Course</button>
                </div>
              </div>

              {/* Course List with Lessons */}
              <div className="space-y-4">
                {courses.length === 0 ? (
                  <div className="glass-card p-8 text-center text-muted-foreground">No courses yet. Add your first course above.</div>
                ) : (
                  courses.map((course) => (
                    <div key={course.id} className="glass-card overflow-hidden">
                      {/* Course Header */}
                      <div className="p-6 flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-display text-xl font-bold">{course.title}</h3>
                          <p className="text-muted-foreground text-sm">{course.description}</p>
                          <p className="text-xs text-primary mt-1">{getCourseLessons(course.id).length} lessons</p>
                        </div>
                        <div className="flex items-center gap-2">
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

                      {/* Expanded Lessons Section */}
                      {expandedCourse === course.id && (
                        <div className="border-t border-border/50 bg-background/30 p-6">
                          <h4 className="font-medium mb-4 flex items-center gap-2"><Play className="w-4 h-4" /> Lessons</h4>
                          
                          {/* Add Lesson Form */}
                          <div className="glass-card p-4 mb-4 bg-primary/5">
                            <h5 className="text-sm font-medium mb-3 flex items-center gap-2"><Plus className="w-3 h-3" /> Add New Lesson</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                              <input 
                                placeholder="Lesson Title *" 
                                value={newLesson.title} 
                                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })} 
                                className="input-glass text-sm" 
                              />
                              <input 
                                placeholder="Video URL (YouTube/Vimeo)" 
                                value={newLesson.video_url} 
                                onChange={(e) => setNewLesson({ ...newLesson, video_url: e.target.value })} 
                                className="input-glass text-sm" 
                              />
                              <input 
                                placeholder="PDF URL (optional)" 
                                value={newLesson.pdf_url} 
                                onChange={(e) => setNewLesson({ ...newLesson, pdf_url: e.target.value })} 
                                className="input-glass text-sm" 
                              />
                              <input 
                                placeholder="Notes (optional)" 
                                value={newLesson.notes} 
                                onChange={(e) => setNewLesson({ ...newLesson, notes: e.target.value })} 
                                className="input-glass text-sm" 
                              />
                              <button onClick={() => handleAddLesson(course.id)} className="btn-gradient text-sm">Add Lesson</button>
                            </div>
                          </div>

                          {/* Lesson List */}
                          <div className="space-y-2">
                            {getCourseLessons(course.id).length === 0 ? (
                              <p className="text-muted-foreground text-sm py-4 text-center">No lessons yet. Add your first lesson above.</p>
                            ) : (
                              getCourseLessons(course.id).map((lesson, index) => (
                                <div key={lesson.id} className="glass-card p-4 flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">{index + 1}</span>
                                    <div>
                                      <h5 className="font-medium">{lesson.title}</h5>
                                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                        {lesson.video_url && <span className="flex items-center gap-1"><Play className="w-3 h-3" /> Video</span>}
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
          {activeTab === "blog" && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold">Manage Blog Posts</h2>
              
              {/* Add New Post */}
              <div className="glass-card p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add New Blog Post</h3>
                <div className="space-y-4">
                  <input 
                    placeholder="Post Title *" 
                    value={newPost.title} 
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} 
                    className="input-glass" 
                  />
                  <textarea 
                    placeholder="Post Content" 
                    value={newPost.content} 
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} 
                    className="input-glass min-h-[120px]" 
                  />
                  <div className="flex gap-4">
                    <input 
                      placeholder="Image URL (optional)" 
                      value={newPost.image_url} 
                      onChange={(e) => setNewPost({ ...newPost, image_url: e.target.value })} 
                      className="input-glass flex-1" 
                    />
                    <button onClick={handleAddPost} className="btn-gradient">Add Post</button>
                  </div>
                </div>
              </div>

              {/* Post List */}
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="glass-card p-8 text-center text-muted-foreground">No blog posts yet. Add your first post above.</div>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="glass-card p-6">
                      {editingPost === post.id ? (
                        <div className="space-y-4">
                          <input 
                            value={editPostData.title} 
                            onChange={(e) => setEditPostData({ ...editPostData, title: e.target.value })} 
                            className="input-glass" 
                          />
                          <textarea 
                            value={editPostData.content} 
                            onChange={(e) => setEditPostData({ ...editPostData, content: e.target.value })} 
                            className="input-glass min-h-[100px]" 
                          />
                          <input 
                            placeholder="Image URL" 
                            value={editPostData.image_url} 
                            onChange={(e) => setEditPostData({ ...editPostData, image_url: e.target.value })} 
                            className="input-glass" 
                          />
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
                            <button 
                              onClick={() => { 
                                setEditingPost(post.id); 
                                setEditPostData({ title: post.title, content: post.content || "", image_url: post.image_url || "" }); 
                              }} 
                              className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            >
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

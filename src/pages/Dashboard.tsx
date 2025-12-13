import { useState } from "react";
import { Link } from "react-router-dom";
import { useSite, Course, Lesson } from "@/contexts/SiteContext";
import {
  ArrowLeft,
  Settings,
  Palette,
  BookOpen,
  Plus,
  Trash2,
  Save,
  Edit3,
  Play,
  X,
  Type,
  Home,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const {
    settings,
    updateSettings,
    addCourse,
    updateCourse,
    deleteCourse,
    addLesson,
    updateLesson,
    deleteLesson,
  } = useSite();

  const [activeTab, setActiveTab] = useState<"general" | "ui" | "courses">("general");
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [newCourse, setNewCourse] = useState({ title: "", description: "", thumbnail: "📚" });
  const [newLesson, setNewLesson] = useState<{ courseId: string; title: string; videoUrl: string; notes: string } | null>(null);

  const handleSaveGeneral = () => {
    toast({ title: "Settings saved!", description: "Your changes have been applied." });
  };

  const handleAddCourse = () => {
    if (!newCourse.title) return;
    addCourse({ ...newCourse, lessons: [] });
    setNewCourse({ title: "", description: "", thumbnail: "📚" });
    toast({ title: "Course added!" });
  };

  const handleAddLesson = (courseId: string) => {
    if (!newLesson?.title || !newLesson?.videoUrl) return;
    addLesson(courseId, {
      title: newLesson.title,
      videoUrl: newLesson.videoUrl,
      notes: newLesson.notes,
    });
    setNewLesson(null);
    toast({ title: "Lesson added!" });
  };

  const tabs = [
    { id: "general" as const, label: "General", icon: Settings },
    { id: "ui" as const, label: "Appearance", icon: Palette },
    { id: "courses" as const, label: "Courses", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-card rounded-none border-x-0 border-t-0 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-display text-xl font-bold">
              <span className="gradient-text">{settings.institutionName}</span> Dashboard
            </h1>
          </div>
          <Link to="/" className="btn-gradient text-sm">
            View Site
          </Link>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-73px)] glass-card rounded-none border-y-0 border-l-0 p-4">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === "general" && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="font-display text-2xl font-bold">General Settings</h2>

              <div className="glass-card p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Institution Name</label>
                  <input
                    type="text"
                    value={settings.institutionName}
                    onChange={(e) => updateSettings({ institutionName: e.target.value })}
                    className="input-glass"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Institution Logo (Emoji)</label>
                  <input
                    type="text"
                    value={settings.institutionLogo}
                    onChange={(e) => updateSettings({ institutionLogo: e.target.value })}
                    className="input-glass"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={settings.institutionDescription}
                    onChange={(e) => updateSettings({ institutionDescription: e.target.value })}
                    className="input-glass min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Home Card Text</label>
                    <input
                      type="text"
                      value={settings.homeCardText}
                      onChange={(e) => updateSettings({ homeCardText: e.target.value })}
                      className="input-glass"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Home Card Subtitle</label>
                    <input
                      type="text"
                      value={settings.homeCardSubtitle}
                      onChange={(e) => updateSettings({ homeCardSubtitle: e.target.value })}
                      className="input-glass"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Type className="w-4 h-4" /> Navigation Labels
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Home</label>
                      <input
                        type="text"
                        value={settings.navLabels.home}
                        onChange={(e) =>
                          updateSettings({ navLabels: { ...settings.navLabels, home: e.target.value } })
                        }
                        className="input-glass"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Courses</label>
                      <input
                        type="text"
                        value={settings.navLabels.courses}
                        onChange={(e) =>
                          updateSettings({ navLabels: { ...settings.navLabels, courses: e.target.value } })
                        }
                        className="input-glass"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Admin</label>
                      <input
                        type="text"
                        value={settings.navLabels.admin}
                        onChange={(e) =>
                          updateSettings({ navLabels: { ...settings.navLabels, admin: e.target.value } })
                        }
                        className="input-glass"
                      />
                    </div>
                  </div>
                </div>

                <button onClick={handleSaveGeneral} className="btn-gradient flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "ui" && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="font-display text-2xl font-bold">Appearance</h2>

              <div className="glass-card p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Color (HSL)</label>
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                    className="input-glass"
                    placeholder="262 83% 58%"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Format: hue saturation% lightness%</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Background Color (HSL)</label>
                  <input
                    type="text"
                    value={settings.backgroundColor}
                    onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                    className="input-glass"
                    placeholder="240 10% 4%"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Card Color (HSL)</label>
                  <input
                    type="text"
                    value={settings.cardColor}
                    onChange={(e) => updateSettings({ cardColor: e.target.value })}
                    className="input-glass"
                    placeholder="240 6% 10%"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Font Family</label>
                  <input
                    type="text"
                    value={settings.fontFamily}
                    onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                    className="input-glass"
                  />
                </div>

                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-sm text-muted-foreground">
                    💡 Changes are applied instantly. Refresh the site to see updates.
                  </p>
                </div>

                <button onClick={handleSaveGeneral} className="btn-gradient flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "courses" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold">Manage Courses</h2>
              </div>

              {/* Add Course Form */}
              <div className="glass-card p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add New Course
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Course Title"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    className="input-glass"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    className="input-glass md:col-span-2"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="📚"
                      value={newCourse.thumbnail}
                      onChange={(e) => setNewCourse({ ...newCourse, thumbnail: e.target.value })}
                      className="input-glass w-20"
                    />
                    <button onClick={handleAddCourse} className="btn-gradient flex-1">
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Course List */}
              <div className="space-y-4">
                {settings.courses.map((course) => (
                  <div key={course.id} className="glass-card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{course.thumbnail}</span>
                        <div>
                          <h3 className="font-display text-xl font-bold">{course.title}</h3>
                          <p className="text-muted-foreground text-sm">{course.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingCourse(editingCourse === course.id ? null : course.id)}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            deleteCourse(course.id);
                            toast({ title: "Course deleted" });
                          }}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {editingCourse === course.id && (
                      <div className="border-t border-border/50 pt-4 mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input
                            type="text"
                            placeholder="Title"
                            value={course.title}
                            onChange={(e) => updateCourse(course.id, { title: e.target.value })}
                            className="input-glass"
                          />
                          <input
                            type="text"
                            placeholder="Description"
                            value={course.description}
                            onChange={(e) => updateCourse(course.id, { description: e.target.value })}
                            className="input-glass"
                          />
                          <input
                            type="text"
                            placeholder="Thumbnail"
                            value={course.thumbnail}
                            onChange={(e) => updateCourse(course.id, { thumbnail: e.target.value })}
                            className="input-glass"
                          />
                        </div>

                        {/* Lessons */}
                        <div className="bg-background/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium flex items-center gap-2">
                              <Play className="w-4 h-4" /> Lessons ({course.lessons.length})
                            </h4>
                            <button
                              onClick={() =>
                                setNewLesson({ courseId: course.id, title: "", videoUrl: "", notes: "" })
                              }
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-4 h-4" /> Add Lesson
                            </button>
                          </div>

                          {newLesson?.courseId === course.id && (
                            <div className="glass-card p-4 mb-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">New Lesson</span>
                                <button onClick={() => setNewLesson(null)} className="text-muted-foreground">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <input
                                type="text"
                                placeholder="Lesson Title"
                                value={newLesson.title}
                                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                                className="input-glass"
                              />
                              <input
                                type="text"
                                placeholder="Video URL (YouTube embed)"
                                value={newLesson.videoUrl}
                                onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
                                className="input-glass"
                              />
                              <input
                                type="text"
                                placeholder="Notes (optional)"
                                value={newLesson.notes}
                                onChange={(e) => setNewLesson({ ...newLesson, notes: e.target.value })}
                                className="input-glass"
                              />
                              <button
                                onClick={() => handleAddLesson(course.id)}
                                className="btn-gradient text-sm"
                              >
                                Add Lesson
                              </button>
                            </div>
                          )}

                          <div className="space-y-2">
                            {course.lessons.map((lesson, index) => (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-3 p-3 bg-card/50 rounded-lg"
                              >
                                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary">
                                  {index + 1}
                                </span>
                                <input
                                  type="text"
                                  value={lesson.title}
                                  onChange={(e) =>
                                    updateLesson(course.id, lesson.id, { title: e.target.value })
                                  }
                                  className="input-glass flex-1 py-1"
                                />
                                <button
                                  onClick={() => {
                                    deleteLesson(course.id, lesson.id);
                                    toast({ title: "Lesson deleted" });
                                  }}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

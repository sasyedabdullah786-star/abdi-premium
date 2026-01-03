import { useState } from "react";
import { Plus, Trash2, Save, Edit3, X, ChevronDown, ChevronUp, TrendingUp, Award, Eye, EyeOff, Play, FileText, BookOpen, GripVertical } from "lucide-react";
import { useCourses, Course } from "@/hooks/useCourses";
import { useLessons, Lesson, RESOURCE_TYPES, ResourceType } from "@/hooks/useLessons";
import { useCategories } from "@/hooks/useCategories";
import { useInstitution } from "@/hooks/useInstitution";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CoursesTab = () => {
  const { courses, createCourse, updateCourse, deleteCourse } = useCourses();
  const { lessons, createLesson, updateLesson, deleteLesson, refetch: refetchLessons } = useLessons();
  const { categories } = useCategories();
  const { institution } = useInstitution();
  const { toast } = useToast();

  const [newCourse, setNewCourse] = useState({ 
    title: "", description: "", thumbnail_url: "", category: "general", 
    price: "Free", duration: "", certificates_enabled: false 
  });
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [editCourseData, setEditCourseData] = useState<Partial<Course>>({});
  const [newLesson, setNewLesson] = useState({ 
    title: "", video_url: "", notes: "", pdf_url: "", resource_type: "video" as ResourceType 
  });
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [editLessonData, setEditLessonData] = useState<Partial<Lesson>>({});

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
      duration: newCourse.duration || null,
      average_rating: null,
      total_reviews: null,
      total_enrollments: null
    });
    if (result.success) {
      setNewCourse({ title: "", description: "", thumbnail_url: "", category: "general", price: "Free", duration: "", certificates_enabled: false });
      toast({ title: "Course added successfully!" });
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course.id);
    setEditCourseData({
      title: course.title,
      description: course.description,
      thumbnail_url: course.thumbnail_url,
      category: course.category,
      price: course.price,
      duration: course.duration,
      certificates_enabled: course.certificates_enabled
    });
  };

  const handleSaveCourse = async (id: string) => {
    const result = await updateCourse(id, editCourseData);
    if (result.success) {
      setEditingCourse(null);
      toast({ title: "Course updated!" });
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (confirm("Delete this course and all its lessons?")) {
      const result = await deleteCourse(id);
      if (result.success) toast({ title: "Course deleted" });
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
      toast({ title: "Lesson added!" });
    }
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson.id);
    setEditLessonData({
      title: lesson.title,
      video_url: lesson.video_url,
      notes: lesson.notes,
      pdf_url: lesson.pdf_url,
      resource_type: lesson.resource_type
    });
  };

  const handleSaveLesson = async (id: string) => {
    const result = await updateLesson(id, editLessonData);
    if (result.success) {
      setEditingLesson(null);
      refetchLessons();
      toast({ title: "Lesson updated!" });
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (confirm("Delete this lesson?")) {
      const result = await deleteLesson(lessonId);
      if (result.success) {
        refetchLessons();
        toast({ title: "Lesson deleted" });
      }
    }
  };

  const getCourseLessons = (courseId: string) => lessons.filter(l => l.course_id === courseId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Manage Courses</h2>
        <p className="text-muted-foreground">Add, edit, and organize your courses and lessons</p>
      </div>

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
              <div className="p-6">
                {editingCourse === course.id ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <input placeholder="Title" value={editCourseData.title || ""} onChange={(e) => setEditCourseData({ ...editCourseData, title: e.target.value })} className="input-glass" />
                      <input placeholder="Description" value={editCourseData.description || ""} onChange={(e) => setEditCourseData({ ...editCourseData, description: e.target.value })} className="input-glass" />
                      <input placeholder="Thumbnail URL" value={editCourseData.thumbnail_url || ""} onChange={(e) => setEditCourseData({ ...editCourseData, thumbnail_url: e.target.value })} className="input-glass" />
                      <select value={editCourseData.category || "general"} onChange={(e) => setEditCourseData({ ...editCourseData, category: e.target.value })} className="input-glass bg-card">
                        <option value="general">General</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                      <input placeholder="Price" value={editCourseData.price || ""} onChange={(e) => setEditCourseData({ ...editCourseData, price: e.target.value })} className="input-glass" />
                      <input placeholder="Duration" value={editCourseData.duration || ""} onChange={(e) => setEditCourseData({ ...editCourseData, duration: e.target.value })} className="input-glass" />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={editCourseData.certificates_enabled} onChange={(e) => setEditCourseData({ ...editCourseData, certificates_enabled: e.target.checked })} className="w-4 h-4 accent-primary" />
                        <span className="text-sm">Enable Certificate</span>
                      </label>
                      <button onClick={() => handleSaveCourse(course.id)} className="btn-gradient flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
                      <button onClick={() => setEditingCourse(null)} className="btn-outline flex items-center gap-2"><X className="w-4 h-4" /> Cancel</button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-display text-xl font-bold">{course.title}</h3>
                        {course.is_featured && <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Trending</span>}
                        {course.certificates_enabled && <span className="px-2 py-0.5 text-xs rounded-full bg-success/20 text-success flex items-center gap-1"><Award className="w-3 h-3" /> Certificate</span>}
                        {!course.is_published && <span className="px-2 py-0.5 text-xs rounded-full bg-destructive/20 text-destructive">Draft</span>}
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
                      <button onClick={() => updateCourse(course.id, { is_published: !course.is_published })} className={`p-2 rounded-lg transition-colors ${course.is_published ? 'bg-success/20 text-success' : 'bg-muted/20 text-muted-foreground'}`} title={course.is_published ? "Published" : "Draft"}>
                        {course.is_published ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                      <button onClick={() => updateCourse(course.id, { is_featured: !course.is_featured })} className={`p-2 rounded-lg transition-colors ${course.is_featured ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-primary/10'}`} title="Toggle Trending">
                        <TrendingUp className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleEditCourse(course)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"><Edit3 className="w-5 h-5" /></button>
                      <button onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg">
                        {expandedCourse === course.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                      <button onClick={() => handleDeleteCourse(course.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                )}
              </div>

              {/* Lessons */}
              {expandedCourse === course.id && (
                <div className="border-t border-border/50 p-6 bg-muted/5">
                  <h4 className="font-medium mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Lessons ({getCourseLessons(course.id).length})</h4>
                  
                  {/* Add Lesson Form */}
                  <div className="glass-card p-4 mb-4 bg-card/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <input placeholder="Lesson Title *" value={newLesson.title} onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })} className="input-glass text-sm" />
                      <select value={newLesson.resource_type} onChange={(e) => setNewLesson({ ...newLesson, resource_type: e.target.value as ResourceType })} className="input-glass bg-card text-sm">
                        {RESOURCE_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                      </select>
                      <input placeholder="Video URL" value={newLesson.video_url} onChange={(e) => setNewLesson({ ...newLesson, video_url: e.target.value })} className="input-glass text-sm" />
                      <input placeholder="PDF URL" value={newLesson.pdf_url} onChange={(e) => setNewLesson({ ...newLesson, pdf_url: e.target.value })} className="input-glass text-sm" />
                    </div>
                    <div className="flex gap-3 mt-3">
                      <textarea placeholder="Notes (optional)" value={newLesson.notes} onChange={(e) => setNewLesson({ ...newLesson, notes: e.target.value })} className="input-glass text-sm flex-1 min-h-[60px]" />
                      <button onClick={() => handleAddLesson(course.id)} className="btn-gradient self-end"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {/* Lessons List */}
                  {getCourseLessons(course.id).length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">No lessons yet</p>
                  ) : (
                    <div className="space-y-2">
                      {getCourseLessons(course.id).map((lesson, idx) => (
                        <div key={lesson.id} className="glass-card p-4 flex items-center gap-4">
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                          <span className="text-muted-foreground text-sm w-8">{idx + 1}</span>
                          
                          {editingLesson === lesson.id ? (
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                              <input value={editLessonData.title || ""} onChange={(e) => setEditLessonData({ ...editLessonData, title: e.target.value })} className="input-glass text-sm" />
                              <input placeholder="Video URL" value={editLessonData.video_url || ""} onChange={(e) => setEditLessonData({ ...editLessonData, video_url: e.target.value })} className="input-glass text-sm" />
                              <div className="flex gap-2">
                                <button onClick={() => handleSaveLesson(lesson.id)} className="btn-gradient text-sm"><Save className="w-3 h-3" /></button>
                                <button onClick={() => setEditingLesson(null)} className="btn-outline text-sm"><X className="w-3 h-3" /></button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1">
                                <h5 className="font-medium">{lesson.title}</h5>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    {lesson.resource_type === 'video' && <Play className="w-3 h-3" />}
                                    {lesson.resource_type === 'pdf' && <FileText className="w-3 h-3" />}
                                    {lesson.resource_type || 'video'}
                                  </span>
                                  {lesson.video_url && <span className="text-primary">Video</span>}
                                  {lesson.pdf_url && <span className="text-secondary">PDF</span>}
                                </div>
                              </div>
                              <button onClick={() => handleEditLesson(lesson)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteLesson(lesson.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CoursesTab;

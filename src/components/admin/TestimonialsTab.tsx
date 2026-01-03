import { useState } from "react";
import { Plus, Trash2, Save, Edit3, X, Star, Check, Eye, EyeOff, TrendingUp } from "lucide-react";
import { useTestimonials, Testimonial } from "@/hooks/useTestimonials";
import { useCourses } from "@/hooks/useCourses";
import { useToast } from "@/hooks/use-toast";

const TestimonialsTab = () => {
  const { testimonials, createTestimonial, updateTestimonial, deleteTestimonial } = useTestimonials();
  const { courses } = useCourses();
  const { toast } = useToast();

  const [newTestimonial, setNewTestimonial] = useState({ 
    student_name: "", content: "", rating: 5, course_name: "", student_image: "" 
  });
  const [editingTestimonial, setEditingTestimonial] = useState<string | null>(null);
  const [editTestimonialData, setEditTestimonialData] = useState<Partial<Testimonial>>({});

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

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial.id);
    setEditTestimonialData({
      student_name: testimonial.student_name,
      content: testimonial.content,
      rating: testimonial.rating,
      course_name: testimonial.course_name,
      student_image: testimonial.student_image
    });
  };

  const handleSaveTestimonial = async (id: string) => {
    const result = await updateTestimonial(id, editTestimonialData);
    if (result.success) {
      setEditingTestimonial(null);
      toast({ title: "Testimonial updated!" });
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (confirm("Delete this testimonial?")) {
      const result = await deleteTestimonial(id);
      if (result.success) toast({ title: "Testimonial deleted" });
    }
  };

  const handleToggleApproved = async (testimonial: Testimonial) => {
    const result = await updateTestimonial(testimonial.id, { is_approved: !testimonial.is_approved });
    if (result.success) {
      toast({ title: testimonial.is_approved ? "Testimonial hidden" : "Testimonial approved" });
    }
  };

  const handleToggleFeatured = async (testimonial: Testimonial) => {
    const result = await updateTestimonial(testimonial.id, { is_featured: !testimonial.is_featured });
    if (result.success) {
      toast({ title: testimonial.is_featured ? "Removed from featured" : "Added to featured" });
    }
  };

  const renderStars = (rating: number, editable: boolean = false, onChange?: (rating: number) => void) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => editable && onChange && onChange(star)}
          className={`${editable ? 'cursor-pointer' : 'cursor-default'}`}
          disabled={!editable}
        >
          <Star className={`w-4 h-4 ${star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Manage Testimonials</h2>
        <p className="text-muted-foreground">Add and manage student testimonials</p>
      </div>

      {/* Add New Testimonial */}
      <div className="glass-card p-6">
        <h3 className="font-medium mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add New Testimonial</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              placeholder="Student Name *" 
              value={newTestimonial.student_name} 
              onChange={(e) => setNewTestimonial({ ...newTestimonial, student_name: e.target.value })} 
              className="input-glass" 
            />
            <select 
              value={newTestimonial.course_name} 
              onChange={(e) => setNewTestimonial({ ...newTestimonial, course_name: e.target.value })} 
              className="input-glass bg-card"
            >
              <option value="">Select Course (optional)</option>
              {courses.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
            </select>
            <input 
              placeholder="Student Image URL" 
              value={newTestimonial.student_image} 
              onChange={(e) => setNewTestimonial({ ...newTestimonial, student_image: e.target.value })} 
              className="input-glass" 
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Rating:</span>
            {renderStars(newTestimonial.rating, true, (rating) => setNewTestimonial({ ...newTestimonial, rating }))}
          </div>
          <textarea 
            placeholder="Testimonial content *" 
            value={newTestimonial.content} 
            onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })} 
            className="input-glass min-h-[100px] w-full" 
          />
          <button onClick={handleAddTestimonial} className="btn-gradient">Add Testimonial</button>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="space-y-3">
        {testimonials.length === 0 ? (
          <div className="glass-card p-8 text-center text-muted-foreground">No testimonials yet. Add your first testimonial above.</div>
        ) : (
          testimonials.map((testimonial) => (
            <div key={testimonial.id} className={`glass-card p-4 transition-all ${!testimonial.is_approved ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {testimonial.student_image ? (
                    <img src={testimonial.student_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-primary">{testimonial.student_name.charAt(0)}</span>
                  )}
                </div>

                {editingTestimonial === testimonial.id ? (
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input 
                        value={editTestimonialData.student_name || ""} 
                        onChange={(e) => setEditTestimonialData({ ...editTestimonialData, student_name: e.target.value })} 
                        className="input-glass" 
                        placeholder="Student Name"
                      />
                      <select 
                        value={editTestimonialData.course_name || ""} 
                        onChange={(e) => setEditTestimonialData({ ...editTestimonialData, course_name: e.target.value })} 
                        className="input-glass bg-card"
                      >
                        <option value="">Select Course</option>
                        {courses.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
                      </select>
                      <input 
                        value={editTestimonialData.student_image || ""} 
                        onChange={(e) => setEditTestimonialData({ ...editTestimonialData, student_image: e.target.value })} 
                        className="input-glass" 
                        placeholder="Image URL"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">Rating:</span>
                      {renderStars(editTestimonialData.rating || 5, true, (rating) => setEditTestimonialData({ ...editTestimonialData, rating }))}
                    </div>
                    <textarea 
                      value={editTestimonialData.content || ""} 
                      onChange={(e) => setEditTestimonialData({ ...editTestimonialData, content: e.target.value })} 
                      className="input-glass min-h-[80px] w-full" 
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveTestimonial(testimonial.id)} className="btn-gradient text-sm flex items-center gap-1"><Save className="w-3 h-3" /> Save</button>
                      <button onClick={() => setEditingTestimonial(null)} className="btn-outline text-sm flex items-center gap-1"><X className="w-3 h-3" /> Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{testimonial.student_name}</h3>
                      {testimonial.course_name && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-secondary/20 text-secondary">{testimonial.course_name}</span>
                      )}
                      {testimonial.is_featured && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Featured</span>
                      )}
                      {!testimonial.is_approved && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-muted/20 text-muted-foreground">Hidden</span>
                      )}
                    </div>
                    {renderStars(testimonial.rating)}
                    <p className="text-muted-foreground text-sm mt-2 line-clamp-3">{testimonial.content}</p>
                  </div>
                )}

                {editingTestimonial !== testimonial.id && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button 
                      onClick={() => handleToggleApproved(testimonial)} 
                      className={`p-2 rounded-lg transition-colors ${testimonial.is_approved ? 'bg-success/20 text-success hover:bg-success/30' : 'bg-muted/20 text-muted-foreground hover:bg-muted/30'}`}
                      title={testimonial.is_approved ? "Hide" : "Approve"}
                    >
                      {testimonial.is_approved ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => handleToggleFeatured(testimonial)} 
                      className={`p-2 rounded-lg transition-colors ${testimonial.is_featured ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-primary/10'}`}
                      title="Toggle Featured"
                    >
                      <TrendingUp className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEditTestimonial(testimonial)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteTestimonial(testimonial.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TestimonialsTab;

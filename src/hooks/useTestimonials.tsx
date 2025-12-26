import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Testimonial {
  id: string;
  student_name: string;
  student_image: string | null;
  course_name: string | null;
  rating: number;
  content: string;
  is_featured: boolean;
  is_approved: boolean;
  created_at: string;
}

export const useTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (err) {
      console.error('Error fetching testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTestimonial = async (testimonial: Omit<Testimonial, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert(testimonial)
        .select()
        .single();

      if (error) throw error;
      setTestimonials([data, ...testimonials]);
      return { success: true, data };
    } catch (err) {
      console.error('Error creating testimonial:', err);
      return { success: false, error: err };
    }
  };

  const updateTestimonial = async (id: string, updates: Partial<Testimonial>) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setTestimonials(testimonials.map(t => t.id === id ? { ...t, ...updates } : t));
      return { success: true };
    } catch (err) {
      console.error('Error updating testimonial:', err);
      return { success: false, error: err };
    }
  };

  const deleteTestimonial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTestimonials(testimonials.filter(t => t.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting testimonial:', err);
      return { success: false, error: err };
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  return { testimonials, loading, createTestimonial, updateTestimonial, deleteTestimonial, refetch: fetchTestimonials };
};

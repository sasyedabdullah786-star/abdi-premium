import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Course {
  id: string;
  institution_id: string | null;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (course: Omit<Course, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert(course)
        .select()
        .single();

      if (error) throw error;
      setCourses([data, ...courses]);
      return { success: true, data };
    } catch (err) {
      console.error('Error creating course:', err);
      return { success: false, error: err };
    }
  };

  const updateCourse = async (id: string, updates: Partial<Course>) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setCourses(courses.map(c => c.id === id ? { ...c, ...updates } : c));
      return { success: true };
    } catch (err) {
      console.error('Error updating course:', err);
      return { success: false, error: err };
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCourses(courses.filter(c => c.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting course:', err);
      return { success: false, error: err };
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return { courses, loading, createCourse, updateCourse, deleteCourse, refetch: fetchCourses };
};

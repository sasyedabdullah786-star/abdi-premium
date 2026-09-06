import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ResourceType = 'video' | 'worksheet' | 'notes' | 'pdf' | 'homework' | 'dpp' | 'timetable' | 'pyq';

export const RESOURCE_TYPES: { value: ResourceType; label: string; icon: string }[] = [
  { value: 'video', label: 'Video', icon: 'Play' },
  { value: 'worksheet', label: 'Worksheet', icon: 'FileSpreadsheet' },
  { value: 'notes', label: 'Notes', icon: 'FileText' },
  { value: 'pdf', label: 'PDF', icon: 'File' },
  { value: 'homework', label: 'Homework', icon: 'BookOpen' },
  { value: 'dpp', label: 'DPP', icon: 'Target' },
  { value: 'timetable', label: 'Timetable', icon: 'Calendar' },
  { value: 'pyq', label: 'PYQs', icon: 'History' },
];

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  video_url: string | null;
  notes: string | null;
  pdf_url: string | null;
  sort_order: number;
  resource_type: ResourceType;
  is_free_preview: boolean;
  created_at: string;
  updated_at: string;
}

export const useLessons = (courseId?: string) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLessons = async () => {
    try {
      let query = supabase
        .from('lessons')
        .select('*')
        .order('sort_order', { ascending: true });

      if (courseId) {
        query = query.eq('course_id', courseId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLessons((data as Lesson[]) || []);
    } catch (err) {
      console.error('Error fetching lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  const createLesson = async (lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert(lesson)
        .select()
        .single();

      if (error) throw error;
      setLessons([...lessons, data as Lesson]);
      return { success: true, data };
    } catch (err) {
      console.error('Error creating lesson:', err);
      return { success: false, error: err };
    }
  };

  const updateLesson = async (id: string, updates: Partial<Lesson>) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setLessons(lessons.map(l => l.id === id ? { ...l, ...updates } : l));
      return { success: true };
    } catch (err) {
      console.error('Error updating lesson:', err);
      return { success: false, error: err };
    }
  };

  const deleteLesson = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setLessons(lessons.filter(l => l.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting lesson:', err);
      return { success: false, error: err };
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [courseId]);

  return { lessons, loading, createLesson, updateLesson, deleteLesson, refetch: fetchLessons };
};

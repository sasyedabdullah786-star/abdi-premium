import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string | null;
  progress_percentage: number;
  completed_lessons: string[];
  is_completed: boolean;
  last_accessed_at: string;
  created_at: string;
  updated_at: string;
}

export const useProgress = (courseId?: string) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [allProgress, setAllProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setProgress(null);
      setAllProgress([]);
      return;
    }

    try {
      if (courseId) {
        const { data, error } = await supabase
          .from('course_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setProgress({
            ...data,
            completed_lessons: Array.isArray(data.completed_lessons) 
              ? data.completed_lessons as string[]
              : []
          });
        }
      } else {
        const { data, error } = await supabase
          .from('course_progress')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        setAllProgress((data || []).map(p => ({
          ...p,
          completed_lessons: Array.isArray(p.completed_lessons) 
            ? p.completed_lessons as string[]
            : []
        })));
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
    } finally {
      setLoading(false);
    }
  }, [user, courseId]);

  const updateProgress = async (lessonId: string, totalLessons: number) => {
    if (!user || !courseId) return { success: false };

    try {
      const completedLessons = progress?.completed_lessons || [];
      const newCompleted = completedLessons.includes(lessonId)
        ? completedLessons
        : [...completedLessons, lessonId];
      
      const progressPercentage = Math.round((newCompleted.length / totalLessons) * 100);
      const isCompleted = progressPercentage >= 100;

      const { data, error } = await supabase
        .from('course_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          lesson_id: lessonId,
          completed_lessons: newCompleted,
          progress_percentage: progressPercentage,
          is_completed: isCompleted,
          last_accessed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,course_id'
        })
        .select()
        .single();

      if (error) throw error;
      
      setProgress({
        ...data,
        completed_lessons: newCompleted
      });
      
      return { success: true, data };
    } catch (err) {
      console.error('Error updating progress:', err);
      return { success: false, error: err };
    }
  };

  const markLessonComplete = async (lessonId: string, totalLessons: number) => {
    return updateProgress(lessonId, totalLessons);
  };

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { 
    progress, 
    allProgress, 
    loading, 
    updateProgress, 
    markLessonComplete,
    refetch: fetchProgress 
  };
};

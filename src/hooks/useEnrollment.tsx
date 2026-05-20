import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  viewed_lessons: string[];
  last_lesson_id: string | null;
  xp_earned: number;
  created_at: string;
  updated_at: string;
}

const XP_PER_LESSON = 15;

export const useEnrollment = (courseId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!user || !courseId) { setEnrollment(null); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle();
    setEnrollment((data as any) ?? null);
    setLoading(false);
  }, [user, courseId]);

  useEffect(() => { refetch(); }, [refetch]);

  const enroll = async () => {
    if (!user || !courseId) {
      toast({ title: 'Sign in required', description: 'Log in to enroll and track your progress.', variant: 'destructive' });
      return null;
    }
    if (enrollment) return enrollment;
    const { data, error } = await supabase
      .from('enrollments')
      .insert({ user_id: user.id, course_id: courseId, viewed_lessons: [], xp_earned: 0 })
      .select()
      .single();
    if (error) {
      toast({ title: 'Could not enroll', description: error.message, variant: 'destructive' });
      return null;
    }
    setEnrollment(data as any);
    toast({ title: 'Enrolled', description: 'Your progress will now be tracked.' });
    return data as any;
  };

  /** Awards XP if this lesson hasn't been viewed before. */
  const markLessonViewed = async (lessonId: string) => {
    if (!user || !courseId) return;
    let current = enrollment;
    if (!current) current = await enroll();
    if (!current) return;

    const already = (current.viewed_lessons || []).includes(lessonId);
    const nextViewed = already ? current.viewed_lessons : [...(current.viewed_lessons || []), lessonId];
    const nextXp = already ? current.xp_earned : current.xp_earned + XP_PER_LESSON;

    const { data: updated } = await supabase
      .from('enrollments')
      .update({ viewed_lessons: nextViewed, last_lesson_id: lessonId, xp_earned: nextXp })
      .eq('id', current.id)
      .select()
      .single();
    if (updated) setEnrollment(updated as any);

    if (!already) {
      // bump user_stats xp + lessons_completed
      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (stats) {
        await supabase
          .from('user_stats')
          .update({
            xp: (stats.xp || 0) + XP_PER_LESSON,
            total_lessons_completed: (stats.total_lessons_completed || 0) + 1,
            last_activity_date: new Date().toISOString().slice(0, 10),
          })
          .eq('user_id', user.id);
      } else {
        await supabase.from('user_stats').insert({
          user_id: user.id,
          xp: XP_PER_LESSON,
          total_lessons_completed: 1,
          last_activity_date: new Date().toISOString().slice(0, 10),
        });
      }
      toast({ title: `+${XP_PER_LESSON} XP`, description: 'Lesson viewed. Keep going!' });
    }
  };

  return { enrollment, loading, enroll, markLessonViewed, isEnrolled: !!enrollment, xpPerLesson: XP_PER_LESSON };
};

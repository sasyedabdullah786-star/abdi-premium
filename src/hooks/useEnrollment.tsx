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

/** Calculate the new streak based on the previous activity date. */
function nextStreak(prev: { current_streak: number; longest_streak: number; last_activity_date: string | null }) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let current = prev.current_streak || 0;
  if (prev.last_activity_date === today) {
    // already counted today
  } else if (prev.last_activity_date === yesterday) {
    current += 1;
  } else {
    current = 1; // streak reset / fresh start
  }
  const longest = Math.max(prev.longest_streak || 0, current);
  return { current_streak: current, longest_streak: longest, last_activity_date: today };
}

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

  /** Awards XP + updates streak if this lesson hasn't been viewed before. */
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
      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (stats) {
        const streak = nextStreak({
          current_streak: stats.current_streak,
          longest_streak: stats.longest_streak,
          last_activity_date: stats.last_activity_date,
        });
        const newXp = (stats.xp || 0) + XP_PER_LESSON;
        const newLevel = Math.max(1, Math.floor(newXp / 100) + 1);
        await supabase
          .from('user_stats')
          .update({
            xp: newXp,
            level: newLevel,
            total_lessons_completed: (stats.total_lessons_completed || 0) + 1,
            ...streak,
          })
          .eq('user_id', user.id);

        if (streak.current_streak > (stats.current_streak || 0)) {
          toast({ title: `🔥 ${streak.current_streak}-day streak`, description: `+${XP_PER_LESSON} XP earned. Keep it alive!` });
        } else {
          toast({ title: `+${XP_PER_LESSON} XP`, description: 'Lesson viewed.' });
        }
      } else {
        await supabase.from('user_stats').insert({
          user_id: user.id,
          xp: XP_PER_LESSON,
          level: 1,
          total_lessons_completed: 1,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: new Date().toISOString().slice(0, 10),
        });
        toast({ title: `🔥 1-day streak started`, description: `+${XP_PER_LESSON} XP. Come back tomorrow!` });
      }
    }
  };

  return { enrollment, loading, enroll, markLessonViewed, isEnrolled: !!enrollment, xpPerLesson: XP_PER_LESSON };
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserStats {
  id: string;
  user_id: string;
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  total_lessons_completed: number;
  total_courses_completed: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  requirement_type: string;
  requirement_value: number;
  sort_order: number;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export const useGamification = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [leaderboard, setLeaderboard] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data: badgeData } = await supabase.from('badges').select('*').order('sort_order');
      setBadges((badgeData as Badge[]) || []);

      const { data: lbData } = await supabase
        .from('user_stats')
        .select('*')
        .order('xp', { ascending: false })
        .limit(10);
      setLeaderboard((lbData as UserStats[]) || []);

      if (user) {
        const { data: statsData } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (statsData) {
          setStats(statsData as UserStats);
        } else {
          // Create initial stats row
          const { data: created } = await supabase
            .from('user_stats')
            .insert({ user_id: user.id })
            .select()
            .single();
          if (created) setStats(created as UserStats);
        }

        const { data: ubData } = await supabase
          .from('user_badges')
          .select('*, badge:badges(*)')
          .eq('user_id', user.id);
        setUserBadges((ubData as any) || []);
      }
    } catch (err) {
      console.error('Error loading gamification:', err);
    } finally {
      setLoading(false);
    }
  };

  const xpForNextLevel = (level: number) => level * 100;
  const progressPercent = stats
    ? Math.min(100, (stats.xp % xpForNextLevel(stats.level)) / xpForNextLevel(stats.level) * 100)
    : 0;

  return { stats, badges, userBadges, leaderboard, loading, progressPercent, xpForNextLevel, refetch: fetchAll };
};

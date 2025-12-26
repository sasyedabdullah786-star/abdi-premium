import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Announcement {
  id: string;
  title: string;
  content: string | null;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async (announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert(announcement)
        .select()
        .single();

      if (error) throw error;
      setAnnouncements([data, ...announcements]);
      return { success: true, data };
    } catch (err) {
      console.error('Error creating announcement:', err);
      return { success: false, error: err };
    }
  };

  const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setAnnouncements(announcements.map(a => a.id === id ? { ...a, ...updates } : a));
      return { success: true };
    } catch (err) {
      console.error('Error updating announcement:', err);
      return { success: false, error: err };
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAnnouncements(announcements.filter(a => a.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting announcement:', err);
      return { success: false, error: err };
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return { announcements, loading, createAnnouncement, updateAnnouncement, deleteAnnouncement, refetch: fetchAnnouncements };
};

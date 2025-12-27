import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Bookmark {
  id: string;
  user_id: string;
  course_id: string;
  created_at: string;
}

export const useBookmarks = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  const addBookmark = async (courseId: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          course_id: courseId
        })
        .select()
        .single();

      if (error) throw error;
      setBookmarks([data, ...bookmarks]);
      return { success: true, data };
    } catch (err) {
      console.error('Error adding bookmark:', err);
      return { success: false, error: err };
    }
  };

  const removeBookmark = async (courseId: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('course_id', courseId);

      if (error) throw error;
      setBookmarks(bookmarks.filter(b => b.course_id !== courseId));
      return { success: true };
    } catch (err) {
      console.error('Error removing bookmark:', err);
      return { success: false, error: err };
    }
  };

  const isBookmarked = (courseId: string) => {
    return bookmarks.some(b => b.course_id === courseId);
  };

  const toggleBookmark = async (courseId: string) => {
    if (isBookmarked(courseId)) {
      return removeBookmark(courseId);
    } else {
      return addBookmark(courseId);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [user]);

  return { 
    bookmarks, 
    loading, 
    addBookmark, 
    removeBookmark, 
    isBookmarked,
    toggleBookmark,
    refetch: fetchBookmarks 
  };
};

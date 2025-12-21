import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BlogPost {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const useBlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert(post)
        .select()
        .single();

      if (error) throw error;
      setPosts([data, ...posts]);
      return { success: true, data };
    } catch (err) {
      console.error('Error creating post:', err);
      return { success: false, error: err };
    }
  };

  const updatePost = async (id: string, updates: Partial<BlogPost>) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setPosts(posts.map(p => p.id === id ? { ...p, ...updates } : p));
      return { success: true };
    } catch (err) {
      console.error('Error updating post:', err);
      return { success: false, error: err };
    }
  };

  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPosts(posts.filter(p => p.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting post:', err);
      return { success: false, error: err };
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return { posts, loading, createPost, updatePost, deletePost, refetch: fetchPosts };
};

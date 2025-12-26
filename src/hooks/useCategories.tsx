import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
  created_at: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (category: Omit<Category, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      setCategories([...categories, data]);
      return { success: true, data };
    } catch (err) {
      console.error('Error creating category:', err);
      return { success: false, error: err };
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setCategories(categories.map(c => c.id === id ? { ...c, ...updates } : c));
      return { success: true };
    } catch (err) {
      console.error('Error updating category:', err);
      return { success: false, error: err };
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting category:', err);
      return { success: false, error: err };
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, createCategory, updateCategory, deleteCategory, refetch: fetchCategories };
};

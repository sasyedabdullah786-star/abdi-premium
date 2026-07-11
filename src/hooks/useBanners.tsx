import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  cta_label: string | null;
  bg_color: string | null;
  text_color: string | null;
  animation: string | null;
  is_active: boolean;
  priority: number;
  variant: string; // 'strip' | 'hero'
  created_at: string;
  updated_at: string;
}

export const useBanners = (onlyActive = false) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBanners = async () => {
    try {
      let q = supabase.from('banners').select('*').order('priority', { ascending: false }).order('created_at', { ascending: false });
      if (onlyActive) q = q.eq('is_active', true);
      const { data, error } = await q;
      if (error) throw error;
      setBanners((data as Banner[]) || []);
    } catch (err) {
      console.error('fetch banners', err);
    } finally {
      setLoading(false);
    }
  };

  const createBanner = async (b: Partial<Banner>) => {
    const { data, error } = await supabase.from('banners').insert(b as any).select().single();
    if (error) return { success: false, error };
    setBanners([data as Banner, ...banners]);
    return { success: true, data };
  };

  const updateBanner = async (id: string, updates: Partial<Banner>) => {
    const { error } = await supabase.from('banners').update(updates as any).eq('id', id);
    if (error) return { success: false, error };
    setBanners(banners.map(b => b.id === id ? { ...b, ...updates } as Banner : b));
    return { success: true };
  };

  const deleteBanner = async (id: string) => {
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) return { success: false, error };
    setBanners(banners.filter(b => b.id !== id));
    return { success: true };
  };

  useEffect(() => { fetchBanners(); }, [onlyActive]);

  return { banners, loading, createBanner, updateBanner, deleteBanner, refetch: fetchBanners };
};

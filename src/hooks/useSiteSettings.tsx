import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SiteSettings {
  id: string;
  primary_color: string;
  background_color: string;
  card_color: string;
  font_family: string;
  footer_text: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string | null;
  nav_home_label: string;
  nav_courses_label: string;
  nav_blog_label: string;
  nav_contact_label: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}

const defaultSettings: SiteSettings = {
  id: '',
  primary_color: '190 100% 50%',
  background_color: '222 47% 6%',
  card_color: '222 47% 8%',
  font_family: 'Inter',
  footer_text: '© 2024 ABD"I. All rights reserved.',
  hero_title: 'Welcome to ABD"I',
  hero_subtitle: 'Your journey to excellence starts here',
  hero_image_url: null,
  nav_home_label: 'Home',
  nav_courses_label: 'Courses',
  nav_blog_label: 'Blog',
  nav_contact_label: 'Contact',
  seo_title: 'ABD"I - Premium Learning Platform',
  seo_description: 'Transform your learning experience with ABD"I',
  seo_keywords: 'learning, education, courses',
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSettings(data as SiteSettings);
        applyTheme(data as SiteSettings);
      }
    } catch (err) {
      console.error('Error fetching site settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (s: SiteSettings) => {
    const root = document.documentElement;
    if (s.primary_color) root.style.setProperty('--primary', s.primary_color);
    if (s.background_color) root.style.setProperty('--background', s.background_color);
    if (s.card_color) root.style.setProperty('--card', s.card_color);
    if (s.font_family) {
      document.body.style.fontFamily = `'${s.font_family}', sans-serif`;
    }
  };

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .update(newSettings)
        .eq('id', settings.id);

      if (error) throw error;
      
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      applyTheme(updated);
      return { success: true };
    } catch (err) {
      console.error('Error updating settings:', err);
      return { success: false, error: err };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, updateSettings, refetch: fetchSettings };
};

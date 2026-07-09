import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HomepageSections {
  announcements: boolean;
  trending: boolean;
  categories: boolean;
  testimonials: boolean;
  stats: boolean;
  features: boolean;
}

export interface PageSetting {
  enabled: boolean;
  coming_soon: boolean;
}

export interface PageSettings {
  courses: PageSetting;
  blog: PageSetting;
  contact: PageSetting;
  institution: PageSetting;
}

export interface SiteSettings {
  id: string;
  primary_color: string;
  background_color: string;
  card_color: string;
  text_color: string;
  accent_color: string;
  border_color: string;
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
  is_maintenance_mode: boolean;
  maintenance_message: string;
  logo_url: string | null;
  homepage_sections: HomepageSections;
  page_settings: PageSettings;
}

const defaultPageSettings: PageSettings = {
  courses: { enabled: true, coming_soon: false },
  blog: { enabled: true, coming_soon: false },
  contact: { enabled: true, coming_soon: false },
  institution: { enabled: true, coming_soon: false }
};

const defaultSettings: SiteSettings = {
  id: '',
  primary_color: '262 78% 55%',
  background_color: '42 60% 97%',
  card_color: '0 0% 100%',
  text_color: '240 25% 12%',
  accent_color: '340 82% 60%',
  border_color: '42 25% 86%',
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
  is_maintenance_mode: false,
  maintenance_message: 'We are currently performing maintenance. Please check back soon.',
  logo_url: null,
  homepage_sections: {
    announcements: true,
    trending: true,
    categories: true,
    testimonials: true,
    stats: true,
    features: true
  },
  page_settings: defaultPageSettings
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
        const rawSections = data.homepage_sections as Record<string, unknown> | null;
        const rawPageSettings = data.page_settings as Record<string, unknown> | null;
        const parsed: SiteSettings = {
          ...defaultSettings,
          ...data,
          is_maintenance_mode: data.is_maintenance_mode ?? false,
          maintenance_message: data.maintenance_message ?? defaultSettings.maintenance_message,
          logo_url: data.logo_url ?? null,
          homepage_sections: rawSections && typeof rawSections === 'object'
            ? {
                announcements: rawSections.announcements === true,
                trending: rawSections.trending === true,
                categories: rawSections.categories === true,
                testimonials: rawSections.testimonials === true,
                stats: rawSections.stats === true,
                features: rawSections.features !== false
              }
            : defaultSettings.homepage_sections,
          page_settings: rawPageSettings && typeof rawPageSettings === 'object'
            ? {
                courses: (rawPageSettings.courses as PageSetting) ?? defaultPageSettings.courses,
                blog: (rawPageSettings.blog as PageSetting) ?? defaultPageSettings.blog,
                contact: (rawPageSettings.contact as PageSetting) ?? defaultPageSettings.contact,
                institution: (rawPageSettings.institution as PageSetting) ?? defaultPageSettings.institution
              }
            : defaultPageSettings
        };
        setSettings(parsed);
        applyTheme(parsed);
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
    if (s.card_color) {
      root.style.setProperty('--card', s.card_color);
      root.style.setProperty('--popover', s.card_color);
    }
    if (s.text_color) {
      root.style.setProperty('--foreground', s.text_color);
      root.style.setProperty('--card-foreground', s.text_color);
      root.style.setProperty('--popover-foreground', s.text_color);
    }
    if (s.accent_color) {
      root.style.setProperty('--accent', s.accent_color);
      root.style.setProperty('--ring', s.primary_color || s.accent_color);
    }
    if (s.border_color) {
      root.style.setProperty('--border', s.border_color);
      root.style.setProperty('--input', s.border_color);
    }
    if (s.font_family) {
      document.body.style.fontFamily = `'${s.font_family}', sans-serif`;
    }
  };

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    try {
      // Convert homepage_sections to JSON-compatible format
      const dbUpdate: Record<string, unknown> = {};
      Object.entries(newSettings).forEach(([key, value]) => {
        if (key === 'homepage_sections' && value && typeof value === 'object') {
          dbUpdate[key] = JSON.parse(JSON.stringify(value));
        } else {
          dbUpdate[key] = value;
        }
      });
      
      const { error } = await supabase
        .from('site_settings')
        .update(dbUpdate as any)
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

  const updateHomepageSections = async (sections: Partial<HomepageSections>) => {
    const newSections = { ...settings.homepage_sections, ...sections };
    return updateSettings({ homepage_sections: newSections });
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { 
    settings, 
    loading, 
    updateSettings, 
    updateHomepageSections,
    refetch: fetchSettings 
  };
};

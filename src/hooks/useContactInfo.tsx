import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ContactInfo {
  id: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  social_links: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export const useContactInfo = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchContactInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setContactInfo(data as ContactInfo);
    } catch (err) {
      console.error('Error fetching contact info:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateContactInfo = async (updates: Partial<ContactInfo>) => {
    if (!contactInfo) return { success: false };
    
    try {
      const { error } = await supabase
        .from('contact_info')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', contactInfo.id);

      if (error) throw error;
      setContactInfo({ ...contactInfo, ...updates });
      return { success: true };
    } catch (err) {
      console.error('Error updating contact info:', err);
      return { success: false, error: err };
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  return { contactInfo, loading, updateContactInfo, refetch: fetchContactInfo };
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Institution {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  mission: string | null;
  created_at: string;
  updated_at: string;
}

export const useInstitution = () => {
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInstitution = async () => {
    try {
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setInstitution(data);
    } catch (err) {
      console.error('Error fetching institution:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateInstitution = async (updates: Partial<Institution>) => {
    if (!institution) return { success: false };
    
    try {
      const { error } = await supabase
        .from('institutions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', institution.id);

      if (error) throw error;
      setInstitution({ ...institution, ...updates });
      return { success: true };
    } catch (err) {
      console.error('Error updating institution:', err);
      return { success: false, error: err };
    }
  };

  useEffect(() => {
    fetchInstitution();
  }, []);

  return { institution, loading, updateInstitution, refetch: fetchInstitution };
};

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface CoursePurchase {
  id: string;
  user_id: string;
  course_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed';
  provider: string | null;
  provider_ref: string | null;
  created_at: string;
}

/**
 * Determines whether the current user may open a course's content.
 * Free courses are open. Paid courses require a completed purchase
 * (admins always have access). Content itself is protected in the
 * database, this hook only drives the UI.
 */
export const useCourseAccess = (courseId?: string, isPaid?: boolean) => {
  const { user, isAdmin } = useAuth();
  const [purchase, setPurchase] = useState<CoursePurchase | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPurchase = useCallback(async () => {
    if (!courseId || !user) {
      setPurchase(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('course_purchases')
      .select('*')
      .eq('course_id', courseId)
      .eq('user_id', user.id)
      .maybeSingle();
    setPurchase((data as CoursePurchase) || null);
    setLoading(false);
  }, [courseId, user]);

  useEffect(() => {
    fetchPurchase();
  }, [fetchPurchase]);

  const hasAccess = !isPaid || isAdmin || purchase?.status === 'paid';

  const requestPurchase = async (amount: number, currency: string) => {
    if (!user || !courseId) return { success: false, error: 'not-signed-in' };
    const { data, error } = await supabase
      .from('course_purchases')
      .insert({ user_id: user.id, course_id: courseId, amount, currency, status: 'pending' })
      .select()
      .single();
    if (error) return { success: false, error };
    setPurchase(data as CoursePurchase);
    return { success: true };
  };

  return { purchase, hasAccess, loading, requestPurchase, refetch: fetchPurchase };
};

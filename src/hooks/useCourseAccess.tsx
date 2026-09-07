import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { listTransactions, PAYMENT_EVENT, PaymentTransaction } from '@/lib/paymentConfig';

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
 * (admins always have access).
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

    // 1. Check local completed transactions first for instant zero-latency feedback
    const localTxs = listTransactions();
    const localMatch = localTxs.find(
      t => t.courseId === courseId && (t.userId === user.id || t.userEmail === user.email) && t.status === 'paid'
    );

    if (localMatch) {
      setPurchase({
        id: localMatch.id,
        user_id: user.id,
        course_id: courseId,
        amount: localMatch.amount,
        currency: localMatch.currency,
        status: 'paid',
        provider: localMatch.paymentMethod,
        provider_ref: localMatch.providerRef,
        created_at: localMatch.createdAt,
      });
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('course_purchases')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .maybeSingle();

      setPurchase((data as CoursePurchase) || null);
    } catch (e) {
      console.warn('Could not fetch course purchase:', e);
    } finally {
      setLoading(false);
    }
  }, [courseId, user]);

  useEffect(() => {
    fetchPurchase();

    const handleSync = () => fetchPurchase();
    window.addEventListener(PAYMENT_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener(PAYMENT_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [fetchPurchase]);

  const hasAccess = !isPaid || isAdmin || purchase?.status === 'paid';

  const recordCompletedPurchase = async (tx: PaymentTransaction) => {
    if (!user || !courseId) return { success: false, error: 'not-signed-in' };

    setPurchase({
      id: tx.id,
      user_id: user.id,
      course_id: courseId,
      amount: tx.amount,
      currency: tx.currency,
      status: 'paid',
      provider: tx.paymentMethod,
      provider_ref: tx.providerRef,
      created_at: tx.createdAt,
    });

    try {
      // Record in Supabase
      await supabase
        .from('course_purchases')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          amount: tx.amount,
          currency: tx.currency,
          status: 'paid',
          provider: tx.paymentMethod,
          provider_ref: tx.providerRef,
        }, { onConflict: 'user_id,course_id' });

      // Automatically enroll the student
      await supabase
        .from('enrollments')
        .upsert({
          user_id: user.id,
          course_id: courseId,
        }, { onConflict: 'user_id,course_id' });
    } catch (err) {
      console.warn('Supabase purchase record sync skipped or offline:', err);
    }

    return { success: true };
  };

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

  return { purchase, hasAccess, loading, recordCompletedPurchase, requestPurchase, refetch: fetchPurchase };
};


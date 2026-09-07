import { supabase } from '@/integrations/supabase/client';

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

export const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export interface RazorpayResult {
  success: boolean;
  error?: string;
  paymentId?: string;
  amount?: number;
  currency?: string;
}

interface StartArgs {
  courseId: string;
  couponCode?: string;
  themeColor?: string;
}

/**
 * Runs a real Razorpay checkout: the server creates the order (authoritative
 * price), Razorpay collects the money, the server verifies the signature and
 * marks the purchase as paid.
 */
export const startRazorpayCheckout = async ({
  courseId,
  couponCode,
  themeColor = '#1b2a4a',
}: StartArgs): Promise<RazorpayResult> => {
  const { data: order, error } = await supabase.functions.invoke('razorpay-create-order', {
    body: { courseId, couponCode },
  });

  if (error || !order?.orderId) {
    return { success: false, error: (order as any)?.error || error?.message || 'Could not start payment.' };
  }

  const loaded = await loadRazorpayScript();
  if (!loaded) return { success: false, error: 'Could not load the secure payment window.' };

  return new Promise<RazorpayResult>((resolve) => {
    const rzp = new (window as any).Razorpay({
      key: order.keyId,
      amount: Math.round(Number(order.amount) * 100),
      currency: order.currency,
      name: 'ABD"I Academy & Education',
      description: order.courseTitle,
      order_id: order.orderId,
      prefill: { email: order.userEmail, name: order.userName },
      theme: { color: themeColor },
      modal: {
        ondismiss: () => resolve({ success: false, error: 'cancelled' }),
      },
      handler: async (response: Record<string, string>) => {
        const { data: verified, error: verifyError } = await supabase.functions.invoke(
          'razorpay-verify-payment',
          { body: { ...response, courseId } },
        );
        if (verifyError || !verified?.success) {
          resolve({
            success: false,
            error: (verified as any)?.error || verifyError?.message || 'Payment could not be verified.',
          });
          return;
        }
        resolve({
          success: true,
          paymentId: verified.paymentId,
          amount: Number(verified.amount),
          currency: verified.currency,
        });
      },
    });
    rzp.on('payment.failed', (resp: any) => {
      resolve({ success: false, error: resp?.error?.description || 'Payment failed.' });
    });
    rzp.open();
  });
};

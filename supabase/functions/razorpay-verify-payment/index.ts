import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const hmacSha256Hex = async (secret: string, message: string) => {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!keySecret) return json({ error: 'Razorpay is not configured yet.' }, 503);

    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: 'You must be signed in.' }, 401);

    const body = await req.json().catch(() => ({}));
    const orderId = typeof body.razorpay_order_id === 'string' ? body.razorpay_order_id : '';
    const paymentId = typeof body.razorpay_payment_id === 'string' ? body.razorpay_payment_id : '';
    const signature = typeof body.razorpay_signature === 'string' ? body.razorpay_signature : '';
    const courseId = typeof body.courseId === 'string' ? body.courseId : '';
    if (!orderId || !paymentId || !signature || !courseId) {
      return json({ error: 'Incomplete payment details.' }, 400);
    }

    const expected = await hmacSha256Hex(keySecret, `${orderId}|${paymentId}`);
    if (expected !== signature) {
      console.warn('Signature mismatch for order', orderId);
      return json({ error: 'Payment could not be verified.' }, 400);
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: pending } = await admin
      .from('course_purchases')
      .select('id, amount, currency')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('provider_ref', orderId)
      .maybeSingle();

    if (!pending) return json({ error: 'No matching order found.' }, 404);

    await admin
      .from('course_purchases')
      .update({ status: 'paid', provider: 'razorpay', provider_ref: paymentId })
      .eq('id', pending.id);

    await admin
      .from('enrollments')
      .upsert({ user_id: user.id, course_id: courseId }, { onConflict: 'user_id,course_id' });

    return json({ success: true, amount: pending.amount, currency: pending.currency, paymentId });
  } catch (e) {
    console.error(e);
    return json({ error: 'Unexpected error verifying payment.' }, 500);
  }
});

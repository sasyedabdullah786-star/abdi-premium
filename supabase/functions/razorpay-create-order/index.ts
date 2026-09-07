import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const COUPONS: Record<string, number> = {
  WELCOME20: 20,
  STUDENT50: 50,
  ABDI100: 100,
  SUPERLEARNER: 30,
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const keyId = Deno.env.get('RAZORPAY_KEY_ID');
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!keyId || !keySecret) {
      return json({ error: 'Razorpay is not configured yet.' }, 503);
    }

    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: 'You must be signed in to pay.' }, 401);

    const body = await req.json().catch(() => ({}));
    const courseId = typeof body.courseId === 'string' ? body.courseId : '';
    const couponCode = typeof body.couponCode === 'string' ? body.couponCode.toUpperCase() : '';
    if (!courseId) return json({ error: 'Missing course.' }, 400);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: course, error: courseErr } = await admin
      .from('courses')
      .select('id, title, is_paid, price_amount, currency')
      .eq('id', courseId)
      .maybeSingle();

    if (courseErr || !course) return json({ error: 'Course not found.' }, 404);
    if (!course.is_paid) return json({ error: 'This course is free.' }, 400);

    const discount = COUPONS[couponCode] ?? 0;
    const amount = Math.max(0, Math.round(Number(course.price_amount) * (100 - discount)) / 100);
    if (amount <= 0) return json({ error: 'Amount must be greater than zero.' }, 400);

    const currency = (course.currency || 'INR').toUpperCase();

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency,
        receipt: `crs_${courseId.slice(0, 8)}_${Date.now().toString().slice(-8)}`,
        notes: { course_id: courseId, user_id: user.id, coupon: couponCode || 'none' },
      }),
    });

    const order = await res.json();
    if (!res.ok) {
      console.error('Razorpay order error', order);
      return json({ error: order?.error?.description || 'Could not start payment.' }, 502);
    }

    await admin.from('course_purchases').upsert(
      {
        user_id: user.id,
        course_id: courseId,
        amount,
        currency,
        status: 'pending',
        provider: 'razorpay',
        provider_ref: order.id,
      },
      { onConflict: 'user_id,course_id' },
    );

    return json({
      orderId: order.id,
      amount,
      currency,
      keyId,
      courseTitle: course.title,
      userEmail: user.email,
      userName: user.user_metadata?.full_name ?? '',
    });
  } catch (e) {
    console.error(e);
    return json({ error: 'Unexpected error starting payment.' }, 500);
  }
});

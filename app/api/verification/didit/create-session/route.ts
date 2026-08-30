import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json().catch(() => ({}));

    if (!userId || userId === 'guest') {
      return NextResponse.json({ error: 'Valid user ID is required.' }, { status: 400 });
    }

    // 1. Server-side PRO subscription check via Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://slyjhprwovcwxfcnxjpn.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan_type, plan, is_super_admin')
      .eq('id', userId)
      .maybeSingle();

    const planType = (profile?.plan_type || profile?.plan || 'free').toLowerCase();
    const isSuperAdmin = profile?.is_super_admin === true;
    const isProOrBusiness = planType === 'pro' || planType === 'business' || isSuperAdmin;

    if (!isProOrBusiness) {
      console.warn(`[Didit Guard]: User '${userId}' with plan '${planType}' attempted verification without PRO membership.`);
      return NextResponse.json(
        { error: 'PRO plan required for verification.' },
        { status: 403 }
      );
    }

    const apiKey = (process.env.DIDIT_CLIENT_SECRET || process.env.DIDIT_CLIENT_ID || process.env.DIDIT_API_KEY || '').trim();
    const workflowId = (process.env.DIDIT_WORKFLOW_ID || '').trim().replace(/['"]/g, '');

    if (!apiKey || !workflowId) {
      return NextResponse.json({ error: 'Didit config missing in .env.local.' }, { status: 500 });
    }

    const response = await fetch('https://verification.didit.me/v3/session/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        vendor_data: userId,
        callback: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/marketing-tools/verification`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: JSON.stringify(data) }, { status: response.status });
    }

    return NextResponse.json({ session_url: data.url || data.session_url });

  } catch (err: any) {
    console.error('Didit Fetch Exception:', err);
    return NextResponse.json({ error: `Connection failed: ${err.message}` }, { status: 500 });
  }
}

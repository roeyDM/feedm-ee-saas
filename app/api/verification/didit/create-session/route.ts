import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = body.userId || 'test_user';

    // עדיפות מפורשת ל-DIDIT_API_KEY, ולאחר מכן ל-Client Secret
    const apiKey = (process.env.DIDIT_API_KEY || process.env.DIDIT_CLIENT_SECRET || '').trim();
    const workflowId = (process.env.DIDIT_WORKFLOW_ID || '').trim().replace(/['"]/g, '');

    console.log('[Didit Session Init] UserID:', userId);
    console.log('[Didit Session Init] Workflow ID:', workflowId);
    console.log('[Didit Session Init] API Key Present:', !!apiKey);

    if (!apiKey || !workflowId) {
      return NextResponse.json({ 
        error: `Missing config: API Key present=${!!apiKey}, Workflow ID present=${!!workflowId}` 
      }, { status: 500 });
    }

    // Official Didit v3 REST API Payload
    const response = await fetch('https://verification.didit.me/v3/session/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        vendor_data: userId,
        callback: `${process.env.NEXT_PUBLIC_APP_URL || 'https://feedm.ee'}/dashboard/marketing-tools/verification`
      })
    });

    const data = await response.json();
    console.log('[Didit Response Status]:', response.status, data);

    if (!response.ok) {
      return NextResponse.json({ error: data.message || JSON.stringify(data) }, { status: response.status });
    }

    return NextResponse.json({ session_url: data.url || data.session_url });

  } catch (err: any) {
    console.error('[Didit Exception]:', err);
    return NextResponse.json({ error: err.message || 'Server network error' }, { status: 500 });
  }
}
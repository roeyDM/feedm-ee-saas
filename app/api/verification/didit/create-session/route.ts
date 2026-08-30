import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = body.userId || 'test_user';

    const apiKey = (process.env.DIDIT_API_KEY || process.env.DIDIT_CLIENT_SECRET || process.env.DIDIT_CLIENT_ID || '').trim();
    const workflowId = (process.env.DIDIT_WORKFLOW_ID || '').trim().replace(/['"]/g, '');

    console.log('[Didit Sandbox Init] Workflow ID:', workflowId);

    if (!apiKey || !workflowId) {
      return NextResponse.json({ 
        error: 'Missing Didit API Key or Workflow ID in .env.local.' 
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
        callback: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/marketing-tools/verification`
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

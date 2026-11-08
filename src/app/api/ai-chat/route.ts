import { AiAssistantEngine } from '@/lib/engines/ai-assistant-engine';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, report } = body;

    if (!question || !report) {
      return NextResponse.json({ error: 'Question and report are required' }, { status: 400 });
    }

    const answer = await AiAssistantEngine.answerQuestion({ question, report });
    return NextResponse.json({ answer });
  } catch (err: any) {
    console.error('Error in /api/ai-chat:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


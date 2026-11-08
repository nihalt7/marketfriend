import { ChartIqOrchestrator } from '@/lib/engines/chartiq-orchestrator';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      imageBase64,
      mimeType,
      symbol = 'RELIANCE',
      exchange = 'NSE',
      timeframe = '15m',
      tradingStyle = 'Intraday',
      capital = 100000,
      riskPercent = 1.0
    } = body;

    // Security & file size validation
    if (imageBase64 && imageBase64.length > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image size exceeds maximum 15MB limit' }, { status: 400 });
    }

    const report = await ChartIqOrchestrator.analyze({
      imageBase64,
      mimeType,
      symbol: symbol.trim().toUpperCase(),
      exchange,
      timeframe,
      tradingStyle,
      capital: Number(capital) || 100000,
      riskPercent: Number(riskPercent) || 1.0
    });

    return NextResponse.json(report);
  } catch (err: any) {
    console.error('Error in /api/analyze:', err);
    return NextResponse.json(
      { error: err.message || 'Internal analysis processing failed' },
      { status: 500 }
    );
  }
}


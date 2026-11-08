import { BacktestingEngine } from '@/lib/engines/backtesting-engine';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      strategyId = 'hammer-confirmation',
      symbol = 'RELIANCE',
      timeframe = '1D',
      initialCapital = 100000
    } = body;

    const result = await BacktestingEngine.runBacktest({
      strategyId,
      symbol,
      timeframe,
      initialCapital: Number(initialCapital) || 100000
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error in /api/backtest:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


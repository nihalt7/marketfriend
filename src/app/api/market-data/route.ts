import { marketDataService } from '@/lib/engines/market-data-engine';
import { StockExchange, Timeframe } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol') || 'NIFTY 50';
    const timeframe = (searchParams.get('timeframe') || '15m') as Timeframe;
    const exchange = (searchParams.get('exchange') || 'NSE') as StockExchange;

    const data = await marketDataService.fetchMarketData(symbol, timeframe, exchange);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Error in /api/market-data:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

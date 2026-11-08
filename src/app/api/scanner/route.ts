import { MarketScannerEngine } from '@/lib/engines/market-scanner-engine';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || undefined;

    const results = await MarketScannerEngine.scanIndianMarket(filter);
    return NextResponse.json(results);
  } catch (err: any) {
    console.error('Error in /api/scanner:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

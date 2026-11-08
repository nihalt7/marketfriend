import { RiskManagementEngine } from '@/lib/engines/risk-management-engine';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      capital = 100000,
      riskPercent = 1.0,
      entryPrice = 2950,
      stopLossPrice = 2920,
      targetPrice = 3010,
      isDelivery = false
    } = body;

    const result = RiskManagementEngine.calculateIndianRisk({
      capital: Number(capital),
      riskPercent: Number(riskPercent),
      entryPrice: Number(entryPrice),
      stopLossPrice: Number(stopLossPrice),
      targetPrice: Number(targetPrice),
      isDelivery: Boolean(isDelivery)
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error in /api/risk-calc:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


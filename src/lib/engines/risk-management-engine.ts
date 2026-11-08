export interface IndianChargesBreakdown {
  brokerage: number;
  stt: number;
  exchangeCharges: number;
  sebiCharges: number;
  stampDuty: number;
  gst: number;
  totalCharges: number;
  netProfit: number;
  netLoss: number;
  pointsToBreakeven: number;
}

export interface RiskCalculationResult {
  capital: number;
  riskPercent: number;
  maxRiskAmount: number;
  entryPrice: number;
  stopLossPrice: number;
  targetPrice: number;
  quantity: number;
  grossProfit: number;
  grossLoss: number;
  riskToReward: number;
  charges: IndianChargesBreakdown;
  recommendationNote: string;
}

export class RiskManagementEngine {
  /**
   * Calculate precise Indian Stock Market position sizing and regulatory transaction charges
   */
  public static calculateIndianRisk(params: {
    capital: number;
    riskPercent?: number; // default 1%
    entryPrice: number;
    stopLossPrice: number;
    targetPrice: number;
    isDelivery?: boolean; // false = Intraday
  }): RiskCalculationResult {
    const {
      capital,
      riskPercent = 1.0,
      entryPrice,
      stopLossPrice,
      targetPrice,
      isDelivery = false
    } = params;

    const maxRiskAmount = (capital * riskPercent) / 100;
    const riskPerShare = Math.abs(entryPrice - stopLossPrice);
    const rewardPerShare = Math.abs(targetPrice - entryPrice);

    // Quantity based strictly on risk amount
    const quantity = riskPerShare > 0 ? Math.max(1, Math.floor(maxRiskAmount / riskPerShare)) : 1;

    const buyTurnover = entryPrice * quantity;
    const sellTurnover = targetPrice * quantity;
    const totalTurnover = buyTurnover + sellTurnover;

    const grossProfit = quantity * rewardPerShare;
    const grossLoss = quantity * riskPerShare;

    // Brokerage (Discount Broker standard ₹20 per order or 0.03% max)
    const buyBrokerage = Math.min(20, buyTurnover * 0.0003);
    const sellBrokerage = Math.min(20, sellTurnover * 0.0003);
    const totalBrokerage = Number((buyBrokerage + sellBrokerage).toFixed(2));

    // STT (Securities Transaction Tax)
    // Intraday: 0.025% on Sell side only
    // Delivery: 0.1% on both Buy and Sell sides
    const stt = isDelivery
      ? Number(((buyTurnover + sellTurnover) * 0.001).toFixed(2))
      : Number((sellTurnover * 0.00025).toFixed(2));

    // Exchange Transaction Charges (NSE standard: 0.00325% on total turnover)
    const exchangeCharges = Number((totalTurnover * 0.0000325).toFixed(2));

    // SEBI Turnover Fees (₹10 per crore = 0.0001% on total turnover)
    const sebiCharges = Number((totalTurnover * 0.000001).toFixed(2));

    // Stamp Duty (Intraday Buy: 0.003%, Delivery Buy: 0.015%)
    const stampDuty = isDelivery
      ? Number((buyTurnover * 0.00015).toFixed(2))
      : Number((buyTurnover * 0.00003).toFixed(2));

    // GST (18% on Brokerage + Exchange Charges + SEBI Fees)
    const taxableServiceAmount = totalBrokerage + exchangeCharges + sebiCharges;
    const gst = Number((taxableServiceAmount * 0.18).toFixed(2));

    // Total Transaction Costs
    const totalCharges = Number((totalBrokerage + stt + exchangeCharges + sebiCharges + stampDuty + gst).toFixed(2));

    const netProfit = Number((grossProfit - totalCharges).toFixed(2));
    const netLoss = Number((grossLoss + totalCharges).toFixed(2));
    const pointsToBreakeven = Number((totalCharges / quantity).toFixed(2));
    const riskToReward = Number((rewardPerShare / (riskPerShare || 1)).toFixed(2));

    const recommendationNote = riskPercent > 2.0
      ? `CAUTION: Risk setting of ${riskPercent}% exceeds disciplined institutional limits (max 1-2%). High vulnerability to drawdowns.`
      : `Optimal disciplined risk sizing applied: risking ₹${maxRiskAmount.toLocaleString('en-IN')} (${riskPercent}% of ₹${capital.toLocaleString('en-IN')}). Breakeven requires only +₹${pointsToBreakeven} move to cover all statutory Indian taxes.`;

    return {
      capital,
      riskPercent,
      maxRiskAmount,
      entryPrice,
      stopLossPrice,
      targetPrice,
      quantity,
      grossProfit,
      grossLoss,
      riskToReward,
      charges: {
        brokerage: totalBrokerage,
        stt,
        exchangeCharges,
        sebiCharges,
        stampDuty,
        gst,
        totalCharges,
        netProfit,
        netLoss,
        pointsToBreakeven
      },
      recommendationNote
    };
  }
}


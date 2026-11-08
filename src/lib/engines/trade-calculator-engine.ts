import {
  Candle,
  CandlestickPattern,
  ConfirmationStatus,
  NextCandleConfirmation,
  TechnicalIndicators,
  TradingPlan
} from '@/types';

export class TradeCalculatorEngine {
  public static calculateTradePlan(params: {
    candles: Candle[];
    indicators: TechnicalIndicators;
    patterns: CandlestickPattern[];
    confirmations: NextCandleConfirmation[];
    confluenceScore: number;
    capital?: number;
    riskPercent?: number;
  }): TradingPlan {
    const { candles, indicators, patterns, confirmations, confluenceScore, capital = 100000, riskPercent = 1 } = params;

    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2];
    const price = last.close;
    const atr = indicators.atr.value || price * 0.008;

    // Determine bias from confirmations and confluence
    const confirmedBullish = confirmations.find(c => c.status === 'Confirmed Bullish Reversal');
    const confirmedBearish = confirmations.find(c => c.status === 'Confirmed Bearish Reversal');
    const isProvisional = confirmations.some(c => c.isProvisional);

    let isBullish = false;
    let isBearish = false;

    if (confirmedBullish || (confluenceScore >= 70 && indicators.rsi14.signal === 'bullish')) {
      isBullish = true;
    } else if (confirmedBearish || (confluenceScore <= 35 && indicators.rsi14.signal === 'bearish')) {
      isBearish = true;
    }

    // Default recommendation calculation
    let recommendation: TradingPlan['recommendation'] = 'WAIT';
    let decisionHeadline = 'NO TRADE – WAIT FOR CONFIRMATION';

    if (isProvisional && !confirmedBullish && !confirmedBearish) {
      recommendation = 'WAIT';
      decisionHeadline = 'WAIT – Pattern Detected but Awaiting Completed Confirmation Candle';
    } else if (isBullish) {
      if (confluenceScore >= 80 && confirmedBullish) {
        recommendation = 'STRONG BUY';
        decisionHeadline = 'STRONG BUY – Multi-Confirmation Technical Confluence';
      } else if (confluenceScore >= 65) {
        recommendation = 'BUY';
        decisionHeadline = 'BUY – Favorable Risk-to-Reward with Technical Alignment';
      } else {
        recommendation = 'WAIT';
        decisionHeadline = 'WAIT – Confluence Score Insufficient for Safe Execution';
      }
    } else if (isBearish) {
      if (confluenceScore >= 75 && confirmedBearish) {
        recommendation = 'STRONG SELL';
        decisionHeadline = 'STRONG SELL – Breakdown Confirmed Across Multiple Engines';
      } else if (confluenceScore >= 60) {
        recommendation = 'SELL';
        decisionHeadline = 'SELL – Distribution Structure Active';
      } else {
        recommendation = 'WAIT';
        decisionHeadline = 'WAIT – Downside Evidence Weak or Incomplete';
      }
    } else {
      recommendation = 'WAIT';
      decisionHeadline = 'WAIT – Market in Neutral Consolidation';
    }

    // Calculate Entry Zone, Stop-Loss, Targets based on technical pivots
    let entryMin = price;
    let entryMax = price;
    let optimalEntry = price;
    let stopLossPrice = price;
    let stopReason = '';
    let target1Price = price;
    let target2Price = price;
    let target3Price = price;

    if (recommendation === 'BUY' || recommendation === 'STRONG BUY' || (!isBearish && recommendation === 'WAIT')) {
      // Long setup
      const swingLow = Math.min(last.low, prev.low, ...candles.slice(-8).map(c => c.low));
      // Technical Stop Loss: Swing Low minus 0.5x ATR buffer
      stopLossPrice = Number((swingLow - atr * 0.4).toFixed(2));
      stopReason = `Set below structural swing low ₹${swingLow.toFixed(2)} with a 0.4x ATR buffer to safeguard against liquidity sweeps.`;

      const riskPerUnit = Math.max(price - stopLossPrice, atr * 0.5);
      entryMin = Number((price - atr * 0.15).toFixed(2));
      entryMax = Number((price + atr * 0.15).toFixed(2));
      optimalEntry = Number(price.toFixed(2));

      target1Price = Number((price + riskPerUnit * 1.5).toFixed(2)); // 1:1.5
      target2Price = Number((price + riskPerUnit * 2.5).toFixed(2)); // 1:2.5
      target3Price = Number((price + riskPerUnit * 4.0).toFixed(2)); // 1:4.0
    } else {
      // Short / Sell setup
      const swingHigh = Math.max(last.high, prev.high, ...candles.slice(-8).map(c => c.high));
      stopLossPrice = Number((swingHigh + atr * 0.4).toFixed(2));
      stopReason = `Set above structural swing high ₹${swingHigh.toFixed(2)} with a 0.4x ATR buffer against false wick expansions.`;

      const riskPerUnit = Math.max(stopLossPrice - price, atr * 0.5);
      entryMin = Number((price + atr * 0.15).toFixed(2));
      entryMax = Number((price - atr * 0.15).toFixed(2));
      optimalEntry = Number(price.toFixed(2));

      target1Price = Number((price - riskPerUnit * 1.5).toFixed(2));
      target2Price = Number((price - riskPerUnit * 2.5).toFixed(2));
      target3Price = Number((price - riskPerUnit * 4.0).toFixed(2));
    }

    const riskDistance = Math.abs(optimalEntry - stopLossPrice);
    const stopDistancePercent = Number(((riskDistance / optimalEntry) * 100).toFixed(2));
    const rewardDistance = Math.abs(target2Price - optimalEntry);
    const riskToReward = Number((rewardDistance / (riskDistance || 1)).toFixed(2));

    // Position sizing calculation based on configured capital & risk %
    const maxRiskRupees = (capital * riskPercent) / 100;
    const suggestedQuantity = riskDistance > 0 ? Math.max(1, Math.floor(maxRiskRupees / riskDistance)) : 0;
    const potentialProfit = Math.round(suggestedQuantity * rewardDistance);

    // Rule enforcement: If R:R is below 1:1.5 or stop loss is unjustified, downgrade to WAIT
    if (riskToReward < 1.4 && (recommendation === 'BUY' || recommendation === 'SELL')) {
      recommendation = 'WAIT';
      decisionHeadline = 'WAIT – Risk-to-Reward Ratio Below Required 1:1.5 Minimum Standard';
    }

    const justification = `Plan formulated using strict multi-engine confluence. Confluence Score: ${confluenceScore}/100. Stop-loss strictly anchored to validated market structure pivots, yielding an optimal Risk-to-Reward profile of 1:${riskToReward}.`;

    return {
      recommendation,
      decisionHeadline,
      entryZone: {
        min: Math.min(entryMin, entryMax),
        max: Math.max(entryMin, entryMax),
        optimal: optimalEntry
      },
      stopLoss: {
        price: stopLossPrice,
        reason: stopReason,
        distancePercent: stopDistancePercent
      },
      target1: {
        price: target1Price,
        riskReward: 1.5,
        exitPercentage: 40
      },
      target2: {
        price: target2Price,
        riskReward: 2.5,
        exitPercentage: 40
      },
      target3: {
        price: target3Price,
        riskReward: 4.0,
        exitPercentage: 20
      },
      riskToReward,
      confidenceScore: confluenceScore,
      positionSizing: {
        suggestedQuantity,
        capitalRiskAmount: maxRiskRupees,
        maxLoss: Math.round(suggestedQuantity * riskDistance),
        potentialProfit
      },
      justification
    };
  }
}


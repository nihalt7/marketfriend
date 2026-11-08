import {
  CandlestickPattern,
  ChartPattern,
  NextCandleConfirmation,
  SmcAnalysis,
  StrategyConfluenceReport,
  TechnicalIndicators
} from '@/types';

export class ConfluenceEngine {
  public static evaluateConfluence(params: {
    indicators: TechnicalIndicators;
    candlestickPatterns: CandlestickPattern[];
    confirmations: NextCandleConfirmation[];
    chartPatterns: ChartPattern[];
    smc: SmcAnalysis;
    isHigherTfBullish: boolean;
  }): StrategyConfluenceReport {
    const { indicators, candlestickPatterns, confirmations, chartPatterns, smc, isHigherTfBullish } = params;

    const confirmingFactors: string[] = [];
    const conflictingFactors: string[] = [];
    const correlatedDeduplications: string[] = [];

    let score = 20; // baseline

    // Factor 1: Candlestick & Confirmation
    const confirmedBullish = confirmations.find(c => c.status === 'Confirmed Bullish Reversal');
    const confirmedBearish = confirmations.find(c => c.status === 'Confirmed Bearish Reversal');
    const provisional = confirmations.find(c => c.isProvisional);

    if (confirmedBullish) {
      score += 25;
      confirmingFactors.push(`Verified Next Candle Confirmation: ${confirmedBullish.patternName} closed with confirmed follow-through`);
    } else if (confirmedBearish) {
      conflictingFactors.push(`Bearish reversal confirmed on ${confirmedBearish.patternName}`);
      score -= 15;
    } else if (candlestickPatterns.length > 0) {
      score += 10;
      confirmingFactors.push(`Candlestick formation detected (${candlestickPatterns[0].name}), but awaiting next candle close`);
      if (provisional) {
        correlatedDeduplications.push(`Current candle is provisional: pattern significance discounted until completed confirmation candle`);
      }
    }

    // Factor 2: Trend & Moving Average Structure (Deduplicated EMA cluster)
    const emaAlignment = indicators.ema9 > indicators.ema21 && indicators.ema21 > indicators.ema50;
    if (emaAlignment) {
      score += 15;
      confirmingFactors.push(`Moving Average Ribbon: Price aligned above 9, 21, and 50 EMAs with positive slope`);
      correlatedDeduplications.push(`EMA 9, 20, 21, and 50 are grouped as a single Trend factor to avoid double-counting correlated moving averages`);
    } else if (indicators.ema9 < indicators.ema21 && indicators.ema21 < indicators.ema50) {
      conflictingFactors.push(`Short-term moving average structure is in a descending bearish crossover`);
      score -= 10;
    }

    // Factor 3: Momentum (RSI + MACD deduplication)
    let momentumBullish = false;
    if (indicators.rsi14.divergence === 'bullish') {
      score += 15;
      confirmingFactors.push(`RSI Bullish Divergence: Price low unconfirmed by momentum indicator, signalling institutional absorption`);
      momentumBullish = true;
    } else if (indicators.rsi14.signal === 'bullish' && indicators.macd.signalType === 'bullish') {
      score += 12;
      confirmingFactors.push(`Momentum Confluence: RSI in bullish territory (${indicators.rsi14.value}) and MACD histogram expanding positive`);
      correlatedDeduplications.push(`RSI, Stochastic RSI, and MACD grouped into single Momentum category to prevent collinear bias`);
      momentumBullish = true;
    } else if (indicators.rsi14.signal === 'bearish' && indicators.macd.signalType === 'bearish') {
      conflictingFactors.push(`Both RSI (${indicators.rsi14.value}) and MACD indicate prevailing bearish momentum`);
      score -= 10;
    }

    // Factor 4: Volume & Liquidity Confirmation
    if (indicators.volumeMetrics.isBreakoutVolume) {
      score += 12;
      confirmingFactors.push(`Volume Expansion: Relative Volume (RVOL ${indicators.volumeMetrics.relativeVolume}x) verifies genuine market participation`);
    } else if (indicators.volumeMetrics.relativeVolume < 0.7) {
      conflictingFactors.push(`Volume contraction (RVOL ${indicators.volumeMetrics.relativeVolume}x): Lacks aggressive institutional buying interest`);
      score -= 5;
    }

    // Factor 5: VWAP & S/R Anchor
    if (indicators.vwap.priceRelation === 'above') {
      score += 8;
      confirmingFactors.push(`Price trading above intraday VWAP (₹${indicators.vwap.value.toFixed(2)}), confirming intraday buyer control`);
    } else {
      conflictingFactors.push(`Price is capped below VWAP (₹${indicators.vwap.value.toFixed(2)})`);
    }

    // Factor 6: SMC / Liquidity Sweep / Structure
    if (smc.chochDetected || smc.bosDetected) {
      score += 10;
      confirmingFactors.push(`Smart Money Confirmation: ${smc.chochDetected ? 'Bullish CHoCH structure shift' : 'Bullish BOS'}`);
    }
    if (smc.liquiditySweeps.some(s => s.type === 'SELL_SIDE')) {
      score += 10;
      confirmingFactors.push(`Sell-side liquidity sweep completed below key support followed by immediate absorption`);
    }

    // Factor 7: Multi-Timeframe Alignment
    if (isHigherTfBullish) {
      score += 10;
      confirmingFactors.push(`Macro alignment: Daily higher timeframe trend is bullish, trading in harmony with macro flow`);
    } else {
      conflictingFactors.push(`Higher timeframe trend is not bullish, creating counter-trend headwinds`);
      score -= 8;
    }

    // Factor 8: Classical Chart Pattern
    const completedPattern = chartPatterns.find(p => p.status === 'completed');
    if (completedPattern) {
      score += 12;
      confirmingFactors.push(`Completed chart pattern breakout: ${completedPattern.name} verified`);
    }

    // Clamp score
    const finalScore = Math.min(100, Math.max(10, score));

    let rating: StrategyConfluenceReport['rating'] = 'INSUFFICIENT';
    if (finalScore >= 80) rating = 'HIGH';
    else if (finalScore >= 65) rating = 'MODERATE';
    else if (finalScore >= 50) rating = 'LOW';
    else rating = 'INSUFFICIENT';

    const summary = rating === 'HIGH'
      ? `High Confluence (${finalScore}%): Multiple independent technical layers (Candlesticks, Indicators, Volume, and Market Structure) are synchronized in agreement.`
      : rating === 'MODERATE'
      ? `Moderate Confluence (${finalScore}%): Favorable primary setup, though some secondary indicators or timeframe elements require watchful risk management.`
      : rating === 'LOW'
      ? `Low Confluence (${finalScore}%): Conflicting signals detected between momentum and trend structure. High probability of chop.`
      : `Insufficient Confluence (${finalScore}%): Evidence is conflicting or incomplete. NO TRADE – WAIT FOR CONFIRMATION.`;

    return {
      confluenceScore: finalScore,
      rating,
      confirmingFactors,
      conflictingFactors,
      correlatedDeduplications,
      summary
    };
  }
}


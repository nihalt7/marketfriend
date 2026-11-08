import { Candle, MultiTimeframeContext, Timeframe } from '@/types';

export class MultiTimeframeEngine {
  public static analyzeMultiTimeframe(candles: Candle[], currentTimeframe: Timeframe): MultiTimeframeContext {
    // Current TF assessment
    const recent = candles.slice(-20);
    const startPrice = recent[0].close;
    const endPrice = recent[recent.length - 1].close;
    const pctChange = ((endPrice - startPrice) / startPrice) * 100;

    let currentTrend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS' = 'SIDEWAYS';
    if (pctChange > 0.8) currentTrend = 'BULLISH';
    else if (pctChange < -0.8) currentTrend = 'BEARISH';

    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const maxHigh = Math.max(...highs.slice(-30));
    const minLow = Math.min(...lows.slice(-30));

    // Simulated / extracted higher and lower timeframe context based on candle history
    let higherTfName = '1D';
    let lowerTfName = '5m';

    if (currentTimeframe === '5m') {
      lowerTfName = '1m';
      higherTfName = '15m';
    } else if (currentTimeframe === '15m') {
      lowerTfName = '5m';
      higherTfName = '1h';
    } else if (currentTimeframe === '1h') {
      lowerTfName = '15m';
      higherTfName = '1D';
    } else if (currentTimeframe === '1D') {
      lowerTfName = '1h';
      higherTfName = '1W';
    }

    // Macro trend analysis across all available candles
    const macroStart = candles[0].close;
    const macroEnd = candles[candles.length - 1].close;
    const macroChange = ((macroEnd - macroStart) / macroStart) * 100;

    let higherTrend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS' = 'SIDEWAYS';
    if (macroChange > 1.5) higherTrend = 'BULLISH';
    else if (macroChange < -1.5) higherTrend = 'BEARISH';

    // Lower timeframe momentum
    const microRecent = candles.slice(-5);
    const microChange = ((microRecent[microRecent.length - 1].close - microRecent[0].open) / microRecent[0].open) * 100;
    let lowerTrend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS' = 'SIDEWAYS';
    if (microChange > 0.3) lowerTrend = 'BULLISH';
    else if (microChange < -0.3) lowerTrend = 'BEARISH';

    let alignment: MultiTimeframeContext['alignment'] = 'NEUTRAL';
    if (higherTrend === 'BULLISH' && currentTrend === 'BULLISH') alignment = 'ALIGNED_BULLISH';
    else if (higherTrend === 'BEARISH' && currentTrend === 'BEARISH') alignment = 'ALIGNED_BEARISH';
    else if (higherTrend !== currentTrend) alignment = 'CONFLICTING';

    return {
      lowerTf: {
        timeframe: lowerTfName,
        trend: lowerTrend,
        momentum: lowerTrend === 'BULLISH' ? 'Buyers defending micro dips' : lowerTrend === 'BEARISH' ? 'Immediate selling pressure' : 'Micro compression'
      },
      currentTf: {
        timeframe: currentTimeframe,
        trend: currentTrend,
        keyLevel: `Support at ₹${minLow.toFixed(2)}, Resistance at ₹${maxHigh.toFixed(2)}`
      },
      higherTf: {
        timeframe: higherTfName,
        trend: higherTrend,
        majorSupport: minLow,
        majorResistance: maxHigh
      },
      alignment
    };
  }
}


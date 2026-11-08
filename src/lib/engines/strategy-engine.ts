import {
  Candle,
  CandlestickPattern,
  ChartPattern,
  NextCandleConfirmation,
  SmcAnalysis,
  StrategyEvaluation,
  TechnicalIndicators
} from '@/types';

export class StrategyEngine {
  public static evaluateAllStrategies(params: {
    candles: Candle[];
    indicators: TechnicalIndicators;
    candlestickPatterns: CandlestickPattern[];
    confirmations: NextCandleConfirmation[];
    chartPatterns: ChartPattern[];
    smc: SmcAnalysis;
  }): StrategyEvaluation[] {
    const { candles, indicators, candlestickPatterns, confirmations, chartPatterns, smc } = params;
    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2];
    const price = last.close;

    const evaluations: StrategyEvaluation[] = [];

    // 1. Price Action Strategy
    const hasBullishRejection = candlestickPatterns.some(p => p.type === 'bullish' && (p.location === 'support' || p.name === 'Hammer'));
    const isHammerConfirmed = confirmations.some(c => c.status === 'Confirmed Bullish Reversal');
    evaluations.push({
      id: 'price-action',
      name: 'Pure Price Action & Rejection',
      isSuitable: hasBullishRejection || isHammerConfirmed,
      score: isHammerConfirmed ? 85 : hasBullishRejection ? 70 : 45,
      marketConditions: 'Clean directional moves reacting off structural swing highs and lows.',
      entryCondition: `Trigger on candle close confirming rejection wick or micro-trendline break above ₹${(last.high * 1.001).toFixed(2)}.`,
      confirmation: 'Subsequent candle sustaining close beyond previous swing high/low with zero wick pushback.',
      invalidation: `Price closing back below pivot low ₹${(Math.min(last.low, prev.low)).toFixed(2)}.`,
      riskFactors: ['Choppy sideways environment causing false wick rejections', 'Low liquidity hours']
    });

    // 2. Support and Resistance Strategy
    const nearSupport = price <= indicators.bollingerBands.lower * 1.01 || hasBullishRejection;
    evaluations.push({
      id: 'support-resistance',
      name: 'Key Support & Resistance Levels',
      isSuitable: nearSupport,
      score: nearSupport ? 80 : 50,
      marketConditions: 'Range-bound or trending market retesting established horizontal price floors/ceilings.',
      entryCondition: `Enter on confirmed rebound near support zone ₹${(indicators.bollingerBands.lower).toFixed(2)}.`,
      confirmation: 'Bullish candlestick close holding firmly above support with expanding volume.',
      invalidation: `Decisive candle close below support floor ₹${(indicators.bollingerBands.lower * 0.995).toFixed(2)}.`,
      riskFactors: ['Breakdown through support into liquidity void', 'Macro news volatility']
    });

    // 3. Breakout Trading
    const isBreakout = indicators.volumeMetrics.isBreakoutVolume && (price > indicators.bollingerBands.upper || chartPatterns.some(p => p.status === 'completed'));
    evaluations.push({
      id: 'breakout',
      name: 'High-Volume Breakout Trading',
      isSuitable: isBreakout,
      score: isBreakout ? 88 : 40,
      marketConditions: 'Consolidation range reaching maturity with volatility squeeze.',
      entryCondition: `Buy on candle close breaking above range resistance with RVOL > 1.5.`,
      confirmation: 'Immediate follow-through candle printing Higher High with no immediate mean-reversion.',
      invalidation: `Fakeout: Price closes back inside the breakout base.`,
      riskFactors: ['Bull trap / false breakout', 'Slippage during rapid breakout momentum']
    });

    // 4. Breakout and Retest
    const hasCompletedPattern = chartPatterns.some(p => p.status === 'completed');
    evaluations.push({
      id: 'breakout-retest',
      name: 'Breakout and Retest Confirmation',
      isSuitable: hasCompletedPattern,
      score: hasCompletedPattern ? 82 : 45,
      marketConditions: 'Post-breakout phase where price pulls back to test prior resistance as new support.',
      entryCondition: `Enter upon bullish rejection off the retested breakout level with lower wick.`,
      confirmation: 'Candle printing Higher Low on the retest followed by bullish continuation green candle.',
      invalidation: `Retest fails and candle closes back below the breakout level.`,
      riskFactors: ['Retest turning into a full failed breakout', 'Volume dry-up']
    });

    // 5. EMA Crossover
    const emaBullish = indicators.ema9 > indicators.ema21 && indicators.ema21 > indicators.ema50;
    const emaBearish = indicators.ema9 < indicators.ema21 && indicators.ema21 < indicators.ema50;
    evaluations.push({
      id: 'ema-crossover',
      name: 'Exponential Moving Average (EMA) Alignment',
      isSuitable: emaBullish || emaBearish,
      score: emaBullish ? 84 : emaBearish ? 80 : 50,
      marketConditions: 'Trending markets with clear directional slope across 9, 21, 50, and 200 EMAs.',
      entryCondition: emaBullish ? `Pullback towards rising 21 EMA (₹${indicators.ema21.toFixed(2)}) presenting dynamic support.` : `Pullback to falling 21 EMA.`,
      confirmation: 'Candle bouncing off 21 EMA with bullish close.',
      invalidation: `Candle close breaching through 50 EMA (₹${indicators.ema50.toFixed(2)}).`,
      riskFactors: ['Whipsaws in non-trending / sideways markets', 'Lagging indicator nature']
    });

    // 6. VWAP Trading
    const isAboveVwap = indicators.vwap.priceRelation === 'above';
    const vwapNear = Math.abs(price - indicators.vwap.value) / price < 0.006;
    evaluations.push({
      id: 'vwap-trading',
      name: 'VWAP Institutional Anchor Trading',
      isSuitable: isAboveVwap || vwapNear,
      score: isAboveVwap && vwapNear ? 86 : 60,
      marketConditions: 'Intraday institutional flow benchmarking price relative to day volume-weighted average.',
      entryCondition: `Long entry as price retests and rejects VWAP floor (₹${indicators.vwap.value.toFixed(2)}) from above.`,
      confirmation: 'Bullish hammer or green candle closing firmly above VWAP with strong volume.',
      invalidation: `Bearish candle close slipping below VWAP with high relative sell volume.`,
      riskFactors: ['Sudden high-volume institutional block dumping below VWAP']
    });

    // 7. RSI Reversal & Divergence
    const hasDivergence = indicators.rsi14.divergence !== null;
    const isOversold = indicators.rsi14.value <= 32;
    evaluations.push({
      id: 'rsi-reversal',
      name: 'RSI Reversal & Divergence System',
      isSuitable: hasDivergence || isOversold,
      score: hasDivergence ? 89 : isOversold ? 75 : 40,
      marketConditions: 'Extended market extremes with momentum exhaustions.',
      entryCondition: indicators.rsi14.divergence === 'bullish'
        ? `Enter on bullish divergence confirmation as RSI crosses back above 30/40.`
        : `Reversal confirmation after oversold test.`,
      confirmation: 'Price breaks above the previous swing candle high after divergence print.',
      invalidation: `New price low breaking divergence without recovery.`,
      riskFactors: ['RSI remaining oversold/overbought for extended trends in strong momentum']
    });

    // 8. MACD Momentum
    const isMacdBullish = indicators.macd.signalType === 'bullish' && indicators.macd.histogram > 0;
    evaluations.push({
      id: 'macd-momentum',
      name: 'MACD Trend Momentum & Zero-Line',
      isSuitable: isMacdBullish,
      score: isMacdBullish ? 78 : 50,
      marketConditions: 'Medium-term momentum acceleration.',
      entryCondition: `Enter on MACD line crossing above signal line accompanied by expanding positive green histogram bars.`,
      confirmation: 'Zero-line cross confirming macro shift into bullish territory.',
      invalidation: `MACD histogram contracting or crossing back below signal line.`,
      riskFactors: ['Frequent whipsaws during low-volatility compression phases']
    });

    // 9. Fibonacci Retracement
    const recentLow = Math.min(...candles.slice(-30).map(c => c.low));
    const recentHigh = Math.max(...candles.slice(-30).map(c => c.high));
    const fib618 = recentHigh - (recentHigh - recentLow) * 0.618;
    const fib50 = recentHigh - (recentHigh - recentLow) * 0.500;
    const isNearGoldenPocket = Math.abs(price - fib618) / price < 0.008 || Math.abs(price - fib50) / price < 0.008;

    evaluations.push({
      id: 'fibonacci',
      name: 'Fibonacci Golden Pocket Retracement',
      isSuitable: isNearGoldenPocket,
      score: isNearGoldenPocket ? 84 : 45,
      marketConditions: 'Impulsive market legs undergoing natural corrective retracements.',
      entryCondition: `Enter in the 0.500 - 0.618 golden pocket zone (₹${fib618.toFixed(2)} - ₹${fib50.toFixed(2)}).`,
      confirmation: 'Bullish reversal candlestick forming directly inside the Fibonacci support cluster.',
      invalidation: `Price closing decisively below 0.786 retracement level.`,
      riskFactors: ['Deep correction turning into trend reversal']
    });

    // 10. Smart Money Concepts (SMC)
    const smcActive = smc.bosDetected || smc.chochDetected || smc.liquiditySweeps.length > 0;
    evaluations.push({
      id: 'smc',
      name: 'Smart Money Concepts (SMC / ICT)',
      isSuitable: smcActive,
      score: smcActive ? 91 : 55,
      marketConditions: 'Institutional market structure: Liquidity runs, order blocks, and market maker sweeps.',
      entryCondition: smc.liquiditySweeps.length > 0
        ? `Enter on reclaim of swept liquidity level with target at opposing liquidity pool.`
        : `Enter at mitigation of unmitigated Order Block / Fair Value Gap.`,
      confirmation: 'Decisive candle close back inside the key structural range following the sweep.',
      invalidation: `Loss of the order block low or continued expansion through the sweep wick.`,
      riskFactors: ['High volatility stop runs before true displacement occurs']
    });

    // 11. Trend Following
    const isUptrend = price > indicators.ema50 && indicators.adx.adx >= 22;
    evaluations.push({
      id: 'trend-following',
      name: 'Classical Trend Following System',
      isSuitable: isUptrend,
      score: isUptrend ? 83 : 50,
      marketConditions: 'Established directional trend with ADX > 22 demonstrating genuine trend strength.',
      entryCondition: `Buy on shallow pullbacks to the dynamic 20 EMA, pyramiding on structural Higher Highs.`,
      confirmation: 'Breakout above preceding swing high with expanding volume.',
      invalidation: `Break of structure printing a Lower Low below ₹${(Math.min(...candles.slice(-10).map(c => c.low))).toFixed(2)}.`,
      riskFactors: ['Late trend entry near exhaustion tops']
    });

    // 12. Reversal Trading
    const isReversal = hasBullishRejection && (indicators.rsi14.value < 35 || indicators.rsi14.divergence === 'bullish');
    evaluations.push({
      id: 'reversal-trading',
      name: 'Systematic Reversal & Exhaustion',
      isSuitable: isReversal,
      score: isReversal ? 87 : 45,
      marketConditions: 'Downtrend exhaustion at major multi-touch support accompanied by bullish divergence.',
      entryCondition: `Enter on confirmed reversal candle holding support floor.`,
      confirmation: 'Completed next-candle confirmation closing above high of the exhaustion candle.',
      invalidation: `Breach of reversal candle low.`,
      riskFactors: ['Falling knife hazard: trying to pick tops/bottoms without multi-engine confirmation']
    });

    // Sort by score descending
    evaluations.sort((a, b) => b.score - a.score);

    return evaluations;
  }
}


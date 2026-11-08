import { Candle, CandlestickMetrics, CandlestickPattern } from '@/types';

export class CandlestickEngine {
  /**
   * Calculate precise candle geometry and metrics
   */
  public static calculateMetrics(candle: Candle): CandlestickMetrics {
    const bodySize = Math.abs(candle.close - candle.open);
    const totalRange = candle.high - candle.low;
    const isBullish = candle.close > candle.open;
    const isBearish = candle.close < candle.open;

    const upperWick = isBullish ? candle.high - candle.close : candle.high - candle.open;
    const lowerWick = isBullish ? candle.open - candle.low : candle.close - candle.low;

    const bodyToRangeRatio = totalRange > 0 ? Number((bodySize / totalRange).toFixed(2)) : 0;
    const wickToBodyRatio = bodySize > 0 ? Number(((upperWick + lowerWick) / bodySize).toFixed(2)) : 10;
    const isDoji = bodyToRangeRatio < 0.1 || bodySize < (totalRange * 0.08);

    return {
      bodySize: Number(bodySize.toFixed(2)),
      upperWick: Number(upperWick.toFixed(2)),
      lowerWick: Number(lowerWick.toFixed(2)),
      totalRange: Number(totalRange.toFixed(2)),
      bodyToRangeRatio,
      wickToBodyRatio,
      isBullish,
      isBearish,
      isDoji
    };
  }

  /**
   * Determine trend before a given candle index (over previous 5-10 candles)
   */
  public static getPriorTrend(candles: Candle[], index: number, lookback: number = 6): 'DOWNTREND' | 'UPTREND' | 'SIDEWAYS' {
    if (index < lookback) return 'SIDEWAYS';
    const startPrice = candles[index - lookback].close;
    const endPrice = candles[index - 1].close;
    const diffPct = ((endPrice - startPrice) / startPrice) * 100;

    if (diffPct <= -1.2) return 'DOWNTREND';
    if (diffPct >= 1.2) return 'UPTREND';
    return 'SIDEWAYS';
  }

  /**
   * Check if price is near support or resistance
   */
  public static getLocationContext(
    candles: Candle[],
    index: number
  ): 'support' | 'resistance' | 'mid_range' | 'after_downtrend' | 'after_uptrend' {
    const priorTrend = this.getPriorTrend(candles, index);
    if (index < 10) {
      return priorTrend === 'DOWNTREND' ? 'after_downtrend' : priorTrend === 'UPTREND' ? 'after_uptrend' : 'mid_range';
    }

    const window = candles.slice(Math.max(0, index - 25), index);
    const lowest = Math.min(...window.map(c => c.low));
    const highest = Math.max(...window.map(c => c.high));
    const currentPrice = candles[index].close;

    const range = highest - lowest;
    if (range <= 0) return 'mid_range';

    const positionInRange = (currentPrice - lowest) / range;
    if (positionInRange <= 0.25) return 'support';
    if (positionInRange >= 0.75) return 'resistance';

    return priorTrend === 'DOWNTREND' ? 'after_downtrend' : priorTrend === 'UPTREND' ? 'after_uptrend' : 'mid_range';
  }

  /**
   * Recognize Candlestick Patterns with strict multi-candle definitions
   */
  public static recognizePatterns(candles: Candle[]): CandlestickPattern[] {
    const patterns: CandlestickPattern[] = [];
    if (candles.length < 3) return patterns;

    const len = candles.length;
    // Check patterns in recent 3 candles (primary focus on the last 2 completed / latest candles)
    for (let i = Math.max(2, len - 3); i < len; i++) {
      const c = candles[i];
      const prev = candles[i - 1];
      const prev2 = candles[i - 2];

      const m = this.calculateMetrics(c);
      const mPrev = this.calculateMetrics(prev);
      const mPrev2 = this.calculateMetrics(prev2);

      const location = this.getLocationContext(candles, i);
      const priorTrend = this.getPriorTrend(candles, i);

      // 1. Hammer (Bullish Reversal: Small body at upper range, lower wick >= 2x body, tiny/no upper wick)
      if (
        m.lowerWick >= m.bodySize * 2 &&
        m.upperWick <= m.bodySize * 0.4 &&
        m.bodyToRangeRatio >= 0.15 &&
        m.bodyToRangeRatio <= 0.45 &&
        (priorTrend === 'DOWNTREND' || location === 'support')
      ) {
        patterns.push({
          name: 'Hammer',
          type: 'bullish',
          significance: 'high',
          location,
          description: `Bullish Hammer with lower shadow (${m.lowerWick}) more than 2x the body size. Indicates heavy buying rejection of lower prices near ${location}.`,
          candleIndices: [i],
          reliabilityScore: location === 'support' ? 88 : 72
        });
      }

      // 2. Inverted Hammer (Bullish Reversal: Small body at lower range, upper wick >= 2x body)
      if (
        m.upperWick >= m.bodySize * 2 &&
        m.lowerWick <= m.bodySize * 0.35 &&
        m.bodyToRangeRatio >= 0.15 &&
        m.bodyToRangeRatio <= 0.45 &&
        (priorTrend === 'DOWNTREND' || location === 'support')
      ) {
        patterns.push({
          name: 'Inverted Hammer',
          type: 'bullish',
          significance: 'medium',
          location,
          description: `Inverted Hammer after selling pressure. Bulls tested higher prices during session; awaits follow-through confirmation.`,
          candleIndices: [i],
          reliabilityScore: 68
        });
      }

      // 3. Shooting Star (Bearish Reversal: Small body at lower range, long upper wick >= 2x body, occurs at resistance / uptrend)
      if (
        m.upperWick >= m.bodySize * 2 &&
        m.lowerWick <= m.bodySize * 0.35 &&
        m.bodyToRangeRatio >= 0.15 &&
        m.bodyToRangeRatio <= 0.45 &&
        (priorTrend === 'UPTREND' || location === 'resistance')
      ) {
        patterns.push({
          name: 'Shooting Star',
          type: 'bearish',
          significance: 'high',
          location,
          description: `Bearish Shooting Star with tall upper shadow (${m.upperWick}). Buyers pushed higher but were rejected by aggressive overhead supply.`,
          candleIndices: [i],
          reliabilityScore: location === 'resistance' ? 89 : 74
        });
      }

      // 4. Hanging Man (Bearish Reversal: Looks like hammer but appears after uptrend at resistance)
      if (
        m.lowerWick >= m.bodySize * 2 &&
        m.upperWick <= m.bodySize * 0.35 &&
        m.bodyToRangeRatio >= 0.15 &&
        (priorTrend === 'UPTREND' || location === 'resistance')
      ) {
        patterns.push({
          name: 'Hanging Man',
          type: 'bearish',
          significance: 'medium',
          location,
          description: `Hanging Man warning at potential swing high. Shows early signs of seller infiltration despite recovery into the close.`,
          candleIndices: [i],
          reliabilityScore: 70
        });
      }

      // 5. Bullish Engulfing (Current green candle body completely swallows previous red candle body)
      if (
        mPrev.isBearish &&
        m.isBullish &&
        c.open <= prev.close &&
        c.close >= prev.open &&
        m.bodySize > mPrev.bodySize * 1.1
      ) {
        patterns.push({
          name: 'Bullish Engulfing',
          type: 'bullish',
          significance: 'high',
          location,
          description: `Bullish Engulfing: Current green candle body (${m.bodySize}) completely envelopes the prior red candle body (${mPrev.bodySize}). Decisive buyer takeover.`,
          candleIndices: [i - 1, i],
          reliabilityScore: location === 'support' ? 90 : 78
        });
      }

      // 6. Bearish Engulfing (Current red candle body completely swallows previous green candle body)
      if (
        mPrev.isBullish &&
        m.isBearish &&
        c.open >= prev.close &&
        c.close <= prev.open &&
        m.bodySize > mPrev.bodySize * 1.1
      ) {
        patterns.push({
          name: 'Bearish Engulfing',
          type: 'bearish',
          significance: 'high',
          location,
          description: `Bearish Engulfing: Sellers engulfed the preceding bullish candle, establishing clear distribution pressure.`,
          candleIndices: [i - 1, i],
          reliabilityScore: location === 'resistance' ? 91 : 79
        });
      }

      // 7. Piercing Pattern (Bullish: Red candle followed by green candle opening lower and closing above 50% of red body)
      if (
        mPrev.isBearish &&
        m.isBullish &&
        c.open < prev.low &&
        c.close > (prev.open + prev.close) / 2 &&
        c.close < prev.open
      ) {
        patterns.push({
          name: 'Piercing Pattern',
          type: 'bullish',
          significance: 'high',
          location,
          description: `Piercing Pattern: Strong bullish thrust penetrating above the midpoint of the prior bearish candle.`,
          candleIndices: [i - 1, i],
          reliabilityScore: 82
        });
      }

      // 8. Dark Cloud Cover (Bearish: Green candle followed by red candle opening higher and closing below 50% of green body)
      if (
        mPrev.isBullish &&
        m.isBearish &&
        c.open > prev.high &&
        c.close < (prev.open + prev.close) / 2 &&
        c.close > prev.open
      ) {
        patterns.push({
          name: 'Dark Cloud Cover',
          type: 'bearish',
          significance: 'high',
          location,
          description: `Dark Cloud Cover: Bearish candle opened at gap-up high but was driven deep below the midpoint of the preceding green candle.`,
          candleIndices: [i - 1, i],
          reliabilityScore: 83
        });
      }

      // 9. Morning Star (3-candle bullish reversal: Long red, small star gapping down, long green closing into red)
      if (
        mPrev2.isBearish &&
        mPrev2.bodyToRangeRatio > 0.5 &&
        mPrev.bodyToRangeRatio < 0.35 &&
        m.isBullish &&
        c.close > (prev2.open + prev2.close) / 2
      ) {
        patterns.push({
          name: 'Morning Star',
          type: 'bullish',
          significance: 'high',
          location,
          description: `Three-candle Morning Star reversal: Bear exhaustion followed by small base candle and strong bullish follow-through.`,
          candleIndices: [i - 2, i - 1, i],
          reliabilityScore: 92
        });
      }

      // 10. Evening Star (3-candle bearish reversal: Long green, small star gapping up, long red closing into green)
      if (
        mPrev2.isBullish &&
        mPrev2.bodyToRangeRatio > 0.5 &&
        mPrev.bodyToRangeRatio < 0.35 &&
        m.isBearish &&
        c.close < (prev2.open + prev2.close) / 2
      ) {
        patterns.push({
          name: 'Evening Star',
          type: 'bearish',
          significance: 'high',
          location,
          description: `Three-candle Evening Star reversal: Distribution peak followed by bearish confirmation candle.`,
          candleIndices: [i - 2, i - 1, i],
          reliabilityScore: 93
        });
      }

      // 11. Three White Soldiers (Three consecutive strong bullish candles with higher closes)
      if (
        mPrev2.isBullish && mPrev.isBullish && m.isBullish &&
        prev.close > prev2.close && c.close > prev.close &&
        mPrev2.bodyToRangeRatio > 0.55 && mPrev.bodyToRangeRatio > 0.55 && m.bodyToRangeRatio > 0.55
      ) {
        patterns.push({
          name: 'Three White Soldiers',
          type: 'bullish',
          significance: 'high',
          location,
          description: `Three consecutive strong bullish marubozu-like candles demonstrating persistent accumulation.`,
          candleIndices: [i - 2, i - 1, i],
          reliabilityScore: 87
        });
      }

      // 12. Three Black Crows (Three consecutive strong bearish candles with lower closes)
      if (
        mPrev2.isBearish && mPrev.isBearish && m.isBearish &&
        prev.close < prev2.close && c.close < prev.close &&
        mPrev2.bodyToRangeRatio > 0.55 && mPrev.bodyToRangeRatio > 0.55 && m.bodyToRangeRatio > 0.55
      ) {
        patterns.push({
          name: 'Three Black Crows',
          type: 'bearish',
          significance: 'high',
          location,
          description: `Three consecutive bearish candles establishing cascade liquidation pressure.`,
          candleIndices: [i - 2, i - 1, i],
          reliabilityScore: 88
        });
      }

      // 13. Tweezer Bottom / Top
      if (Math.abs(c.low - prev.low) <= c.close * 0.0008 && mPrev.isBearish && m.isBullish) {
        patterns.push({
          name: 'Tweezer Bottom',
          type: 'bullish',
          significance: 'medium',
          location,
          description: `Tweezer Bottom: Consecutive candles testing and holding the exact same low (${c.low}) as firm floor.`,
          candleIndices: [i - 1, i],
          reliabilityScore: 76
        });
      } else if (Math.abs(c.high - prev.high) <= c.close * 0.0008 && mPrev.isBullish && m.isBearish) {
        patterns.push({
          name: 'Tweezer Top',
          type: 'bearish',
          significance: 'medium',
          location,
          description: `Tweezer Top: Consecutive candles rejected at the identical ceiling level (${c.high}).`,
          candleIndices: [i - 1, i],
          reliabilityScore: 77
        });
      }

      // 14. Doji / Dragonfly / Gravestone / Long-legged
      if (m.isDoji) {
        if (m.lowerWick > m.totalRange * 0.65 && m.upperWick < m.totalRange * 0.1) {
          patterns.push({
            name: 'Dragonfly Doji',
            type: 'bullish',
            significance: 'medium',
            location,
            description: `Dragonfly Doji: Long lower shadow with open and close at the high. Strong intraday rejection of lower prices.`,
            candleIndices: [i],
            reliabilityScore: 75
          });
        } else if (m.upperWick > m.totalRange * 0.65 && m.lowerWick < m.totalRange * 0.1) {
          patterns.push({
            name: 'Gravestone Doji',
            type: 'bearish',
            significance: 'medium',
            location,
            description: `Gravestone Doji: Long upper shadow with close at the low. Complete surrender of intraday gains.`,
            candleIndices: [i],
            reliabilityScore: 75
          });
        } else if (m.upperWick > m.totalRange * 0.35 && m.lowerWick > m.totalRange * 0.35) {
          patterns.push({
            name: 'Long-Legged Doji',
            type: 'neutral',
            significance: 'medium',
            location,
            description: `Long-Legged Doji: High volatility indecision where neither buyers nor sellers could secure control.`,
            candleIndices: [i],
            reliabilityScore: 60
          });
        } else {
          patterns.push({
            name: 'Doji',
            type: 'neutral',
            significance: 'low',
            location,
            description: `Standard Doji: Complete equilibrium between buyers and sellers, often signaling impending pause or inflection point.`,
            candleIndices: [i],
            reliabilityScore: 55
          });
        }
      }

      // 15. Marubozu (Bullish / Bearish)
      if (m.bodyToRangeRatio > 0.88) {
        if (m.isBullish) {
          patterns.push({
            name: 'Bullish Marubozu',
            type: 'bullish',
            significance: 'high',
            location,
            description: `Bullish Marubozu: Full-bodied expansion candle with virtually no wicks. Relentless buying pressure from open to close.`,
            candleIndices: [i],
            reliabilityScore: 84
          });
        } else if (m.isBearish) {
          patterns.push({
            name: 'Bearish Marubozu',
            type: 'bearish',
            significance: 'high',
            location,
            description: `Bearish Marubozu: Full-bodied distribution candle with virtually no wicks. Relentless selling throughout.`,
            candleIndices: [i],
            reliabilityScore: 85
          });
        }
      }

      // 16. Inside Bar / Outside Bar
      if (c.high < prev.high && c.low > prev.low) {
        patterns.push({
          name: 'Inside Bar',
          type: 'neutral',
          significance: 'medium',
          location,
          description: `Inside Bar (Harami structure): Current candle completely contained within prior candle's range. Compression before breakout.`,
          candleIndices: [i - 1, i],
          reliabilityScore: 68
        });
      } else if (c.high > prev.high && c.low < prev.low) {
        patterns.push({
          name: 'Outside Bar',
          type: 'neutral',
          significance: 'medium',
          location,
          description: `Outside Bar: Current candle engulfs both the high and low of prior candle, reflecting volatility expansion.`,
          candleIndices: [i - 1, i],
          reliabilityScore: 70
        });
      }
    }

    // Deduplicate patterns by name keeping latest
    const uniqueMap = new Map<string, CandlestickPattern>();
    for (const p of patterns) {
      uniqueMap.set(p.name, p);
    }

    return Array.from(uniqueMap.values());
  }

  /**
   * Candle Psychology Narrative
   */
  public static explainCandlePsychology(candle: Candle, metrics: CandlestickMetrics): string {
    if (metrics.isDoji) {
      return `Bulls and bears engaged in active contest throughout the period, but neither side achieved directional advantage, closing virtually where it opened. Wait for the subsequent candle to confirm direction.`;
    }
    if (metrics.isBullish) {
      if (metrics.lowerWick > metrics.bodySize) {
        return `Sellers initially attempted to drive the price down to ₹${candle.low}, but responsive institutional buyers absorbed the liquidity and pushed the price back up to close near the session high (₹${candle.close}). Strong rejection of discount prices.`;
      }
      return `Buyers maintained sustained control from open (₹${candle.open}) to close (₹${candle.close}), absorbing supply with minimal upper shadow pushback.`;
    }
    if (metrics.isBearish) {
      if (metrics.upperWick > metrics.bodySize) {
        return `Buyers attempted to push higher to ₹${candle.high}, but encountered heavy resistance supply. Sellers decisively rejected the high and drove the price down to close near the lows (₹${candle.close}). Overhead supply confirmed.`;
      }
      return `Sellers dominated the session from open (₹${candle.open}) through close (₹${candle.close}), indicating active liquidation or distribution.`;
    }
    return `Balanced price action across current session range.`;
  }
}


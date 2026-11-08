import { Candle, PriceActionCandleAnalysis } from '@/types';
import { CandlestickEngine } from './candlestick-engine';

export class PriceActionEngine {
  /**
   * Analyze the latest 15 to 25 completed candles candle-by-candle
   */
  public static analyzeLatestCandles(candles: Candle[], count: number = 20): PriceActionCandleAnalysis[] {
    const results: PriceActionCandleAnalysis[] = [];
    if (candles.length < 5) return results;

    const slice = candles.slice(-count);
    const startIdx = candles.length - slice.length;

    for (let i = 0; i < slice.length; i++) {
      const c = slice[i];
      const prev = i > 0 ? slice[i - 1] : null;
      const globalIdx = startIdx + i;
      const metrics = CandlestickEngine.calculateMetrics(c);

      // Structure classification
      let structure: PriceActionCandleAnalysis['structure'] = 'CONSOLIDATION';
      let buyerSellerControl: 'buyers' | 'sellers' | 'balanced' = 'balanced';
      let isKeyCandle = false;
      let whatHappened = '';
      let whyImportant = '';
      let whatSuggests = '';
      let requiredConfirmation = '';
      let invalidation = '';

      if (prev) {
        const isHigherHigh = c.high > prev.high;
        const isHigherLow = c.low > prev.low;
        const isLowerHigh = c.high < prev.high;
        const isLowerLow = c.low < prev.low;

        // Long wick rejection
        if (metrics.lowerWick > metrics.bodySize * 1.8 && c.low <= prev.low) {
          structure = 'REJECTION';
          buyerSellerControl = 'buyers';
          isKeyCandle = true;
          whatHappened = `Intraday push to ₹${c.low} was rejected by responsive demand, closing at ₹${c.close}.`;
          whyImportant = `Sellers failed to accept lower prices below previous swing low.`;
          whatSuggests = `Bullish defense of support level.`;
          requiredConfirmation = `Next candle closing above ₹${c.high}.`;
          invalidation = `Subsequent candle closing below rejection wick at ₹${c.low}.`;
        } else if (metrics.upperWick > metrics.bodySize * 1.8 && c.high >= prev.high) {
          structure = 'REJECTION';
          buyerSellerControl = 'sellers';
          isKeyCandle = true;
          whatHappened = `Attempted rally to ₹${c.high} met aggressive overhead supply, pushing close down to ₹${c.close}.`;
          whyImportant = `Buyers unable to sustain prices above prior swing high.`;
          whatSuggests = `Overhead resistance and selling pressure.`;
          requiredConfirmation = `Subsequent candle breaking below ₹${c.low}.`;
          invalidation = `Subsequent candle closing above wick high ₹${c.high}.`;
        } else if (isHigherHigh && isHigherLow) {
          structure = 'HH';
          buyerSellerControl = 'buyers';
          if (metrics.bodyToRangeRatio > 0.6) {
            whatHappened = `Bullish momentum candle printing a Higher High (₹${c.high}) and Higher Low (₹${c.low}).`;
            whyImportant = `Confirms upward trend continuity and aggressive buyer participation.`;
            whatSuggests = `Bullish continuation towards next resistance.`;
            requiredConfirmation = `Holding above ₹${c.low} on pullbacks.`;
            invalidation = `Breaching below the candle low ₹${c.low}.`;
            isKeyCandle = true;
          } else {
            whatHappened = `Candle maintained Higher High structure but showed some wick pushback.`;
            whyImportant = `Pivots remain bullish but upward velocity is moderating.`;
            whatSuggests = `Potential consolidation ahead.`;
            requiredConfirmation = `Follow-through breakout.`;
            invalidation = `Drop below ₹${c.low}.`;
          }
        } else if (isLowerHigh && isLowerLow) {
          structure = 'LL';
          buyerSellerControl = 'sellers';
          if (metrics.bodyToRangeRatio > 0.6) {
            whatHappened = `Strong bearish candle logging a Lower Low (₹${c.low}) and Lower High (₹${c.high}).`;
            whyImportant = `Confirms active distribution and descending market structure.`;
            whatSuggests = `Downside continuation towards lower liquidity zones.`;
            requiredConfirmation = `Next candle maintaining closes below ₹${c.high}.`;
            invalidation = `Rally closing above ₹${c.high}.`;
            isKeyCandle = true;
          } else {
            whatHappened = `Sellers pushed price to Lower Low but encountered moderate support.`;
            whyImportant = `Bearish bias remains dominant.`;
            whatSuggests = `Bearish continuation or temporary bounce.`;
            requiredConfirmation = `Sustained breakdown close.`;
            invalidation = `Close above ₹${c.high}.`;
          }
        } else if (isHigherHigh && isLowerLow) {
          structure = 'BREAKOUT';
          isKeyCandle = true;
          buyerSellerControl = metrics.isBullish ? 'buyers' : 'sellers';
          whatHappened = `Range expansion candle engulfing prior high and low (High ₹${c.high}, Low ₹${c.low}).`;
          whyImportant = `Volatility expansion event clearing stops on both sides.`;
          whatSuggests = metrics.isBullish ? `Bullish range expansion favor.` : `Bearish distribution surge.`;
          requiredConfirmation = `Decisive follow-through close in direction of expansion.`;
          invalidation = `Reversal back inside prior candle range.`;
        } else if (isLowerHigh && isHigherLow) {
          structure = 'CONSOLIDATION';
          buyerSellerControl = 'balanced';
          whatHappened = `Inside bar forming inside prior range (₹${prev.low} - ₹${prev.high}).`;
          whyImportant = `Market contraction and equilibrium as participants position for the next move.`;
          whatSuggests = `Impending volatility expansion upon range breakout.`;
          requiredConfirmation = `Clean close outside the mother candle boundaries.`;
          invalidation = `Continued erratic chop within range.`;
        }
      } else {
        whatHappened = `Reference baseline candle at ₹${c.close}.`;
        whyImportant = `Sets initial pivot reference.`;
        whatSuggests = `Starting point for micro-structural assessment.`;
        requiredConfirmation = `Next candle direction.`;
        invalidation = `N/A`;
      }

      const dateObj = new Date(c.time * 1000);
      const timeFormatted = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

      const explanation = `${whatHappened} ${whyImportant} Implication: ${whatSuggests} Confirmation: ${requiredConfirmation} Invalidation: ${invalidation}`;

      results.push({
        index: globalIdx,
        timeFormatted,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
        structure,
        buyerSellerControl,
        explanation,
        isKeyCandle
      });
    }

    return results;
  }
}


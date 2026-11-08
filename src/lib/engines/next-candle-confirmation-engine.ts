import { Candle, CandlestickPattern, ConfirmationCriterion, ConfirmationStatus, NextCandleConfirmation } from '@/types';
import { CandlestickEngine } from './candlestick-engine';

export class NextCandleConfirmationEngine {
  /**
   * Evaluate confirmation status of detected candlestick patterns against subsequent candles
   */
  public static evaluateConfirmations(
    candles: Candle[],
    patterns: CandlestickPattern[]
  ): NextCandleConfirmation[] {
    const results: NextCandleConfirmation[] = [];
    const len = candles.length;

    for (const pattern of patterns) {
      const patternCandleIdx = pattern.candleIndices[pattern.candleIndices.length - 1];
      const patternCandle = candles[patternCandleIdx];
      const hasNextCompletedCandle = patternCandleIdx < len - 1;
      const followingCandle = hasNextCompletedCandle ? candles[patternCandleIdx + 1] : null;

      // If the pattern formed on the very latest candle, the next candle has NOT formed yet
      if (!followingCandle) {
        results.push({
          patternName: pattern.name,
          status: 'Waiting for Confirmation',
          patternCandleIndex: patternCandleIdx,
          isProvisional: true,
          criteriaEvaluated: [
            { criterion: 'Pattern Formed', passed: true, details: `${pattern.name} formed on candle #${patternCandleIdx + 1}` },
            { criterion: 'Subsequent Candle Closed', passed: false, details: 'Currently forming / next candle has not closed yet. Formation is provisional until next completed candle.' },
            { criterion: 'Breakout / Follow-through Confirmation', passed: false, details: 'Pending next candle close.' }
          ],
          explanation: `The ${pattern.name} pattern appeared on the latest candle. Per disciplined technical analysis standards, a currently forming setup cannot be traded blindly. Must WAIT for the next completed candle to validate confirmation.`
        });
        continue;
      }

      // We have a following completed candle! Let's rigorously evaluate confirmation criteria based on pattern type
      if (pattern.name === 'Hammer') {
        const priorTrend = CandlestickEngine.getPriorTrend(candles, patternCandleIdx);
        const metrics = CandlestickEngine.calculateMetrics(patternCandle);
        const folMetrics = CandlestickEngine.calculateMetrics(followingCandle);

        const isBearishPrior = priorTrend === 'DOWNTREND';
        const isNearSupport = pattern.location === 'support' || pattern.location === 'after_downtrend';
        const wickRatioPass = metrics.lowerWick >= metrics.bodySize * 2;
        const volumeMeaningful = patternCandle.volume >= (candles[patternCandleIdx - 1]?.volume || 1) * 0.9;
        const closedAboveHammerHigh = followingCandle.close > patternCandle.high;
        const sustainedBullish = folMetrics.isBullish;
        const volumeSupported = followingCandle.volume >= patternCandle.volume * 0.85;
        const setupValid = followingCandle.low >= patternCandle.low;

        const criteria: ConfirmationCriterion[] = [
          { criterion: 'Previous Trend Bearish', passed: isBearishPrior, details: `Prior trend: ${priorTrend}` },
          { criterion: 'Formed Near Support', passed: isNearSupport, details: `Location: ${pattern.location}` },
          { criterion: 'Lower Wick >= 2x Body', passed: wickRatioPass, details: `Lower shadow: ₹${metrics.lowerWick}, Body: ₹${metrics.bodySize}` },
          { criterion: 'Volume Expansion', passed: volumeMeaningful, details: `Pattern volume: ${patternCandle.volume.toLocaleString('en-IN')}` },
          { criterion: 'Next Candle Closed Above Hammer High', passed: closedAboveHammerHigh, details: `Follow close: ₹${followingCandle.close} vs Hammer High: ₹${patternCandle.high}` },
          { criterion: 'Follow-Through Bullish Close', passed: sustainedBullish, details: `Follow candle was ${folMetrics.isBullish ? 'Bullish' : 'Bearish'}` },
          { criterion: 'Setup Intact (Low Held)', passed: setupValid, details: `Follow low (₹${followingCandle.low}) held above Hammer low (₹${patternCandle.low})` },
        ];

        let status: ConfirmationStatus = 'Waiting for Confirmation';
        let explanation = '';

        if (!setupValid) {
          status = 'Failed Pattern';
          explanation = `Hammer low (₹${patternCandle.low}) was breached by the subsequent candle. The bullish reversal setup has failed.`;
        } else if (closedAboveHammerHigh && sustainedBullish && volumeSupported) {
          status = 'Confirmed Bullish Reversal';
          explanation = `Hammer reversal is strictly confirmed! The subsequent candle closed firmly at ₹${followingCandle.close} above the Hammer high (₹${patternCandle.high}) with healthy volume.`;
        } else if (closedAboveHammerHigh || sustainedBullish) {
          status = 'Potential Bullish Reversal';
          explanation = `Follow-through candle closed green but lacked full volume surge or was slightly shy of clean high breakout. Setup remains viable with conservative stops.`;
        } else {
          status = 'Weak Confirmation';
          explanation = `Following candle failed to close above the Hammer high. Market remains hesitant; high risk of bull trap without breakout close.`;
        }

        results.push({
          patternName: 'Hammer',
          status,
          patternCandleIndex: patternCandleIdx,
          confirmationCandleIndex: patternCandleIdx + 1,
          criteriaEvaluated: criteria,
          isProvisional: false,
          explanation
        });
      } else if (pattern.name === 'Shooting Star') {
        const priorTrend = CandlestickEngine.getPriorTrend(candles, patternCandleIdx);
        const metrics = CandlestickEngine.calculateMetrics(patternCandle);
        const folMetrics = CandlestickEngine.calculateMetrics(followingCandle);

        const isUptrendPrior = priorTrend === 'UPTREND';
        const isNearResistance = pattern.location === 'resistance' || pattern.location === 'after_uptrend';
        const wickRatioPass = metrics.upperWick >= metrics.bodySize * 2;
        const closedBelowStarLow = followingCandle.close < patternCandle.low;
        const sustainedBearish = folMetrics.isBearish;
        const setupValid = followingCandle.high <= patternCandle.high;

        const criteria: ConfirmationCriterion[] = [
          { criterion: 'Previous Trend Bullish', passed: isUptrendPrior, details: `Prior trend: ${priorTrend}` },
          { criterion: 'Formed Near Resistance', passed: isNearResistance, details: `Location: ${pattern.location}` },
          { criterion: 'Upper Wick >= 2x Body', passed: wickRatioPass, details: `Upper shadow: ₹${metrics.upperWick}, Body: ₹${metrics.bodySize}` },
          { criterion: 'Next Candle Closed Below Star Low', passed: closedBelowStarLow, details: `Follow close: ₹${followingCandle.close} vs Star Low: ₹${patternCandle.low}` },
          { criterion: 'Follow-Through Bearish Close', passed: sustainedBearish, details: `Follow candle was ${folMetrics.isBearish ? 'Bearish' : 'Bullish'}` },
          { criterion: 'High Held (Invalidation Safe)', passed: setupValid, details: `Follow high (₹${followingCandle.high}) remained below Star High (₹${patternCandle.high})` }
        ];

        let status: ConfirmationStatus = 'Waiting for Confirmation';
        let explanation = '';

        if (!setupValid) {
          status = 'Failed Pattern';
          explanation = `Shooting Star high (₹${patternCandle.high}) was taken out by the next candle. The bearish reversal thesis is invalidated.`;
        } else if (closedBelowStarLow && sustainedBearish) {
          status = 'Confirmed Bearish Reversal';
          explanation = `Shooting Star bearish reversal is confirmed! Subsequent candle closed decisively below the Star low (₹${patternCandle.low}), confirming heavy distribution.`;
        } else if (sustainedBearish) {
          status = 'Potential Bearish Reversal';
          explanation = `Subsequent candle closed bearish but hasn't closed below the complete low of the Shooting Star.`;
        } else {
          status = 'Weak Confirmation';
          explanation = `Subsequent candle closed green or failed to provide selling pressure. Setup requires caution.`;
        }

        results.push({
          patternName: 'Shooting Star',
          status,
          patternCandleIndex: patternCandleIdx,
          confirmationCandleIndex: patternCandleIdx + 1,
          criteriaEvaluated: criteria,
          isProvisional: false,
          explanation
        });
      } else if (pattern.name === 'Bullish Engulfing') {
        const folMetrics = CandlestickEngine.calculateMetrics(followingCandle);
        const closedAboveHigh = followingCandle.close > patternCandle.high;
        const heldLow = followingCandle.low >= patternCandle.low;

        const criteria: ConfirmationCriterion[] = [
          { criterion: 'Engulfing Body Established', passed: true, details: `Green body covered prior red candle` },
          { criterion: 'Held Pattern Low', passed: heldLow, details: `Follow low (₹${followingCandle.low}) held above Engulfing low (₹${patternCandle.low})` },
          { criterion: 'Subsequent Candle Continuation', passed: closedAboveHigh || folMetrics.isBullish, details: `Follow candle close: ₹${followingCandle.close}` },
          { criterion: 'Volume Expansion', passed: patternCandle.volume > (candles[patternCandleIdx - 1]?.volume || 1), details: `Pattern volume expansion confirmed` }
        ];

        let status: ConfirmationStatus = 'Confirmed Bullish Reversal';
        let explanation = `Bullish Engulfing received positive continuation; buyers maintained control above support.`;

        if (!heldLow) {
          status = 'Failed Pattern';
          explanation = `Subsequent price action breached the Bullish Engulfing candle low. Invalidation triggered.`;
        } else if (!closedAboveHigh && !folMetrics.isBullish) {
          status = 'Weak Confirmation';
          explanation = `Subsequent candle paused with an inside bar or slight pullback; awaiting decisive upside continuation.`;
        }

        results.push({
          patternName: 'Bullish Engulfing',
          status,
          patternCandleIndex: patternCandleIdx,
          confirmationCandleIndex: patternCandleIdx + 1,
          criteriaEvaluated: criteria,
          isProvisional: false,
          explanation
        });
      } else if (pattern.name === 'Bearish Engulfing') {
        const folMetrics = CandlestickEngine.calculateMetrics(followingCandle);
        const closedBelowLow = followingCandle.close < patternCandle.low;
        const heldHigh = followingCandle.high <= patternCandle.high;

        const criteria: ConfirmationCriterion[] = [
          { criterion: 'Bearish Engulfing Body Established', passed: true, details: `Red body engulfed prior green candle` },
          { criterion: 'Held Resistance High', passed: heldHigh, details: `Follow high held below Engulfing high (₹${patternCandle.high})` },
          { criterion: 'Subsequent Continuation Breakdown', passed: closedBelowLow || folMetrics.isBearish, details: `Follow candle close: ₹${followingCandle.close}` }
        ];

        let status: ConfirmationStatus = 'Confirmed Bearish Reversal';
        let explanation = `Bearish Engulfing confirmed with continuation selling into next candle.`;

        if (!heldHigh) {
          status = 'Failed Pattern';
          explanation = `Buyers took out the high of the Bearish Engulfing candle. Bearish thesis invalidated.`;
        } else if (!closedBelowLow && !folMetrics.isBearish) {
          status = 'Weak Confirmation';
          explanation = `Price did not immediately break below pattern low.`;
        }

        results.push({
          patternName: 'Bearish Engulfing',
          status,
          patternCandleIndex: patternCandleIdx,
          confirmationCandleIndex: patternCandleIdx + 1,
          criteriaEvaluated: criteria,
          isProvisional: false,
          explanation
        });
      } else {
        // Generic pattern confirmation
        const folMetrics = CandlestickEngine.calculateMetrics(followingCandle);
        const isBullish = pattern.type === 'bullish';
        const continuation = isBullish ? (followingCandle.close > patternCandle.close) : (followingCandle.close < patternCandle.close);

        results.push({
          patternName: pattern.name,
          status: continuation ? (isBullish ? 'Potential Bullish Reversal' : 'Potential Bearish Reversal') : 'Weak Confirmation',
          patternCandleIndex: patternCandleIdx,
          confirmationCandleIndex: patternCandleIdx + 1,
          criteriaEvaluated: [
            { criterion: 'Pattern Recognized', passed: true, details: `${pattern.name} detected on completed candle` },
            { criterion: 'Next Candle Follow-through', passed: continuation, details: `Next candle closed at ₹${followingCandle.close} (${folMetrics.isBullish ? 'Bullish' : 'Bearish'})` }
          ],
          isProvisional: false,
          explanation: continuation
            ? `${pattern.name} received favorable follow-through on the subsequent completed candle.`
            : `${pattern.name} saw hesitation or opposing response on the following candle.`
        });
      }
    }

    return results;
  }
}


import { Candle, NextCandleScenarios, TechnicalIndicators } from '@/types';

export class ScenarioEngine {
  public static generateScenarios(candles: Candle[], indicators: TechnicalIndicators): NextCandleScenarios {
    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2];
    const price = last.close;
    const atr = indicators.atr.value || price * 0.008;

    // Bullish trigger: Breakout above high of latest candle / swing resistance
    const recentHigh = Math.max(last.high, prev.high);
    const bullishBreakout = Number((recentHigh + (atr * 0.1)).toFixed(2));
    const bullishInvalidation = Number((last.low - (atr * 0.2)).toFixed(2));

    // Bearish trigger: Breakdown below low of latest candle / swing support
    const recentLow = Math.min(last.low, prev.low);
    const bearishBreakdown = Number((recentLow - (atr * 0.1)).toFixed(2));
    const bearishInvalidation = Number((last.high + (atr * 0.2)).toFixed(2));

    // Neutral range
    const rangeMin = Number((price - atr * 0.4).toFixed(2));
    const rangeMax = Number((price + atr * 0.4).toFixed(2));

    return {
      bullish: {
        requiredPriceAction: `Next candle must open firmly and break above ₹${bullishBreakout} with strong body expansion.`,
        breakoutLevel: bullishBreakout,
        confirmation: `Completed candle close above ₹${bullishBreakout} holding gains into closing minutes.`,
        volumeRequirement: `Volume must exceed 20-period average (RVOL > 1.3x) to validate institutional demand.`,
        invalidationLevel: bullishInvalidation,
        probabilityEstimate: 'Contingent strictly on confirmed breakout close'
      },
      bearish: {
        supportBreakdown: bearishBreakdown,
        bearishConfirmation: `Next candle printing decisive breakdown closing below ₹${bearishBreakdown}.`,
        volumeRequirement: `Sustained selling volume exceeding average volume with no lower wick recovery.`,
        invalidationLevel: bearishInvalidation,
        probabilityEstimate: 'Valid only if support fails to hold'
      },
      neutral: {
        consolidationRange: { min: rangeMin, max: rangeMax },
        indecisionTriggers: `Price remains trapped inside the range of ₹${rangeMin} - ₹${rangeMax} as a Doji or inside bar.`,
        confirmationWait: `No edge in choppy consolidation. Maintain capital preservation and wait for decisive boundary breakout.`
      }
    };
  }
}


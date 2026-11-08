import { Candle, SmcAnalysis } from '@/types';
import { ChartPatternEngine } from './chart-pattern-engine';

export class SmcEngine {
  public static analyzeSMC(candles: Candle[]): SmcAnalysis {
    if (candles.length < 20) {
      return {
        bosDetected: false,
        chochDetected: false,
        liquiditySweeps: [],
        orderBlocks: [],
        fairValueGaps: [],
        marketZone: 'EQUILIBRIUM'
      };
    }

    const { swingHighs, swingLows } = ChartPatternEngine.findPivots(candles, 3);
    const lastPrice = candles[candles.length - 1].close;

    // 1. Premium vs Discount Zone based on dealing range (last 40 candles)
    const dealingSlice = candles.slice(-40);
    const rangeHigh = Math.max(...dealingSlice.map(c => c.high));
    const rangeLow = Math.min(...dealingSlice.map(c => c.low));
    const equilibrium = (rangeHigh + rangeLow) / 2;

    let marketZone: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM' = 'EQUILIBRIUM';
    const distFromEq = (lastPrice - equilibrium) / (rangeHigh - rangeLow || 1);
    if (distFromEq > 0.1) marketZone = 'PREMIUM';
    else if (distFromEq < -0.1) marketZone = 'DISCOUNT';

    // 2. BOS & CHoCH Detection
    let bosDetected = false;
    let chochDetected = false;
    let bosDetails = '';
    let chochDetails = '';

    if (swingHighs.length >= 2) {
      const prevHigh = swingHighs[swingHighs.length - 2];
      const latestHigh = swingHighs[swingHighs.length - 1];

      if (lastPrice > latestHigh.price) {
        bosDetected = true;
        bosDetails = `Bullish Break of Structure (BOS): Price decisively closed above previous swing high of ₹${latestHigh.price.toFixed(2)}.`;
      }
    }

    if (swingLows.length >= 2) {
      const prevLow = swingLows[swingLows.length - 2];
      const latestLow = swingLows[swingLows.length - 1];

      if (lastPrice < latestLow.price) {
        if (!bosDetected) {
          bosDetected = true;
          bosDetails = `Bearish Break of Structure (BOS): Price broke below prior swing low of ₹${latestLow.price.toFixed(2)}.`;
        }
      }
    }

    // CHoCH: Change of Character
    if (swingHighs.length >= 2 && swingLows.length >= 2) {
      const sh2 = swingHighs[swingHighs.length - 2];
      const sl2 = swingLows[swingLows.length - 2];
      const sl1 = swingLows[swingLows.length - 1];

      // Downtrend transitioning to uptrend (CHoCH)
      if (sl1.price < sl2.price && lastPrice > sh2.price) {
        chochDetected = true;
        chochDetails = `Bullish CHoCH (Change of Character): Downtrend structure violated as buyers punched through Lower High pivot ₹${sh2.price.toFixed(2)}.`;
      }
    }

    // 3. Liquidity Sweeps
    const liquiditySweeps: SmcAnalysis['liquiditySweeps'] = [];
    for (let i = candles.length - 10; i < candles.length; i++) {
      const c = candles[i];
      // Check if candle high pierced a prior swing high but closed below it (Sweep of Buy-Side Liquidity)
      for (const sh of swingHighs) {
        if (sh.index < i && c.high > sh.price && c.close < sh.price) {
          liquiditySweeps.push({
            level: sh.price,
            type: 'BUY_SIDE',
            description: `Buy-side liquidity swept above ₹${sh.price.toFixed(2)} with candle closing back inside the range. Indicates stop-hunt rejection.`
          });
          break;
        }
      }

      // Check if candle low pierced a prior swing low but closed above it (Sweep of Sell-Side Liquidity)
      for (const sl of swingLows) {
        if (sl.index < i && c.low < sl.price && c.close > sl.price) {
          liquiditySweeps.push({
            level: sl.price,
            type: 'SELL_SIDE',
            description: `Sell-side liquidity swept below ₹${sl.price.toFixed(2)} with candle rebounding to close above support. Clean stop run absorption.`
          });
          break;
        }
      }
    }

    // 4. Fair Value Gaps (FVG)
    const fairValueGaps: SmcAnalysis['fairValueGaps'] = [];
    for (let i = candles.length - 15; i < candles.length - 1; i++) {
      if (i >= 2) {
        const c1 = candles[i - 2];
        const c3 = candles[i];

        // Bullish FVG: Gap between candle 1 high and candle 3 low
        if (c3.low > c1.high) {
          fairValueGaps.push({
            high: c3.low,
            low: c1.high,
            type: 'BULLISH',
            description: `Bullish Fair Value Gap (FVG) between ₹${c1.high.toFixed(2)} and ₹${c3.low.toFixed(2)}. Unfilled imbalance acting as demand zone.`
          });
        }
        // Bearish FVG: Gap between candle 1 low and candle 3 high
        if (c3.high < c1.low) {
          fairValueGaps.push({
            high: c1.low,
            low: c3.high,
            type: 'BEARISH',
            description: `Bearish Fair Value Gap (FVG) between ₹${c3.high.toFixed(2)} and ₹${c1.low.toFixed(2)}. Unfilled sell-side imbalance.`
          });
        }
      }
    }

    // 5. Order Blocks (OB)
    const orderBlocks: SmcAnalysis['orderBlocks'] = [];
    for (let i = candles.length - 20; i < candles.length - 2; i++) {
      const c = candles[i];
      const next1 = candles[i + 1];
      const next2 = candles[i + 2];

      // Bullish OB: last down candle before aggressive 2-candle green rally
      if (c.close < c.open && next1.close > next1.open && next2.close > next2.open && (next2.close - c.low) > (c.high - c.low) * 2) {
        orderBlocks.push({
          high: c.high,
          low: c.low,
          type: 'BULLISH',
          description: `Bullish Order Block at ₹${c.low.toFixed(2)} - ₹${c.high.toFixed(2)}. Last down-candle before aggressive displacement upward.`
        });
      }

      // Bearish OB: last up candle before aggressive 2-candle drop
      if (c.close > c.open && next1.close < next1.open && next2.close < next2.open && (c.high - next2.close) > (c.high - c.low) * 2) {
        orderBlocks.push({
          high: c.high,
          low: c.low,
          type: 'BEARISH',
          description: `Bearish Order Block at ₹${c.low.toFixed(2)} - ₹${c.high.toFixed(2)}. Last up-candle preceding heavy institutional liquidation.`
        });
      }
    }

    return {
      bosDetected,
      chochDetected,
      bosDetails,
      chochDetails,
      liquiditySweeps: liquiditySweeps.slice(-3),
      orderBlocks: orderBlocks.slice(-3),
      fairValueGaps: fairValueGaps.slice(-3),
      marketZone
    };
  }
}


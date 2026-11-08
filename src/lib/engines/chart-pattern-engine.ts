import { Candle, ChartPattern } from '@/types';

export class ChartPatternEngine {
  /**
   * Find swing highs and swing lows (fractal pivots)
   */
  public static findPivots(candles: Candle[], lookback: number = 3): {
    swingHighs: { index: number; price: number; candle: Candle }[];
    swingLows: { index: number; price: number; candle: Candle }[];
  } {
    const swingHighs: { index: number; price: number; candle: Candle }[] = [];
    const swingLows: { index: number; price: number; candle: Candle }[] = [];

    for (let i = lookback; i < candles.length - lookback; i++) {
      let isHigh = true;
      let isLow = true;

      for (let j = 1; j <= lookback; j++) {
        if (candles[i].high <= candles[i - j].high || candles[i].high <= candles[i + j].high) {
          isHigh = false;
        }
        if (candles[i].low >= candles[i - j].low || candles[i].low >= candles[i + j].low) {
          isLow = false;
        }
      }

      if (isHigh) {
        swingHighs.push({ index: i, price: candles[i].high, candle: candles[i] });
      }
      if (isLow) {
        swingLows.push({ index: i, price: candles[i].low, candle: candles[i] });
      }
    }

    return { swingHighs, swingLows };
  }

  /**
   * Recognize classical chart formations
   */
  public static recognizeChartPatterns(candles: Candle[]): ChartPattern[] {
    const patterns: ChartPattern[] = [];
    if (candles.length < 25) return patterns;

    const { swingHighs, swingLows } = this.findPivots(candles, 2);
    const lastPrice = candles[candles.length - 1].close;

    // 1. Double Bottom (W Pattern)
    if (swingLows.length >= 2) {
      const l1 = swingLows[swingLows.length - 2];
      const l2 = swingLows[swingLows.length - 1];
      const diffPercent = Math.abs(l1.price - l2.price) / l1.price;

      if (diffPercent < 0.012 && l2.index - l1.index >= 5) {
        // Find intermediate neckline high between l1 and l2
        const intermediateCandles = candles.slice(l1.index, l2.index);
        const neckline = Math.max(...intermediateCandles.map(c => c.high));
        const isCompleted = lastPrice > neckline;

        patterns.push({
          name: 'Double Bottom (W-Formation)',
          status: isCompleted ? 'completed' : 'developing',
          bullishOrBearish: 'bullish',
          breakoutLevel: neckline,
          confirmationLevel: Number((neckline * 1.003).toFixed(2)),
          invalidationLevel: Math.min(l1.price, l2.price),
          volumeCondition: 'High volume surge required on neckline candle close',
          description: `Two distinct troughs formed around ₹${l1.price.toFixed(2)} and ₹${l2.price.toFixed(2)}. ${isCompleted ? 'Decisive breakout above neckline (₹' + neckline + ') completed!' : 'Approaching neckline resistance at ₹' + neckline + '.'}`
        });
      }
    }

    // 2. Double Top (M Pattern)
    if (swingHighs.length >= 2) {
      const h1 = swingHighs[swingHighs.length - 2];
      const h2 = swingHighs[swingHighs.length - 1];
      const diffPercent = Math.abs(h1.price - h2.price) / h1.price;

      if (diffPercent < 0.012 && h2.index - h1.index >= 5) {
        const intermediateCandles = candles.slice(h1.index, h2.index);
        const neckline = Math.min(...intermediateCandles.map(c => c.low));
        const isCompleted = lastPrice < neckline;

        patterns.push({
          name: 'Double Top (M-Formation)',
          status: isCompleted ? 'completed' : 'developing',
          bullishOrBearish: 'bearish',
          breakoutLevel: neckline,
          confirmationLevel: Number((neckline * 0.997).toFixed(2)),
          invalidationLevel: Math.max(h1.price, h2.price),
          volumeCondition: 'Expanding sell volume on breakdown below neckline',
          description: `Twin peaks tested at ₹${h1.price.toFixed(2)} and ₹${h2.price.toFixed(2)}. ${isCompleted ? 'Neckline (₹' + neckline + ') broken to the downside.' : 'Tracking neckline support at ₹' + neckline + '.'}`
        });
      }
    }

    // 3. Head and Shoulders / Inverse Head and Shoulders
    if (swingHighs.length >= 3) {
      const sh1 = swingHighs[swingHighs.length - 3];
      const head = swingHighs[swingHighs.length - 2];
      const sh2 = swingHighs[swingHighs.length - 1];

      if (head.price > sh1.price && head.price > sh2.price && Math.abs(sh1.price - sh2.price) / sh1.price < 0.02) {
        const neckline = Math.min(
          ...candles.slice(sh1.index, sh2.index).map(c => c.low)
        );
        patterns.push({
          name: 'Head and Shoulders',
          status: lastPrice < neckline ? 'completed' : 'developing',
          bullishOrBearish: 'bearish',
          breakoutLevel: neckline,
          confirmationLevel: Number((neckline * 0.995).toFixed(2)),
          invalidationLevel: head.price,
          volumeCondition: 'Volume expands on right shoulder decay and neckline breakdown',
          description: `Major reversal formation with Left Shoulder (₹${sh1.price}), Head (₹${head.price}), and Right Shoulder (₹${sh2.price}). Neckline sits at ₹${neckline}.`
        });
      }
    }

    if (swingLows.length >= 3) {
      const sl1 = swingLows[swingLows.length - 3];
      const head = swingLows[swingLows.length - 2];
      const sl2 = swingLows[swingLows.length - 1];

      if (head.price < sl1.price && head.price < sl2.price && Math.abs(sl1.price - sl2.price) / sl1.price < 0.02) {
        const neckline = Math.max(
          ...candles.slice(sl1.index, sl2.index).map(c => c.high)
        );
        patterns.push({
          name: 'Inverse Head and Shoulders',
          status: lastPrice > neckline ? 'completed' : 'developing',
          bullishOrBearish: 'bullish',
          breakoutLevel: neckline,
          confirmationLevel: Number((neckline * 1.005).toFixed(2)),
          invalidationLevel: head.price,
          volumeCondition: 'Strong volume expansion required on right shoulder upward breakout',
          description: `Bullish bottom reversal pattern with Left Shoulder (₹${sl1.price}), Head (₹${head.price}), and Right Shoulder (₹${sl2.price}). Neckline target ₹${neckline}.`
        });
      }
    }

    // 4. Ascending Triangle (Flat Top Resistance, Higher Lows)
    if (swingHighs.length >= 2 && swingLows.length >= 2) {
      const h1 = swingHighs[swingHighs.length - 2];
      const h2 = swingHighs[swingHighs.length - 1];
      const l1 = swingLows[swingLows.length - 2];
      const l2 = swingLows[swingLows.length - 1];

      const flatTops = Math.abs(h1.price - h2.price) / h1.price < 0.008;
      const higherLows = l2.price > l1.price;

      if (flatTops && higherLows) {
        const ceiling = Math.max(h1.price, h2.price);
        patterns.push({
          name: 'Ascending Triangle',
          status: lastPrice > ceiling ? 'completed' : 'developing',
          bullishOrBearish: 'bullish',
          breakoutLevel: ceiling,
          confirmationLevel: Number((ceiling * 1.004).toFixed(2)),
          invalidationLevel: l2.price,
          volumeCondition: 'Volume contraction during triangle formation, breakout surge upon ceiling break',
          description: `Buyers applying upward pressure against flat resistance at ₹${ceiling}. Ascending lows reflect aggressive accumulation.`
        });
      }
    }

    // 5. Descending Triangle (Flat Floor Support, Lower Highs)
    if (swingHighs.length >= 2 && swingLows.length >= 2) {
      const h1 = swingHighs[swingHighs.length - 2];
      const h2 = swingHighs[swingHighs.length - 1];
      const l1 = swingLows[swingLows.length - 2];
      const l2 = swingLows[swingLows.length - 1];

      const flatFloor = Math.abs(l1.price - l2.price) / l1.price < 0.008;
      const lowerHighs = h2.price < h1.price;

      if (flatFloor && lowerHighs) {
        const floor = Math.min(l1.price, l2.price);
        patterns.push({
          name: 'Descending Triangle',
          status: lastPrice < floor ? 'completed' : 'developing',
          bullishOrBearish: 'bearish',
          breakoutLevel: floor,
          confirmationLevel: Number((floor * 0.996).toFixed(2)),
          invalidationLevel: h2.price,
          volumeCondition: 'Heavy sell volume on floor breakdown',
          description: `Sellers pressing down with lower highs against horizontal support at ₹${floor}. Distribution pressure building.`
        });
      }
    }

    // 6. Bull Flag / Consolidation Channel
    const recent30 = candles.slice(-30);
    const impulseMove = recent30.slice(0, 10);
    const consolidationMove = recent30.slice(-15);
    const impulseGain = ((impulseMove[impulseMove.length - 1].close - impulseMove[0].open) / impulseMove[0].open) * 100;

    if (impulseGain > 2.5) {
      const flagHigh = Math.max(...consolidationMove.map(c => c.high));
      const flagLow = Math.min(...consolidationMove.map(c => c.low));
      const flagRange = (flagHigh - flagLow) / flagLow;

      if (flagRange < 0.02) {
        patterns.push({
          name: 'Bull Flag',
          status: lastPrice > flagHigh ? 'completed' : 'developing',
          bullishOrBearish: 'bullish',
          breakoutLevel: flagHigh,
          confirmationLevel: Number((flagHigh * 1.003).toFixed(2)),
          invalidationLevel: flagLow,
          volumeCondition: 'Contracting volume inside flag channel, high expansion on upward resolution',
          description: `Sharp pole rally (+${impulseGain.toFixed(1)}%) followed by tight rectangular consolidation between ₹${flagLow} and ₹${flagHigh}. High-continuation structure.`
        });
      }
    }

    // 7. Horizontal Rectangle / Range
    const recent20 = candles.slice(-20);
    const boxHigh = Math.max(...recent20.map(c => c.high));
    const boxLow = Math.min(...recent20.map(c => c.low));
    const boxRangePercent = ((boxHigh - boxLow) / boxLow) * 100;

    if (boxRangePercent < 1.8 && patterns.length === 0) {
      patterns.push({
        name: 'Rectangle Range Consolidation',
        status: 'developing',
        bullishOrBearish: 'neutral',
        breakoutLevel: boxHigh,
        confirmationLevel: Number((boxHigh * 1.002).toFixed(2)),
        invalidationLevel: boxLow,
        volumeCondition: 'Requires candle close outside boundary accompanied by relative volume > 1.5',
        description: `Price bound tightly within a ₹${boxLow} - ₹${boxHigh} horizontal corridor (${boxRangePercent.toFixed(2)}% range). Await clear range breakout before committing.`
      });
    }

    return patterns;
  }
}


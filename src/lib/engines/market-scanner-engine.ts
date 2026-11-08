import { DataFreshness, StockExchange } from '@/types';
import { INDIAN_STOCKS } from '../data/indian-stocks';
import { marketDataService } from './market-data-engine';
import { TechnicalIndicatorEngine } from './technical-indicator-engine';

export interface ScanResultItem {
  symbol: string;
  name: string;
  exchange: StockExchange;
  sector: string;
  price: number;
  changePercent: number;
  rsi: number;
  volume: number;
  signals: {
    rsiOversold: boolean;
    rsiOverbought: boolean;
    emaBullishCross: boolean;
    emaBearishCross: boolean;
    macdBullishCross: boolean;
    macdBearishCross: boolean;
    volumeBreakout: boolean;
    nearSupport: boolean;
    nearResistance: boolean;
    is20DayHigh: boolean;
    is20DayLow: boolean;
  };
  matchedCriteria: string[];
  dataFreshness: DataFreshness;
  timestamp: string;
}

export class MarketScannerEngine {
  public static async scanIndianMarket(filterType?: string): Promise<ScanResultItem[]> {
    // Scan top 15 Indian liquid stocks and indices
    const targets = INDIAN_STOCKS.slice(0, 16);
    const results: ScanResultItem[] = [];

    for (const item of targets) {
      try {
        const data = await marketDataService.fetchMarketData(item.symbol, '1D', item.exchange);
        const candles = data.candles;
        if (candles.length < 25) continue;

        const indicators = TechnicalIndicatorEngine.calculateAll(candles);
        const last = candles[candles.length - 1];
        const prev = candles[candles.length - 2];
        const last20 = candles.slice(-20);

        const high20 = Math.max(...last20.map(c => c.high));
        const low20 = Math.min(...last20.map(c => c.low));

        const rsiOversold = indicators.rsi14.value <= 32;
        const rsiOverbought = indicators.rsi14.value >= 68;

        const emaBullishCross = indicators.ema9 > indicators.ema21 && candles[candles.length - 3].close <= indicators.ema21;
        const emaBearishCross = indicators.ema9 < indicators.ema21 && candles[candles.length - 3].close >= indicators.ema21;

        const macdBullishCross = indicators.macd.macd > indicators.macd.signal && indicators.macd.histogram > 0;
        const macdBearishCross = indicators.macd.macd < indicators.macd.signal && indicators.macd.histogram < 0;

        const volumeBreakout = indicators.volumeMetrics.isBreakoutVolume;
        const nearSupport = Math.abs(last.close - low20) / last.close < 0.015;
        const nearResistance = Math.abs(last.close - high20) / last.close < 0.015;

        const is20DayHigh = last.high >= high20 * 0.998;
        const is20DayLow = last.low <= low20 * 1.002;

        const matchedCriteria: string[] = [];
        if (rsiOversold) matchedCriteria.push('RSI < 30 (Oversold)');
        if (rsiOverbought) matchedCriteria.push('RSI > 70 (Overbought)');
        if (emaBullishCross) matchedCriteria.push('EMA 9/21 Golden Crossover');
        if (emaBearishCross) matchedCriteria.push('EMA 9/21 Bearish Crossover');
        if (macdBullishCross) matchedCriteria.push('MACD Bullish Crossover');
        if (macdBearishCross) matchedCriteria.push('MACD Bearish Crossover');
        if (volumeBreakout) matchedCriteria.push(`Volume Breakout (${indicators.volumeMetrics.relativeVolume}x)`);
        if (nearSupport) matchedCriteria.push('Testing Major Support');
        if (nearResistance) matchedCriteria.push('Testing Major Resistance');
        if (is20DayHigh) matchedCriteria.push('20-Day New High');
        if (is20DayLow) matchedCriteria.push('20-Day New Low');

        // Apply filter if specified
        let include = true;
        if (filterType === 'rsi-oversold' && !rsiOversold) include = false;
        if (filterType === 'rsi-overbought' && !rsiOverbought) include = false;
        if (filterType === 'ema-bullish' && !emaBullishCross) include = false;
        if (filterType === 'volume-breakout' && !volumeBreakout) include = false;
        if (filterType === 'near-support' && !nearSupport) include = false;

        if (include) {
          results.push({
            symbol: item.symbol,
            name: item.name,
            exchange: item.exchange,
            sector: item.sector,
            price: data.currentPrice,
            changePercent: data.changePercent,
            rsi: indicators.rsi14.value,
            volume: last.volume,
            signals: {
              rsiOversold,
              rsiOverbought,
              emaBullishCross,
              emaBearishCross,
              macdBullishCross,
              macdBearishCross,
              volumeBreakout,
              nearSupport,
              nearResistance,
              is20DayHigh,
              is20DayLow
            },
            matchedCriteria,
            dataFreshness: data.dataFreshness,
            timestamp: data.timestamp
          });
        }
      } catch (err) {
        // Continue scanning other stocks
      }
    }

    return results;
  }
}


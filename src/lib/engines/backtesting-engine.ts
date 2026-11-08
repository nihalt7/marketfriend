import { Candle } from '@/types';
import { CandlestickEngine } from './candlestick-engine';
import { marketDataService } from './market-data-engine';
import { NextCandleConfirmationEngine } from './next-candle-confirmation-engine';
import { TechnicalIndicatorEngine } from './technical-indicator-engine';

export interface BacktestTrade {
  id: string;
  entryIndex: number;
  entryTime: string;
  exitTime: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  target: number;
  pnl: number;
  pnlPercent: number;
  isWin: boolean;
  exitReason: 'TARGET' | 'STOP_LOSS' | 'TIME_EXIT';
}

export interface BacktestResult {
  strategyName: string;
  symbol: string;
  timeframe: string;
  initialCapital: number;
  finalCapital: number;
  netReturnPercent: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  averageProfit: number;
  averageLoss: number;
  maxDrawdownPercent: number;
  equityCurve: { time: string; equity: number }[];
  trades: BacktestTrade[];
}

export class BacktestingEngine {
  public static async runBacktest(params: {
    strategyId: string;
    symbol: string;
    timeframe?: string;
    initialCapital?: number;
  }): Promise<BacktestResult> {
    const {
      strategyId,
      symbol,
      timeframe = '1D',
      initialCapital = 100000
    } = params;

    const data = await marketDataService.fetchMarketData(symbol, '1D', 'NSE');
    const candles = data.candles;

    let capital = initialCapital;
    let peakCapital = initialCapital;
    let maxDrawdown = 0;

    const trades: BacktestTrade[] = [];
    const equityCurve: { time: string; equity: number }[] = [
      { time: 'Start', equity: initialCapital }
    ];

    const transactionFeeRate = 0.0005; // 0.05% brokerage + STT combined

    // Iterate through candles with zero look-ahead bias
    for (let i = 25; i < candles.length - 3; i++) {
      const historicalSlice = candles.slice(0, i + 1);
      const currentCandle = candles[i];
      const nextCandle = candles[i + 1];

      let shouldEnter = false;
      let tradeType: 'BUY' | 'SELL' = 'BUY';
      let stopLoss = 0;
      let target = 0;

      if (strategyId === 'hammer-confirmation') {
        const patterns = CandlestickEngine.recognizePatterns(historicalSlice);
        const hammer = patterns.find(p => p.name === 'Hammer');
        if (hammer) {
          const confirmations = NextCandleConfirmationEngine.evaluateConfirmations(historicalSlice, [hammer]);
          const confirmed = confirmations.find(c => c.status === 'Confirmed Bullish Reversal');
          if (confirmed) {
            shouldEnter = true;
            tradeType = 'BUY';
            stopLoss = currentCandle.low * 0.992;
            target = currentCandle.close + (currentCandle.close - stopLoss) * 2.0;
          }
        }
      } else if (strategyId === 'ema-crossover') {
        const ema9 = TechnicalIndicatorEngine.calculateEMA(historicalSlice, 9);
        const ema21 = TechnicalIndicatorEngine.calculateEMA(historicalSlice, 21);
        const prevEma9 = ema9[ema9.length - 2];
        const prevEma21 = ema21[ema21.length - 2];
        const currEma9 = ema9[ema9.length - 1];
        const currEma21 = ema21[ema21.length - 1];

        // Bullish crossover
        if (prevEma9 <= prevEma21 && currEma9 > currEma21) {
          shouldEnter = true;
          tradeType = 'BUY';
          stopLoss = currentCandle.low * 0.985;
          target = currentCandle.close + (currentCandle.close - stopLoss) * 2.2;
        }
      } else if (strategyId === 'rsi-divergence') {
        const rsiResult = TechnicalIndicatorEngine.calculateRSI(historicalSlice, 14);
        if (rsiResult.divergence === 'bullish' || rsiResult.latest <= 30) {
          shouldEnter = true;
          tradeType = 'BUY';
          stopLoss = currentCandle.low * 0.988;
          target = currentCandle.close + (currentCandle.close - stopLoss) * 2.0;
        }
      } else {
        // Default Breakout Strategy
        const recent20 = historicalSlice.slice(-20, -1);
        const high20 = Math.max(...recent20.map(c => c.high));
        if (currentCandle.close > high20 && currentCandle.volume > (recent20[recent20.length - 1]?.volume || 1) * 1.3) {
          shouldEnter = true;
          tradeType = 'BUY';
          stopLoss = high20 * 0.988;
          target = currentCandle.close + (currentCandle.close - stopLoss) * 2.0;
        }
      }

      // If signal triggered, execute at next candle open and track outcome forward
      if (shouldEnter && nextCandle) {
        const entryPrice = nextCandle.open;
        const riskAmount = capital * 0.01; // 1% risk per trade
        const riskPerShare = Math.abs(entryPrice - stopLoss);
        const quantity = Math.max(1, Math.floor(riskAmount / (riskPerShare || 1)));

        let exitPrice = entryPrice;
        let exitReason: BacktestTrade['exitReason'] = 'TIME_EXIT';
        let exitIndex = i + 1;

        // Evaluate future candles up to 10 periods ahead
        for (let j = i + 2; j < Math.min(candles.length, i + 12); j++) {
          const futureCandle = candles[j];
          exitIndex = j;

          if (futureCandle.low <= stopLoss) {
            exitPrice = stopLoss;
            exitReason = 'STOP_LOSS';
            break;
          }
          if (futureCandle.high >= target) {
            exitPrice = target;
            exitReason = 'TARGET';
            break;
          }
        }

        if (exitReason === 'TIME_EXIT') {
          exitPrice = candles[exitIndex].close;
        }

        const grossPnl = quantity * (exitPrice - entryPrice);
        const transactionCosts = (entryPrice * quantity + exitPrice * quantity) * transactionFeeRate;
        const netPnl = Number((grossPnl - transactionCosts).toFixed(2));
        const pnlPercent = Number(((exitPrice - entryPrice) / entryPrice * 100).toFixed(2));
        const isWin = netPnl > 0;

        capital += netPnl;
        if (capital > peakCapital) peakCapital = capital;
        const currentDrawdown = ((peakCapital - capital) / peakCapital) * 100;
        if (currentDrawdown > maxDrawdown) maxDrawdown = currentDrawdown;

        trades.push({
          id: `BT-${trades.length + 1}`,
          entryIndex: i + 1,
          entryTime: new Date(nextCandle.time * 1000).toLocaleDateString('en-IN'),
          exitTime: new Date(candles[exitIndex].time * 1000).toLocaleDateString('en-IN'),
          type: tradeType,
          entryPrice: Number(entryPrice.toFixed(2)),
          exitPrice: Number(exitPrice.toFixed(2)),
          stopLoss: Number(stopLoss.toFixed(2)),
          target: Number(target.toFixed(2)),
          pnl: netPnl,
          pnlPercent,
          isWin,
          exitReason
        });

        equityCurve.push({
          time: new Date(candles[exitIndex].time * 1000).toLocaleDateString('en-IN'),
          equity: Number(capital.toFixed(2))
        });

        // Fast forward iterator to avoid overlapping trade bias
        i = exitIndex;
      }
    }

    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => t.isWin).length;
    const losingTrades = totalTrades - winningTrades;
    const winRate = totalTrades > 0 ? Number(((winningTrades / totalTrades) * 100).toFixed(2)) : 0;

    const grossGains = trades.filter(t => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0);
    const grossLosses = Math.abs(trades.filter(t => t.pnl < 0).reduce((acc, t) => acc + t.pnl, 0));
    const profitFactor = grossLosses > 0 ? Number((grossGains / grossLosses).toFixed(2)) : grossGains > 0 ? 5.0 : 1.0;

    const averageProfit = winningTrades > 0 ? Number((grossGains / winningTrades).toFixed(2)) : 0;
    const averageLoss = losingTrades > 0 ? Number((grossLosses / losingTrades).toFixed(2)) : 0;
    const netReturnPercent = Number((((capital - initialCapital) / initialCapital) * 100).toFixed(2));

    const strategyNames: Record<string, string> = {
      'hammer-confirmation': 'Hammer Reversal with Next Candle Confirmation',
      'ema-crossover': 'EMA 9/21 Dynamic Trend Crossover',
      'rsi-divergence': 'RSI Divergence & Oversold Reversal',
      'breakout': 'High-Volume Range Breakout'
    };

    return {
      strategyName: strategyNames[strategyId] || strategyId,
      symbol,
      timeframe,
      initialCapital,
      finalCapital: Number(capital.toFixed(2)),
      netReturnPercent,
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      profitFactor,
      averageProfit,
      averageLoss,
      maxDrawdownPercent: Number(maxDrawdown.toFixed(2)),
      equityCurve,
      trades: trades.reverse()
    };
  }
}


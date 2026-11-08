import {
  AnalysisReport,
  StockExchange,
  Timeframe,
  TradingStyle
} from '@/types';
import { AiVisionEngine } from './ai-vision-engine';
import { CandlestickEngine } from './candlestick-engine';
import { ChartPatternEngine } from './chart-pattern-engine';
import { ComparisonEngine } from './comparison-engine';
import { ConfluenceEngine } from './confluence-engine';
import { marketDataService } from './market-data-engine';
import { MultiTimeframeEngine } from './multi-timeframe-engine';
import { NextCandleConfirmationEngine } from './next-candle-confirmation-engine';
import { PriceActionEngine } from './price-action-engine';
import { ScenarioEngine } from './scenario-engine';
import { SmcEngine } from './smc-engine';
import { StrategyEngine } from './strategy-engine';
import { TechnicalIndicatorEngine } from './technical-indicator-engine';
import { TradeCalculatorEngine } from './trade-calculator-engine';

export interface RunAnalysisParams {
  imageBase64?: string;
  mimeType?: string;
  symbol: string;
  exchange: StockExchange;
  timeframe: Timeframe;
  tradingStyle: TradingStyle;
  capital?: number;
  riskPercent?: number;
}

export class ChartIqOrchestrator {
  public static async analyze(params: RunAnalysisParams): Promise<AnalysisReport> {
    const {
      imageBase64,
      mimeType = 'image/png',
      symbol,
      exchange,
      timeframe,
      tradingStyle,
      capital = 100000,
      riskPercent = 1.0
    } = params;

    const reportId = `CHARTIQ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // STEP 6: AI Vision examines screenshot
    const vision = imageBase64
      ? await AiVisionEngine.analyzeChartImage(imageBase64, mimeType, symbol, timeframe)
      : {
          symbol,
          exchange,
          timeframe,
          detected_price: null,
          trend: 'bullish' as const,
          detected_patterns: [],
          visible_indicators: [],
          has_drawings: false,
          has_volume_bars: true,
          image_quality: 'good' as const,
          confidence: 0.9,
          missing_information: [],
          raw_interpretation: 'Market direct inquiry without screenshot.'
        };

    // STEP 7: Market Data Engine retrieves verified Indian market data
    const marketData = await marketDataService.fetchMarketData(symbol, timeframe, exchange);
    const candles = marketData.candles;

    if (candles.length < 10) {
      throw new Error(`Insufficient market data retrieved for ${symbol}. Please check symbol.`);
    }

    // STEP 11: Technical Analysis Engine calculates indicators
    const technicalIndicators = TechnicalIndicatorEngine.calculateAll(candles);

    // STEP 9: Candlestick Engine analyzes completed candles
    const detectedPatterns = CandlestickEngine.recognizePatterns(candles);
    const latestCandle = candles[candles.length - 1];
    const previousCandle = candles[candles.length - 2];
    const metrics = CandlestickEngine.calculateMetrics(latestCandle);
    const candlePsychology = CandlestickEngine.explainCandlePsychology(latestCandle, metrics);

    // STEP 13: Next Candle Confirmation Engine evaluates subsequent price action
    const nextCandleConfirmation = NextCandleConfirmationEngine.evaluateConfirmations(candles, detectedPatterns);

    // STEP 10: Chart Pattern Engine & SMC identifies formations
    const chartPatternAnalysis = ChartPatternEngine.recognizeChartPatterns(candles);
    const smcAnalysis = SmcEngine.analyzeSMC(candles);

    // Multi-timeframe context
    const multiTimeframeContext = MultiTimeframeEngine.analyzeMultiTimeframe(candles, timeframe);
    const isHigherTfBullish = multiTimeframeContext.higherTf.trend === 'BULLISH';

    // STEP 8: Comparison Engine compares screenshot info with verified OHLC data
    const comparison = ComparisonEngine.compareScreenshotAndMarketData({
      vision,
      selectedSymbol: symbol,
      selectedExchange: exchange,
      selectedTimeframe: timeframe,
      verifiedPrice: marketData.currentPrice,
      verifiedTrend: multiTimeframeContext.currentTf.trend
    });

    // Strategy Evaluations
    const strategyEvaluations = StrategyEngine.evaluateAllStrategies({
      candles,
      indicators: technicalIndicators,
      candlestickPatterns: detectedPatterns,
      confirmations: nextCandleConfirmation,
      chartPatterns: chartPatternAnalysis,
      smc: smcAnalysis
    });

    const selectedStrategy = strategyEvaluations[0];
    const alternativeStrategy = strategyEvaluations[1];

    // Confluence Engine
    const confluenceReport = ConfluenceEngine.evaluateConfluence({
      indicators: technicalIndicators,
      candlestickPatterns: detectedPatterns,
      confirmations: nextCandleConfirmation,
      chartPatterns: chartPatternAnalysis,
      smc: smcAnalysis,
      isHigherTfBullish
    });

    // STEP 14: Risk Management & Trade Calculator Engine
    const tradingPlan = TradeCalculatorEngine.calculateTradePlan({
      candles,
      indicators: technicalIndicators,
      patterns: detectedPatterns,
      confirmations: nextCandleConfirmation,
      confluenceScore: confluenceReport.confluenceScore,
      capital,
      riskPercent
    });

    // Next Candle Scenarios (Bullish, Bearish, Neutral)
    const nextCandleScenarios = ScenarioEngine.generateScenarios(candles, technicalIndicators);

    // Candle-by-Candle Price Action Analysis (latest 15 candles)
    const priceActionAnalysis = PriceActionEngine.analyzeLatestCandles(candles, 15);

    // Pivots for market structure
    const pivots = ChartPatternEngine.findPivots(candles, 3);
    const structurePivots = [
      ...pivots.swingHighs.map(h => ({
        type: 'HH' as const,
        price: h.price,
        time: new Date(h.candle.time * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      })),
      ...pivots.swingLows.map(l => ({
        type: 'HL' as const,
        price: l.price,
        time: new Date(l.candle.time * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }))
    ].slice(-6);

    // Support and Resistance levels
    const supportLevels = pivots.swingLows.map(l => l.price).slice(-3);
    const resistanceLevels = pivots.swingHighs.map(h => h.price).slice(-3);

    // Final Explanations in simple, crystal-clear professional English
    const finalExplanation = `Comprehensive quantitative synthesis for ${marketData.name} (${symbol}) on ${timeframe} timeframe.
Current market price is ₹${marketData.currentPrice.toFixed(2)} (${marketData.change >= 0 ? '+' : ''}${marketData.change} / ${marketData.changePercent.toFixed(2)}%).
The chart exhibits ${multiTimeframeContext.currentTf.trend.toLowerCase()} market structure aligned with ${multiTimeframeContext.higherTf.timeframe} higher timeframe flow.
Primary strategy selected: "${selectedStrategy.name}" (Suitability Score: ${selectedStrategy.score}/100) with a Strategy Confluence Rating of ${confluenceReport.rating} (${confluenceReport.confluenceScore}/100).
${detectedPatterns.length > 0 ? `Key candlestick formation identified: ${detectedPatterns.map(p => p.name).join(', ')}. Confirmation status: ${nextCandleConfirmation[0]?.status || 'Evaluated'}.` : 'No solitary candlestick reversal formed; evaluating broader structural support.'}
${tradingPlan.recommendation === 'WAIT' ? 'Evidence threshold for high-probability execution has not been met. Maintain capital discipline and await confirmation.' : `Recommended execution zone: ₹${tradingPlan.entryZone.min} - ₹${tradingPlan.entryZone.max} with strict stop-loss at ₹${tradingPlan.stopLoss.price} (${tradingPlan.stopLoss.distancePercent}% risk distance), targeting ₹${tradingPlan.target1.price} (T1) and ₹${tradingPlan.target2.price} (T2). Risk-to-Reward is 1:${tradingPlan.riskToReward}.`}`;

    const simpleSummary = tradingPlan.recommendation === 'WAIT'
      ? `Market is currently consolidating or waiting for confirmation. Professional traders protect capital first. Wait for price to break out above ₹${nextCandleScenarios.bullish.breakoutLevel} with strong volume before considering fresh entries.`
      : `${tradingPlan.recommendation} setup on ${symbol}. Buyers are actively defending support near ₹${tradingPlan.entryZone.min}. Planned stop-loss is ₹${tradingPlan.stopLoss.price}. If market moves favorably, take profit in phases at Target 1 (₹${tradingPlan.target1.price}) and Target 2 (₹${tradingPlan.target2.price}). Never risk more than 1% of your trading capital.`;

    return {
      id: reportId,
      timestamp: Date.now(),
      stockInfo: {
        name: marketData.name,
        symbol: marketData.symbol,
        exchange: marketData.exchange,
        currentPrice: marketData.currentPrice,
        previousClose: marketData.previousClose,
        change: marketData.change,
        changePercent: marketData.changePercent,
        timeframe,
        tradingStyle,
        marketStatus: marketData.marketStatus,
        dataFreshness: marketData.dataFreshness,
        dataTimestamp: marketData.timestamp
      },
      marketStructure: {
        overallTrend: multiTimeframeContext.currentTf.trend,
        trendStrength: technicalIndicators.adx.trendStrength.toUpperCase(),
        structurePivots,
        supportLevels,
        resistanceLevels
      },
      candlestickAnalysis: {
        latestCandle,
        previousCandle,
        metrics,
        detectedPatterns,
        nextCandleConfirmation,
        candlePsychology
      },
      priceActionAnalysis,
      chartPatternAnalysis,
      smcAnalysis,
      technicalIndicators,
      strategyEvaluations,
      selectedStrategy,
      alternativeStrategy,
      confluenceReport,
      multiTimeframeContext,
      nextCandleScenarios,
      tradingPlan,
      comparison,
      finalExplanation,
      simpleSummary,
      candles
    };
  }
}


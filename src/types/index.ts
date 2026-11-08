export type StockExchange = 'NSE' | 'BSE';

export type Timeframe = '5m' | '15m' | '30m' | '1h' | '4h' | '1D' | '1W';

export type TradingStyle = 'Scalping' | 'Intraday' | 'Swing' | 'Positional';

export type MarketStatus = 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'POST_MARKET' | 'HOLIDAY';

export type DataFreshness = 'LIVE' | 'DELAYED' | 'HISTORICAL' | 'FALLBACK';

export interface Candle {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CandlestickMetrics {
  bodySize: number;
  upperWick: number;
  lowerWick: number;
  totalRange: number;
  bodyToRangeRatio: number;
  wickToBodyRatio: number;
  isBullish: boolean;
  isBearish: boolean;
  isDoji: boolean;
}

export interface CandlestickPattern {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  significance: 'high' | 'medium' | 'low';
  location: 'support' | 'resistance' | 'mid_range' | 'after_downtrend' | 'after_uptrend';
  description: string;
  candleIndices: number[];
  reliabilityScore: number;
}

export type ConfirmationStatus =
  | 'Confirmed Bullish Reversal'
  | 'Potential Bullish Reversal'
  | 'Confirmed Bearish Reversal'
  | 'Potential Bearish Reversal'
  | 'Weak Confirmation'
  | 'Failed Pattern'
  | 'Waiting for Confirmation';

export interface ConfirmationCriterion {
  criterion: string;
  passed: boolean;
  details: string;
}

export interface NextCandleConfirmation {
  patternName: string;
  status: ConfirmationStatus;
  patternCandleIndex: number;
  confirmationCandleIndex?: number;
  criteriaEvaluated: ConfirmationCriterion[];
  isProvisional: boolean;
  explanation: string;
}

export interface PriceActionCandleAnalysis {
  index: number;
  timeFormatted: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  structure: 'HH' | 'HL' | 'LH' | 'LL' | 'CONSOLIDATION' | 'BREAKOUT' | 'BREAKDOWN' | 'REJECTION' | 'FALSE_BREAKOUT' | 'EXHAUSTION';
  buyerSellerControl: 'buyers' | 'sellers' | 'balanced';
  explanation: string;
  isKeyCandle: boolean;
}

export interface ChartPattern {
  name: string;
  status: 'developing' | 'completed' | 'broken';
  bullishOrBearish: 'bullish' | 'bearish' | 'neutral';
  breakoutLevel: number;
  confirmationLevel: number;
  invalidationLevel: number;
  volumeCondition: string;
  description: string;
}

export interface TechnicalIndicators {
  ema9: number;
  ema20: number;
  ema21: number;
  ema50: number;
  ema100: number;
  ema200: number;
  sma20: number;
  sma50: number;
  sma200: number;
  rsi14: {
    value: number;
    interpretation: string;
    signal: 'bullish' | 'bearish' | 'neutral';
    divergence?: 'bullish' | 'bearish' | null;
  };
  macd: {
    macd: number;
    signal: number;
    histogram: number;
    interpretation: string;
    signalType: 'bullish' | 'bearish' | 'neutral';
  };
  stochRsi: {
    k: number;
    d: number;
    interpretation: string;
  };
  adx: {
    adx: number;
    pdi: number;
    ndi: number;
    trendStrength: 'strong' | 'moderate' | 'weak';
  };
  cci: {
    value: number;
    interpretation: string;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    bandwidth: number;
    percentB: number;
  };
  atr: {
    value: number;
    percent: number;
  };
  vwap: {
    value: number;
    priceRelation: 'above' | 'below' | 'at';
  };
  obv: {
    value: number;
    trend: 'rising' | 'falling' | 'flat';
  };
  volumeMetrics: {
    currentVolume: number;
    volumeMA20: number;
    relativeVolume: number;
    isBreakoutVolume: boolean;
  };
}

export interface StrategyEvaluation {
  id: string;
  name: string;
  isSuitable: boolean;
  score: number; // 0-100
  marketConditions: string;
  entryCondition: string;
  confirmation: string;
  invalidation: string;
  riskFactors: string[];
}

export interface StrategyConfluenceReport {
  confluenceScore: number; // 0 - 100
  rating: 'HIGH' | 'MODERATE' | 'LOW' | 'INSUFFICIENT';
  confirmingFactors: string[];
  conflictingFactors: string[];
  correlatedDeduplications: string[];
  summary: string;
}

export interface MultiTimeframeContext {
  lowerTf: {
    timeframe: string;
    trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
    momentum: string;
  };
  currentTf: {
    timeframe: string;
    trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
    keyLevel: string;
  };
  higherTf: {
    timeframe: string;
    trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
    majorSupport: number;
    majorResistance: number;
  };
  alignment: 'ALIGNED_BULLISH' | 'ALIGNED_BEARISH' | 'CONFLICTING' | 'NEUTRAL';
}

export interface NextCandleScenarios {
  bullish: {
    requiredPriceAction: string;
    breakoutLevel: number;
    confirmation: string;
    volumeRequirement: string;
    invalidationLevel: number;
    probabilityEstimate?: string;
  };
  bearish: {
    supportBreakdown: number;
    bearishConfirmation: string;
    volumeRequirement: string;
    invalidationLevel: number;
    probabilityEstimate?: string;
  };
  neutral: {
    consolidationRange: { min: number; max: number };
    indecisionTriggers: string;
    confirmationWait: string;
  };
}

export interface TradingPlan {
  recommendation: 'STRONG BUY' | 'BUY' | 'WAIT' | 'SELL' | 'STRONG SELL';
  decisionHeadline: string;
  entryZone: {
    min: number;
    max: number;
    optimal: number;
  };
  stopLoss: {
    price: number;
    reason: string;
    distancePercent: number;
  };
  target1: {
    price: number;
    riskReward: number;
    exitPercentage: number;
  };
  target2: {
    price: number;
    riskReward: number;
    exitPercentage: number;
  };
  target3: {
    price: number;
    riskReward: number;
    exitPercentage: number;
  };
  riskToReward: number;
  confidenceScore: number; // 0 - 100
  positionSizing: {
    suggestedQuantity: number;
    capitalRiskAmount: number;
    maxLoss: number;
    potentialProfit: number;
  };
  justification: string;
}

export interface ScreenshotComparison {
  detectedSymbol: string;
  selectedSymbol: string;
  symbolMatches: boolean;
  detectedTimeframe: string;
  selectedTimeframe: string;
  timeframeMatches: boolean;
  detectedPrice: number | null;
  verifiedPrice: number;
  priceDifferencePercent: number;
  isOutdated: boolean;
  warnings: string[];
  status: 'MATCHED' | 'DISCREPANCY_WARNING' | 'MISMATCH_DETECTED';
}

export interface SmcAnalysis {
  bosDetected: boolean;
  chochDetected: boolean;
  bosDetails?: string;
  chochDetails?: string;
  liquiditySweeps: { level: number; type: 'BUY_SIDE' | 'SELL_SIDE'; description: string }[];
  orderBlocks: { high: number; low: number; type: 'BULLISH' | 'BEARISH'; description: string }[];
  fairValueGaps: { high: number; low: number; type: 'BULLISH' | 'BEARISH'; description: string }[];
  marketZone: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM';
}

export interface AnalysisReport {
  id: string;
  timestamp: number;
  stockInfo: {
    name: string;
    symbol: string;
    exchange: StockExchange;
    currentPrice: number;
    previousClose: number;
    change: number;
    changePercent: number;
    timeframe: Timeframe;
    tradingStyle: TradingStyle;
    marketStatus: MarketStatus;
    dataFreshness: DataFreshness;
    dataTimestamp: string;
  };
  marketStructure: {
    overallTrend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
    trendStrength: string;
    structurePivots: { type: 'HH' | 'HL' | 'LH' | 'LL'; price: number; time: string }[];
    supportLevels: number[];
    resistanceLevels: number[];
  };
  candlestickAnalysis: {
    latestCandle: Candle;
    previousCandle: Candle;
    metrics: CandlestickMetrics;
    detectedPatterns: CandlestickPattern[];
    nextCandleConfirmation: NextCandleConfirmation[];
    candlePsychology: string;
  };
  priceActionAnalysis: PriceActionCandleAnalysis[];
  chartPatternAnalysis: ChartPattern[];
  smcAnalysis: SmcAnalysis;
  technicalIndicators: TechnicalIndicators;
  strategyEvaluations: StrategyEvaluation[];
  selectedStrategy: StrategyEvaluation;
  alternativeStrategy?: StrategyEvaluation;
  confluenceReport: StrategyConfluenceReport;
  multiTimeframeContext: MultiTimeframeContext;
  nextCandleScenarios: NextCandleScenarios;
  tradingPlan: TradingPlan;
  comparison: ScreenshotComparison;
  finalExplanation: string;
  simpleSummary: string;
  candles: Candle[];
}

export interface IndianStockSymbol {
  symbol: string;
  name: string;
  exchange: StockExchange;
  sector: string;
  isIndex?: boolean;
}


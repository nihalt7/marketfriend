import { ScreenshotComparison, StockExchange, Timeframe } from '@/types';
import { VisionAnalysisResult } from './ai-vision-engine';

export class ComparisonEngine {
  /**
   * Compare AI vision findings against verified Indian market data
   */
  public static compareScreenshotAndMarketData(params: {
    vision: VisionAnalysisResult;
    selectedSymbol: string;
    selectedExchange: StockExchange;
    selectedTimeframe: Timeframe;
    verifiedPrice: number;
    verifiedTrend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
  }): ScreenshotComparison {
    const {
      vision,
      selectedSymbol,
      selectedExchange,
      selectedTimeframe,
      verifiedPrice,
      verifiedTrend
    } = params;

    const warnings: string[] = [];
    const normDetected = vision.symbol.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const normSelected = selectedSymbol.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    const symbolMatches = !vision.symbol || normDetected.includes(normSelected) || normSelected.includes(normDetected);
    if (!symbolMatches) {
      warnings.push(`Symbol discrepancy: Uploaded screenshot appears to show ${vision.symbol}, but analysis was requested for ${selectedSymbol}. Verified market data for ${selectedSymbol} is being used.`);
    }

    const timeframeMatches = !vision.timeframe || vision.timeframe.toLowerCase() === selectedTimeframe.toLowerCase();
    if (!timeframeMatches) {
      warnings.push(`Timeframe divergence: Screenshot indicators suggest ${vision.timeframe}, while active engine timeframe is set to ${selectedTimeframe}.`);
    }

    let isOutdated = false;
    let priceDiffPercent = 0;

    if (vision.detected_price !== null && vision.detected_price > 0) {
      const diff = Math.abs(vision.detected_price - verifiedPrice);
      priceDiffPercent = Number(((diff / verifiedPrice) * 100).toFixed(2));

      if (priceDiffPercent > 2.5) {
        isOutdated = true;
        warnings.push(`Price divergence (${priceDiffPercent}%): Screenshot shows ₹${vision.detected_price.toFixed(2)}, but verified live/latest market price is ₹${verifiedPrice.toFixed(2)}. The chart screenshot may be outdated or from a previous session.`);
      }
    }

    // Trend comparison
    const visionTrendUpper = vision.trend.toUpperCase();
    if (visionTrendUpper !== verifiedTrend && verifiedTrend !== 'SIDEWAYS') {
      warnings.push(`Trend nuance: Visual trend (${vision.trend}) differs slightly from macro indicator trend (${verifiedTrend.toLowerCase()}). Multi-timeframe confirmation will be required.`);
    }

    let status: ScreenshotComparison['status'] = 'MATCHED';
    if (!symbolMatches || isOutdated) {
      status = 'DISCREPANCY_WARNING';
    } else if (warnings.length > 1) {
      status = 'MISMATCH_DETECTED';
    }

    return {
      detectedSymbol: vision.symbol || selectedSymbol,
      selectedSymbol,
      symbolMatches,
      detectedTimeframe: vision.timeframe || selectedTimeframe,
      selectedTimeframe,
      timeframeMatches,
      detectedPrice: vision.detected_price,
      verifiedPrice,
      priceDifferencePercent: priceDiffPercent,
      isOutdated,
      warnings,
      status
    };
  }
}


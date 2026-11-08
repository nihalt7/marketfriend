import { AnalysisReport } from '@/types';
import OpenAI from 'openai';

export class AiAssistantEngine {
  public static async answerQuestion(params: {
    question: string;
    report: AnalysisReport;
  }): Promise<string> {
    const { question, report } = params;
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey && apiKey.trim().length > 5) {
      try {
        const openai = new OpenAI({ apiKey });
        const systemPrompt = `You are CHARTIQ's Senior Technical Analyst Assistant for the Indian Stock Market.
Answer the user's question directly, concisely, and with strict adherence to this verified report data:
- Symbol: ${report.stockInfo.symbol} (${report.stockInfo.exchange})
- Current Price: ₹${report.stockInfo.currentPrice}
- Recommendation: ${report.tradingPlan.recommendation}
- Confluence Score: ${report.confluenceReport.confluenceScore}/100 (${report.confluenceReport.rating})
- Strategy: ${report.selectedStrategy.name}
- Entry Zone: ₹${report.tradingPlan.entryZone.min} - ₹${report.tradingPlan.entryZone.max}
- Stop Loss: ₹${report.tradingPlan.stopLoss.price} (${report.tradingPlan.stopLoss.reason})
- Target 1: ₹${report.tradingPlan.target1.price}, Target 2: ₹${report.tradingPlan.target2.price}
- Candlestick: ${report.candlestickAnalysis.detectedPatterns.map(p => p.name).join(', ') || 'None'}
- Next Candle Confirmation: ${JSON.stringify(report.candlestickAnalysis.nextCandleConfirmation)}
- Technicals: RSI=${report.technicalIndicators.rsi14.value}, VWAP=₹${report.technicalIndicators.vwap.value}, EMA20=₹${report.technicalIndicators.ema20}
- Scenarios: Bullish trigger ₹${report.nextCandleScenarios.bullish.breakoutLevel}, Bearish trigger ₹${report.nextCandleScenarios.bearish.supportBreakdown}.

Never fabricate prices or guarantee profits. Emphasize disciplined risk management.`;

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question }
          ],
          max_tokens: 450
        });

        const reply = response.choices[0]?.message?.content;
        if (reply) return reply;
      } catch (err: any) {
        console.warn('[AiAssistantEngine] OpenAI call failed:', err.message);
      }
    }

    // Context-Grounded Deterministic Fallback Engine
    return this.generateDeterministicAnswer(question, report);
  }

  private static generateDeterministicAnswer(question: string, report: AnalysisReport): string {
    const q = question.toLowerCase();
    const info = report.stockInfo;
    const plan = report.tradingPlan;
    const tech = report.technicalIndicators;
    const conf = report.candlestickAnalysis.nextCandleConfirmation[0];

    if (q.includes('why') && (q.includes('wait') || q.includes('no trade'))) {
      if (conf?.isProvisional) {
        return `We are currently in WAIT status because the detected pattern on ${info.symbol} is still provisional. In professional technical analysis, a currently forming candle cannot be treated as confirmed until the subsequent candle closes. Confluence score is ${report.confluenceReport.confluenceScore}/100. Always protect capital first.`;
      }
      return `CHARTIQ recommended WAIT because the confluence evidence is incomplete (${report.confluenceReport.confluenceScore}/100). The Risk-to-Reward ratio or technical confirmation does not yet meet institutional risk criteria. Wait for a clean breakout above ₹${report.nextCandleScenarios.bullish.breakoutLevel} with volume before committing.`;
    }

    if (q.includes('why') && (q.includes('buy') || q.includes('sell'))) {
      return `The ${plan.recommendation} decision for ${info.symbol} at ₹${info.currentPrice} is supported by ${report.confluenceReport.rating} confluence (${report.confluenceReport.confluenceScore}/100). Key drivers include: 1) ${report.selectedStrategy.name}, 2) RSI momentum at ${tech.rsi14.value}, 3) Market structure trading ${tech.vwap.priceRelation} VWAP (₹${tech.vwap.value}), and 4) Stop-loss protection at ₹${plan.stopLoss.price}.`;
    }

    if (q.includes('stop loss') || q.includes('stop-loss') || q.includes('sl') || q.includes('risk')) {
      return `The stop-loss is placed at ₹${plan.stopLoss.price} (${plan.stopLoss.distancePercent}% from current price). Reason: ${plan.stopLoss.reason}. A stop-loss is mandatory to cap your maximum downside at 1% of your capital.`;
    }

    if (q.includes('hammer') || q.includes('shooting star') || q.includes('candle') || q.includes('pattern')) {
      if (conf) {
        return `Regarding ${conf.patternName}: Status is "${conf.status}". ${conf.explanation} Criteria evaluated: ${conf.criteriaEvaluated.map(c => `${c.criterion}: ${c.passed ? 'PASSED' : 'PENDING'}`).join('; ')}.`;
      }
      return `Latest candle on ${info.symbol} closed at ₹${info.currentPrice}. Psychology: ${report.candlestickAnalysis.candlePsychology}`;
    }

    if (q.includes('breakout') || q.includes('support') || q.includes('resistance')) {
      return `Major structural levels for ${info.symbol}: Support is established at ₹${report.nextCandleScenarios.bearish.supportBreakdown}, while Bullish Breakout triggers at ₹${report.nextCandleScenarios.bullish.breakoutLevel}. Invalidation level sits at ₹${report.nextCandleScenarios.bullish.invalidationLevel}.`;
    }

    // Default intelligent summary response
    return `CHARTIQ Analysis Summary for ${info.symbol} (${info.timeframe}): Currently trading at ₹${info.currentPrice}. Primary strategy is "${report.selectedStrategy.name}" with a ${plan.recommendation} signal. Entry zone is ₹${plan.entryZone.min} - ₹${plan.entryZone.max}, Stop-Loss at ₹${plan.stopLoss.price}, Target 1 at ₹${plan.target1.price}, and Target 2 at ₹${plan.target2.price}. Risk-to-Reward is 1:${plan.riskToReward}.`;
  }
}


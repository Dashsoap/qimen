import { BaseAnalysis, AI_CONFIG, AnalysisStrategy } from './BaseAnalysis.js';
import { 
  getDeepSystemPrompt, 
  buildDeepPrompt, 
  getCurrentTimeInfo 
} from '../../prompts/index.js';

/**
 * 深度分析策略
 * 提供更详细深入的奇门遁甲解读
 */
export class DeepAnalysis extends BaseAnalysis {
  constructor() {
    super();
    this.strategyName = AnalysisStrategy.DEEP;
  }

  /**
   * 执行深度分析
   * @param {string} question - 用户问题
   * @param {object} parsedPaipan - 已解析的排盘数据
   * @param {object} options - 可选参数
   * @returns {Promise<string>} 分析结果
   */
  async analyze(question, parsedPaipan, options = {}) {
    console.log('🎯 开始DEEP模式分析');
    
    const timeInfo = getCurrentTimeInfo();
    const systemPrompt = getDeepSystemPrompt(timeInfo);
    const userPrompt = buildDeepPrompt(question, parsedPaipan);
    
    const response = await this.openai.chat.completions.create({
      model: AI_CONFIG.ARK_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: AI_CONFIG.TEMPERATURE.deep,
      max_tokens: AI_CONFIG.MAX_TOKENS.deep
    });

    return this.cleanAiResponse(response.choices[0].message.content);
  }
}


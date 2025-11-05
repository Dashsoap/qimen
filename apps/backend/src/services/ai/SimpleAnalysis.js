import { BaseAnalysis, AI_CONFIG, AnalysisStrategy } from './BaseAnalysis.js';
import { SIMPLE_SYSTEM_PROMPT, buildSimplePrompt } from '../../prompts/index.js';

/**
 * 简单分析策略
 * 快速给出基础的奇门遁甲解读
 */
export class SimpleAnalysis extends BaseAnalysis {
  constructor() {
    super();
    this.strategyName = AnalysisStrategy.SIMPLE;
  }

  /**
   * 执行简单分析
   * @param {string} question - 用户问题
   * @param {object} parsedPaipan - 已解析的排盘数据
   * @param {object} options - 可选参数
   * @returns {Promise<string>} 分析结果
   */
  async analyze(question, parsedPaipan, options = {}) {
    console.log('🎯 开始SIMPLE模式分析');
    
    const prompt = buildSimplePrompt(question, parsedPaipan);
    
    const response = await this.openai.chat.completions.create({
      model: AI_CONFIG.ARK_MODEL,
      messages: [
        { role: "system", content: SIMPLE_SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      temperature: AI_CONFIG.TEMPERATURE.simple,
      max_tokens: AI_CONFIG.MAX_TOKENS.simple
    });

    return this.cleanAiResponse(response.choices[0].message.content);
  }
}


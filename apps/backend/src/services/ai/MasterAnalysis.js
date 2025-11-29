import { BaseAnalysis, AI_CONFIG, AnalysisStrategy } from './BaseAnalysis.js';
import { 
  getMasterSystemPrompt, 
  buildMasterPrompt, 
  getCurrentTimeInfo 
} from '../../prompts/index.js';

/**
 * 专业大师解盘分析策略
 * 提供最专业、最详细的奇门遁甲解读
 */
export class MasterAnalysis extends BaseAnalysis {
  constructor() {
    super();
    this.strategyName = AnalysisStrategy.MASTER;
  }

  /**
   * 执行专业大师解盘分析
   * @param {string} question - 用户问题
   * @param {object} parsedPaipan - 已解析的排盘数据
   * @param {object} options - 可选参数
   * @returns {Promise<string>} 分析结果
   */
  async analyze(question, parsedPaipan, options = {}) {
    console.log('🎯 开始MASTER模式分析');
    
    const timeInfo = getCurrentTimeInfo();
    const systemPrompt = getMasterSystemPrompt(timeInfo);
    const userPrompt = buildMasterPrompt(question, parsedPaipan);
    
    const response = await this.openai.chat.completions.create({
      model: AI_CONFIG.ARK_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: AI_CONFIG.MAX_TOKENS.master,
      temperature: AI_CONFIG.TEMPERATURE.master
    });

    return this.cleanAiResponse(response.choices[0].message.content);
  }
}





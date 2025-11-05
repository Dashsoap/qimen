import { AnalysisStrategy } from './ai/BaseAnalysis.js';
import { SimpleAnalysis } from './ai/SimpleAnalysis.js';
import { DeepAnalysis } from './ai/DeepAnalysis.js';
import { StreamAnalysis } from './ai/StreamAnalysis.js';
import { MasterAnalysis } from './ai/MasterAnalysis.js';

// 导出策略枚举供外部使用
export { AnalysisStrategy };

/**
 * 奇门遁甲AI分析服务（策略协调器）
 * 负责协调不同的分析策略，统一处理分析流程
 */
export class QimenAIService {
  constructor() {
    // 初始化各种分析策略
    this.strategies = {
      [AnalysisStrategy.SIMPLE]: new SimpleAnalysis(),
      [AnalysisStrategy.DEEP]: new DeepAnalysis(),
      [AnalysisStrategy.STREAM]: new StreamAnalysis(),
      [AnalysisStrategy.MASTER]: new MasterAnalysis()
    };
  }

  /**
   * 带上下文的AI分析
   * @param {string} question - 用户问题
   * @param {object} paipanData - 排盘数据
   * @param {array} contextMessages - 上下文消息数组
   * @param {string} strategy - 分析策略
   * @param {object} options - 其他选项
   * @returns {Promise<object>} 分析结果
   */
  async analyzeWithContext(question, paipanData, contextMessages = [], strategy = AnalysisStrategy.SIMPLE, options = {}) {
    options.contextMessages = contextMessages;
    return this.analyze(question, paipanData, strategy, options);
  }

  /**
   * 统一的AI分析入口
   * @param {string} question - 用户问题
   * @param {object} paipanData - 排盘数据
   * @param {string} strategy - 分析策略（simple/deep/stream/master）
   * @param {object} options - 额外选项（如res, sessionId等）
   * @returns {Promise<object>} 格式化的分析结果
   */
  async analyze(question, paipanData, strategy = AnalysisStrategy.SIMPLE, options = {}) {
    try {
      // 获取策略实例
      const analysisStrategy = this.strategies[strategy];
      if (!analysisStrategy) {
        throw new Error(`不支持的分析策略: ${strategy}`);
      }
      
      // 验证输入
      analysisStrategy.validateInput(question, paipanData);
      
      // 解析排盘数据
      const parsedPaipan = analysisStrategy.parsePaipanData(paipanData);
      
      // 执行分析
      const startTime = Date.now();
      const result = await analysisStrategy.analyze(question, parsedPaipan, options);
      const executionTime = Date.now() - startTime;
      
      // 格式化响应（流式分析不需要格式化响应）
      if (strategy === AnalysisStrategy.STREAM) {
        return { success: true, message: '流式分析完成' };
      }
      
      return this.formatResponse(result, {
        strategy,
        executionTime,
        question,
        paipanInfo: parsedPaipan,
        ...options
      });
      
    } catch (error) {
      console.error('AI分析错误:', error);
      return this.handleError(error, question, paipanData);
    }
  }

  /**
   * 格式化响应
   */
  formatResponse(analysis, metadata) {
    return {
      success: true,
      sessionId: metadata.sessionId || 'session-' + Date.now(),
      timestamp: new Date().toISOString(),
      strategy: metadata.strategy,
      executionTime: metadata.executionTime,
      analysis: analysis,
      paipanInfo: metadata.paipanInfo,
      question: metadata.question,
      steps: this.generateAnalysisSteps(metadata.strategy, metadata.executionTime)
    };
  }

  /**
   * 生成分析步骤
   */
  generateAnalysisSteps(strategy, executionTime) {
    const baseSteps = [
      { step: 1, action: '解析排盘结构', timestamp: new Date().toISOString(), summary: '已解析奇门遁甲格局' },
      { step: 2, action: '调用AI分析引擎', timestamp: new Date().toISOString(), summary: `使用${strategy}策略分析` },
      { step: 3, action: '生成专业解读', timestamp: new Date().toISOString(), summary: `完成分析，耗时${executionTime}ms` }
    ];

    if (strategy === AnalysisStrategy.DEEP || strategy === AnalysisStrategy.STREAM) {
      baseSteps.splice(2, 0, { 
        step: 3, 
        action: '深度符号解析', 
        timestamp: new Date().toISOString(), 
        summary: '分析九宫八门九星组合关系' 
      });
    }

    if (strategy === AnalysisStrategy.MASTER) {
      return [
        { step: 1, action: '盘面确认与验证', timestamp: new Date().toISOString(), summary: '确认盘法局数，选定用神' },
        { step: 2, action: '卦主现状分析', timestamp: new Date().toISOString(), summary: '验证盘面与现实对应关系' },
        { step: 3, action: '详细盘面解读', timestamp: new Date().toISOString(), summary: '用神分析、三传分析、宫位解读' },
        { step: 4, action: '吉凶判断与方位时机', timestamp: new Date().toISOString(), summary: '综合判断格局吉凶，确定有利因素' },
        { step: 5, action: '专业建议与预测', timestamp: new Date().toISOString(), summary: `专业大师解盘完成，耗时${executionTime}ms` }
      ];
    }

    return baseSteps;
  }

  /**
   * 错误处理
   */
  handleError(error, question, paipanData) {
    console.error('AI分析服务错误:', error);
    
    // 使用任意一个策略实例生成备用分析
    const fallbackStrategy = this.strategies[AnalysisStrategy.SIMPLE];
    
    return {
      success: false,
      error: error.message,
      fallbackAnalysis: fallbackStrategy.generateFallbackAnalysis(question, paipanData),
      timestamp: new Date().toISOString(),
      question,
      message: 'AI服务暂时不可用，已提供基础分析'
    };
  }
}

// 单例模式导出
let aiServiceInstance = null;

/**
 * 创建AI服务实例
 */
export function createAIService() {
  if (!aiServiceInstance) {
    aiServiceInstance = new QimenAIService();
  }
  return aiServiceInstance;
}

/**
 * 获取AI服务实例
 */
export function getAIService() {
  if (!aiServiceInstance) {
    throw new Error('AIService not initialized. Call createAIService first.');
  }
  return aiServiceInstance;
}

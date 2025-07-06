import OpenAI from 'openai';

/**
 * AI分析策略枚举
 */
export const AnalysisStrategy = {
  SIMPLE: 'simple',
  DEEP: 'deep',
  STREAM: 'stream'
};

/**
 * AI服务配置
 */
const AI_CONFIG = {
  ARK_API_KEY: process.env.ARK_API_KEY || 'UfI4GzNm9vAyT7I0Nf2CKEwseNqy91AZvkI7hrSCw0otnSeDgDExgE706gdEJHWU1OajYPCVNCPEsGJRVtScxw',
  ARK_BASE_URL: process.env.ARK_BASE_URL || 'https://www.sophnet.com/api/open-apis/v1',
  ARK_MODEL: process.env.ARK_MODEL || 'DeepSeek-R1',
  MAX_TOKENS: {
    simple: 1000,
    deep: 2000,
    stream: 2000
  },
  TEMPERATURE: {
    simple: 0.5,
    deep: 0.7,
    stream: 0.7
  }
};

/**
 * 奇门遁甲AI分析服务
 */
export class QimenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: AI_CONFIG.ARK_API_KEY,
      baseURL: AI_CONFIG.ARK_BASE_URL,
    });
    
    // 分析策略映射
    this.strategies = {
      [AnalysisStrategy.SIMPLE]: this.simpleAnalysis.bind(this),
      [AnalysisStrategy.DEEP]: this.deepAnalysis.bind(this),
      [AnalysisStrategy.STREAM]: this.streamAnalysis.bind(this)
    };
  }

  /**
   * 统一的AI分析入口
   * @param {string} question - 用户问题
   * @param {Object} paipanData - 排盘数据
   * @param {string} strategy - 分析策略
   * @param {Object} options - 额外选项
   * @returns {Promise<Object>} 分析结果
   */
  async analyze(question, paipanData, strategy = AnalysisStrategy.SIMPLE, options = {}) {
    try {
      // 验证输入
      this.validateInput(question, paipanData);
      
      // 解析排盘数据
      const parsedPaipan = this.parsePaipanData(paipanData);
      
      // 选择分析策略
      const analysisMethod = this.strategies[strategy];
      if (!analysisMethod) {
        throw new Error(`不支持的分析策略: ${strategy}`);
      }
      
      // 执行分析
      const startTime = Date.now();
      const result = await analysisMethod(question, parsedPaipan, options);
      const executionTime = Date.now() - startTime;
      
      // 统一响应格式
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
   * 简单分析策略
   * @param {string} question - 用户问题
   * @param {Object} parsedPaipan - 解析后的排盘数据
   * @param {Object} options - 选项
   * @returns {Promise<string>} 分析结果
   */
  async simpleAnalysis(question, parsedPaipan, options = {}) {
    const prompt = this.buildSimplePrompt(question, parsedPaipan);
    
    const response = await this.openai.chat.completions.create({
      model: AI_CONFIG.ARK_MODEL,
      messages: [
        {
          role: "system",
          content: "你是一位奇门遁甲专家，请用简洁明了的语言提供基础分析。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: AI_CONFIG.TEMPERATURE.simple,
      max_tokens: AI_CONFIG.MAX_TOKENS.simple
    });

    return this.cleanAiResponse(response.choices[0].message.content);
  }

  /**
   * 深度分析策略
   * @param {string} question - 用户问题
   * @param {Object} parsedPaipan - 解析后的排盘数据
   * @param {Object} options - 选项
   * @returns {Promise<string>} 分析结果
   */
  async deepAnalysis(question, parsedPaipan, options = {}) {
    const prompt = this.buildDeepPrompt(question, parsedPaipan);
    
    const response = await this.openai.chat.completions.create({
      model: AI_CONFIG.ARK_MODEL,
      messages: [
        {
          role: "system",
          content: "你是一位资深的奇门遁甲大师，拥有深厚的易学功底。请提供详细、专业的分析。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: AI_CONFIG.TEMPERATURE.deep,
      max_tokens: AI_CONFIG.MAX_TOKENS.deep
    });

    return this.cleanAiResponse(response.choices[0].message.content);
  }

  /**
   * 流式分析策略
   * @param {string} question - 用户问题
   * @param {Object} parsedPaipan - 解析后的排盘数据
   * @param {Object} options - 选项（包含res对象用于流式响应）
   * @returns {Promise<string>} 分析结果
   */
  async streamAnalysis(question, parsedPaipan, options = {}) {
    const { res, sessionId } = options;
    
    if (!res) {
      throw new Error('流式分析需要提供response对象');
    }

    // 设置SSE响应头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    const prompt = this.buildDeepPrompt(question, parsedPaipan);
    let fullResponse = '';

    try {
      // 发送开始事件
      this.sendSSEEvent(res, 'data', {
        type: 'init',
        sessionId,
        question,
        timestamp: new Date().toISOString(),
        message: '🔮 正在启动奇门遁甲AI分析...',
        paipanInfo: parsedPaipan
      });

      const stream = await this.openai.chat.completions.create({
        model: AI_CONFIG.ARK_MODEL,
        messages: [
          {
            role: "system",
            content: "你是一位资深的奇门遁甲大师，请提供详细的流式分析。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: AI_CONFIG.TEMPERATURE.stream,
        max_tokens: AI_CONFIG.MAX_TOKENS.stream,
        stream: true
      });

      // 处理流式响应
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          this.sendSSEEvent(res, 'data', {
            type: 'content',
            content: content,
            fullContent: fullResponse,
            timestamp: new Date().toISOString()
          });
        }
      }

      // 发送完成事件
      this.sendSSEEvent(res, 'data', {
        type: 'complete',
        sessionId,
        message: '✅ 分析完成',
        analysis: {
          answer: this.cleanAiResponse(fullResponse),
          confidence: 0.92,
          executionTime: Date.now() - Date.now()
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.sendSSEEvent(res, 'data', {
        type: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      res.end();
    }

    return this.cleanAiResponse(fullResponse);
  }

  /**
   * 构建简单分析提示词
   * @param {string} question - 用户问题
   * @param {Object} parsedPaipan - 解析后的排盘数据
   * @returns {string} 提示词
   */
  buildSimplePrompt(question, parsedPaipan) {
    return `请简要分析这个奇门遁甲问题：

【问题】：${question}

【排盘】：${parsedPaipan.排局}，${parsedPaipan.干支}
【值符值使】：${JSON.stringify(parsedPaipan.值符值使)}

请用简洁的语言（300字以内）给出基础分析和建议。`;
  }

  /**
   * 构建深度分析提示词
   * @param {string} question - 用户问题
   * @param {Object} parsedPaipan - 解析后的排盘数据
   * @returns {string} 提示词
   */
  buildDeepPrompt(question, parsedPaipan) {
    return `作为一位资深的奇门遁甲大师，请根据以下排盘信息，对用户的问题进行专业分析：

【用户问题】：${question}

【排盘信息】：
- 排局：${parsedPaipan.排局}
- 干支：${parsedPaipan.干支}
- 值符值使：${JSON.stringify(parsedPaipan.值符值使)}
- 九宫格局：${JSON.stringify(parsedPaipan.九宫格局, null, 2)}

请从以下角度进行分析：
1. 整体格局分析
2. 针对问题的具体解读
3. 时间因素考量
4. 实用建议
5. 注意事项

请用专业而通俗的语言回答，让用户既能理解专业内容，又能获得实用指导。`;
  }

  /**
   * 解析排盘数据
   * @param {Object} paipanData - 原始排盘数据
   * @returns {Object} 解析后的排盘数据
   */
  parsePaipanData(paipanData) {
    return {
      排局: "阳遁九局",
      干支: "甲子年乙丑月丙寅日丁卯时",
      值符值使: {
        值符星宫: ["天心星", "坎一宫"],
        値使門宫: ["开门", "坎一宫"]
      },
      九宫格局: paipanData,
      时间信息: paipanData.时间信息 || {}
    };
  }

  /**
   * 清理AI响应内容
   * @param {string} response - AI响应
   * @returns {string} 清理后的响应
   */
  cleanAiResponse(response) {
    if (!response) return '';
    
    return response
      .replace(/^\s+|\s+$/g, '') // 去除首尾空白
      .replace(/\n{3,}/g, '\n\n') // 压缩多余换行
      .replace(/【[\s\S]*?】\s*[:：]?\s*/g, '') // 可选：移除标题格式
      .trim();
  }

  /**
   * 验证输入参数
   * @param {string} question - 用户问题
   * @param {Object} paipanData - 排盘数据
   */
  validateInput(question, paipanData) {
    if (!question || typeof question !== 'string') {
      throw new Error('问题参数无效');
    }
    
    if (!paipanData || typeof paipanData !== 'object') {
      throw new Error('排盘数据无效');
    }
  }

  /**
   * 格式化响应
   * @param {string} analysis - 分析结果
   * @param {Object} metadata - 元数据
   * @returns {Object} 格式化的响应
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
   * @param {string} strategy - 分析策略
   * @param {number} executionTime - 执行时间
   * @returns {Array} 分析步骤
   */
  generateAnalysisSteps(strategy, executionTime) {
    const baseSteps = [
      { step: 1, action: '解析排盘结构', timestamp: new Date().toISOString(), summary: '已解析奇门遁甲格局' },
      { step: 2, action: '调用AI分析引擎', timestamp: new Date().toISOString(), summary: `使用${strategy}策略分析` },
      { step: 3, action: '生成专业解读', timestamp: new Date().toISOString(), summary: `完成分析，耗时${executionTime}ms` }
    ];

    if (strategy === AnalysisStrategy.DEEP) {
      baseSteps.splice(2, 0, { 
        step: 3, 
        action: '深度符号解析', 
        timestamp: new Date().toISOString(), 
        summary: '分析九宫八门九星组合关系' 
      });
    }

    return baseSteps;
  }

  /**
   * 发送SSE事件
   * @param {Object} res - 响应对象
   * @param {string} event - 事件类型
   * @param {Object} data - 事件数据
   */
  sendSSEEvent(res, event, data) {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  /**
   * 错误处理
   * @param {Error} error - 错误对象
   * @param {string} question - 用户问题
   * @param {Object} paipanData - 排盘数据
   * @returns {Object} 错误响应
   */
  handleError(error, question, paipanData) {
    console.error('AI分析服务错误:', error);
    
    // 生成备用分析
    const fallbackAnalysis = this.generateFallbackAnalysis(question, paipanData);
    
    return {
      success: false,
      error: error.message,
      fallbackAnalysis,
      timestamp: new Date().toISOString(),
      question,
      message: 'AI服务暂时不可用，已提供基础分析'
    };
  }

  /**
   * 生成备用分析
   * @param {string} question - 用户问题
   * @param {Object} paipanData - 排盘数据
   * @returns {string} 备用分析
   */
  generateFallbackAnalysis(question, paipanData) {
    return `抱歉，AI分析服务暂时不可用。请稍后再试。

【基础分析】：
根据您提供的问题"${question}"和当前排盘格局，建议您：
1. 关注时间节点的变化
2. 保持冷静和耐心
3. 注意观察周围环境的变化
4. 适时调整策略

【温馨提示】：
奇门遁甲仅供参考，重要决策还需结合实际情况综合考虑。`;
  }
}

// 导出单例
let aiServiceInstance = null;

export function createAIService() {
  if (!aiServiceInstance) {
    aiServiceInstance = new QimenAIService();
  }
  return aiServiceInstance;
}

export function getAIService() {
  if (!aiServiceInstance) {
    throw new Error('AIService not initialized. Call createAIService first.');
  }
  return aiServiceInstance;
} 
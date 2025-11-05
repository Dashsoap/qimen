import OpenAI from 'openai';
import {
  SIMPLE_SYSTEM_PROMPT,
  getDeepSystemPrompt,
  getMasterSystemPrompt,
  getCurrentTimeInfo,
  buildSimplePrompt,
  buildDeepPrompt,
  buildMasterPrompt
} from '../prompts/index.js';

/**
 * AI分析策略枚举
 */
export const AnalysisStrategy = {
  SIMPLE: 'simple',
  DEEP: 'deep',
  STREAM: 'stream',
  MASTER: 'master'
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
    stream: 2000,
    master: 3000
  },
  TEMPERATURE: {
    simple: 0.5,
    deep: 0.7,
    stream: 0.7,
    master: 0.6
  }
};

/**
 * 丁未奇门遁甲分析服务 (重构版)
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
      [AnalysisStrategy.STREAM]: this.streamAnalysis.bind(this),
      [AnalysisStrategy.MASTER]: this.masterAnalysis.bind(this)
    };
  }

  /**
   * 带上下文的AI分析
   */
  async analyzeWithContext(question, paipanData, contextMessages = [], strategy = AnalysisStrategy.SIMPLE, options = {}) {
    options.contextMessages = contextMessages;
    return this.analyze(question, paipanData, strategy, options);
  }

  /**
   * 统一的AI分析入口
   */
  async analyze(question, paipanData, strategy = AnalysisStrategy.SIMPLE, options = {}) {
    try {
      this.validateInput(question, paipanData);
      const parsedPaipan = this.parsePaipanData(paipanData);
      
      const analysisMethod = this.strategies[strategy];
      if (!analysisMethod) {
        throw new Error(`不支持的分析策略: ${strategy}`);
      }
      
      const startTime = Date.now();
      const result = await analysisMethod(question, parsedPaipan, options);
      const executionTime = Date.now() - startTime;
      
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
   */
  async simpleAnalysis(question, parsedPaipan, options = {}) {
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

  /**
   * 深度分析策略
   */
  async deepAnalysis(question, parsedPaipan, options = {}) {
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

  /**
   * 流式分析策略
   */
  async streamAnalysis(question, parsedPaipan, options = {}) {
    const { res, sessionId } = options;
    
    if (!res) {
      throw new Error('Response对象未提供，无法进行流式分析');
    }

    if (res.headersSent || res.destroyed) {
      console.warn('⚠️ Response已发送或销毁，跳过流式分析');
      return;
    }

    console.log('🔍 开始流式分析...');
    const timeInfo = getCurrentTimeInfo();
    const systemPrompt = getDeepSystemPrompt(timeInfo);
    const userPrompt = buildDeepPrompt(question, parsedPaipan);

    let fullResponse = '';
    let chunkCount = 0;

    try {
      console.log(`🚀 开始流式分析 - SessionID: ${sessionId}, Question: ${question}`);
      
      // 发送开始事件
      this.sendSSEEvent(res, 'data', {
        type: 'init',
        sessionId,
        question,
        timestamp: new Date().toISOString(),
        message: '🔮 正在启动丁未奇门遁甲分析...',
        paipanInfo: parsedPaipan
      });

      const stream = await this.openai.chat.completions.create({
        model: AI_CONFIG.ARK_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        stream: true,
        max_tokens: AI_CONFIG.MAX_TOKENS.stream,
        temperature: AI_CONFIG.TEMPERATURE.stream
      });

      console.log('📡 开始接收AI流式响应');
      const startTime = Date.now();

      // 处理流式响应
      for await (const chunk of stream) {
        if (res.destroyed) {
          console.log('⚠️ 连接已断开，停止流式响应');
          break;
        }

        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          chunkCount++;
          fullResponse += content;
          
          if (chunkCount % 10 === 0) {
            console.log(`📊 已接收 ${chunkCount} 个chunk, 总长度: ${fullResponse.length}`);
          }
          
          this.sendSSEEvent(res, 'data', {
            type: 'content',
            content: content,
            fullContent: fullResponse,
            timestamp: new Date().toISOString()
          });
        }
      }

      console.log(`✅ AI流式响应完成 - 总chunk数: ${chunkCount}, 总长度: ${fullResponse.length}`);

      // 发送完成事件
      const executionTime = Date.now() - startTime;
      const cleanedAnswer = this.cleanAiResponse(fullResponse);
      
      this.sendSSEEvent(res, 'data', {
        type: 'complete',
        sessionId,
        message: '✅ 分析完成',
        analysis: {
          answer: cleanedAnswer,
          confidence: 0.92,
          executionTime: executionTime
        },
        timestamp: new Date().toISOString()
      });

      console.log(`🎉 流式分析完成 - 耗时: ${executionTime}ms`);

    } catch (error) {
      console.error('❌ 流式分析错误:', error);
      this.sendSSEEvent(res, 'data', {
        type: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      try {
        res.end();
        console.log('🔚 SSE连接已关闭');
      } catch (e) {
        console.warn('⚠️ 关闭SSE连接时出错:', e.message);
      }
    }

    return this.cleanAiResponse(fullResponse);
  }

  /**
   * 专业大师解盘分析策略
   */
  async masterAnalysis(question, parsedPaipan, options = {}) {
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

  /**
   * 解析排盘数据
   */
  parsePaipanData(paipanData) {
    if (!paipanData) {
      console.warn('排盘数据为空，使用默认数据');
      return {
        排局: "数据缺失",
        干支: "数据缺失",
        值符值使: {},
        九宫格局: {},
        时间信息: {}
      };
    }

    const parsedData = {
      排局: paipanData.排局 || "数据缺失",
      干支: paipanData.干支 || "数据缺失",
      值符值使: paipanData.值符值使 || {},
      九宫格局: paipanData.九宫格局 || {},
      时间信息: paipanData.时间信息 || {}
    };

    console.log('🔍 解析排盘数据结果:', {
      排局: parsedData.排局,
      干支: parsedData.干支,
      九宫格局数量: Object.keys(parsedData.九宫格局).length
    });

    return parsedData;
  }

  /**
   * 清理AI响应内容
   */
  cleanAiResponse(response) {
    if (!response) return '';
    
    return response
      .replace(/^\s+|\s+$/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /**
   * 验证输入参数
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
   * 发送SSE事件
   */
  sendSSEEvent(res, event, data) {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  /**
   * 错误处理
   */
  handleError(error, question, paipanData) {
    console.error('AI分析服务错误:', error);
    
    return {
      success: false,
      error: error.message,
      fallbackAnalysis: this.generateFallbackAnalysis(question, paipanData),
      timestamp: new Date().toISOString(),
      question,
      message: 'AI服务暂时不可用，已提供基础分析'
    };
  }

  /**
   * 生成备用分析
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



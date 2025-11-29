import OpenAI from 'openai';

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
export const AI_CONFIG = {
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
 * 奇门遁甲AI分析基类
 * 提供共享的OpenAI客户端和通用工具方法
 */
export class BaseAnalysis {
  constructor() {
    this.openai = new OpenAI({
      apiKey: AI_CONFIG.ARK_API_KEY,
      baseURL: AI_CONFIG.ARK_BASE_URL,
    });
    this.strategyName = 'base';
  }

  /**
   * 抽象方法：执行分析
   * 子类必须实现此方法
   */
  async analyze(question, parsedPaipan, options = {}) {
    throw new Error('analyze() must be implemented by subclass');
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
   * 发送SSE事件（用于流式分析）
   */
  sendSSEEvent(res, event, data) {
    if (!res || res.destroyed || res.headersSent) {
      return;
    }
    try {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      console.warn('⚠️ SSE发送失败:', error.message);
    }
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





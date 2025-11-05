import { BaseAnalysis, AI_CONFIG, AnalysisStrategy } from './BaseAnalysis.js';
import { 
  getDeepSystemPrompt, 
  buildDeepPrompt, 
  getCurrentTimeInfo 
} from '../../prompts/index.js';

/**
 * 流式分析策略
 * 实时推送分析过程，提供更好的用户体验
 */
export class StreamAnalysis extends BaseAnalysis {
  constructor() {
    super();
    this.strategyName = AnalysisStrategy.STREAM;
  }

  /**
   * 执行流式分析
   * @param {string} question - 用户问题
   * @param {object} parsedPaipan - 已解析的排盘数据
   * @param {object} options - 包含 res 和 sessionId 的选项
   * @returns {Promise<string>} 完整的分析结果
   */
  async analyze(question, parsedPaipan, options = {}) {
    const { res, sessionId } = options;
    
    if (!res) {
      throw new Error('Response对象未提供，无法进行流式分析');
    }

    if (res.headersSent || res.destroyed) {
      console.warn('⚠️ Response已发送或销毁，跳过流式分析');
      return '';
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
      throw error;
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
}


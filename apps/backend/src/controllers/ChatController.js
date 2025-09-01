import { createChatSessionService } from '../services/ChatSessionService.js';

export class ChatController {
  constructor(aiService, pointsService, config) {
    this.aiService = aiService;
    this.pointsService = pointsService;
    this.config = config;
    this.sessionService = createChatSessionService();
  }

  /**
   * 创建新会话
   */
  async createSession(req, res) {
    try {
      const { question } = req.body;
      const userId = req.user.id;
      
      if (!question) {
        return res.status(400).json({
          success: false,
          error: '问题不能为空'
        });
      }
      
      const result = await this.sessionService.createSession(userId, question);
      
      res.json(result);
    } catch (error) {
      console.error('创建会话失败:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 获取会话列表
   */
  async getSessions(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      
      const result = await this.sessionService.getUserSessions(
        userId,
        parseInt(page),
        parseInt(limit)
      );
      
      res.json(result);
    } catch (error) {
      console.error('获取会话列表失败:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 获取会话详情
   */
  async getSessionDetail(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      
      const result = await this.sessionService.getSessionDetail(sessionId, userId);
      
      res.json(result);
    } catch (error) {
      console.error('获取会话详情失败:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 发送消息（连续对话）
   */
  async sendMessage(req, res) {
    try {
      const { sessionId } = req.params;
      const { question, paipanData, strategy = 'DEEP' } = req.body;
      const userId = req.user.id;
      
      if (!question || !paipanData) {
        return res.status(400).json({
          success: false,
          error: '参数缺失'
        });
      }
      
      // 1. 检查积分
      const pointsConfig = this.config.getPointsConfig();
      const analysisPointsCost = pointsConfig.analysisPointsCost;
      
      const balanceCheck = await this.pointsService.checkBalance(userId, analysisPointsCost);
      if (!balanceCheck.sufficient) {
        return res.status(400).json({
          success: false,
          error: '积分不足',
          message: `AI分析需要${analysisPointsCost}积分，当前余额：${balanceCheck.currentBalance}`
        });
      }
      
      // 2. 保存用户消息
      await this.sessionService.addUserMessage(sessionId, userId, question, paipanData);
      
      // 3. 消费积分
      const spendResult = await this.pointsService.spendPoints(
        userId,
        analysisPointsCost,
        `会话分析(${strategy})`
      );
      
      // 4. 获取会话历史用于上下文
      const sessionDetail = await this.sessionService.getSessionDetail(sessionId, userId);
      const contextMessages = this.buildContextMessages(sessionDetail.session.messages);
      
      // 5. 调用AI分析（带上下文）
      const analysisResult = await this.aiService.analyzeWithContext(
        question,
        paipanData,
        contextMessages,
        strategy
      );
      
      // 6. 保存AI回复
      await this.sessionService.addAssistantMessage(
        sessionId,
        userId,
        analysisResult.analysis,
        analysisResult,
        strategy,
        analysisPointsCost
      );
      
      // 7. 返回结果
      res.json({
        success: true,
        message: {
          role: 'assistant',
          content: analysisResult.analysis,
          analysis: analysisResult,
          strategy,
          pointsSpent: analysisPointsCost,
          remainingPoints: spendResult.newBalance
        }
      });
      
    } catch (error) {
      console.error('发送消息失败:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 流式对话
   */
  async sendMessageStream(req, res) {
    try {
      const { sessionId } = req.params;
      const { question, paipanData } = req.body;
      const userId = req.user.id;
      
      if (!question || !paipanData) {
        return res.status(400).json({
          success: false,
          error: '参数缺失'
        });
      }
      
      // 设置SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      // 1. 检查积分
      const pointsConfig = this.config.getPointsConfig();
      const analysisPointsCost = pointsConfig.analysisPointsCost;
      
      const balanceCheck = await this.pointsService.checkBalance(userId, analysisPointsCost);
      if (!balanceCheck.sufficient) {
        res.write(`event: error\n`);
        res.write(`data: ${JSON.stringify({
          error: '积分不足',
          message: `AI分析需要${analysisPointsCost}积分，当前余额：${balanceCheck.currentBalance}`
        })}\n\n`);
        res.end();
        return;
      }
      
      // 2. 保存用户消息
      await this.sessionService.addUserMessage(sessionId, userId, question, paipanData);
      
      // 3. 消费积分
      const spendResult = await this.pointsService.spendPoints(
        userId,
        analysisPointsCost,
        '会话流式分析'
      );
      
      // 4. 获取会话历史
      const sessionDetail = await this.sessionService.getSessionDetail(sessionId, userId);
      const contextMessages = this.buildContextMessages(sessionDetail.session.messages);
      
      // 5. 调用流式AI分析
      const analysisResult = await this.aiService.analyzeWithContext(
        question,
        paipanData,
        contextMessages,
        'STREAM',
        { res, sessionId }
      );
      
      // 6. 保存AI回复（流式完成后）
      await this.sessionService.addAssistantMessage(
        sessionId,
        userId,
        analysisResult.analysis,
        analysisResult,
        'STREAM',
        analysisPointsCost
      );
      
    } catch (error) {
      console.error('流式对话失败:', error);
      if (!res.headersSent) {
        res.write(`event: error\n`);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
    }
  }

  /**
   * 删除会话
   */
  async deleteSession(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      
      const result = await this.sessionService.deleteSession(sessionId, userId);
      
      res.json(result);
    } catch (error) {
      console.error('删除会话失败:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 获取统计信息
   */
  async getStats(req, res) {
    try {
      const userId = req.user.id;
      
      const result = await this.sessionService.getSessionStats(userId);
      
      res.json(result);
    } catch (error) {
      console.error('获取统计失败:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 构建上下文消息
   */
  buildContextMessages(messages) {
    // 只保留最近10条消息作为上下文
    const recentMessages = messages.slice(-10);
    
    return recentMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
      question: msg.question,
      paipanData: msg.paipanData
    }));
  }
}

export function createChatController(aiService, pointsService, config) {
  return new ChatController(aiService, pointsService, config);
}
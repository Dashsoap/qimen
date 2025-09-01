import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ChatSessionService {
  /**
   * 创建新会话
   */
  async createSession(userId, firstQuestion) {
    try {
      const title = firstQuestion.substring(0, 30) + (firstQuestion.length > 30 ? '...' : '');
      
      const session = await prisma.chatSession.create({
        data: {
          userId,
          title,
          status: 'active'
        }
      });
      
      return {
        success: true,
        session
      };
    } catch (error) {
      console.error('创建会话失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户的会话列表
   */
  async getUserSessions(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const [sessions, total] = await Promise.all([
        prisma.chatSession.findMany({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
          skip,
          take: limit,
          include: {
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' }
            }
          }
        }),
        prisma.chatSession.count({
          where: { userId }
        })
      ]);
      
      return {
        success: true,
        sessions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('获取会话列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取会话详情及所有消息
   */
  async getSessionDetail(sessionId, userId) {
    try {
      const session = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });
      
      if (!session) {
        throw new Error('会话不存在或无权访问');
      }
      
      return {
        success: true,
        session
      };
    } catch (error) {
      console.error('获取会话详情失败:', error);
      throw error;
    }
  }

  /**
   * 添加用户消息到会话
   */
  async addUserMessage(sessionId, userId, question, paipanData) {
    try {
      const message = await prisma.chatMessage.create({
        data: {
          sessionId,
          userId,
          role: 'user',
          content: question,
          question,
          paipanData
        }
      });
      
      // 更新会话的更新时间
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() }
      });
      
      return {
        success: true,
        message
      };
    } catch (error) {
      console.error('添加用户消息失败:', error);
      throw error;
    }
  }

  /**
   * 添加AI回复到会话
   */
  async addAssistantMessage(sessionId, userId, content, analysis, strategy, pointsSpent) {
    try {
      const message = await prisma.chatMessage.create({
        data: {
          sessionId,
          userId,
          role: 'assistant',
          content,
          analysis,
          strategy,
          pointsSpent
        }
      });
      
      // 同时保存到分析历史
      const userMessage = await prisma.chatMessage.findFirst({
        where: {
          sessionId,
          role: 'user'
        },
        orderBy: { createdAt: 'desc' }
      });
      
      if (userMessage) {
        await prisma.analysisHistory.create({
          data: {
            userId,
            sessionId,
            messageId: message.id,
            question: userMessage.question,
            paipanData: userMessage.paipanData,
            analysisResult: analysis,
            strategy,
            pointsSpent
          }
        });
      }
      
      return {
        success: true,
        message
      };
    } catch (error) {
      console.error('添加AI消息失败:', error);
      throw error;
    }
  }

  /**
   * 关闭会话
   */
  async closeSession(sessionId, userId) {
    try {
      const session = await prisma.chatSession.update({
        where: {
          id: sessionId,
          userId
        },
        data: {
          status: 'closed'
        }
      });
      
      return {
        success: true,
        session
      };
    } catch (error) {
      console.error('关闭会话失败:', error);
      throw error;
    }
  }

  /**
   * 删除会话
   */
  async deleteSession(sessionId, userId) {
    try {
      await prisma.chatSession.delete({
        where: {
          id: sessionId,
          userId
        }
      });
      
      return {
        success: true,
        message: '会话已删除'
      };
    } catch (error) {
      console.error('删除会话失败:', error);
      throw error;
    }
  }

  /**
   * 获取会话统计
   */
  async getSessionStats(userId) {
    try {
      const [totalSessions, totalMessages, totalPoints] = await Promise.all([
        prisma.chatSession.count({
          where: { userId }
        }),
        prisma.chatMessage.count({
          where: { userId }
        }),
        prisma.chatMessage.aggregate({
          where: { 
            userId,
            role: 'assistant'
          },
          _sum: {
            pointsSpent: true
          }
        })
      ]);
      
      return {
        success: true,
        stats: {
          totalSessions,
          totalMessages,
          totalPointsSpent: totalPoints._sum.pointsSpent || 0
        }
      };
    } catch (error) {
      console.error('获取统计失败:', error);
      throw error;
    }
  }
}

export function createChatSessionService() {
  return new ChatSessionService();
}
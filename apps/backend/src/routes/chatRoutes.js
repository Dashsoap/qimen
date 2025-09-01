import express from 'express';
import { createChatController } from '../controllers/ChatController.js';

const router = express.Router();

export function createChatRoutes(aiService, pointsService, config, middlewares) {
  const chatController = createChatController(aiService, pointsService, config);
  const { authMiddleware } = middlewares;

  // 创建新会话
  router.post('/sessions', 
    authMiddleware, 
    (req, res) => chatController.createSession(req, res)
  );

  // 获取会话列表
  router.get('/sessions', 
    authMiddleware, 
    (req, res) => chatController.getSessions(req, res)
  );

  // 获取会话详情
  router.get('/sessions/:sessionId', 
    authMiddleware, 
    (req, res) => chatController.getSessionDetail(req, res)
  );

  // 发送消息（连续对话）
  router.post('/sessions/:sessionId/messages', 
    authMiddleware, 
    (req, res) => chatController.sendMessage(req, res)
  );

  // 流式对话
  router.post('/sessions/:sessionId/stream', 
    authMiddleware, 
    (req, res) => chatController.sendMessageStream(req, res)
  );

  // 删除会话
  router.delete('/sessions/:sessionId', 
    authMiddleware, 
    (req, res) => chatController.deleteSession(req, res)
  );

  // 获取统计信息
  router.get('/chat/stats', 
    authMiddleware, 
    (req, res) => chatController.getStats(req, res)
  );

  return router;
}

export default createChatRoutes;
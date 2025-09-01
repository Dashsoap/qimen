import express from 'express';

/**
 * 分析路由
 */
export function createAnalysisRoutes(analysisController, middlewares) {
  const router = express.Router();
  const { authMiddleware, aiRateLimit, optionalAuthMiddleware } = middlewares;

  // 排盘API（可选登录）
  router.post('/qimen/paipan', optionalAuthMiddleware, (req, res) => 
    analysisController.paipan(req, res));

  // 深度AI分析（需要登录+积分）
  router.post('/qimen', authMiddleware, aiRateLimit, (req, res) => 
    analysisController.aiAnalysis(req, res));

  // 简单AI分析（需要登录+积分）
  router.post('/qimen/simple', authMiddleware, aiRateLimit, (req, res) => 
    analysisController.aiAnalysisSimple(req, res));

  // 流式AI分析（需要登录+积分）
  router.post('/qimen/stream', authMiddleware, aiRateLimit, (req, res) => 
    analysisController.aiAnalysisStream(req, res));

  return router;
}
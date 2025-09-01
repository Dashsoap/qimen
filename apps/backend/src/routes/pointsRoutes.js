import express from 'express';

/**
 * 积分路由
 */
export function createPointsRoutes(pointsController, middlewares) {
  const router = express.Router();
  const { authMiddleware } = middlewares;

  // 所有积分路由都需要认证
  router.use(authMiddleware);

  // 获取积分信息
  router.get('/', (req, res) => pointsController.getPoints(req, res));

  // 积分交易
  router.post('/transaction', (req, res) => pointsController.pointsTransaction(req, res));

  // 积分转账
  router.post('/transfer', (req, res) => pointsController.pointsTransfer(req, res));

  // 积分历史
  router.get('/history', (req, res) => pointsController.getPointsHistory(req, res));

  return router;
}
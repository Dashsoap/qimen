import { createAuthRoutes } from './authRoutes.js';
import { createPointsRoutes } from './pointsRoutes.js';
import { createAnalysisRoutes } from './analysisRoutes.js';
import { createChatRoutes } from './chatRoutes.js';

/**
 * 配置所有路由
 */
export function configureRoutes(app, controllers, middlewares) {
  const { authController, pointsController, analysisController } = controllers;

  // 健康检查
  app.get('/health', middlewares.healthCheck);

  // API路由
  app.use('/api/auth', createAuthRoutes(authController, middlewares));
  app.use('/api/points', createPointsRoutes(pointsController, middlewares));
  app.use('/api/analysis', createAnalysisRoutes(analysisController, middlewares));
  
  // 聊天会话路由 - 需要传入aiService和config
  const aiService = controllers.analysisController.aiService;
  const pointsService = controllers.pointsController.pointsService;
  const config = controllers.analysisController.config;
  app.use('/api/chat', createChatRoutes(aiService, pointsService, config, middlewares));

  // 根路径
  app.get('/', (req, res) => {
    res.json({
      message: '🔮 丁未奇门遁甲 - 重构版后端服务',
      version: '3.2.0',
      status: 'running',
      environment: process.env.NODE_ENV || 'development',
      features: [
        '✅ 模块化架构',
        '✅ 控制器分离',
        '✅ 路由组织优化',
        '✅ 中间件管理',
        '✅ 服务层抽象',
        '✅ 配置集中管理',
        '✅ 会话管理系统',
        '✅ 连续对话支持'
      ],
      endpoints: {
        health: 'GET /health',
        auth: '/api/auth/*',
        points: '/api/points/*',
        analysis: '/api/analysis/*',
        chat: '/api/chat/*'
      },
      timestamp: new Date().toISOString()
    });
  });

  // 404处理
  app.use(middlewares.notFoundHandler);

  // 错误处理
  app.use(middlewares.errorHandler);
}
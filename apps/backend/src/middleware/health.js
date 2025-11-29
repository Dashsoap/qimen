import { getConfig } from '../config/AppConfig.js';

/**
 * 健康检查中间件
 */
export function configureHealthCheck(prisma) {
  return async (req, res) => {
    try {
      // 检查数据库连接
      await prisma.$queryRaw`SELECT 1`;
      
      const config = getConfig();
      
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        environment: config.get('NODE_ENV'),
        database: 'connected',
        ai_provider: 'sophnet_deepseek',
        services: {
          authentication: 'ready',
          database: 'connected',
          ai_agent: 'ready',
          points_system: 'ready',
          cache: 'ready'
        },
        uptime: process.uptime(),
        memory: process.memoryUsage()
      });
    } catch (error) {
      console.error('健康检查失败:', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
        services: {
          database: 'error',
          ai_agent: 'unknown'
        }
      });
    }
  };
}





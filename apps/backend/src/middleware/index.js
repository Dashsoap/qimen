import express from 'express';

// 导入各个middleware模块
import { createAuthMiddleware, createOptionalAuthMiddleware } from './auth.js';
import { configureRateLimit, configureAuthRateLimit, configureAIRateLimit } from './rateLimit.js';
import { configureCORS, configureSecurity } from './security.js';
import { configureRequestLogger } from './logger.js';
import { configureErrorHandler, configureNotFoundHandler } from './errorHandler.js';
import { configureHealthCheck } from './health.js';

/**
 * 配置所有中间件（重构版）
 * 统一管理和导出所有middleware
 */
export function configureMiddlewares(app, prisma) {
  // 1. 安全中间件
  app.use(configureSecurity());
  
  // 2. CORS中间件
  app.use(configureCORS());
  
  // 3. 通用限流中间件
  app.use(configureRateLimit());
  
  // 4. Body解析中间件
  app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
      // 允许空请求体，只验证非空JSON
      if (buf && buf.length > 0) {
        try {
          JSON.parse(buf);
        } catch (e) {
          throw new Error('无效的JSON格式');
        }
      }
    }
  }));
  
  app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
  }));
  
  // 5. 请求日志中间件
  app.use(configureRequestLogger());
  
  // 返回各个中间件实例供路由使用
  return {
    authMiddleware: createAuthMiddleware(prisma),
    optionalAuthMiddleware: createOptionalAuthMiddleware(prisma),
    authRateLimit: configureAuthRateLimit(),
    aiRateLimit: configureAIRateLimit(),
    errorHandler: configureErrorHandler(),
    notFoundHandler: configureNotFoundHandler(),
    healthCheck: configureHealthCheck(prisma)
  };
} 

// 导出各个middleware模块供单独使用
export { 
  createAuthMiddleware, 
  createOptionalAuthMiddleware 
} from './auth.js';

export { 
  configureRateLimit, 
  configureAuthRateLimit, 
  configureAIRateLimit 
} from './rateLimit.js';

export { 
  configureCORS, 
  configureSecurity 
} from './security.js';

export { 
  configureRequestLogger 
} from './logger.js';

export { 
  configureErrorHandler, 
  configureNotFoundHandler 
} from './errorHandler.js';

export { 
  configureHealthCheck 
} from './health.js';

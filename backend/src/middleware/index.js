import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { getConfig } from '../config/AppConfig.js';

/**
 * 配置CORS中间件
 */
export function configureCORS() {
  const config = getConfig();
  const corsConfig = config.getCORSConfig();
  
  return cors({
    origin: function (origin, callback) {
      // 允许没有origin的请求（如移动应用）
      if (!origin) return callback(null, true);
      
      // 开发模式下允许所有来源
      if (config.isDevelopment()) {
        return callback(null, true);
      }
      
      // 生产模式下检查白名单
      if (corsConfig.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: corsConfig.credentials,
    methods: corsConfig.methods,
    allowedHeaders: corsConfig.allowedHeaders,
  });
}

/**
 * 配置安全中间件
 */
export function configureSecurity() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  });
}

/**
 * 配置通用限流中间件
 */
export function configureRateLimit() {
  const config = getConfig();
  const rateLimitConfig = config.getRateLimitConfig();
  
  return rateLimit({
    windowMs: rateLimitConfig.windowMs,
    max: rateLimitConfig.maxRequests,
    message: {
      error: '请求过于频繁，请稍后再试',
      retryAfter: Math.ceil(rateLimitConfig.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: '请求过于频繁',
        message: '您的请求过于频繁，请稍后再试',
        retryAfter: Math.ceil(rateLimitConfig.windowMs / 1000)
      });
    }
  });
}

/**
 * 配置认证限流中间件（更严格）
 */
export function configureAuthRateLimit() {
  const config = getConfig();
  const rateLimitConfig = config.getRateLimitConfig();
  
  return rateLimit({
    windowMs: rateLimitConfig.windowMs,
    max: rateLimitConfig.authMaxRequests,
    message: {
      error: '认证请求过于频繁，请稍后再试',
      retryAfter: Math.ceil(rateLimitConfig.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: '认证请求过于频繁',
        message: `您的认证请求过于频繁，请${Math.ceil(rateLimitConfig.windowMs / 1000 / 60)}分钟后再试`,
        retryAfter: Math.ceil(rateLimitConfig.windowMs / 1000)
      });
    }
  });
}

/**
 * 配置AI分析限流中间件（基于用户等级的差异化限流）
 */
export function configureAIRateLimit() {
  const config = getConfig();
  
  return rateLimit({
    windowMs: 60 * 1000, // 1分钟
    max: (req) => {
      // 基于用户等级的差异化限流
      const user = req.user;
      if (!user) return 1; // 未登录用户
      
      // 根据用户积分等级设置不同的限流
      if (user.points && user.points.totalEarned > 10000) {
        return 10; // VIP用户：10次/分钟
      } else if (user.points && user.points.totalEarned > 5000) {
        return 5;  // 高级用户：5次/分钟
      } else {
        return 2;  // 普通用户：2次/分钟
      }
    },
    keyGenerator: (req) => {
      // 使用用户ID作为限流键
      return req.user ? `ai_${req.user.id}` : req.ip;
    },
    handler: (req, res) => {
      const user = req.user;
      const userLevel = user && user.points && user.points.totalEarned > 5000 ? '高级' : '普通';
      
      res.status(429).json({
        success: false,
        error: 'AI分析请求过于频繁',
        message: `${userLevel}用户AI分析请求已达上限，请稍后再试`,
        suggestion: user && user.points && user.points.totalEarned <= 5000 
          ? '提升用户等级可获得更高的请求限额' 
          : null
      });
    }
  });
}

/**
 * 请求日志中间件
 */
export function configureRequestLogger() {
  const config = getConfig();
  
  return (req, res, next) => {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    
    // 记录请求开始
    console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
    
    // 记录请求体（开发环境）
    if (config.isDevelopment() && req.body && Object.keys(req.body).length > 0) {
      console.log('Request Body:', JSON.stringify(req.body, null, 2));
    }
    
    // 重写end方法来记录响应时间
    const originalEnd = res.end;
    res.end = function(...args) {
      const duration = Date.now() - startTime;
      console.log(`${timestamp} - ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
      originalEnd.apply(this, args);
    };
    
    next();
  };
}

/**
 * JWT认证中间件
 */
export function createAuthMiddleware(prisma) {
  const config = getConfig();
  const jwtConfig = config.getJWTConfig();
  
  return async (req, res, next) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          error: '访问令牌缺失',
          message: '请先登录'
        });
      }

      const decoded = jwt.verify(token, jwtConfig.secret);
      
      // 检查用户是否仍然存在
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          profile: true,
          points: true,
          subscription: true
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: '用户不存在',
          message: '请重新登录'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('JWT验证错误:', error);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: '令牌已过期',
          message: '请重新登录'
        });
      }
      
      return res.status(401).json({
        success: false,
        error: '无效的访问令牌',
        message: '请重新登录'
      });
    }
  };
}

/**
 * 可选认证中间件（用户可登录可不登录的接口）
 */
export function createOptionalAuthMiddleware(prisma) {
  const config = getConfig();
  const jwtConfig = config.getJWTConfig();
  
  return async (req, res, next) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        // 没有token，继续处理但不设置user
        return next();
      }

      const decoded = jwt.verify(token, jwtConfig.secret);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          profile: true,
          points: true,
          subscription: true
        }
      });

      if (user) {
        req.user = user;
      }
      
      next();
    } catch (error) {
      // 认证失败也继续处理，但不设置user
      console.warn('可选认证失败:', error.message);
      next();
    }
  };
}

/**
 * 错误处理中间件
 */
export function configureErrorHandler() {
  const config = getConfig();
  
  return (error, req, res, next) => {
    console.error('服务器错误:', error);
    
    // Prisma错误处理
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: '数据冲突',
        message: '该数据已存在',
        details: config.isDevelopment() ? error.message : undefined
      });
    }
    
    // JWT错误处理
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: '无效的访问令牌',
        message: '请重新登录'
      });
    }
    
    // 验证错误处理
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: '数据验证失败',
        message: error.message,
        details: error.details
      });
    }
    
    // 通用错误处理
    res.status(error.status || 500).json({
      success: false,
      error: error.status >= 400 && error.status < 500 ? '客户端错误' : '服务器内部错误',
      message: error.message || '未知错误',
      details: config.isDevelopment() ? error.stack : undefined
    });
  };
}

/**
 * 404处理中间件
 */
export function configureNotFoundHandler() {
  return (req, res) => {
    res.status(404).json({
      success: false,
      error: '接口不存在',
      message: `未找到路径 ${req.method} ${req.path}`,
      suggestion: '请检查API文档确认正确的接口路径'
    });
  };
}

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

/**
 * 配置所有中间件
 */
export function configureMiddlewares(app, prisma) {
  const config = getConfig();
  
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
      // 🔧 优化：允许空请求体，只验证非空JSON
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
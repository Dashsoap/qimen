import rateLimit from 'express-rate-limit';
import { getConfig } from '../config/AppConfig.js';

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
 * 配置AI分析限流中间件
 * 基于用户等级的差异化限流
 */
export function configureAIRateLimit() {
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





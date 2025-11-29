import jwt from 'jsonwebtoken';
import { getConfig } from '../config/AppConfig.js';

/**
 * JWT认证中间件
 * 验证用户身份并加载用户信息
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
 * 可选认证中间件
 * 用户可登录可不登录的接口
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





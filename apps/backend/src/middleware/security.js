import cors from 'cors';
import helmet from 'helmet';
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





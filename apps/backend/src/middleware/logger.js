import { getConfig } from '../config/AppConfig.js';

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


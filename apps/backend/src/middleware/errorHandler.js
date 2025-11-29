import { getConfig } from '../config/AppConfig.js';

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





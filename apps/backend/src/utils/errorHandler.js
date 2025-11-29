/**
 * 错误处理工具
 * 提供统一的错误处理和日志记录
 */

/**
 * 错误类型枚举
 */
export const ErrorType = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  INTERNAL: 'INTERNAL_ERROR',
  EXTERNAL_API: 'EXTERNAL_API_ERROR',
  DATABASE: 'DATABASE_ERROR'
};

/**
 * 自定义应用错误类
 */
export class AppError extends Error {
  constructor(message, type = ErrorType.INTERNAL, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * 记录错误
 * @param {Error} error - 错误对象
 * @param {object} context - 上下文信息
 */
export function logError(error, context = {}) {
  const errorInfo = {
    message: error.message,
    type: error.type || 'UNKNOWN',
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...context
  };
  
  console.error('❌ 错误详情:', JSON.stringify(errorInfo, null, 2));
}

/**
 * 处理数据库错误
 * @param {Error} error - 数据库错误
 * @returns {AppError} 应用错误
 */
export function handleDatabaseError(error) {
  logError(error, { source: 'database' });
  
  // SQLite 特定错误处理
  if (error.message.includes('UNIQUE constraint')) {
    return new AppError('数据已存在', ErrorType.VALIDATION, 409, error.message);
  }
  
  if (error.message.includes('NOT NULL constraint')) {
    return new AppError('缺少必需字段', ErrorType.VALIDATION, 400, error.message);
  }
  
  return new AppError('数据库操作失败', ErrorType.DATABASE, 500, error.message);
}

/**
 * 处理验证错误
 * @param {Error} error - 验证错误
 * @returns {AppError} 应用错误
 */
export function handleValidationError(error) {
  logError(error, { source: 'validation' });
  return new AppError(error.message, ErrorType.VALIDATION, 400, error.details);
}

/**
 * 处理认证错误
 * @param {string} message - 错误消息
 * @returns {AppError} 应用错误
 */
export function handleAuthError(message = '认证失败') {
  return new AppError(message, ErrorType.AUTHENTICATION, 401);
}

/**
 * 处理授权错误
 * @param {string} message - 错误消息
 * @returns {AppError} 应用错误
 */
export function handleAuthorizationError(message = '权限不足') {
  return new AppError(message, ErrorType.AUTHORIZATION, 403);
}

/**
 * 处理未找到错误
 * @param {string} resource - 资源名称
 * @returns {AppError} 应用错误
 */
export function handleNotFoundError(resource = '资源') {
  return new AppError(`${resource}不存在`, ErrorType.NOT_FOUND, 404);
}

/**
 * 处理外部API错误
 * @param {Error} error - API错误
 * @param {string} apiName - API名称
 * @returns {AppError} 应用错误
 */
export function handleExternalApiError(error, apiName = '外部服务') {
  logError(error, { source: 'external_api', apiName });
  return new AppError(`${apiName}调用失败`, ErrorType.EXTERNAL_API, 503, error.message);
}

/**
 * 通用错误处理中间件
 * @param {Error} error - 错误对象
 * @param {object} req - Express请求对象
 * @param {object} res - Express响应对象
 * @param {function} next - Express next函数
 */
export function errorMiddleware(error, req, res, next) {
  // 如果是AppError，直接使用
  if (error instanceof AppError) {
    logError(error, { path: req.path, method: req.method });
    return res.status(error.statusCode).json({
      success: false,
      error: error.type,
      message: error.message,
      details: error.details,
      timestamp: error.timestamp
    });
  }
  
  // 未知错误
  logError(error, { path: req.path, method: req.method });
  res.status(500).json({
    success: false,
    error: ErrorType.INTERNAL,
    message: '服务器内部错误',
    timestamp: new Date().toISOString()
  });
}

/**
 * 安全地执行异步函数并处理错误
 * @param {function} fn - 异步函数
 * @returns {function} Express中间件
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}





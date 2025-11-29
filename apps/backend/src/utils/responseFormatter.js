/**
 * 响应格式化工具
 * 统一API响应格式
 */

/**
 * 生成成功响应
 * @param {*} data - 响应数据
 * @param {string} message - 可选消息
 * @returns {object} 格式化的成功响应
 */
export function successResponse(data, message = 'success') {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}

/**
 * 生成错误响应
 * @param {string} message - 错误消息
 * @param {*} error - 错误详情（可选）
 * @param {number} code - 错误代码（可选）
 * @returns {object} 格式化的错误响应
 */
export function errorResponse(message, error = null, code = null) {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (error) {
    response.error = typeof error === 'string' ? error : error.message;
  }
  
  if (code) {
    response.code = code;
  }
  
  return response;
}

/**
 * 生成分页响应
 * @param {array} items - 数据项
 * @param {number} total - 总数
 * @param {number} page - 当前页
 * @param {number} pageSize - 每页大小
 * @returns {object} 格式化的分页响应
 */
export function paginatedResponse(items, total, page, pageSize) {
  return {
    success: true,
    data: {
      items,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
        hasPrev: page > 1
      }
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * 格式化AI分析响应
 * @param {string} analysis - 分析结果
 * @param {object} metadata - 元数据
 * @returns {object} 格式化的AI分析响应
 */
export function aiAnalysisResponse(analysis, metadata = {}) {
  return {
    success: true,
    sessionId: metadata.sessionId || 'session-' + Date.now(),
    timestamp: new Date().toISOString(),
    strategy: metadata.strategy,
    executionTime: metadata.executionTime,
    analysis: analysis,
    paipanInfo: metadata.paipanInfo,
    question: metadata.question,
    steps: metadata.steps || []
  };
}





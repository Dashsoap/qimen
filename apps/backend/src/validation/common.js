/**
 * 通用验证工具函数
 */

/**
 * 安全过滤函数
 * 移除潜在的XSS和注入攻击内容
 */
export function sanitizeInput(value) {
  if (typeof value !== 'string') {
    return value;
  }
  
  return value
    // 移除HTML标签
    .replace(/<[^>]*>/g, '')
    // 移除JavaScript事件处理器
    .replace(/on\w+\s*=/gi, '')
    // 移除script标签内容
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // 移除SQL注入常见关键词
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/gi, '')
    // 移除可能的路径遍历
    .replace(/\.\./g, '')
    // 移除特殊字符
    .replace(/[<>\"\'&]/g, '')
    // 清理多余空白
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * 敏感词检查
 */
export function containsSensitiveWords(text) {
  const sensitiveWords = [
    // 政治敏感词
    '政治', '政府', '总统', '主席',
    // 宗教敏感词
    '宗教', '佛教', '基督教', '伊斯兰教',
    // 暴力内容
    '暴力', '杀死', '爆炸', '恐怖',
    // 色情内容
    '色情', '性', '裸体'
  ];
  
  const lowerText = text.toLowerCase();
  return sensitiveWords.some(word => lowerText.includes(word.toLowerCase()));
}

/**
 * 验证中间件工厂
 */
export function createValidationMiddleware(schema, source = 'body') {
  return (req, res, next) => {
    const data = source === 'query' ? req.query : 
                  source === 'params' ? req.params : 
                  req.body;
    
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: '数据验证失败',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }))
      });
    }
    
    // 将验证后的数据赋值回请求对象
    if (source === 'query') {
      req.query = value;
    } else if (source === 'params') {
      req.params = value;
    } else {
      req.body = value;
    }
    
    next();
  };
}






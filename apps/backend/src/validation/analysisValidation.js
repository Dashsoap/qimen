import Joi from 'joi';
import { sanitizeInput, containsSensitiveWords, createValidationMiddleware } from './common.js';
import { qimenSchemas } from './qimenValidation.js';

/**
 * AI分析相关的验证Schema
 */
export const analysisSchemas = {
  request: Joi.object({
    question: Joi.string()
      .min(5)
      .max(1000)
      .required()
      .custom((value, helpers) => {
        // 安全过滤
        const cleaned = sanitizeInput(value);
        if (cleaned !== value) {
          return helpers.error('string.unsafe');
        }
        
        // 检查敏感词
        if (containsSensitiveWords(cleaned)) {
          return helpers.error('string.sensitive');
        }
        
        return cleaned;
      })
      .messages({
        'string.min': '问题至少5个字符',
        'string.max': '问题最多1000个字符',
        'string.unsafe': '问题包含不安全的内容',
        'string.sensitive': '问题包含敏感词汇',
        'any.required': '问题是必填项'
      }),
    
    paipanData: qimenSchemas.fullPaipan.required()
      .messages({
        'any.required': '排盘数据是必填项'
      }),
    
    strategy: Joi.string()
      .valid('simple', 'deep', 'stream', 'master')
      .optional()
      .default('deep')
      .messages({
        'any.only': '分析策略必须是simple、deep、stream或master之一'
      }),
    
    options: Joi.object({
      maxTokens: Joi.number()
        .integer()
        .positive()
        .max(4000)
        .optional()
        .messages({
          'number.integer': '最大token数必须是整数',
          'number.positive': '最大token数必须是正数',
          'number.max': '最大token数不能超过4000'
        }),
      
      temperature: Joi.number()
        .min(0)
        .max(2)
        .optional()
        .messages({
          'number.min': '温度参数不能小于0',
          'number.max': '温度参数不能大于2'
        })
    }).optional()
  })
};

/**
 * AI分析相关的验证中间件
 */
export const analysisValidationMiddlewares = {
  validateAnalysisRequest: createValidationMiddleware(analysisSchemas.request)
};



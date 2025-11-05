import Joi from 'joi';
import { createValidationMiddleware } from './common.js';

/**
 * 积分系统相关的验证Schema
 */
export const pointsSchemas = {
  transaction: Joi.object({
    amount: Joi.number()
      .integer()
      .positive()
      .max(100000)
      .required()
      .messages({
        'number.integer': '积分数量必须是整数',
        'number.positive': '积分数量必须是正数',
        'number.max': '单次交易积分不能超过100000',
        'any.required': '积分数量是必填项'
      }),
    
    type: Joi.string()
      .valid('earned', 'spent')
      .required()
      .messages({
        'any.only': '交易类型必须是earned或spent',
        'any.required': '交易类型是必填项'
      }),
    
    description: Joi.string()
      .max(200)
      .optional()
      .messages({
        'string.max': '描述最多200个字符'
      })
  }),
  
  transfer: Joi.object({
    toUserId: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.uuid': '用户ID格式无效',
        'any.required': '接收用户ID是必填项'
      }),
    
    amount: Joi.number()
      .integer()
      .positive()
      .max(50000)
      .required()
      .messages({
        'number.integer': '转账数量必须是整数',
        'number.positive': '转账数量必须是正数',
        'number.max': '单次转账不能超过50000积分',
        'any.required': '转账数量是必填项'
      }),
    
    description: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': '转账描述最多100个字符'
      })
  }),
  
  history: Joi.object({
    page: Joi.number()
      .integer()
      .positive()
      .max(1000)
      .default(1)
      .messages({
        'number.integer': '页码必须是整数',
        'number.positive': '页码必须是正数',
        'number.max': '页码不能超过1000'
      }),
    
    limit: Joi.number()
      .integer()
      .positive()
      .max(100)
      .default(20)
      .messages({
        'number.integer': '每页数量必须是整数',
        'number.positive': '每页数量必须是正数',
        'number.max': '每页最多100条记录'
      }),
    
    type: Joi.string()
      .valid('earned', 'spent')
      .optional()
      .messages({
        'any.only': '类型筛选必须是earned或spent'
      }),
    
    startDate: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': '开始日期格式无效，请使用ISO格式'
      }),
    
    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .optional()
      .messages({
        'date.format': '结束日期格式无效，请使用ISO格式',
        'date.min': '结束日期不能早于开始日期'
      })
  })
};

/**
 * 积分相关的验证中间件
 */
export const pointsValidationMiddlewares = {
  validatePointsTransaction: createValidationMiddleware(pointsSchemas.transaction),
  validatePointsTransfer: createValidationMiddleware(pointsSchemas.transfer),
  validatePointsHistory: createValidationMiddleware(pointsSchemas.history, 'query')
};



import Joi from 'joi';
import { sanitizeInput, createValidationMiddleware } from './common.js';

/**
 * 查询参数验证Schema
 */
export const querySchemas = {
  pagination: Joi.object({
    page: Joi.number()
      .integer()
      .positive()
      .max(1000)
      .default(1),
    
    limit: Joi.number()
      .integer()
      .positive()
      .max(100)
      .default(20)
  }),
  
  dateRange: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional()
  }),
  
  search: Joi.object({
    keyword: Joi.string()
      .max(100)
      .custom(sanitizeInput)
      .optional(),
    
    category: Joi.string()
      .max(50)
      .optional()
  })
};

/**
 * 查询参数的验证中间件
 */
export const queryValidationMiddlewares = {
  validatePagination: createValidationMiddleware(querySchemas.pagination, 'query'),
  validateDateRange: createValidationMiddleware(querySchemas.dateRange, 'query'),
  validateSearch: createValidationMiddleware(querySchemas.search, 'query')
};






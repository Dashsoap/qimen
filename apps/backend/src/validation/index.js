/**
 * Validation 模块统一导出
 */

// 通用工具
export * from './common.js';

// 各模块schemas
export { authSchemas, authValidationMiddlewares } from './authValidation.js';
export { pointsSchemas, pointsValidationMiddlewares } from './pointsValidation.js';
export { analysisSchemas, analysisValidationMiddlewares } from './analysisValidation.js';
export { qimenSchemas, validatePaipanIntegrity } from './qimenValidation.js';
export { querySchemas, queryValidationMiddlewares } from './queryValidation.js';

// 自定义验证器
export * from './customValidators.js';

// 向后兼容：导出所有Schema的集合
export const allSchemas = {
  auth: authSchemas,
  points: pointsSchemas,
  analysis: analysisSchemas,
  qimen: qimenSchemas,
  query: querySchemas
};

// 向后兼容：导出所有验证中间件
export const validationMiddlewares = {
  ...authValidationMiddlewares,
  ...pointsValidationMiddlewares,
  ...analysisValidationMiddlewares,
  ...queryValidationMiddlewares
};






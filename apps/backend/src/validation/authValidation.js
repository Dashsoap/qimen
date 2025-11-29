import Joi from 'joi';
import { createValidationMiddleware } from './common.js';

/**
 * 用户认证相关的验证Schema
 */
export const authSchemas = {
  register: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.alphanum': '用户名只能包含字母和数字',
        'string.min': '用户名至少3个字符',
        'string.max': '用户名最多30个字符',
        'any.required': '用户名是必填项'
      }),
    
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': '请输入有效的邮箱地址',
        'any.required': '邮箱是必填项'
      }),
    
    password: Joi.string()
      .min(6)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': '密码至少6个字符',
        'string.max': '密码最多128个字符',
        'string.pattern.base': '密码必须包含至少一个大写字母、一个小写字母和一个数字',
        'any.required': '密码是必填项'
      }),
    
    phone: Joi.string()
      .pattern(/^1[3-9]\d{9}$/)
      .optional()
      .messages({
        'string.pattern.base': '请输入有效的手机号码'
      }),
    
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': '确认密码必须与密码匹配',
        'any.required': '确认密码是必填项'
      })
  }),
  
  login: Joi.object({
    usernameOrEmail: Joi.string()
      .required()
      .messages({
        'any.required': '用户名或邮箱是必填项'
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'any.required': '密码是必填项'
      })
  }),
  
  resetPassword: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': '请输入有效的邮箱地址',
        'any.required': '邮箱是必填项'
      })
  })
};

/**
 * 认证相关的验证中间件
 */
export const authValidationMiddlewares = {
  validateRegister: createValidationMiddleware(authSchemas.register),
  validateLogin: createValidationMiddleware(authSchemas.login),
  validateResetPassword: createValidationMiddleware(authSchemas.resetPassword)
};






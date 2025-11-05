import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { AppError, handleValidationError, asyncHandler } from '../utils/errorHandler.js';
import { validateRegister, validateLogin, validateSmsLogin, validateSmsCode } from '../validation/authValidation.js';

/**
 * 认证控制器（重构版）
 * 负责处理HTTP请求和响应，业务逻辑委托给AuthService
 */
export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  /**
   * 用户注册
   */
  async register(req, res) {
    try {
      // 验证输入
      const { error, value } = validateRegister(req.body);
      if (error) {
        return res.status(400).json(errorResponse('输入数据验证失败', error.details));
      }

      // 调用Service层处理业务逻辑
      const result = await this.authService.register(value);

      res.status(201).json(successResponse({
        user: result.user,
        token: result.token,
        tokenExpiry: result.tokenExpiry
      }, result.message));

    } catch (error) {
      console.error('注册错误:', error);
      const statusCode = error.message.includes('已存在') ? 409 : 
                        error.message.includes('邀请码') ? 400 : 500;
      res.status(statusCode).json(errorResponse(error.message, error));
    }
  }

  /**
   * 用户登录
   */
  async login(req, res) {
    try {
      // 验证输入
      const { error, value } = validateLogin(req.body);
      if (error) {
        return res.status(400).json(errorResponse('输入数据验证失败', error.details));
      }

      // 调用Service层处理业务逻辑
      const result = await this.authService.login(value.usernameOrEmail, value.password);

      res.json(successResponse({
        user: result.user,
        token: result.token,
        tokenExpiry: result.tokenExpiry
      }, result.message));

    } catch (error) {
      console.error('登录错误:', error);
      const statusCode = error.message.includes('不存在') || error.message.includes('密码错误') ? 401 : 500;
      res.status(statusCode).json(errorResponse(error.message, error));
    }
  }

  /**
   * 验证token
   */
  async verifyToken(req, res) {
    try {
      // authMiddleware已经验证了token并设置了req.user
      const user = req.user;

      if (!user) {
        return res.status(401).json(errorResponse('未授权'));
      }

      // 获取完整的用户信息
      const fullUser = await this.authService.getUserById(user.userId);

      res.json(successResponse({
        user: fullUser,
        userId: user.userId,
        username: user.username
      }, 'Token有效'));

    } catch (error) {
      console.error('Token验证错误:', error);
      res.status(401).json(errorResponse('Token验证失败', error));
    }
  }

  /**
   * 发送SMS验证码
   */
  async sendSmsCode(req, res) {
    try {
      // 验证输入
      const { error, value } = validateSmsCode(req.body);
      if (error) {
        return res.status(400).json(errorResponse('输入数据验证失败', error.details));
      }

      // TODO: 实现实际的SMS发送逻辑
      // 这里简化处理，返回模拟的验证码（实际应该通过SMS发送）
      const mockCode = '123456';
      console.log(`[模拟SMS] 发送验证码到 ${value.phone}: ${mockCode}`);

      res.json(successResponse({
        phone: value.phone,
        codeLength: 6,
        expiresIn: 300 // 5分钟
      }, 'SMS验证码已发送'));

    } catch (error) {
      console.error('发送SMS验证码错误:', error);
      res.status(500).json(errorResponse('发送验证码失败', error));
    }
  }

  /**
   * SMS验证码登录
   */
  async loginWithSms(req, res) {
    try {
      // 验证输入
      const { error, value } = validateSmsLogin(req.body);
      if (error) {
        return res.status(400).json(errorResponse('输入数据验证失败', error.details));
      }

      // 调用Service层处理业务逻辑
      const result = await this.authService.smsLogin(value.phone, value.code);

      res.json(successResponse({
        user: result.user,
        token: result.token,
        tokenExpiry: result.tokenExpiry
      }, result.message));

    } catch (error) {
      console.error('SMS登录错误:', error);
      const statusCode = error.message.includes('未注册') ? 404 : 401;
      res.status(statusCode).json(errorResponse(error.message, error));
    }
  }
}

/**
 * 创建AuthController实例
 */
export function createAuthController(authService) {
  return new AuthController(authService);
}

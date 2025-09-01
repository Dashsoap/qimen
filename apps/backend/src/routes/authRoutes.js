import express from 'express';

/**
 * 认证路由
 */
export function createAuthRoutes(authController, middlewares) {
  const router = express.Router();
  const { authRateLimit, authMiddleware } = middlewares;

  // 用户注册
  router.post('/register', authRateLimit, (req, res) => authController.register(req, res));

  // 用户登录
  router.post('/login', authRateLimit, (req, res) => authController.login(req, res));

  // 验证token
  router.get('/verify', authMiddleware, (req, res) => authController.verifyToken(req, res));

  // 发送短信验证码
  router.post('/send-sms', authRateLimit, (req, res) => authController.sendSmsCode(req, res));

  // 短信验证码登录
  router.post('/login-sms', authRateLimit, (req, res) => authController.loginWithSms(req, res));

  // 用户登出
  router.post('/logout', authMiddleware, (req, res) => authController.logout(req, res));

  // 获取用户资料
  router.get('/profile', authMiddleware, (req, res) => authController.getProfile(req, res));

  return router;
}
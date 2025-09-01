import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

/**
 * 认证控制器
 * 处理用户注册、登录、验证等认证相关的业务逻辑
 */
export class AuthController {
  constructor(prisma, config, inviteCodeService, pointsService) {
    this.prisma = prisma;
    this.config = config;
    this.inviteCodeService = inviteCodeService;
    this.pointsService = pointsService;
  }

  /**
   * 用户注册
   */
  async register(req, res) {
    try {
      const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional(),
        inviteCode: Joi.string().required().messages({
          'any.required': '邀请码是必填项'
        })
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: '输入数据验证失败',
          details: error.details.map(d => d.message)
        });
      }

      const { username, email, password, phone, inviteCode } = value;

      // 验证邀请码
      const inviteValidation = await this.inviteCodeService.validateInviteCode(inviteCode);
      if (!inviteValidation.valid) {
        return res.status(400).json({
          success: false,
          error: '邀请码无效',
          message: inviteValidation.error
        });
      }

      // 检查用户是否已存在
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { username },
            { email },
            ...(phone ? [{ phone }] : [])
          ]
        }
      });

      if (existingUser) {
        let conflictField = '用户';
        if (existingUser.username === username) conflictField = '用户名';
        else if (existingUser.email === email) conflictField = '邮箱';
        else if (existingUser.phone === phone) conflictField = '手机号';
        
        return res.status(409).json({
          success: false,
          error: `${conflictField}已存在`
        });
      }

      // 加密密码
      const cryptoConfig = this.config.getCryptoConfig();
      const hashedPassword = await bcrypt.hash(password, cryptoConfig.bcryptRounds);

      // 创建用户（包含积分奖励和邀请码记录）
      const pointsConfig = this.config.getPointsConfig();
      const user = await this.prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          phone,
          inviteCode: inviteCode,
          points: {
            create: {
              balance: pointsConfig.registerBonusPoints,
              totalEarned: pointsConfig.registerBonusPoints,
              totalSpent: 0,
              pointsRecords: {
                create: {
                  amount: pointsConfig.registerBonusPoints,
                  type: 'earned',
                  description: '注册奖励'
                }
              }
            }
          }
        },
        include: {
          profile: true,
          points: {
            include: {
              pointsRecords: true
            }
          }
        }
      });

      // 使用邀请码
      try {
        await this.inviteCodeService.useInviteCode(inviteCode, user.id);
      } catch (error) {
        console.error('使用邀请码失败:', error);
        // 如果邀请码使用失败，删除已创建的用户
        await this.prisma.user.delete({ where: { id: user.id } });
        return res.status(400).json({
          success: false,
          error: '邀请码使用失败',
          message: error.message
        });
      }

      // 生成JWT令牌
      const jwtConfig = this.config.getJWTConfig();
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
      );

      // 返回用户信息（不包含密码）
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({
        success: true,
        message: `注册成功！获得${pointsConfig.registerBonusPoints}积分奖励`,
        user: userWithoutPassword,
        token,
        tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });

    } catch (error) {
      console.error('注册错误:', error);
      res.status(500).json({
        success: false,
        error: '注册失败',
        message: '服务器内部错误'
      });
    }
  }

  /**
   * 用户登录
   */
  async login(req, res) {
    try {
      const schema = Joi.object({
        usernameOrEmail: Joi.string().required(),
        password: Joi.string().required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: '输入数据验证失败',
          details: error.details.map(d => d.message)
        });
      }

      const { usernameOrEmail, password } = value;

      // 查找用户
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { username: usernameOrEmail },
            { email: usernameOrEmail }
          ]
        },
        include: {
          profile: true,
          points: {
            include: {
              pointsRecords: {
                take: 10,
                orderBy: { createdAt: 'desc' }
              }
            }
          },
          subscription: true
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: '用户不存在'
        });
      }

      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: '密码错误'
        });
      }

      // 生成JWT令牌
      const jwtConfig = this.config.getJWTConfig();
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
      );

      // 返回用户信息（不包含密码）
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: '登录成功',
        user: userWithoutPassword,
        token,
        tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });

    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json({
        success: false,
        error: '登录失败'
      });
    }
  }

  /**
   * 验证token
   */
  async verifyToken(req, res) {
    try {
      // authMiddleware已经验证了token并设置了req.user
      // 返回用户信息（不包含密码）
      const { password: _, ...userWithoutPassword } = req.user;

      res.json({
        success: true,
        message: 'Token验证成功',
        user: userWithoutPassword
      });

    } catch (error) {
      console.error('Token验证错误:', error);
      res.status(500).json({
        success: false,
        error: 'Token验证失败',
        message: '服务器内部错误'
      });
    }
  }

  /**
   * 发送短信验证码
   */
  async sendSmsCode(req, res) {
    try {
      const { phone } = req.body;

      // 验证手机号格式
      if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          error: '请输入正确的手机号'
        });
      }

      // 生成6位验证码
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // 设置验证码过期时间（5分钟）
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // 存储验证码到数据库
      await this.prisma.smsCode.upsert({
        where: { phone },
        update: {
          code,
          expiresAt,
          attempts: 0
        },
        create: {
          phone,
          code,
          expiresAt,
          attempts: 0
        }
      });

      // 这里应该调用短信服务发送验证码
      // 为了演示，我们只是记录到控制台
      console.log(`📱 发送验证码到 ${phone}: ${code}`);

      res.json({
        success: true,
        message: '验证码发送成功',
        // 开发环境下返回验证码，生产环境不应该返回
        ...(process.env.NODE_ENV === 'development' && { code })
      });

    } catch (error) {
      console.error('发送短信验证码错误:', error);
      res.status(500).json({
        success: false,
        error: '验证码发送失败'
      });
    }
  }

  /**
   * 短信验证码登录
   */
  async loginWithSms(req, res) {
    try {
      const { phone, code } = req.body;

      // 验证手机号格式
      if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          error: '请输入正确的手机号'
        });
      }

      // 验证验证码格式
      if (!code || !/^\d{6}$/.test(code)) {
        return res.status(400).json({
          success: false,
          error: '请输入6位验证码'
        });
      }

      // 查找验证码记录
      const smsRecord = await this.prisma.smsCode.findUnique({
        where: { phone }
      });

      if (!smsRecord) {
        return res.status(400).json({
          success: false,
          error: '请先获取验证码'
        });
      }

      // 检查验证码是否过期
      if (new Date() > smsRecord.expiresAt) {
        return res.status(400).json({
          success: false,
          error: '验证码已过期，请重新获取'
        });
      }

      // 检查尝试次数
      if (smsRecord.attempts >= 3) {
        return res.status(400).json({
          success: false,
          error: '验证码错误次数过多，请重新获取'
        });
      }

      // 验证验证码
      if (smsRecord.code !== code) {
        // 增加尝试次数
        await this.prisma.smsCode.update({
          where: { phone },
          data: { attempts: smsRecord.attempts + 1 }
        });

        return res.status(400).json({
          success: false,
          error: '验证码错误'
        });
      }

      // 验证成功，删除验证码记录
      await this.prisma.smsCode.delete({
        where: { phone }
      });

      // 查找或创建用户
      let user = await this.prisma.user.findUnique({
        where: { phone }
      });

      if (!user) {
        // 创建新用户
        const username = `user_${phone.slice(-4)}_${Date.now().toString().slice(-4)}`;
        const pointsConfig = this.config.getPointsConfig();
        
        user = await this.prisma.user.create({
          data: {
            username,
            phone,
            email: `${phone}@phone.user`,
            password: '', // 手机号登录用户没有密码
            points: {
              create: {
                balance: pointsConfig.registerBonusPoints,
                totalEarned: pointsConfig.registerBonusPoints,
                totalSpent: 0,
                pointsRecords: {
                  create: {
                    amount: pointsConfig.registerBonusPoints,
                    type: 'earned',
                    description: '新用户注册奖励'
                  }
                }
              }
            }
          },
          include: {
            points: {
              include: {
                pointsRecords: true
              }
            }
          }
        });
      }

      // 生成JWT令牌
      const jwtConfig = this.config.getJWTConfig();
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username,
          phone: user.phone 
        },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
      );

      // 返回用户信息（不包含密码）
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: user.createdAt.getTime() === user.updatedAt.getTime() ? 
          '注册成功，获得积分奖励！' : '登录成功',
        user: userWithoutPassword,
        token
      });

    } catch (error) {
      console.error('短信验证码登录错误:', error);
      res.status(500).json({
        success: false,
        error: '登录失败'
      });
    }
  }

  /**
   * 用户登出
   */
  logout(req, res) {
    res.json({
      success: true,
      message: '已成功登出'
    });
  }

  /**
   * 获取用户资料
   */
  getProfile(req, res) {
    const { password, ...userWithoutPassword } = req.user;
    
    res.json({
      success: true,
      user: userWithoutPassword
    });
  }
}

export function createAuthController(prisma, config, inviteCodeService, pointsService) {
  return new AuthController(prisma, config, inviteCodeService, pointsService);
}
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * 认证服务
 * 处理用户注册、登录、令牌生成等核心认证业务逻辑
 */
export class AuthService {
  constructor(prisma, config, inviteCodeService) {
    this.prisma = prisma;
    this.config = config;
    this.inviteCodeService = inviteCodeService;
  }

  /**
   * 用户注册
   * @param {object} userData - 用户注册数据
   * @returns {Promise<object>} 注册结果
   */
  async register(userData) {
    const { username, email, password, phone, inviteCode } = userData;

    // 验证邀请码
    const inviteValidation = await this.inviteCodeService.validateInviteCode(inviteCode);
    if (!inviteValidation.valid) {
      throw new Error(inviteValidation.error || '邀请码无效');
    }

    // 检查用户是否已存在
    const existingUser = await this.findExistingUser(username, email, phone);
    if (existingUser) {
      const conflictField = this.getConflictField(existingUser, username, email, phone);
      throw new Error(`${conflictField}已存在`);
    }

    // 加密密码
    const hashedPassword = await this.hashPassword(password);

    // 创建用户（包含积分奖励）
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
      // 如果邀请码使用失败，删除已创建的用户
      await this.prisma.user.delete({ where: { id: user.id } });
      throw new Error(`邀请码使用失败: ${error.message}`);
    }

    // 生成令牌
    const token = this.generateToken(user);

    // 返回不包含密码的用户信息
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      tokenExpiry: this.getTokenExpiry(),
      message: `注册成功！获得${pointsConfig.registerBonusPoints}积分奖励`
    };
  }

  /**
   * 用户登录
   * @param {string} usernameOrEmail - 用户名或邮箱
   * @param {string} password - 密码
   * @returns {Promise<object>} 登录结果
   */
  async login(usernameOrEmail, password) {
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
      throw new Error('用户不存在');
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('密码错误');
    }

    // 生成令牌
    const token = this.generateToken(user);

    // 返回不包含密码的用户信息
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      tokenExpiry: this.getTokenExpiry(),
      message: '登录成功'
    };
  }

  /**
   * SMS登录
   * @param {string} phone - 手机号
   * @param {string} code - 验证码
   * @returns {Promise<object>} 登录结果
   */
  async smsLogin(phone, code) {
    // TODO: 实现验证码验证逻辑
    // 这里简化处理，实际应该验证验证码是否正确
    
    const user = await this.prisma.user.findFirst({
      where: { phone },
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
      throw new Error('手机号未注册');
    }

    const token = this.generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      tokenExpiry: this.getTokenExpiry(),
      message: 'SMS登录成功'
    };
  }

  /**
   * 查找已存在的用户
   */
  async findExistingUser(username, email, phone) {
    return await this.prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
          ...(phone ? [{ phone }] : [])
        ]
      }
    });
  }

  /**
   * 获取冲突字段名称
   */
  getConflictField(existingUser, username, email, phone) {
    if (existingUser.username === username) return '用户名';
    if (existingUser.email === email) return '邮箱';
    if (existingUser.phone === phone) return '手机号';
    return '用户';
  }

  /**
   * 加密密码
   */
  async hashPassword(password) {
    const cryptoConfig = this.config.getCryptoConfig();
    return await bcrypt.hash(password, cryptoConfig.bcryptRounds);
  }

  /**
   * 生成JWT令牌
   */
  generateToken(user) {
    const jwtConfig = this.config.getJWTConfig();
    return jwt.sign(
      { userId: user.id, username: user.username },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );
  }

  /**
   * 获取令牌过期时间
   */
  getTokenExpiry() {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  }

  /**
   * 验证令牌
   */
  verifyToken(token) {
    const jwtConfig = this.config.getJWTConfig();
    try {
      return jwt.verify(token, jwtConfig.secret);
    } catch (error) {
      throw new Error('令牌无效或已过期');
    }
  }

  /**
   * 根据ID获取用户信息
   */
  async getUserById(userId) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
      throw new Error('用户不存在');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

// 单例模式导出
let authServiceInstance = null;

/**
 * 创建AuthService实例
 */
export function createAuthService(prisma, config, inviteCodeService) {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService(prisma, config, inviteCodeService);
  }
  return authServiceInstance;
}

/**
 * 获取AuthService实例
 */
export function getAuthService() {
  if (!authServiceInstance) {
    throw new Error('AuthService not initialized. Call createAuthService first.');
  }
  return authServiceInstance;
}





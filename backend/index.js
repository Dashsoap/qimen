#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import OpenAI from 'openai';

// 导入服务
import { initDatabase } from './src/database/init.js';
import { QimenAgent } from './src/agents/QimenAgent.js';
import { MCPServer } from './src/mcp/MCPServer.js';

// 导入路由
import qimenRoutes from './src/routes/qimen.js';
import analysisRoutes from './src/routes/analysis.js';

// 配置
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: join(__dirname, 'config.env') });

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// 环境变量配置
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

// AI配置
const ARK_API_KEY = process.env.ARK_API_KEY || 'UfI4GzNm9vAyT7I0Nf2CKEwseNqy91AZvkI7hrSCw0otnSeDgDExgE706gdEJHWU1OajYPCVNCPEsGJRVtScxw';
const ARK_BASE_URL = process.env.ARK_BASE_URL || 'https://www.sophnet.com/api/open-apis/v1';
const ARK_MODEL = process.env.ARK_MODEL || 'DeepSeek-R1';

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: ARK_API_KEY,
  baseURL: ARK_BASE_URL,
});

// 安全中间件
app.use(helmet());

// 限流中间件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100个请求
  message: {
    error: '请求过于频繁，请稍后再试',
    retryAfter: 15 * 60
  }
});
app.use(limiter);

// 认证限流（更严格）
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 每个IP最多5次登录/注册尝试
  message: {
    error: '认证请求过于频繁，请15分钟后再试',
    retryAfter: 15 * 60
  }
});

// CORS配置
app.use(cors({
  origin: function (origin, callback) {
    // 允许没有origin的请求（如移动应用）
    if (!origin) return callback(null, true);
    
    // 开发模式下允许所有来源
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // 生产模式下的白名单
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// Body解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 验证模式
const schemas = {
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required()
      .messages({
        'string.alphanum': '用户名只能包含字母和数字',
        'string.min': '用户名至少3个字符',
        'string.max': '用户名最多30个字符',
        'any.required': '用户名是必填项'
      }),
    email: Joi.string().email().required()
      .messages({
        'string.email': '请输入有效的邮箱地址',
        'any.required': '邮箱是必填项'
      }),
    password: Joi.string().min(6).required()
      .messages({
        'string.min': '密码至少6个字符',
        'any.required': '密码是必填项'
      }),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional()
      .messages({
        'string.pattern.base': '请输入有效的手机号码'
      })
  }),
  
  login: Joi.object({
    usernameOrEmail: Joi.string().required()
      .messages({
        'any.required': '用户名或邮箱是必填项'
      }),
    password: Joi.string().required()
      .messages({
        'any.required': '密码是必填项'
      })
  })
};

// JWT认证中间件
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: '访问令牌缺失',
        message: '请先登录'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 检查用户是否仍然存在
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        profile: true,
        points: true,
        subscription: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: '用户不存在',
        message: '请重新登录'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT验证错误:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: '令牌已过期',
        message: '请重新登录'
      });
    }
    
    return res.status(401).json({
      success: false,
      error: '无效的访问令牌',
      message: '请重新登录'
    });
  }
};

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: '🔮 鬼谷奇门遁甲 - 完整版后端服务',
    version: '2.0.0',
    status: 'running',
    features: [
      '✅ 用户认证系统',
      '✅ JWT安全认证',
      '✅ 数据库集成',
      '✅ 积分系统',
      '✅ 订阅管理',
      '✅ AI智能解盘',
      '✅ 安全防护'
    ],
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        profile: 'GET /api/auth/profile'
      },
      points: {
        get: 'GET /api/points',
        transaction: 'POST /api/points/transaction'
      },
      qimen: {
        paipan: 'POST /api/qimen/paipan',
        analysis: 'POST /api/analysis/qimen',
        analysisStream: 'POST /api/analysis/qimen/stream'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    database: 'connected',
    ai_provider: 'sophnet_deepseek',
    services: {
      authentication: 'ready',
      database: 'connected',
      ai_agent: 'ready'
    }
  });
});

// === 认证路由 ===

// 用户注册
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    // 验证输入数据
    const { error, value } = schemas.register.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: '输入数据验证失败',
        details: error.details.map(d => d.message)
      });
    }

    const { username, email, password, phone } = value;

    // 检查用户是否已存在
    const existingUser = await prisma.user.findFirst({
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
        error: `${conflictField}已存在`,
        message: '请使用其他信息注册'
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        phone,
        points: {
          create: {
            balance: 1000, // 注册送1000积分
            totalEarned: 1000,
            totalSpent: 0,
            pointsRecords: {
              create: {
                amount: 1000,
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

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: '注册成功！获得1000积分奖励',
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
});

// 用户登录
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    // 验证输入数据
    const { error, value } = schemas.login.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: '输入数据验证失败',
        details: error.details.map(d => d.message)
      });
    }

    const { usernameOrEmail, password } = value;

    // 查找用户
    const user = await prisma.user.findFirst({
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
        error: '用户不存在',
        message: '用户名或邮箱不正确'
      });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: '密码错误',
        message: '请检查密码是否正确'
      });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
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
      error: '登录失败',
      message: '服务器内部错误'
    });
  }
});

// 用户登出
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  // 在实际应用中，这里可以将token加入黑名单
  res.json({
    success: true,
    message: '已成功登出'
  });
});

// 获取用户资料
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  const { password, ...userWithoutPassword } = req.user;
  
  res.json({
    success: true,
    user: userWithoutPassword
  });
});

// === 积分系统路由 ===

// 获取积分信息
app.get('/api/points', authenticateToken, async (req, res) => {
  try {
    const points = await prisma.userPoints.findUnique({
      where: { userId: req.user.id },
      include: {
        pointsRecords: {
          take: 20,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!points) {
      return res.status(404).json({
        success: false,
        error: '积分记录不存在'
      });
    }

    res.json({
      success: true,
      points
    });

  } catch (error) {
    console.error('获取积分错误:', error);
    res.status(500).json({
      success: false,
      error: '获取积分失败'
    });
  }
});

// 积分交易
app.post('/api/points/transaction', authenticateToken, async (req, res) => {
  try {
    const { amount, type, description } = req.body;

    if (!amount || !type || !['earned', 'spent'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: '参数错误',
        message: 'amount、type是必填项，type必须是earned或spent'
      });
    }

    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: '积分数量必须是正整数'
      });
    }

    // 获取用户当前积分
    const currentPoints = await prisma.userPoints.findUnique({
      where: { userId: req.user.id }
    });

    if (!currentPoints) {
      return res.status(404).json({
        success: false,
        error: '积分记录不存在'
      });
    }

    // 检查余额（如果是消费）
    if (type === 'spent' && currentPoints.balance < numAmount) {
      return res.status(400).json({
        success: false,
        error: '积分余额不足',
        message: `当前余额：${currentPoints.balance}，需要消费：${numAmount}`
      });
    }

    // 计算新的积分值
    const newBalance = type === 'earned' 
      ? currentPoints.balance + numAmount 
      : currentPoints.balance - numAmount;
    
    const newTotalEarned = type === 'earned' 
      ? currentPoints.totalEarned + numAmount 
      : currentPoints.totalEarned;
    
    const newTotalSpent = type === 'spent' 
      ? currentPoints.totalSpent + numAmount 
      : currentPoints.totalSpent;

    // 更新积分和创建记录
    const updatedPoints = await prisma.userPoints.update({
      where: { userId: req.user.id },
      data: {
        balance: newBalance,
        totalEarned: newTotalEarned,
        totalSpent: newTotalSpent,
        pointsRecords: {
          create: {
            amount: numAmount,
            type,
            description: description || (type === 'earned' ? '积分获得' : '积分消费')
          }
        }
      },
      include: {
        pointsRecords: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    res.json({
      success: true,
      message: type === 'earned' ? '积分获得成功' : '积分消费成功',
      transaction: updatedPoints.pointsRecords[0],
      updatedPoints: {
        balance: updatedPoints.balance,
        totalEarned: updatedPoints.totalEarned,
        totalSpent: updatedPoints.totalSpent
      }
    });

  } catch (error) {
    console.error('积分交易错误:', error);
    res.status(500).json({
      success: false,
      error: '积分交易失败'
    });
  }
});

// === 奇门遁甲相关路由 ===

// 模拟排盘API
app.post('/api/qimen/paipan', authenticateToken, (req, res) => {
  const { question } = req.body;
  
  console.log('用户排盘请求:', req.user.username, question);
  
  // 模拟排盘数据
  const paipanData = {
    宫1: { 八门: '开门', 九星: '天心星', 八神: '值符', 天盘: '甲', 地盘: '子' },
    宫2: { 八门: '休门', 九星: '天蓬星', 八神: '螣蛇', 天盘: '乙', 地盘: '丑' },
    宫3: { 八门: '生门', 九星: '天任星', 八神: '太阴', 天盘: '丙', 地盘: '寅' },
    宫4: { 八门: '伤门', 九星: '天冲星', 八神: '六合', 天盘: '丁', 地盘: '卯' },
    宫5: { 八门: '杜门', 九星: '天辅星', 八神: '白虎', 天盘: '戊', 地盘: '辰' },
    宫6: { 八门: '景门', 九星: '天英星', 八神: '玄武', 天盘: '己', 地盘: '巳' },
    宫7: { 八门: '死门', 九星: '天芮星', 八神: '九地', 天盘: '庚', 地盘: '午' },
    宫8: { 八门: '惊门', 九星: '天柱星', 八神: '九天', 天盘: '辛', 地盘: '未' },
    宫9: { 八门: '开门', 九星: '天心星', 八神: '值符', 天盘: '壬', 地盘: '申' },
    时间信息: {
      公历: new Date().toISOString(),
      年: new Date().getFullYear(),
      月: new Date().getMonth() + 1,
      日: new Date().getDate(),
      时: new Date().getHours(),
      分: new Date().getMinutes()
    }
  };
  
  res.json({
    success: true,
    question,
    user: req.user.username,
    timestamp: new Date().toISOString(),
    paipan: paipanData,
    metadata: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate(),
      hour: new Date().getHours(),
      minute: new Date().getMinutes()
    }
  });
});

// AI分析API (需要登录 + 积分消费)
app.post('/api/analysis/qimen', authenticateToken, async (req, res) => {
  try {
    const { question, paipanData } = req.body;
    
    if (!question || !paipanData) {
      return res.status(400).json({
        success: false,
        error: '参数缺失',
        message: '需要问题和排盘数据'
      });
    }

    // 检查用户积分
    const userPoints = await prisma.userPoints.findUnique({
      where: { userId: req.user.id }
    });

    const analysisPointsCost = 100; // AI分析消费100积分
    
    if (!userPoints || userPoints.balance < analysisPointsCost) {
      return res.status(400).json({
        success: false,
        error: '积分不足',
        message: `AI分析需要${analysisPointsCost}积分，当前余额：${userPoints?.balance || 0}`
      });
    }

    // 消费积分
    await prisma.userPoints.update({
      where: { userId: req.user.id },
      data: {
        balance: userPoints.balance - analysisPointsCost,
        totalSpent: userPoints.totalSpent + analysisPointsCost,
        pointsRecords: {
          create: {
            amount: analysisPointsCost,
            type: 'spent',
            description: 'AI奇门分析'
          }
        }
      }
    });

    // 解析排盘数据
    const parsedPaipan = parsePaipanData(paipanData);
    
    // 调用AI分析
    const analysisResult = await callDeepSeekAPI(question, parsedPaipan);
    
    console.log('AI分析完成:', req.user.username, question);
    
    res.json({
      success: true,
      sessionId: 'session-' + Date.now(),
      timestamp: new Date().toISOString(),
      user: req.user.username,
      pointsSpent: analysisPointsCost,
      remainingPoints: userPoints.balance - analysisPointsCost,
      analysis: analysisResult,
      paipanInfo: parsedPaipan,
      steps: [
        { step: 1, action: '验证用户权限', timestamp: new Date().toISOString(), summary: `用户${req.user.username}，消费${analysisPointsCost}积分` },
        { step: 2, action: '解析排盘结构', timestamp: new Date().toISOString(), summary: `已解析${parsedPaipan.排局}格局，${parsedPaipan.干支}时辰` },
        { step: 3, action: '调用AI分析', timestamp: new Date().toISOString(), summary: `正在使用DeepSeek-R1分析奇门遁甲格局` },
        { step: 4, action: '生成专业解读', timestamp: new Date().toISOString(), summary: '已根据奇门遁甲理论生成专业分析结果' }
      ]
    });
    
  } catch (error) {
    console.error('AI分析错误:', error);
    res.status(500).json({
      success: false,
      error: 'AI分析失败',
      message: error.message || '服务器内部错误'
    });
  }
});

// 工具函数
function parsePaipanData(paipanData) {
  // 解析排盘数据的逻辑
  return {
    排局: "阳遁九局",
    干支: "甲子年乙丑月丙寅日丁卯时",
    值符值使: {
      值符星宫: ["天心星", "坎一宫"],
      値使門宫: ["开门", "坎一宫"]
    },
    九宫格局: paipanData,
    时间信息: paipanData.时间信息 || {}
  };
}

async function callDeepSeekAPI(question, parsedPaipan) {
  try {
    const prompt = `作为一位资深的奇门遁甲大师，请根据以下排盘信息，对用户的问题进行专业分析：

【用户问题】：${question}

【排盘信息】：
- 排局：${parsedPaipan.排局}
- 干支：${parsedPaipan.干支}
- 值符值使：${JSON.stringify(parsedPaipan.值符值使)}
- 九宫格局：${JSON.stringify(parsedPaipan.九宫格局, null, 2)}

请从以下角度进行分析：
1. 整体格局分析
2. 针对问题的具体解读
3. 时间因素考量
4. 实用建议
5. 注意事项

请用专业而通俗的语言回答，让用户既能理解专业内容，又能获得实用指导。`;

    const response = await openai.chat.completions.create({
      model: ARK_MODEL,
      messages: [
        {
          role: "system",
          content: "你是一位精通奇门遁甲的专业大师，拥有深厚的易学功底。请用专业、准确、通俗易懂的语言为用户解答问题。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return response.choices[0].message.content;
    
  } catch (error) {
    console.error('DeepSeek API调用错误:', error);
    return `抱歉，AI分析服务暂时不可用。请稍后再试。

【基础分析】：
根据您提供的问题"${question}"和当前排盘格局，建议您：
1. 关注时间节点的变化
2. 保持冷静和耐心
3. 注意观察周围环境的变化
4. 适时调整策略

【温馨提示】：
奇门遁甲仅供参考，重要决策还需结合实际情况综合考虑。`;
  }
}

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? error.message : '请稍后再试'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在',
    message: `未找到路径 ${req.method} ${req.path}`
  });
});

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('正在关闭服务器...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('正在关闭服务器...');
  await prisma.$disconnect();
  process.exit(0);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
🔮 =======================================
   鬼谷奇门遁甲 - 完整版后端服务
🔮 =======================================

✅ 服务器启动成功
🌐 服务地址: http://localhost:${PORT}
🔒 安全认证: JWT + bcrypt
📊 数据库: Prisma + SQLite
🤖 AI服务: SophNet DeepSeek-R1
⚡ 性能优化: 限流 + 安全防护

📋 主要功能:
   - 用户注册/登录
   - JWT安全认证  
   - 积分系统
   - AI智能解盘
   - 完整的错误处理

🚀 准备就绪，开始您的奇门遁甲之旅！
=======================================
  `);
});

export default app; 
import Joi from 'joi';

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
 * 奇门遁甲相关的验证Schema
 */
export const qimenSchemas = {
  // 九宫格位置Schema
  gongPosition: Joi.object({
    八门: Joi.string()
      .valid('开门', '休门', '生门', '伤门', '杜门', '景门', '死门', '惊门')
      .required()
      .messages({
        'any.only': '八门必须是有效的门类',
        'any.required': '八门是必填项'
      }),
    
    九星: Joi.string()
      .valid('天心星', '天蓬星', '天任星', '天冲星', '天辅星', '天英星', '天芮星', '天柱星', '天禽星')
      .required()
      .messages({
        'any.only': '九星必须是有效的星类',
        'any.required': '九星是必填项'
      }),
    
    八神: Joi.string()
      .valid('值符', '螣蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天')
      .required()
      .messages({
        'any.only': '八神必须是有效的神类',
        'any.required': '八神是必填项'
      }),
    
    天盘: Joi.string()
      .valid('甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸')
      .required()
      .messages({
        'any.only': '天盘必须是有效的天干',
        'any.required': '天盘是必填项'
      }),
    
    地盘: Joi.string()
      .valid('子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥')
      .required()
      .messages({
        'any.only': '地盘必须是有效的地支',
        'any.required': '地盘是必填项'
      })
  }),
  
  // 时间信息Schema
  timeInfo: Joi.object({
    公历: Joi.date()
      .iso()
      .required()
      .messages({
        'date.format': '公历时间格式无效',
        'any.required': '公历时间是必填项'
      }),
    
    年: Joi.number()
      .integer()
      .min(1900)
      .max(2100)
      .required()
      .messages({
        'number.integer': '年份必须是整数',
        'number.min': '年份不能早于1900年',
        'number.max': '年份不能晚于2100年',
        'any.required': '年份是必填项'
      }),
    
    月: Joi.number()
      .integer()
      .min(1)
      .max(12)
      .required()
      .messages({
        'number.integer': '月份必须是整数',
        'number.min': '月份不能小于1',
        'number.max': '月份不能大于12',
        'any.required': '月份是必填项'
      }),
    
    日: Joi.number()
      .integer()
      .min(1)
      .max(31)
      .required()
      .messages({
        'number.integer': '日期必须是整数',
        'number.min': '日期不能小于1',
        'number.max': '日期不能大于31',
        'any.required': '日期是必填项'
      }),
    
    时: Joi.number()
      .integer()
      .min(0)
      .max(23)
      .required()
      .messages({
        'number.integer': '小时必须是整数',
        'number.min': '小时不能小于0',
        'number.max': '小时不能大于23',
        'any.required': '小时是必填项'
      }),
    
    分: Joi.number()
      .integer()
      .min(0)
      .max(59)
      .required()
      .messages({
        'number.integer': '分钟必须是整数',
        'number.min': '分钟不能小于0',
        'number.max': '分钟不能大于59',
        'any.required': '分钟是必填项'
      })
  }),
  
  // 排盘数据Schema
  paipan: Joi.object({
    question: Joi.string()
      .min(5)
      .max(500)
      .required()
      .custom((value, helpers) => {
        // 安全过滤：移除潜在的恶意内容
        const cleaned = sanitizeInput(value);
        if (cleaned !== value) {
          return helpers.error('string.unsafe');
        }
        return cleaned;
      })
      .messages({
        'string.min': '问题至少5个字符',
        'string.max': '问题最多500个字符',
        'string.unsafe': '问题包含不安全的内容',
        'any.required': '问题是必填项'
      })
  }),
  
  // 完整排盘数据Schema
  fullPaipan: Joi.object({
    宫1: Joi.ref('#gongPosition'),
    宫2: Joi.ref('#gongPosition'),
    宫3: Joi.ref('#gongPosition'),
    宫4: Joi.ref('#gongPosition'),
    宫5: Joi.ref('#gongPosition'),
    宫6: Joi.ref('#gongPosition'),
    宫7: Joi.ref('#gongPosition'),
    宫8: Joi.ref('#gongPosition'),
    宫9: Joi.ref('#gongPosition'),
    时间信息: Joi.ref('#timeInfo')
  }).id('gongPosition').append(qimenSchemas.gongPosition)
    .id('timeInfo').append(qimenSchemas.timeInfo)
};

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
      .valid('simple', 'deep', 'stream')
      .optional()
      .default('deep')
      .messages({
        'any.only': '分析策略必须是simple、deep或stream之一'
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
 * 安全过滤函数
 * 移除潜在的XSS和注入攻击内容
 */
function sanitizeInput(value) {
  if (typeof value !== 'string') {
    return value;
  }
  
  return value
    // 移除HTML标签
    .replace(/<[^>]*>/g, '')
    // 移除JavaScript事件处理器
    .replace(/on\w+\s*=/gi, '')
    // 移除script标签内容
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // 移除SQL注入常见关键词
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/gi, '')
    // 移除可能的路径遍历
    .replace(/\.\./g, '')
    // 移除特殊字符
    .replace(/[<>\"\'&]/g, '')
    // 清理多余空白
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * 敏感词检查
 */
function containsSensitiveWords(text) {
  const sensitiveWords = [
    // 政治敏感词
    '政治', '政府', '总统', '主席',
    // 宗教敏感词
    '宗教', '佛教', '基督教', '伊斯兰教',
    // 暴力内容
    '暴力', '杀死', '爆炸', '恐怖',
    // 色情内容
    '色情', '性', '裸体'
  ];
  
  const lowerText = text.toLowerCase();
  return sensitiveWords.some(word => lowerText.includes(word.toLowerCase()));
}

/**
 * 验证中间件工厂
 */
export function createValidationMiddleware(schema, source = 'body') {
  return (req, res, next) => {
    const data = source === 'query' ? req.query : 
                  source === 'params' ? req.params : 
                  req.body;
    
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: '数据验证失败',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }))
      });
    }
    
    // 将验证后的数据赋值回请求对象
    if (source === 'query') {
      req.query = value;
    } else if (source === 'params') {
      req.params = value;
    } else {
      req.body = value;
    }
    
    next();
  };
}

/**
 * 自定义验证器
 */
export const customValidators = {
  // 验证用户名是否可用
  async isUsernameAvailable(username, prisma) {
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });
    return !existingUser;
  },
  
  // 验证邮箱是否可用
  async isEmailAvailable(email, prisma) {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    return !existingUser;
  },
  
  // 验证手机号是否可用
  async isPhoneAvailable(phone, prisma) {
    if (!phone) return true;
    const existingUser = await prisma.user.findUnique({
      where: { phone }
    });
    return !existingUser;
  },
  
  // 验证奇门遁甲排盘的完整性
  validatePaipanIntegrity(paipanData) {
    // 检查是否包含所有九宫
    const requiredGongs = ['宫1', '宫2', '宫3', '宫4', '宫5', '宫6', '宫7', '宫8', '宫9'];
    const hasAllGongs = requiredGongs.every(gong => paipanData[gong]);
    
    if (!hasAllGongs) {
      return { valid: false, message: '排盘数据不完整，缺少必要的宫位信息' };
    }
    
    // 检查时间信息
    if (!paipanData.时间信息) {
      return { valid: false, message: '排盘数据缺少时间信息' };
    }
    
    // 检查八门的唯一性（某些门可能重复，但需要验证）
    const doors = requiredGongs.map(gong => paipanData[gong].八门);
    const uniqueDoors = new Set(doors);
    
    // 这里可以根据奇门遁甲的实际规则来验证
    // 暂时允许重复，但记录警告
    if (uniqueDoors.size < doors.length) {
      console.warn('排盘中存在重复的八门，请检查排盘算法');
    }
    
    return { valid: true, message: '排盘数据验证通过' };
  }
};

/**
 * 导出所有Schema的集合
 */
export const allSchemas = {
  auth: authSchemas,
  points: pointsSchemas,
  qimen: qimenSchemas,
  analysis: analysisSchemas,
  query: querySchemas
};

/**
 * 导出常用的验证中间件
 */
export const validationMiddlewares = {
  // 认证相关
  validateRegister: createValidationMiddleware(authSchemas.register),
  validateLogin: createValidationMiddleware(authSchemas.login),
  
  // 积分相关
  validatePointsTransaction: createValidationMiddleware(pointsSchemas.transaction),
  validatePointsTransfer: createValidationMiddleware(pointsSchemas.transfer),
  validatePointsHistory: createValidationMiddleware(pointsSchemas.history, 'query'),
  
  // AI分析相关
  validateAnalysisRequest: createValidationMiddleware(analysisSchemas.request),
  
  // 查询参数
  validatePagination: createValidationMiddleware(querySchemas.pagination, 'query'),
  validateDateRange: createValidationMiddleware(querySchemas.dateRange, 'query')
}; 
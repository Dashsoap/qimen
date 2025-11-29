import Joi from 'joi';
import { sanitizeInput } from './common.js';

/**
 * 奇门遁甲相关的验证Schema
 */

// 九宫格位置Schema
const gongPosition = Joi.object({
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
});

// 时间信息Schema
const timeInfo = Joi.object({
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
});

export const qimenSchemas = {
  gongPosition,
  timeInfo,
  
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
    宫1: gongPosition,
    宫2: gongPosition,
    宫3: gongPosition,
    宫4: gongPosition,
    宫5: gongPosition,
    宫6: gongPosition,
    宫7: gongPosition,
    宫8: gongPosition,
    宫9: gongPosition,
    时间信息: timeInfo
  })
};

/**
 * 验证奇门遁甲排盘的完整性
 */
export function validatePaipanIntegrity(paipanData) {
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






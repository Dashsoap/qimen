/**
 * 排盘数据处理工具
 * 提供奇门遁甲排盘数据的解析和格式化功能
 */

/**
 * 验证排盘数据完整性
 * @param {object} paipanData - 排盘数据
 * @returns {object} 验证结果
 */
export function validatePaipanData(paipanData) {
  const errors = [];
  const warnings = [];
  
  if (!paipanData) {
    return {
      isValid: false,
      errors: ['排盘数据为空'],
      warnings: []
    };
  }
  
  // 检查必需字段
  if (!paipanData.排局) {
    errors.push('缺少排局信息');
  }
  
  if (!paipanData.干支) {
    warnings.push('缺少干支信息');
  }
  
  if (!paipanData.值符值使) {
    warnings.push('缺少值符值使信息');
  }
  
  if (!paipanData.九宫格局 || typeof paipanData.九宫格局 !== 'object') {
    errors.push('九宫格局数据无效或缺失');
  } else {
    // 检查九宫数据完整性（应该有9个宫位）
    const palaceCount = Object.keys(paipanData.九宫格局).length;
    if (palaceCount !== 9) {
      warnings.push(`九宫格局不完整，当前仅有${palaceCount}个宫位`);
    }
  }
  
  if (!paipanData.时间信息) {
    warnings.push('缺少时间信息');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 解析排盘数据
 * @param {object} paipanData - 原始排盘数据
 * @returns {object} 解析后的数据
 */
export function parsePaipanData(paipanData) {
  if (!paipanData) {
    console.warn('排盘数据为空，使用默认数据');
    return getDefaultPaipanData();
  }

  const parsedData = {
    排局: paipanData.排局 || "数据缺失",
    干支: paipanData.干支 || "数据缺失",
    值符值使: paipanData.值符值使 || {},
    九宫格局: paipanData.九宫格局 || {},
    时间信息: paipanData.时间信息 || {},
    原始数据: paipanData
  };

  // 统计信息
  parsedData.统计 = {
    九宫格局数量: Object.keys(parsedData.九宫格局).length,
    是否完整: Object.keys(parsedData.九宫格局).length === 9,
    数据来源: paipanData.来源 || 'unknown'
  };

  console.log('🔍 解析排盘数据结果:', {
    排局: parsedData.排局,
    干支: parsedData.干支,
    九宫格局数量: parsedData.统计.九宫格局数量,
    是否完整: parsedData.统计.是否完整
  });

  return parsedData;
}

/**
 * 获取默认排盘数据
 * @returns {object} 默认数据
 */
export function getDefaultPaipanData() {
  return {
    排局: "数据缺失",
    干支: "数据缺失",
    值符值使: {},
    九宫格局: {},
    时间信息: {},
    统计: {
      九宫格局数量: 0,
      是否完整: false,
      数据来源: 'default'
    }
  };
}

/**
 * 格式化排盘数据为文本
 * @param {object} paipanData - 排盘数据
 * @returns {string} 格式化后的文本
 */
export function formatPaipanDataToText(paipanData) {
  if (!paipanData) return '无排盘数据';
  
  const lines = [];
  
  lines.push('【奇门遁甲排盘】');
  lines.push(`排局：${paipanData.排局 || '未知'}`);
  lines.push(`干支：${paipanData.干支 || '未知'}`);
  
  if (paipanData.值符值使 && Object.keys(paipanData.值符值使).length > 0) {
    lines.push(`值符：${paipanData.值符值使.值符 || '未知'}`);
    lines.push(`值使：${paipanData.值符值使.值使 || '未知'}`);
  }
  
  if (paipanData.时间信息 && Object.keys(paipanData.时间信息).length > 0) {
    lines.push('');
    lines.push('【时间信息】');
    if (paipanData.时间信息.公历) lines.push(`公历：${paipanData.时间信息.公历}`);
    if (paipanData.时间信息.农历) lines.push(`农历：${paipanData.时间信息.农历}`);
    if (paipanData.时间信息.时辰) lines.push(`时辰：${paipanData.时间信息.时辰}`);
  }
  
  if (paipanData.九宫格局 && Object.keys(paipanData.九宫格局).length > 0) {
    lines.push('');
    lines.push('【九宫格局】');
    Object.entries(paipanData.九宫格局).forEach(([key, palace]) => {
      if (palace.宫位) {
        const info = [];
        if (palace.八门) info.push(`${palace.八门}`);
        if (palace.九星) info.push(`${palace.九星}`);
        if (palace.天干) info.push(`${palace.天干}`);
        lines.push(`${palace.宫位}: ${info.join('、')}`);
      }
    });
  }
  
  return lines.join('\n');
}

/**
 * 提取关键信息
 * @param {object} paipanData - 排盘数据
 * @returns {object} 关键信息
 */
export function extractKeyInfo(paipanData) {
  if (!paipanData) return {};
  
  return {
    排局: paipanData.排局,
    干支: paipanData.干支,
    值符: paipanData.值符值使?.值符,
    值使: paipanData.值符值使?.值使,
    时辰: paipanData.时间信息?.时辰,
    日期: paipanData.时间信息?.公历,
    宫位数量: Object.keys(paipanData.九宫格局 || {}).length
  };
}

/**
 * 压缩排盘数据（用于存储或传输）
 * @param {object} paipanData - 完整排盘数据
 * @returns {object} 压缩后的数据
 */
export function compressPaipanData(paipanData) {
  if (!paipanData) return null;
  
  return {
    局: paipanData.排局,
    支: paipanData.干支,
    符使: paipanData.值符值使,
    宫: paipanData.九宫格局,
    时: paipanData.时间信息,
    _compressed: true,
    _version: '1.0'
  };
}

/**
 * 解压排盘数据
 * @param {object} compressedData - 压缩的数据
 * @returns {object} 完整排盘数据
 */
export function decompressPaipanData(compressedData) {
  if (!compressedData || !compressedData._compressed) {
    return compressedData;
  }
  
  return {
    排局: compressedData.局,
    干支: compressedData.支,
    值符值使: compressedData.符使,
    九宫格局: compressedData.宫,
    时间信息: compressedData.时
  };
}

/**
 * 计算排盘数据的哈希值（用于缓存键）
 * @param {object} paipanData - 排盘数据
 * @returns {string} 哈希值
 */
export function getPaipanDataHash(paipanData) {
  if (!paipanData) return 'null';
  
  const keyInfo = extractKeyInfo(paipanData);
  const hashString = JSON.stringify(keyInfo);
  
  // 简单哈希函数
  let hash = 0;
  for (let i = 0; i < hashString.length; i++) {
    const char = hashString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return 'paipan_' + Math.abs(hash).toString(36);
}

/**
 * 比较两个排盘数据是否相同
 * @param {object} data1 - 排盘数据1
 * @param {object} data2 - 排盘数据2
 * @returns {boolean} 是否相同
 */
export function comparePaipanData(data1, data2) {
  if (!data1 && !data2) return true;
  if (!data1 || !data2) return false;
  
  return (
    data1.排局 === data2.排局 &&
    data1.干支 === data2.干支 &&
    JSON.stringify(data1.值符值使) === JSON.stringify(data2.值符值使) &&
    JSON.stringify(data1.时间信息) === JSON.stringify(data2.时间信息)
  );
}


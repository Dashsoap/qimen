/**
 * 排盘数据优化工具
 * 将复杂的排盘数据转换为AI分析需要的核心信息
 */

/**
 * 优化排盘数据格式，提取AI需要的核心信息
 * @param {Object} panData - 原始排盘数据
 * @returns {Object} 优化后的排盘数据
 */
export const optimizePaipanData = (panData) => {
  if (!panData) return null;

  // 提取核心信息
  const optimizedData = {
    排局: panData.排局 || '',
    干支: panData.干支 || '',
    值符值使: panData.值符值使 || {},
    九宫格局: {},
    时间信息: {
      节气: panData.節氣 || '',
      旬空: panData.旬空 || {},
      马星: panData.馬星 || {}
    }
  };

  // 转换九宫格局数据
  if (panData.gongs && Array.isArray(panData.gongs)) {
    panData.gongs.forEach(gong => {
      // 跳过中宫，因为它通常不参与奇门分析
      if (gong.name !== '中') {
        optimizedData.九宫格局[`${gong.name}宫`] = {
          八门: gong.八门 || '',
          九星: gong.九星 || '',
          八神: gong.八神 || '',
          天盘: gong.天盘 || '',
          地盘: gong.地盘 || '',
          暗干: gong.暗干 || ''
        };
      }
    });
  }

  return optimizedData;
};

/**
 * 验证排盘数据的完整性
 * @param {Object} paipanData - 排盘数据
 * @returns {Object} 验证结果 { isValid, missingFields, suggestions }
 */
export const validatePaipanData = (paipanData) => {
  const result = {
    isValid: true,
    missingFields: [],
    suggestions: []
  };

  if (!paipanData) {
    result.isValid = false;
    result.missingFields.push('整个排盘数据');
    result.suggestions.push('请先进行排盘');
    return result;
  }

  // 检查必要字段
  const requiredFields = ['排局', '干支', '值符值使'];
  
  requiredFields.forEach(field => {
    if (!paipanData[field]) {
      result.isValid = false;
      result.missingFields.push(field);
    }
  });

  // 检查九宫格局
  if (!paipanData.九宫格局 || Object.keys(paipanData.九宫格局).length === 0) {
    result.isValid = false;
    result.missingFields.push('九宫格局');
    result.suggestions.push('九宫格局数据缺失，可能影响分析准确性');
  }

  // 给出建议
  if (result.missingFields.length > 0) {
    result.suggestions.push(`缺少以下关键信息：${result.missingFields.join('、')}`);
    result.suggestions.push('建议重新排盘以获取完整数据');
  }

  return result;
};

/**
 * 获取排盘数据的摘要信息
 * @param {Object} paipanData - 排盘数据
 * @returns {string} 排盘摘要
 */
export const getPaipanSummary = (paipanData) => {
  if (!paipanData) return '暂无排盘数据';

  const parts = [];
  
  if (paipanData.排局) parts.push(paipanData.排局);
  if (paipanData.干支) parts.push(paipanData.干支);
  if (paipanData.时间信息?.节气) parts.push(paipanData.时间信息.节气);

  return parts.length > 0 ? parts.join(' | ') : '排盘数据不完整';
};

/**
 * 检查是否为高质量排盘数据
 * @param {Object} paipanData - 排盘数据
 * @returns {Object} 质量评估结果
 */
export const assessDataQuality = (paipanData) => {
  const assessment = {
    score: 0,
    level: 'poor', // poor, fair, good, excellent
    details: []
  };

  if (!paipanData) {
    assessment.details.push('无排盘数据');
    return assessment;
  }

  // 基础信息评分 (40分)
  if (paipanData.排局) {
    assessment.score += 15;
    assessment.details.push('✓ 排局信息完整');
  } else {
    assessment.details.push('✗ 缺少排局信息');
  }

  if (paipanData.干支) {
    assessment.score += 15;
    assessment.details.push('✓ 干支信息完整');
  } else {
    assessment.details.push('✗ 缺少干支信息');
  }

  if (paipanData.值符值使) {
    assessment.score += 10;
    assessment.details.push('✓ 值符值使信息完整');
  } else {
    assessment.details.push('✗ 缺少值符值使信息');
  }

  // 九宫格局评分 (40分)
  const gongCount = Object.keys(paipanData.九宫格局 || {}).length;
  if (gongCount >= 8) {
    assessment.score += 40;
    assessment.details.push('✓ 九宫格局数据完整');
  } else if (gongCount >= 6) {
    assessment.score += 30;
    assessment.details.push('△ 九宫格局数据基本完整');
  } else if (gongCount >= 3) {
    assessment.score += 15;
    assessment.details.push('△ 九宫格局数据不完整');
  } else {
    assessment.details.push('✗ 九宫格局数据缺失严重');
  }

  // 时间信息评分 (20分)
  if (paipanData.时间信息) {
    const timeFields = ['节气', '旬空', '马星'];
    const presentFields = timeFields.filter(field => paipanData.时间信息[field]);
    assessment.score += (presentFields.length / timeFields.length) * 20;
    assessment.details.push(`✓ 时间信息完整度: ${presentFields.length}/${timeFields.length}`);
  } else {
    assessment.details.push('✗ 缺少时间信息');
  }

  // 确定质量等级
  if (assessment.score >= 90) {
    assessment.level = 'excellent';
  } else if (assessment.score >= 70) {
    assessment.level = 'good';
  } else if (assessment.score >= 50) {
    assessment.level = 'fair';
  } else {
    assessment.level = 'poor';
  }

  return assessment;
};

/**
 * 获取数据质量等级的中文描述
 * @param {string} level - 质量等级
 * @returns {string} 中文描述
 */
export const getQualityLevelText = (level) => {
  const levels = {
    excellent: '优秀',
    good: '良好', 
    fair: '一般',
    poor: '较差'
  };
  return levels[level] || '未知';
};

/**
 * 获取数据质量对应的颜色
 * @param {string} level - 质量等级
 * @returns {string} 颜色值
 */
export const getQualityColor = (level) => {
  const colors = {
    excellent: '#52c41a',
    good: '#1890ff',
    fair: '#faad14',
    poor: '#ff4d4f'
  };
  return colors[level] || '#666';
}; 
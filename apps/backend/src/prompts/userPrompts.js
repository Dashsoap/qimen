/**
 * 奇门遁甲 AI 分析系统 - User Prompts
 * 定义各种分析模式的用户提示词构建函数
 */

import { getCurrentTimeInfo } from './systemPrompts.js';

/**
 * 构建简单分析的用户提示词
 * @param {string} question - 用户问题
 * @param {Object} parsedPaipan - 解析后的排盘数据
 * @returns {string} 用户提示词
 */
export function buildSimplePrompt(question, parsedPaipan) {
  const currentTimeInfo = getCurrentTimeInfo();

  return `# 奇门遁甲分析任务

## ⏰ 当前时间基准
**实际时间**: ${currentTimeInfo.时间}
**基准年份**: ${currentTimeInfo.年份}年

⚠️ **重要提醒**: 所有时间建议必须基于当前实际时间，不可使用过去的年份！

## 用户问题
${question}

## 排盘信息
- **排局**: ${parsedPaipan.排局}
- **干支**: ${parsedPaipan.干支}
- **值符值使**: ${JSON.stringify(parsedPaipan.值符值使)}

## 分析要求
请作为奇门遁甲专家，用300字以内简洁语言提供：
1. **核心判断**: 针对问题的直接回答（吉/凶/平/待定）
2. **主要依据**: 基于哪些关键符号和组合
3. **实用建议**: 具体可操作的建议（1-2条）
4. **时机提醒**: 最佳行动时间或注意节点（必须是${currentTimeInfo.年份}年之后的时间）

## 回答风格
- 语言简洁专业，避免冗长描述
- 突出重点，条理清晰
`;
}

/**
 * 构建深度分析的用户提示词
 * @param {string} question - 用户问题
 * @param {Object} parsedPaipan - 解析后的排盘数据
 * @returns {string} 用户提示词
 */
export function buildDeepPrompt(question, parsedPaipan) {
  const currentTimeInfo = getCurrentTimeInfo();

  return `# 奇门遁甲大师解盘任务

## 🎯 分析任务
**用户问题**: ${question}

## ⏰ 当前时间基准
**实际时间**: ${currentTimeInfo.时间}
**基准年份**: ${currentTimeInfo.年份}年
**基准月份**: ${currentTimeInfo.月份}月

⚠️ **重要提醒**: 所有时间相关的分析和建议必须基于上述当前实际时间，绝对不可使用过去的年份！

## 📊 系统提供的排盘信息
\`\`\`json
{
  "排局": "${parsedPaipan.排局}",
  "干支": "${parsedPaipan.干支}",
  "值符值使": ${JSON.stringify(parsedPaipan.值符值使, null, 2)},
  "九宫格局": ${JSON.stringify(parsedPaipan.九宫格局, null, 2)},
  "时间信息": ${JSON.stringify(parsedPaipan.时间信息 || {}, null, 2)}
}
\`\`\`

## 📋 解盘要求
请严格按照以下专业格式进行解读：

### 📊 盘面确认
【盘法】时家/地家/人盘 【局数】阳/阴遁第X局 【值符】X神落X宫 【值使】X门落X宫 【用神】X宫（说明选取理由）

### 👤 卦主现状分析
【主要特征】基于问题推测的3-5个关键特征
【盘面对应】这些特征在盘面中的体现
【验证结论】盘面与推测情况的吻合度评估

### 🔍 详细盘面分析
**【用神分析】**
- 用神所处环境（乘门临神组合）
- 吉凶格局判断
- 与值符值使关系

**【三传分析】**
- 初传：X宫情况与象意
- 中传：X宫情况与象意  
- 末传：X宫情况与象意
- 三传路径综合研判

**【重点宫位分析】**
- 重点宫位1：组合与象意
- 重点宫位2：组合与象意

### ⚖️ 吉凶判断
【总体格局】吉/凶/中平，原因分析
【有利因素】3-5点关键有利因素
【不利因素】3-5点需注意的风险点
【吉利方位】具体方位及理由
【吉利时段】⚠️ 必须从${currentTimeInfo.年份}年${currentTimeInfo.月份}月开始的未来时间点

### 🧭 行动建议
【核心策略】1-2条总体策略建议
【具体行动】3-5条可执行的具体行动
【避忌要点】2-3条需要规避的行为
【时机选择】最佳行动时机建议（必须是${currentTimeInfo.年份}年之后的时间）

### 🔮 预测与验证
【短期预测】未来7天内可能发生的情况
【中期预测】未来1个月内的发展趋势
【验证要点】用户可关注的验证预测准确性的关键事件或迹象

### 📚 知识延伸
【理论解释】针对本次解盘中的1-2个重要概念进行简明解释
【应用启示】此盘面对未来类似情境的参考价值

---
**【奇门解读仅供参考，重要决策请综合理性判断。本解读基于传统奇门理论，非决定性预言，请辩证看待。奇门遁甲作为中华文化瑰宝，重在智慧启迪而非命运决定。】**`;
}

/**
 * 构建专业大师解盘的用户提示词
 * @param {string} question - 用户问题
 * @param {Object} parsedPaipan - 解析后的排盘数据
 * @returns {string} 用户提示词
 */
export function buildMasterPrompt(question, parsedPaipan) {
  const currentTimeInfo = getCurrentTimeInfo();

  return `# 奇门遁甲大师解盘任务

## 🎯 分析任务
**用户问题**: ${question}

## ⏰ 当前时间基准
**实际时间**: ${currentTimeInfo.时间}
**基准年份**: ${currentTimeInfo.年份}年
**基准月份**: ${currentTimeInfo.月份}月

⚠️ **重要提醒**: 所有时间相关的分析和建议必须基于上述当前实际时间，绝对不可使用过去的年份！

## 📊 系统提供的排盘信息
\`\`\`json
{
  "排局": "${parsedPaipan.排局}",
  "干支": "${parsedPaipan.干支}",
  "值符值使": ${JSON.stringify(parsedPaipan.值符值使, null, 2)},
  "九宫格局": ${JSON.stringify(parsedPaipan.九宫格局, null, 2)},
  "时间信息": ${JSON.stringify(parsedPaipan.时间信息 || {}, null, 2)}
}
\`\`\`

## 📋 解盘要求
请严格按照以下专业格式进行解读：

### 📊 盘面确认
【盘法】时家/地家/人盘 【局数】阳/阴遁第X局 【值符】X神落X宫 【值使】X门落X宫 【用神】X宫（说明选取理由）

### 👤 卦主现状分析
【主要特征】基于问题推测的3-5个关键特征
【盘面对应】这些特征在盘面中的体现
【验证结论】盘面与推测情况的吻合度评估

### 🔍 详细盘面分析
**【用神分析】**
- 用神所处环境（乘门临神组合）
- 吉凶格局判断
- 与值符值使关系

**【三传分析】**
- 初传：X宫情况与象意
- 中传：X宫情况与象意  
- 末传：X宫情况与象意
- 三传路径综合研判

**【重点宫位分析】**
- 重点宫位1：组合与象意
- 重点宫位2：组合与象意

### ⚖️ 吉凶判断
【总体格局】吉/凶/中平，原因分析
【有利因素】3-5点关键有利因素
【不利因素】3-5点需注意的风险点
【吉利方位】具体方位及理由
【吉利时段】⚠️ 必须从${currentTimeInfo.年份}年${currentTimeInfo.月份}月开始的未来时间点，如：${currentTimeInfo.年份}年某月某日

### 🧭 行动建议
【核心策略】1-2条总体策略建议
【具体行动】3-5条可执行的具体行动
【避忌要点】2-3条需要规避的行为
【时机选择】最佳行动时机建议（必须是${currentTimeInfo.年份}年之后的时间）

### 🔮 预测与验证
【短期预测】未来7天内可能发生的情况
【中期预测】未来1个月内的发展趋势
【验证要点】用户可关注的验证预测准确性的关键事件或迹象

### 📚 知识延伸
【理论解释】针对本次解盘中的1-2个重要概念进行简明解释
【应用启示】此盘面对未来类似情境的参考价值

---
**【奇门解读仅供参考，重要决策请综合理性判断。本解读基于传统奇门理论，非决定性预言，请辩证看待。奇门遁甲作为中华文化瑰宝，重在智慧启迪而非命运决定。】**`;
}






import axios from 'axios';
import { getDatabase } from '../database/init.js';
import { QimenTools } from '../mcp/QimenTools.js';

export class QimenAgent {
  constructor() {
    // 豆包API配置
    this.apiKey = process.env.ARK_API_KEY;
    this.baseURL = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
    this.model = process.env.ARK_MODEL || 'deepseek-r1-250528';
    
    this.tools = new QimenTools();
    this.maxDepth = parseInt(process.env.MAX_ANALYSIS_DEPTH) || 5;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      await this.tools.initialize();
      this.isInitialized = true;
      console.log('🤖 AI Agent 初始化完成 (豆包API)');
    } catch (error) {
      console.error('❌ AI Agent 初始化失败:', error);
      throw error;
    }
  }

  // 调用豆包API
  async callAI(messages, systemPrompt, maxTokens = 1000) {
    try {
      const requestData = {
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        max_tokens: maxTokens,
        temperature: 0.7
      };

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('豆包API调用失败:', error.response?.data || error.message);
      throw new Error(`AI调用失败: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 主要分析入口
  async analyzeQimen(paipanData, question, sessionId) {
    if (!this.isInitialized) {
      throw new Error('AI Agent 未初始化');
    }

    const analysisSteps = [];
    const startTime = Date.now();

    try {
      console.log(`🔮 开始分析奇门遁甲：${question}`);
      
      // 第一步：解析排盘数据
      const paipanAnalysis = await this.analyzePaipanStructure(paipanData);
      analysisSteps.push({
        step: 1,
        action: '解析排盘结构',
        result: paipanAnalysis,
        timestamp: new Date().toISOString()
      });

      // 第二步：查询符号含义
      const symbolMeanings = await this.getSymbolMeanings(paipanData);
      analysisSteps.push({
        step: 2,
        action: '查询符号含义',
        result: symbolMeanings,
        timestamp: new Date().toISOString()
      });

      // 第三步：分析组合关系
      const combinationAnalysis = await this.analyzeCombinations(paipanData, symbolMeanings);
      analysisSteps.push({
        step: 3,
        action: '分析符号组合',
        result: combinationAnalysis,
        timestamp: new Date().toISOString()
      });

      // 第四步：根据问题生成回答
      const finalAnswer = await this.generateAnswer(
        question, 
        paipanData, 
        symbolMeanings, 
        combinationAnalysis
      );
      analysisSteps.push({
        step: 4,
        action: '生成最终回答',
        result: finalAnswer,
        timestamp: new Date().toISOString()
      });

      // 计算置信度
      const confidence = this.calculateConfidence(analysisSteps);

      // 保存分析历史
      await this.saveAnalysisHistory({
        sessionId,
        question,
        paipanData,
        analysisResult: finalAnswer,
        analysisSteps,
        confidence,
        executionTime: Date.now() - startTime
      });

      return {
        answer: finalAnswer.content,
        confidence,
        analysisSteps,
        executionTime: Date.now() - startTime,
        metadata: {
          paipanSummary: paipanAnalysis.summary,
          keySymbols: symbolMeanings.keySymbols,
          criticalCombinations: combinationAnalysis.criticalCombinations
        }
      };

    } catch (error) {
      console.error('🔮 分析过程出错:', error);
      throw new Error(`分析失败: ${error.message}`);
    }
  }

  // 解析排盘结构
  async analyzePaipanStructure(paipanData) {
    const systemPrompt = `你是一位精通奇门遁甲排盘解析的专家，具备以下专业能力：

🔍 **解析重点**：
1. **时间分析**: 准确识别年月日时干支，判断节气位置和旺衰状态
2. **格局识别**: 分析九宫分布，识别特殊格局和异常组合
3. **用神定位**: 根据问题类型确定用神，分析其落宫和状态
4. **值符值使**: 明确值符星和值使门的位置及其影响力
5. **整体评估**: 综合判断排盘的吉凶趋势和能量分布

🎯 **分析要求**：
- 使用标准的奇门术语，但配以简洁解释
- 突出影响预测结果的关键要素
- 为后续深度分析提供坚实基础
- 保持客观专业，避免主观臆测

请按照以上框架，对排盘进行结构化解析。`;

    const content = await this.callAI([{
      role: "user",
      content: `请分析这个奇门遁甲排盘：\n\n${JSON.stringify(paipanData, null, 2)}`
    }], systemPrompt, 1000);

    return {
      content,
      summary: this.extractPaipanSummary(content),
      keyPoints: this.extractKeyPoints(content)
    };
  }

  // 获取符号含义
  async getSymbolMeanings(paipanData) {
    const db = await getDatabase();
    const symbols = new Set();
    const meanings = {};

    // 提取所有符号
    Object.values(paipanData).forEach(gong => {
      if (typeof gong === 'object') {
        if (gong.八门) symbols.add(`bamen:${gong.八门}`);
        if (gong.九星) symbols.add(`jiuxing:天${gong.九星}`);
        if (gong.八神) symbols.add(`bashen:${gong.八神}`);
        if (gong.天盘) symbols.add(`tiangan:${gong.天盘}`);
        if (gong.地盘) symbols.add(`dizhi:${gong.地盘}`);
      }
    });

    // 查询数据库获取含义
    for (const symbol of symbols) {
      const [type, name] = symbol.split(':');
      const result = await db.get(
        'SELECT meaning, properties FROM symbols WHERE type = ? AND name = ?',
        [type, name]
      );
      
      if (result) {
        meanings[symbol] = {
          meaning: result.meaning,
          properties: JSON.parse(result.properties || '{}')
        };
      }
    }

    return {
      meanings,
      keySymbols: this.identifyKeySymbols(meanings),
      symbolCount: symbols.size
    };
  }

  // 分析符号组合
  async analyzeCombinations(paipanData, symbolMeanings) {
    const systemPrompt = `你是奇门遁甲组合分析的权威专家，专精于符号间的相互作用分析：

🔄 **组合分析框架**：

### 1. 三元组合分析
- **门星神配合**: 分析每宫八门、九星、八神的协调程度
- **吉凶判定**: 识别大吉、中吉、平和、小凶、大凶等级别
- **特殊效应**: 注意相冲、相合、相生、相克的特殊影响

### 2. 天地盘关系
- **干支生克**: 分析天盘地盘干支的五行关系
- **旺衰状态**: 判断各干支在当前时空的力量强弱
- **变化趋势**: 预测组合力量的发展方向

### 3. 格局识别
- **经典格局**: 三奇得使、青龙返首、白虎猖狂等
- **特殊现象**: 伏吟、反吟、空亡、马星等
- **组合效应**: 多重格局的叠加影响

🎯 **分析重点**：
- 突出对用神最有影响的关键组合
- 识别可能改变预测结果的决定性因素
- 提供清晰的吉凶判断依据
- 为最终解答提供有力支撑

请按此框架进行专业的组合分析。`;

    const combinationData = {
      paipan: paipanData,
      symbolMeanings: symbolMeanings.meanings
    };

    const content = await this.callAI([{
      role: "user",
      content: `请分析这些符号组合的吉凶含义：\n\n${JSON.stringify(combinationData, null, 2)}`
    }], systemPrompt, 1500);

    return {
      content,
      criticalCombinations: this.extractCriticalCombinations(content),
      overallTrend: this.extractOverallTrend(content)
    };
  }

  // 生成最终答案
  async generateAnswer(question, paipanData, symbolMeanings, combinationAnalysis) {
    const systemPrompt = `你是一位德高望重的奇门遁甲宗师，集理论大成与实战精华于一身：

🌟 **宗师特质**：
- 通晓《奇门遁甲》千年传承，融汇历代名家心法
- 善于将深奥理论转化为实用智慧
- 语言既有传统文化底蕴，又具现代实用价值
- 保持适度神秘感，体现玄学大师风范

📋 **回答结构**：

### 1. 开篇定论
- 直接回答咨询问题的核心（吉/凶/平/变）
- 给出整体趋势的明确判断
- 提供可信度评估

### 2. 理论依据
- 详细解释分析的奇门理论基础
- 指出关键的符号组合和格局
- 说明用神状态和力量强弱

### 3. 实战建议
- 提供3-5条具体可行的行动指导
- 每条建议都要有明确的奇门依据
- 区分轻重缓急，突出重点

### 4. 时机把握
- 指出最佳行动时间窗口
- 提醒需要注意的关键节点
- 预测短期内的变化趋势

### 5. 禁忌警示
- 明确指出需要避免的行为
- 解释违背的后果和影响
- 提供化解或补救的方法

🎭 **语言风格**：
- 用词典雅而不失亲和力
- 保持权威性的同时体现人文关怀
- 理论阐述简明扼要，建议具体可行
- 体现奇门遁甲的文化深度和实用价值

请按此框架为咨询者提供专业而温暖的指导。`;

    const analysisContext = {
      question,
      paipanData,
      symbolMeanings: symbolMeanings.meanings,
      keySymbols: symbolMeanings.keySymbols,
      combinationAnalysis: combinationAnalysis.content,
      criticalCombinations: combinationAnalysis.criticalCombinations
    };

    const content = await this.callAI([{
      role: "user",
      content: `请根据奇门遁甲分析为以下问题提供专业解答：

问题：${question}

分析依据：
${JSON.stringify(analysisContext, null, 2)}`
    }], systemPrompt, 2000);

    return {
      content,
      reasoning: this.extractReasoning(content),
      recommendations: this.extractRecommendations(content)
    };
  }

  // 计算分析置信度
  calculateConfidence(analysisSteps) {
    let totalConfidence = 0;
    let stepCount = 0;

    analysisSteps.forEach(step => {
      if (step.result && step.result.content) {
        // 基于内容长度和关键词密度计算置信度
        const contentLength = step.result.content.length;
        const keywordDensity = this.calculateKeywordDensity(step.result.content);
        const stepConfidence = Math.min(0.9, (contentLength / 1000 + keywordDensity) / 2);
        
        totalConfidence += stepConfidence;
        stepCount++;
      }
    });

    return stepCount > 0 ? (totalConfidence / stepCount) : 0.5;
  }

  // 保存分析历史
  async saveAnalysisHistory(analysisData) {
    const db = await getDatabase();
    
    await db.run(`
      INSERT INTO analysis_history 
      (session_id, question, paipan_data, analysis_result, analysis_steps, confidence_score)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      analysisData.sessionId,
      analysisData.question,
      JSON.stringify(analysisData.paipanData),
      JSON.stringify(analysisData.analysisResult),
      JSON.stringify(analysisData.analysisSteps),
      analysisData.confidence
    ]);
  }

  // 辅助方法
  extractPaipanSummary(content) {
    // 提取排盘摘要的关键信息
    const lines = content.split('\n');
    return lines.slice(0, 3).join(' ').substring(0, 200) + '...';
  }

  extractKeyPoints(content) {
    // 提取要点
    const matches = content.match(/[0-9]\.\s*([^。]+)/g);
    return matches ? matches.slice(0, 5) : [];
  }

  identifyKeySymbols(meanings) {
    // 识别关键符号
    return Object.keys(meanings).slice(0, 8); // 返回前8个符号
  }

  extractCriticalCombinations(content) {
    // 提取关键组合
    return ['待实现具体提取逻辑'];
  }

  extractOverallTrend(content) {
    // 提取整体趋势
    if (content.includes('吉') && !content.includes('凶')) return '吉';
    if (content.includes('凶') && !content.includes('吉')) return '凶';
    return '中平';
  }

  extractReasoning(content) {
    // 提取推理过程
    return content.match(/因为|由于|根据[\s\S]*?，/g) || [];
  }

  extractRecommendations(content) {
    // 提取建议
    return content.match(/建议|应该|宜|忌[\s\S]*?[。！]/g) || [];
  }

  calculateKeywordDensity(content) {
    // 计算关键词密度
    const keywords = ['奇门', '遁甲', '八门', '九星', '八神', '天干', '地支'];
    let count = 0;
    keywords.forEach(keyword => {
      count += (content.match(new RegExp(keyword, 'g')) || []).length;
    });
    return Math.min(1, count / 20);
  }
}
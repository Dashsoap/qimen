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
    const systemPrompt = `你是一位资深的奇门遁甲大师，擅长解析排盘结构。

请分析给定的奇门遁甲排盘数据，提取关键信息：
1. 时间信息（年月日时、节气等）
2. 九宫格局分布
3. 用神落宫情况
4. 值符值使位置
5. 整体格局特点

请用专业术语和易懂的语言描述。`;

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
    const systemPrompt = `你是奇门遁甲组合分析专家。

根据各宫的符号组合，分析其吉凶含义：
1. 门、星、神的组合关系
2. 天地盘干支的生克制化
3. 特殊格局（伏吟、反吟、三奇等）
4. 用神的旺衰状态

请重点分析对预测结果有重要影响的组合。`;

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
    const systemPrompt = `你是一位德高望重的奇门遁甲大师，具有深厚的理论基础和丰富的实践经验。

你的任务是根据奇门遁甲排盘为咨询者提供准确、有用的建议：

1. 直接回答咨询问题
2. 解释分析依据（基于哪些符号和组合）
3. 给出具体建议和注意事项
4. 提供时机把握的指导
5. 保持神秘而权威的语言风格

请确保回答：
- 专业而易懂
- 有理有据
- 实用性强
- 语言优美，符合玄学大师的身份`;

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
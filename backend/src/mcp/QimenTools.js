import { getDatabase } from '../database/init.js';

export class QimenTools {
  constructor() {
    this.tools = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // 注册工具
      this.registerTool('query_symbol_meaning', this.querySymbolMeaning.bind(this));
      this.registerTool('search_combinations', this.searchCombinations.bind(this));
      this.registerTool('calculate_wuxing', this.calculateWuxingRelation.bind(this));
      this.registerTool('find_similar_cases', this.findSimilarCases.bind(this));
      this.registerTool('get_time_energy', this.getTimeEnergy.bind(this));
      
      this.isInitialized = true;
      // MCP工具集初始化完成
    } catch (error) {
      console.error('❌ MCP工具集初始化失败:', error);
      throw error;
    }
  }

  registerTool(name, handler) {
    this.tools.set(name, {
      name,
      handler,
      description: this.getToolDescription(name)
    });
  }

  getToolDescription(name) {
    const descriptions = {
      'query_symbol_meaning': '查询奇门遁甲符号的含义和属性',
      'search_combinations': '搜索符号组合的解释和案例',
      'calculate_wuxing': '计算五行生克制化关系',
      'find_similar_cases': '查找相似的历史分析案例',
      'get_time_energy': '获取特定时间的能量状态'
    };
    return descriptions[name] || '未知工具';
  }

  async callTool(toolName, parameters) {
    if (!this.isInitialized) {
      throw new Error('MCP工具集未初始化');
    }

    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`未找到工具: ${toolName}`);
    }

    const startTime = Date.now();
    try {
      const result = await tool.handler(parameters);
      
      // 记录工具调用日志
      await this.logToolCall(toolName, parameters, result, Date.now() - startTime, true);
      
      return result;
    } catch (error) {
      await this.logToolCall(toolName, parameters, error.message, Date.now() - startTime, false);
      throw error;
    }
  }

  // 工具1: 查询符号含义
  async querySymbolMeaning(params) {
    const { type, name } = params;
    const db = await getDatabase();
    
    const result = await db.get(
      'SELECT * FROM symbols WHERE type = ? AND name = ?',
      [type, name]
    );
    
    if (!result) {
      return {
        found: false,
        message: `未找到符号: ${type}:${name}`
      };
    }

    return {
      found: true,
      symbol: {
        name: result.name,
        type: result.type,
        meaning: result.meaning,
        properties: JSON.parse(result.properties || '{}'),
        description: result.description
      }
    };
  }

  // 工具2: 搜索组合解释
  async searchCombinations(params) {
    const { elements, context } = params;
    const db = await getDatabase();
    
    // 生成组合键
    const combinationKey = this.generateCombinationKey(elements);
    
    // 先精确匹配
    let result = await db.get(
      'SELECT * FROM combinations WHERE combination_key = ?',
      [combinationKey]
    );
    
    if (!result) {
      // 模糊匹配
      const elementStr = JSON.stringify(elements);
      result = await db.get(
        'SELECT * FROM combinations WHERE elements LIKE ? ORDER BY confidence DESC LIMIT 1',
        [`%${elementStr.substring(1, elementStr.length - 1)}%`]
      );
    }
    
    if (!result) {
      return {
        found: false,
        suggestion: '建议基于基础符号含义进行组合分析'
      };
    }

    return {
      found: true,
      combination: {
        elements: JSON.parse(result.elements),
        interpretation: result.interpretation,
        context: result.context,
        confidence: result.confidence,
        source: result.source
      }
    };
  }

  // 工具3: 计算五行关系
  async calculateWuxingRelation(params) {
    const { element1, element2 } = params;
    
    const wuxingMap = {
      '金': 4, '木': 0, '水': 1, '火': 2, '土': 3
    };
    
    const relations = ['生', '克', '被生', '被克', '同类'];
    
    const e1 = wuxingMap[element1];
    const e2 = wuxingMap[element2];
    
    if (e1 === undefined || e2 === undefined) {
      return {
        error: '未知的五行元素'
      };
    }
    
    let relation;
    if (e1 === e2) {
      relation = '同类';
    } else if ((e1 + 1) % 5 === e2) {
      relation = '生';
    } else if ((e1 + 2) % 5 === e2) {
      relation = '克';
    } else if ((e2 + 1) % 5 === e1) {
      relation = '被生';
    } else {
      relation = '被克';
    }
    
    return {
      element1,
      element2,
      relation,
      strength: this.calculateRelationStrength(relation),
      interpretation: this.getWuxingInterpretation(relation)
    };
  }

  // 工具4: 查找相似案例
  async findSimilarCases(params) {
    const { question, paipanData, limit = 3 } = params;
    const db = await getDatabase();
    
    // 简化的相似性查询（实际应用中可使用向量相似性）
    const results = await db.all(`
      SELECT question, analysis_result, confidence_score, created_at
      FROM analysis_history 
      WHERE question LIKE ? OR analysis_result LIKE ?
      ORDER BY confidence_score DESC, created_at DESC
      LIMIT ?
    `, [`%${question.substring(0, 10)}%`, `%${question.substring(0, 10)}%`, limit]);
    
    return {
      found: results.length > 0,
      cases: results.map(r => ({
        question: r.question,
        analysis: JSON.parse(r.analysis_result),
        confidence: r.confidence_score,
        date: r.created_at
      }))
    };
  }

  // 工具5: 获取时间能量
  async getTimeEnergy(params) {
    const { year, month, day, hour } = params;
    
    // 简化的时间能量计算
    const tianganDizhi = this.calculateTianganDizhi(year, month, day, hour);
    const wuxingEnergy = this.calculateWuxingEnergy(tianganDizhi);
    const seasonalInfluence = this.getSeasonalInfluence(month);
    
    return {
      tianganDizhi,
      wuxingEnergy,
      seasonalInfluence,
      overallEnergy: this.calculateOverallEnergy(wuxingEnergy, seasonalInfluence)
    };
  }

  // 辅助方法
  generateCombinationKey(elements) {
    return Object.keys(elements).sort().map(key => `${key}:${elements[key]}`).join('|');
  }

  calculateRelationStrength(relation) {
    const strengthMap = {
      '生': 0.8,
      '被生': 0.6,
      '同类': 0.5,
      '克': -0.7,
      '被克': -0.9
    };
    return strengthMap[relation] || 0;
  }

  getWuxingInterpretation(relation) {
    const interpretations = {
      '生': '相生关系，有助益，能够促进发展',
      '被生': '得到助力，但主动性较弱',
      '同类': '性质相同，平和稳定',
      '克': '制约对方，可能产生冲突',
      '被克': '受到制约，可能遇到阻碍'
    };
    return interpretations[relation] || '关系不明确';
  }

  calculateTianganDizhi(year, month, day, hour) {
    // 简化的天干地支计算
    const tiangan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const dizhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    
    return {
      year: `${tiangan[(year - 4) % 10]}${dizhi[(year - 4) % 12]}`,
      month: `${tiangan[(month - 1) % 10]}${dizhi[(month - 1) % 12]}`,
      day: `${tiangan[(day - 1) % 10]}${dizhi[(day - 1) % 12]}`,
      hour: `${tiangan[Math.floor(hour / 2) % 10]}${dizhi[Math.floor(hour / 2) % 12]}`
    };
  }

  calculateWuxingEnergy(tianganDizhi) {
    // 简化的五行能量计算
    const wuxingCount = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
    
    // 统计天干地支的五行分布
    Object.values(tianganDizhi).forEach(ganzhi => {
      const tg = ganzhi[0];
      const dz = ganzhi[1];
      
      // 天干五行
      if (['甲', '乙'].includes(tg)) wuxingCount.木++;
      else if (['丙', '丁'].includes(tg)) wuxingCount.火++;
      else if (['戊', '己'].includes(tg)) wuxingCount.土++;
      else if (['庚', '辛'].includes(tg)) wuxingCount.金++;
      else if (['壬', '癸'].includes(tg)) wuxingCount.水++;
      
      // 地支五行（简化）
      if (['寅', '卯'].includes(dz)) wuxingCount.木++;
      else if (['巳', '午'].includes(dz)) wuxingCount.火++;
      else if (['申', '酉'].includes(dz)) wuxingCount.金++;
      else if (['亥', '子'].includes(dz)) wuxingCount.水++;
      else wuxingCount.土++;
    });
    
    return wuxingCount;
  }

  getSeasonalInfluence(month) {
    const seasons = {
      春: [3, 4, 5],
      夏: [6, 7, 8],
      秋: [9, 10, 11],
      冬: [12, 1, 2]
    };
    
    for (const [season, months] of Object.entries(seasons)) {
      if (months.includes(month)) {
        return {
          season,
          dominantWuxing: this.getSeasonWuxing(season),
          influence: 0.8
        };
      }
    }
    
    return { season: '未知', dominantWuxing: '土', influence: 0.5 };
  }

  getSeasonWuxing(season) {
    const seasonWuxing = {
      春: '木',
      夏: '火',
      秋: '金',
      冬: '水'
    };
    return seasonWuxing[season] || '土';
  }

  calculateOverallEnergy(wuxingEnergy, seasonalInfluence) {
    const total = Object.values(wuxingEnergy).reduce((sum, count) => sum + count, 0);
    const balance = Math.min(...Object.values(wuxingEnergy)) / Math.max(...Object.values(wuxingEnergy));
    
    return {
      balance: balance,
      strength: total,
      harmony: balance > 0.6 ? '和谐' : balance > 0.3 ? '一般' : '失衡',
      recommendation: balance > 0.6 ? '能量平衡，适宜行动' : '能量失衡，需要调整'
    };
  }

  async logToolCall(toolName, parameters, result, executionTime, success) {
    try {
      const db = await getDatabase();
      await db.run(`
        INSERT INTO mcp_tool_logs 
        (tool_name, parameters, result, execution_time, success)
        VALUES (?, ?, ?, ?, ?)
      `, [
        toolName,
        JSON.stringify(parameters),
        JSON.stringify(result),
        executionTime,
        success
      ]);
    } catch (error) {
      console.error('记录工具调用日志失败:', error);
    }
  }
} 
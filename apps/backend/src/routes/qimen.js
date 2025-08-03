import express from 'express';
import { getDatabase } from '../database/init.js';

const router = express.Router();

// GET /api/qimen/symbols - 获取符号列表
router.get('/symbols', async (req, res) => {
  try {
    const { type } = req.query;
    const db = await getDatabase();
    
    let query = 'SELECT * FROM symbols';
    let params = [];
    
    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY type, name';
    
    const symbols = await db.all(query, params);
    
    res.json({
      success: true,
      symbols: symbols.map(s => ({
        id: s.id,
        type: s.type,
        name: s.name,
        meaning: s.meaning,
        properties: JSON.parse(s.properties || '{}'),
        description: s.description
      })),
      total: symbols.length
    });
    
  } catch (error) {
    console.error('获取符号列表出错:', error);
    res.status(500).json({
      error: '获取符号列表失败',
      message: error.message
    });
  }
});

// GET /api/qimen/symbols/:type - 获取特定类型的符号
router.get('/symbols/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const db = await getDatabase();
    
    const symbols = await db.all(
      'SELECT * FROM symbols WHERE type = ? ORDER BY name',
      [type]
    );
    
    if (symbols.length === 0) {
      return res.status(404).json({
        error: '符号类型不存在',
        type
      });
    }
    
    res.json({
      success: true,
      type,
      symbols: symbols.map(s => ({
        name: s.name,
        meaning: s.meaning,
        properties: JSON.parse(s.properties || '{}'),
        description: s.description
      }))
    });
    
  } catch (error) {
    console.error('获取符号类型出错:', error);
    res.status(500).json({
      error: '获取符号类型失败',
      message: error.message
    });
  }
});

// POST /api/qimen/paipan - 自动排盘（使用当前时间）
router.post('/paipan', async (req, res) => {
  try {
    const { question, customTime } = req.body;
    
    if (!question) {
      return res.status(400).json({
        error: '缺少问题',
        message: '请提供要分析的问题'
      });
    }
    
    // 使用当前时间或自定义时间
    const targetTime = customTime ? new Date(customTime) : new Date();
    
    // 生成排盘数据
    const paipanData = await generatePaipan(targetTime);
    
    res.json({
      success: true,
      question,
      timestamp: targetTime.toISOString(),
      paipan: paipanData,
      metadata: {
        year: targetTime.getFullYear(),
        month: targetTime.getMonth() + 1,
        day: targetTime.getDate(),
        hour: targetTime.getHours(),
        minute: targetTime.getMinutes()
      }
    });
    
  } catch (error) {
    console.error('排盘出错:', error);
    res.status(500).json({
      error: '排盘失败',
      message: error.message
    });
  }
});

// GET /api/qimen/combinations - 获取组合解释
router.get('/combinations', async (req, res) => {
  try {
    const { context } = req.query;
    const db = await getDatabase();
    
    let query = 'SELECT * FROM combinations';
    let params = [];
    
    if (context) {
      query += ' WHERE context LIKE ?';
      params.push(`%${context}%`);
    }
    
    query += ' ORDER BY confidence DESC LIMIT 20';
    
    const combinations = await db.all(query, params);
    
    res.json({
      success: true,
      combinations: combinations.map(c => ({
        id: c.id,
        elements: JSON.parse(c.elements),
        interpretation: c.interpretation,
        context: c.context,
        confidence: c.confidence,
        source: c.source
      })),
      total: combinations.length
    });
    
  } catch (error) {
    console.error('获取组合解释出错:', error);
    res.status(500).json({
      error: '获取组合解释失败',
      message: error.message
    });
  }
});

// POST /api/qimen/combinations - 添加新的组合解释
router.post('/combinations', async (req, res) => {
  try {
    const { elements, interpretation, context, confidence = 0.8, source = '用户提供' } = req.body;
    
    if (!elements || !interpretation) {
      return res.status(400).json({
        error: '缺少必要参数',
        message: '需要提供元素组合(elements)和解释(interpretation)'
      });
    }
    
    const db = await getDatabase();
    
    // 生成组合键
    const combinationKey = generateCombinationKey(elements);
    
    // 检查是否已存在
    const existing = await db.get(
      'SELECT id FROM combinations WHERE combination_key = ?',
      [combinationKey]
    );
    
    if (existing) {
      return res.status(409).json({
        error: '组合已存在',
        message: '该组合解释已经存在于数据库中'
      });
    }
    
    // 插入新组合
    const result = await db.run(`
      INSERT INTO combinations 
      (combination_key, elements, interpretation, context, confidence, source)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      combinationKey,
      JSON.stringify(elements),
      interpretation,
      context,
      confidence,
      source
    ]);
    
    res.json({
      success: true,
      id: result.lastID,
      message: '组合解释已添加',
      combinationKey
    });
    
  } catch (error) {
    console.error('添加组合解释出错:', error);
    res.status(500).json({
      error: '添加组合解释失败',
      message: error.message
    });
  }
});

// GET /api/qimen/knowledge - 搜索知识库
router.get('/knowledge', async (req, res) => {
  try {
    const { q, category, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        error: '缺少搜索关键词'
      });
    }
    
    const db = await getDatabase();
    
    let query = `
      SELECT * FROM knowledge_base 
      WHERE (title LIKE ? OR content LIKE ? OR keywords LIKE ?)
    `;
    let params = [`%${q}%`, `%${q}%`, `%${q}%`];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY relevance_score DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const articles = await db.all(query, params);
    
    res.json({
      success: true,
      query: q,
      articles: articles.map(a => ({
        id: a.id,
        title: a.title,
        content: a.content.substring(0, 200) + '...',
        category: a.category,
        relevanceScore: a.relevance_score,
        keywords: a.keywords
      })),
      total: articles.length
    });
    
  } catch (error) {
    console.error('搜索知识库出错:', error);
    res.status(500).json({
      error: '搜索知识库失败',
      message: error.message
    });
  }
});

// 辅助函数：生成排盘数据
async function generatePaipan(targetTime) {
  // 这里实现奇门遁甲排盘算法
  // 为了示例，我们生成一个简化的排盘结构
  
  const bamen = ['休门', '生门', '伤门', '杜门', '景门', '死门', '惊门', '开门'];
  const jiuxing = ['蓬星', '任星', '冲星', '辅星', '英星', '芮星', '柱星', '心星', '禽星'];
  const bashen = ['值符', '螣蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天'];
  const tiangan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  
  const paipan = {};
  
  // 生成九宫数据
  for (let i = 1; i <= 9; i++) {
    paipan[`宫${i}`] = {
      宫位: i,
      八门: bamen[Math.floor(Math.random() * bamen.length)],
      九星: jiuxing[Math.floor(Math.random() * jiuxing.length)],
      八神: bashen[Math.floor(Math.random() * bashen.length)],
      天盘: tiangan[Math.floor(Math.random() * tiangan.length)],
      地盘: tiangan[Math.floor(Math.random() * tiangan.length)]
    };
  }
  
  // 添加时间信息
  paipan.时间信息 = {
    公历: targetTime.toISOString(),
    年: targetTime.getFullYear(),
    月: targetTime.getMonth() + 1,
    日: targetTime.getDate(),
    时: targetTime.getHours(),
    分: targetTime.getMinutes()
  };
  
  return paipan;
}

// 辅助函数：生成组合键
function generateCombinationKey(elements) {
  return Object.keys(elements)
    .sort()
    .map(key => `${key}:${elements[key]}`)
    .join('|');
}

export default router; 
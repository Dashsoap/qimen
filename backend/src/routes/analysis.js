import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { QimenAgent } from '../agents/QimenAgent.js';

const router = express.Router();
let qimenAgent = null;

// 初始化AI Agent
async function initAgent() {
  if (!qimenAgent) {
    qimenAgent = new QimenAgent();
    await qimenAgent.initialize();
  }
  return qimenAgent;
}

// POST /api/analysis/qimen - 奇门遁甲AI分析
router.post('/qimen', async (req, res) => {
  try {
    const { question, paipanData, sessionId } = req.body;
    
    // 验证必要参数
    if (!question || !paipanData) {
      return res.status(400).json({
        error: '缺少必要参数',
        message: '需要提供问题(question)和排盘数据(paipanData)'
      });
    }

    // 生成会话ID（如果没有提供）
    const currentSessionId = sessionId || uuidv4();
    
    console.log(`🔮 收到奇门遁甲分析请求 - 会话: ${currentSessionId}`);
    console.log(`📝 问题: ${question}`);
    
    // 初始化并调用AI Agent
    const agent = await initAgent();
    const analysisResult = await agent.analyzeQimen(
      paipanData, 
      question, 
      currentSessionId
    );
    
    // 返回分析结果
    res.json({
      success: true,
      sessionId: currentSessionId,
      timestamp: new Date().toISOString(),
      analysis: {
        answer: analysisResult.answer,
        confidence: analysisResult.confidence,
        executionTime: analysisResult.executionTime,
        metadata: analysisResult.metadata
      },
      steps: analysisResult.analysisSteps.map(step => ({
        step: step.step,
        action: step.action,
        timestamp: step.timestamp,
        summary: step.result?.summary || step.result?.content?.substring(0, 100) + '...'
      }))
    });
    
  } catch (error) {
    console.error('🔮 奇门遁甲分析出错:', error);
    
    res.status(500).json({
      error: '分析服务错误',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/analysis/quick - 快速分析（简化版）
router.post('/quick', async (req, res) => {
  try {
    const { question, paipanData } = req.body;
    
    if (!question || !paipanData) {
      return res.status(400).json({
        error: '缺少必要参数'
      });
    }

    const agent = await initAgent();
    
    // 简化分析流程
    const symbolMeanings = await agent.getSymbolMeanings(paipanData);
    const quickAnswer = await agent.generateAnswer(
      question, 
      paipanData, 
      symbolMeanings, 
      { content: '快速分析模式', criticalCombinations: [] }
    );
    
    res.json({
      success: true,
      answer: quickAnswer.content,
      confidence: 0.7, // 快速模式置信度较低
      type: 'quick_analysis',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('快速分析出错:', error);
    res.status(500).json({
      error: '快速分析失败',
      message: error.message
    });
  }
});

// GET /api/analysis/history/:sessionId - 获取分析历史
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { getDatabase } = await import('../database/init.js');
    const db = await getDatabase();
    
    const history = await db.all(`
      SELECT question, analysis_result, confidence_score, created_at
      FROM analysis_history 
      WHERE session_id = ?
      ORDER BY created_at DESC
    `, [sessionId]);
    
    res.json({
      success: true,
      sessionId,
      history: history.map(h => ({
        question: h.question,
        analysis: JSON.parse(h.analysis_result),
        confidence: h.confidence_score,
        timestamp: h.created_at
      }))
    });
    
  } catch (error) {
    console.error('获取历史记录出错:', error);
    res.status(500).json({
      error: '获取历史记录失败',
      message: error.message
    });
  }
});

// POST /api/analysis/feedback - 用户反馈
router.post('/feedback', async (req, res) => {
  try {
    const { sessionId, analysisId, rating, comment } = req.body;
    
    if (!sessionId || !rating) {
      return res.status(400).json({
        error: '缺少必要参数'
      });
    }
    
    const { getDatabase } = await import('../database/init.js');
    const db = await getDatabase();
    
    // 更新用户反馈
    await db.run(`
      UPDATE analysis_history 
      SET user_feedback = ?
      WHERE session_id = ? AND id = ?
    `, [rating, sessionId, analysisId]);
    
    res.json({
      success: true,
      message: '反馈已记录',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('记录反馈出错:', error);
    res.status(500).json({
      error: '记录反馈失败',
      message: error.message
    });
  }
});

// GET /api/analysis/stats - 分析统计
router.get('/stats', async (req, res) => {
  try {
    const { getDatabase } = await import('../database/init.js');
    const db = await getDatabase();
    
    // 获取统计数据
    const totalAnalysis = await db.get('SELECT COUNT(*) as count FROM analysis_history');
    const avgConfidence = await db.get('SELECT AVG(confidence_score) as avg FROM analysis_history');
    const avgRating = await db.get('SELECT AVG(user_feedback) as avg FROM analysis_history WHERE user_feedback IS NOT NULL');
    
    const topQuestions = await db.all(`
      SELECT question, COUNT(*) as count 
      FROM analysis_history 
      GROUP BY question 
      ORDER BY count DESC 
      LIMIT 5
    `);
    
    res.json({
      success: true,
      stats: {
        totalAnalysis: totalAnalysis.count,
        averageConfidence: Math.round(avgConfidence.avg * 100) / 100,
        averageRating: Math.round(avgRating.avg * 10) / 10,
        topQuestions: topQuestions
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('获取统计数据出错:', error);
    res.status(500).json({
      error: '获取统计数据失败',
      message: error.message
    });
  }
});

export default router; 
/**
 * AI分析控制器
 * 处理奇门遁甲AI分析相关的业务逻辑
 */
export class AnalysisController {
  constructor(aiService, pointsService, config) {
    this.aiService = aiService;
    this.pointsService = pointsService;
    this.config = config;
  }

  /**
   * 深度AI分析
   */
  async aiAnalysis(req, res) {
    await this.handleAIAnalysis(req, res, 'DEEP');
  }

  /**
   * 简单AI分析
   */
  async aiAnalysisSimple(req, res) {
    await this.handleAIAnalysis(req, res, 'SIMPLE');
  }

  /**
   * 流式AI分析
   */
  async aiAnalysisStream(req, res) {
    await this.handleAIAnalysis(req, res, 'STREAM', { 
      res, 
      sessionId: 'session-' + Date.now() 
    });
  }

  /**
   * 处理AI分析的通用方法
   */
  async handleAIAnalysis(req, res, strategy, options = {}) {
    try {
      const { question, paipanData } = req.body;
      
      if (!question || !paipanData) {
        return res.status(400).json({
          success: false,
          error: '参数缺失',
          message: '需要问题和排盘数据'
        });
      }

      // 检查并消费积分
      const pointsConfig = this.config.getPointsConfig();
      const analysisPointsCost = pointsConfig.analysisPointsCost;
      
      // 检查余额
      const balanceCheck = await this.pointsService.checkBalance(req.user.id, analysisPointsCost);
      if (!balanceCheck.sufficient) {
        return res.status(400).json({
          success: false,
          error: '积分不足',
          message: `AI分析需要${analysisPointsCost}积分，当前余额：${balanceCheck.currentBalance}`
        });
      }

      // 消费积分（使用事务确保原子性）
      const spendResult = await this.pointsService.spendPoints(
        req.user.id, 
        analysisPointsCost, 
        `AI奇门分析(${strategy})`
      );

      // 调用AI分析
      const analysisResult = await this.aiService.analyze(question, paipanData, strategy, options);
      
      // 如果是流式分析，不需要返回JSON响应
      if (strategy === 'STREAM') {
        return; // 响应已在流式处理中完成
      }

      console.log('AI分析完成:', req.user.username, strategy, question);
      
      res.json({
        ...analysisResult,
        user: req.user.username,
        pointsSpent: analysisPointsCost,
        remainingPoints: spendResult.newBalance,
        strategy: strategy
      });
      
    } catch (error) {
      console.error('AI分析错误:', error);
      res.status(500).json({
        success: false,
        error: 'AI分析失败',
        message: error.message || '服务器内部错误'
      });
    }
  }

  /**
   * 排盘API
   */
  paipan(req, res) {
    const { question } = req.body;
    
    const username = req.user ? req.user.username : '匿名用户';
    console.log('排盘请求:', username, question);
    
    // 模拟排盘数据
    const paipanData = {
      宫1: { 八门: '开门', 九星: '天心星', 八神: '值符', 天盘: '甲', 地盘: '子' },
      宫2: { 八门: '休门', 九星: '天蓬星', 八神: '螣蛇', 天盘: '乙', 地盘: '丑' },
      宫3: { 八门: '生门', 九星: '天任星', 八神: '太阴', 天盘: '丙', 地盘: '寅' },
      宫4: { 八门: '伤门', 九星: '天冲星', 八神: '六合', 天盘: '丁', 地盘: '卯' },
      宫5: { 八门: '杜门', 九星: '天辅星', 八神: '白虎', 天盘: '戊', 地盘: '辰' },
      宫6: { 八门: '景门', 九星: '天英星', 八神: '玄武', 天盘: '己', 地盘: '巳' },
      宫7: { 八门: '死门', 九星: '天芮星', 八神: '九地', 天盘: '庚', 地盘: '午' },
      宫8: { 八门: '惊门', 九星: '天柱星', 八神: '九天', 天盘: '辛', 地盘: '未' },
      宫9: { 八门: '开门', 九星: '天心星', 八神: '值符', 天盘: '壬', 地盘: '申' },
      时间信息: {
        公历: new Date().toISOString(),
        年: new Date().getFullYear(),
        月: new Date().getMonth() + 1,
        日: new Date().getDate(),
        时: new Date().getHours(),
        分: new Date().getMinutes()
      }
    };
    
    res.json({
      success: true,
      question,
      user: username,
      timestamp: new Date().toISOString(),
      paipan: paipanData,
      metadata: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
        hour: new Date().getHours(),
        minute: new Date().getMinutes()
      }
    });
  }
}

export function createAnalysisController(aiService, pointsService, config) {
  return new AnalysisController(aiService, pointsService, config);
}
/**
 * 积分控制器
 * 处理积分相关的业务逻辑
 */
export class PointsController {
  constructor(pointsService) {
    this.pointsService = pointsService;
  }

  /**
   * 获取积分信息
   */
  async getPoints(req, res) {
    try {
      const points = await this.pointsService.getUserPoints(req.user.id);
      
      if (!points) {
        return res.status(404).json({
          success: false,
          error: '积分记录不存在'
        });
      }

      res.json({
        success: true,
        points,
        cacheStats: this.pointsService.getCacheStats()
      });

    } catch (error) {
      console.error('获取积分错误:', error);
      res.status(500).json({
        success: false,
        error: '获取积分失败'
      });
    }
  }

  /**
   * 积分交易
   */
  async pointsTransaction(req, res) {
    try {
      const { amount, type, description } = req.body;

      if (!amount || !type || !['earned', 'spent'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: '参数错误'
        });
      }

      const numAmount = parseInt(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: '积分数量必须是正整数'
        });
      }

      let result;
      if (type === 'earned') {
        result = await this.pointsService.earnPoints(req.user.id, numAmount, description);
      } else {
        result = await this.pointsService.spendPoints(req.user.id, numAmount, description);
      }

      res.json({
        success: true,
        message: type === 'earned' ? '积分获得成功' : '积分消费成功',
        ...result
      });

    } catch (error) {
      console.error('积分交易错误:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 积分转账
   */
  async pointsTransfer(req, res) {
    try {
      const { toUserId, amount, description } = req.body;

      if (!toUserId || !amount) {
        return res.status(400).json({
          success: false,
          error: '缺少必要参数'
        });
      }

      const numAmount = parseInt(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: '转账金额必须是正整数'
        });
      }

      const result = await this.pointsService.transferPoints(
        req.user.id, 
        toUserId, 
        numAmount, 
        description || '积分转账'
      );

      res.json({
        success: true,
        message: '积分转账成功',
        ...result
      });

    } catch (error) {
      console.error('积分转账错误:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 获取积分历史
   */
  async getPointsHistory(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        type: req.query.type,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const history = await this.pointsService.getPointsHistory(req.user.id, options);

      res.json({
        success: true,
        ...history
      });

    } catch (error) {
      console.error('获取积分历史失败:', error);
      res.status(500).json({
        success: false,
        error: '获取积分历史失败'
      });
    }
  }
}

export function createPointsController(pointsService) {
  return new PointsController(pointsService);
}
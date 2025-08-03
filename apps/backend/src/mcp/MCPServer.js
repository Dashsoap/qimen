import { QimenTools } from './QimenTools.js';
import { Server } from 'node:http';

export class MCPServer {
  constructor() {
    this.port = process.env.MCP_SERVER_PORT || 3002;
    this.name = process.env.MCP_SERVER_NAME || 'qimen-tools';
    this.tools = new QimenTools();
    this.server = null;
    this.isRunning = false;
  }

  async start() {
    try {
      console.log(`🔌 启动MCP服务器: ${this.name}`);
      
      // 初始化工具集
      await this.tools.initialize();
      
      // 创建HTTP服务器
      this.server = new Server(this.handleRequest.bind(this));
      
      // 启动服务器
      this.server.listen(this.port, () => {
        this.isRunning = true;
        console.log(`✅ MCP服务器运行在端口 ${this.port}`);
      });
      
      // 错误处理
      this.server.on('error', (error) => {
        console.error('❌ MCP服务器错误:', error);
        this.isRunning = false;
      });
      
    } catch (error) {
      console.error('❌ MCP服务器启动失败:', error);
      throw error;
    }
  }

  async handleRequest(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 处理OPTIONS请求
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    try {
      const url = new URL(req.url, `http://localhost:${this.port}`);
      const path = url.pathname;
      
      // 路由处理
      if (path === '/tools' && req.method === 'GET') {
        await this.handleGetTools(req, res);
      } else if (path === '/call' && req.method === 'POST') {
        await this.handleToolCall(req, res);
      } else if (path === '/status' && req.method === 'GET') {
        await this.handleStatus(req, res);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found', path }));
      }
      
    } catch (error) {
      console.error('MCP请求处理错误:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Internal Server Error', 
        message: error.message 
      }));
    }
  }

  async handleGetTools(req, res) {
    try {
      const tools = Array.from(this.tools.tools.entries()).map(([name, tool]) => ({
        name,
        description: tool.description,
        parameters: this.getToolParameters(name)
      }));
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        server: this.name,
        tools,
        total: tools.length
      }));
      
    } catch (error) {
      console.error('获取工具列表错误:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  async handleToolCall(req, res) {
    try {
      const body = await this.readRequestBody(req);
      const { tool, parameters } = JSON.parse(body);
      
      if (!tool) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '缺少工具名称' }));
        return;
      }
      
      // 调用MCP工具
      
      const startTime = Date.now();
      const result = await this.tools.callTool(tool, parameters || {});
      const executionTime = Date.now() - startTime;
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        tool,
        result,
        executionTime,
        timestamp: new Date().toISOString()
      }));
      
    } catch (error) {
      console.error('工具调用错误:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: '工具调用失败', 
        message: error.message 
      }));
    }
  }

  async handleStatus(req, res) {
    try {
      const status = {
        server: this.name,
        port: this.port,
        running: this.isRunning,
        tools: {
          total: this.tools.tools.size,
          initialized: this.tools.isInitialized,
          available: Array.from(this.tools.tools.keys())
        },
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(status));
      
    } catch (error) {
      console.error('获取状态错误:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  getToolParameters(toolName) {
    // 返回每个工具的参数定义
    const parameterDefinitions = {
      'query_symbol_meaning': {
        type: { type: 'string', required: true, description: '符号类型' },
        name: { type: 'string', required: true, description: '符号名称' }
      },
      'search_combinations': {
        elements: { type: 'object', required: true, description: '元素组合' },
        context: { type: 'string', required: false, description: '应用语境' }
      },
      'calculate_wuxing': {
        element1: { type: 'string', required: true, description: '第一个五行元素' },
        element2: { type: 'string', required: true, description: '第二个五行元素' }
      },
      'find_similar_cases': {
        question: { type: 'string', required: true, description: '问题内容' },
        paipanData: { type: 'object', required: false, description: '排盘数据' },
        limit: { type: 'number', required: false, description: '返回数量限制' }
      },
      'get_time_energy': {
        year: { type: 'number', required: true, description: '年份' },
        month: { type: 'number', required: true, description: '月份' },
        day: { type: 'number', required: true, description: '日期' },
        hour: { type: 'number', required: true, description: '小时' }
      }
    };
    
    return parameterDefinitions[toolName] || {};
  }

  async readRequestBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        resolve(body);
      });
      req.on('error', reject);
    });
  }

  async stop() {
    if (this.server && this.isRunning) {
      this.server.close(() => {
        this.isRunning = false;
        console.log('🔌 MCP服务器已关闭');
      });
    }
  }

  // 测试工具调用
  async testTool(toolName, parameters) {
    try {
      console.log(`🧪 测试工具: ${toolName}`);
      const result = await this.tools.callTool(toolName, parameters);
      console.log('✅ 测试结果:', result);
      return result;
    } catch (error) {
      console.error('❌ 测试失败:', error);
      throw error;
    }
  }

  // 获取工具使用统计
  async getToolStats() {
    try {
      const { getDatabase } = await import('../database/init.js');
      const db = await getDatabase();
      
      const stats = await db.all(`
        SELECT 
          tool_name,
          COUNT(*) as call_count,
          AVG(execution_time) as avg_execution_time,
          SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as success_count,
          SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as error_count
        FROM mcp_tool_logs 
        GROUP BY tool_name
        ORDER BY call_count DESC
      `);
      
      return stats.map(s => ({
        toolName: s.tool_name,
        callCount: s.call_count,
        avgExecutionTime: Math.round(s.avg_execution_time),
        successCount: s.success_count,
        errorCount: s.error_count,
        successRate: Math.round((s.success_count / s.call_count) * 100)
      }));
      
    } catch (error) {
      console.error('获取工具统计失败:', error);
      return [];
    }
  }
} 
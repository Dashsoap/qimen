#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 导入服务
import { initDatabase } from './src/database/init.js';
import { QimenAgent } from './src/agents/QimenAgent.js';
import { MCPServer } from './src/mcp/MCPServer.js';

// 导入路由
import qimenRoutes from './src/routes/qimen.js';
import analysisRoutes from './src/routes/analysis.js';

// 配置
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: join(__dirname, 'config.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 路由
app.use('/api/qimen', qimenRoutes);
app.use('/api/analysis', analysisRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: 'connected',
      ai_agent: 'ready',
      mcp_server: 'running'
    }
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: '接口不存在',
    path: req.originalUrl
  });
});

// 启动服务
async function startServer() {
  try {
    console.log('🔮 正在启动奇门遁甲AI后端服务...');
    
    // 1. 初始化数据库
    console.log('📚 初始化数据库...');
    await initDatabase();
    
    // 2. 启动MCP服务器
    console.log('🔌 启动MCP工具服务器...');
    const mcpServer = new MCPServer();
    await mcpServer.start();
    
    // 3. 初始化AI Agent
    console.log('🤖 初始化AI Agent...');
    const qimenAgent = new QimenAgent();
    await qimenAgent.initialize();
    
    // 4. 启动HTTP服务器
    app.listen(PORT, () => {
      console.log(`
🎉 奇门遁甲AI后端服务启动成功！

📡 服务地址: http://localhost:${PORT}
🔮 健康检查: http://localhost:${PORT}/health
🤖 AI Agent: 已就绪 (豆包API DeepSeek-R1)
🔌 MCP服务器: 端口 ${process.env.MCP_SERVER_PORT || 3002}
📚 数据库: SQLite (${process.env.DB_PATH})

✨ 准备接收奇门遁甲分析请求...
      `);
    });
    
  } catch (error) {
    console.error('❌ 服务启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🔮 正在优雅关闭奇门遁甲AI服务...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔮 正在优雅关闭奇门遁甲AI服务...');
  process.exit(0);
});

// 启动
startServer().catch(console.error); 
# 🔮 奇门遁甲AI后端服务

基于Agent模式的智能奇门遁甲分析系统，集成豆包AI（DeepSeek-R1）、MCP工具链和专业知识库。

## 🌟 核心特性

### 🤖 AI Agent 架构
- **多步骤推理**：排盘解析 → 符号查询 → 组合分析 → 智能解答
- **豆包AI驱动**：使用火山引擎豆包API (DeepSeek-R1-250528模型)
- **专业知识库**：内置八门、九星、八神等传统奇门遁甲符号体系
- **智能工具调用**：通过MCP协议调用专业分析工具

### 🔧 MCP工具集
- `query_symbol_meaning` - 查询符号含义
- `search_combinations` - 搜索组合解释
- `calculate_wuxing` - 五行生克制化分析
- `find_similar_cases` - 历史案例检索
- `get_time_energy` - 时间能量分析

### 📚 数据库系统
- **符号库**：八门、九星、八神、天干、地支
- **组合库**：符号组合的传统解释
- **历史库**：AI分析历史和用户反馈
- **知识库**：奇门遁甲理论文献

## 🚀 快速开始

### 1. 环境准备
```bash
cd backend
npm install
```

### 2. 配置API密钥
编辑 `config.env` 文件：
```env
# 豆包 AI 配置 (火山引擎)
ARK_API_KEY=847716db-7e9f-4cef-8dbd-8c4d25f23d5a
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
ARK_MODEL=deepseek-r1-250528
```

### 3. 初始化数据库
```bash
npm run init-db
```

### 4. 启动服务
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## 📡 API接口

### 🔮 分析接口

#### POST `/api/analysis/qimen`
完整的奇门遁甲AI分析
```json
{
  "question": "我最近的事业运势如何？",
  "paipanData": {
    "宫1": {
      "八门": "开门",
      "九星": "天心星",
      "八神": "值符"
    }
  },
  "sessionId": "optional-session-id"
}
```

#### POST `/api/analysis/quick`
快速分析（简化版）
```json
{
  "question": "今天适合投资吗？",
  "paipanData": { /* 排盘数据 */ }
}
```

### 🎯 排盘接口

#### POST `/api/qimen/paipan`
自动排盘（使用当前时间）
```json
{
  "question": "关于感情的问题",
  "customTime": "2024-01-01T12:00:00Z" // 可选
}
```

### 📚 知识库接口

#### GET `/api/qimen/symbols?type=bamen`
获取符号列表

#### GET `/api/qimen/knowledge?q=奇门遁甲&category=基础理论`
搜索知识库

## 🏗️ 项目架构

```
backend/
├── src/
│   ├── agents/          # AI Agent核心
│   │   └── QimenAgent.js
│   ├── database/        # 数据库管理
│   │   └── init.js
│   ├── mcp/            # MCP工具服务
│   │   ├── MCPServer.js
│   │   └── QimenTools.js
│   ├── routes/         # API路由
│   │   ├── analysis.js
│   │   └── qimen.js
│   └── services/       # 业务服务
├── data/               # 数据库文件
├── logs/               # 日志文件
└── scripts/            # 脚本工具
```

## 🔍 工作流程

### 1. AI分析流程
```
用户问题 → 自动排盘 → AI Agent分析
    ↓
排盘解析 → 符号查询 → 组合分析 → 生成回答
    ↓
保存历史 → 返回结果
```

### 2. MCP工具调用
```
AI Agent → MCP Server → 专业工具 → 数据库查询
    ↓
工具结果 → 日志记录 → 返回Agent
```

## 🌐 服务状态

访问以下地址查看服务状态：
- 主服务：`http://localhost:3001/health`
- MCP服务器：`http://localhost:3002/status`

## 🔧 开发指南

### 添加新的分析工具
1. 在 `QimenTools.js` 中注册新工具
2. 实现工具逻辑
3. 更新 `MCPServer.js` 参数定义

### 扩展符号数据库
1. 修改 `init.js` 中的 `seedBasicData` 函数
2. 添加新的符号类型和含义
3. 重新运行 `npm run init-db`

### 自定义AI提示词
在 `QimenAgent.js` 中修改各步骤的 `systemPrompt`

## 📊 监控和日志

- 分析历史：存储在 `analysis_history` 表
- 工具调用：记录在 `mcp_tool_logs` 表  
- 用户反馈：通过 `/api/analysis/feedback` 收集
- 统计数据：通过 `/api/analysis/stats` 查看

## 🔒 安全特性

- API密钥环境变量管理
- CORS跨域保护
- 请求参数验证
- 错误信息脱敏

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License

---

**🔮 愿奇门遁甲的古老智慧，在AI的加持下，为现代人指引方向！** 
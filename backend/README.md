# 🔮 丁未奇门遁甲后端服务

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
完整的丁未奇门遁甲分析
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

# 🔮 丁未奇门遁甲遁甲 - 后端服务

完整版奇门遁甲应用的后端服务，提供用户认证、AI智能解盘、历史记录管理和收藏夹功能。

## 🚀 核心功能

### 1. 用户认证系统
- **注册/登录**: JWT令牌认证，bcrypt密码加密
- **积分系统**: 注册送1000积分，AI分析消费100积分
- **用户资料**: 完整的用户档案管理
- **订阅管理**: 支持多种会员计划

### 2. AI智能解盘
- **流式分析**: 实时响应的AI奇门遁甲分析
- **深度学习**: 基于SophNet DeepSeek-R1模型
- **专业解读**: 传统易学与现代AI的完美结合
- **排盘解析**: 自动解析奇门遁甲排盘数据

### 3. 历史记录系统 ⭐
- **自动保存**: AI分析完成后自动保存历史记录
- **搜索功能**: 支持按问题内容和标签搜索
- **分页查询**: 高效的数据分页加载
- **详情查看**: 完整的分析结果展示
- **记录管理**: 支持删除不需要的历史记录

### 4. 收藏夹功能 ⭐
- **智能收藏**: 一键收藏重要的分析结果
- **备注管理**: 为每个收藏添加个人备注
- **快速访问**: 便捷的收藏记录浏览
- **收藏同步**: 实时更新收藏状态
- **批量管理**: 高效的收藏记录管理

## 📊 数据库模型

### 新增模型

#### QimenRecord (历史记录)
```prisma
model QimenRecord {
  id          String   @id @default(uuid())
  userId      String   // 用户ID
  question    String   // 用户问题
  paipanData  String   // 排盘数据(JSON)
  analysis    String   // AI分析结果
  tags        String?  // 标签(逗号分隔)
  
  user        User     @relation(fields: [userId], references: [id])
  favorites   QimenFavorite[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId, createdAt])
}
```

#### QimenFavorite (收藏夹)
```prisma
model QimenFavorite {
  id          String   @id @default(uuid())
  userId      String   // 用户ID
  recordId    String   // 记录ID
  note        String?  // 收藏备注
  
  user        User     @relation(fields: [userId], references: [id])
  record      QimenRecord @relation(fields: [recordId], references: [id])
  
  createdAt   DateTime @default(now())
  
  @@unique([userId, recordId])
  @@index([userId, createdAt])
}
```

## 🔗 API接口

### 历史记录API

#### 获取历史记录列表
```http
GET /api/qimen/history?page=1&limit=20&search=关键词
Authorization: Bearer {token}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "uuid",
        "question": "今日运势如何？",
        "analysis": "AI分析结果...",
        "paipanData": {...},
        "isFavorited": true,
        "createdAt": "2024-01-01T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

#### 获取历史记录详情
```http
GET /api/qimen/history/{id}
Authorization: Bearer {token}
```

#### 删除历史记录
```http
DELETE /api/qimen/history/{id}
Authorization: Bearer {token}
```

### 收藏夹API

#### 获取收藏列表
```http
GET /api/qimen/favorites?page=1&limit=20
Authorization: Bearer {token}
```

#### 添加收藏
```http
POST /api/qimen/favorites
Authorization: Bearer {token}
Content-Type: application/json

{
  "recordId": "uuid",
  "note": "重要的分析结果"
}
```

#### 取消收藏
```http
DELETE /api/qimen/favorites/{recordId}
Authorization: Bearer {token}
```

#### 更新收藏备注
```http
PUT /api/qimen/favorites/{recordId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "note": "更新后的备注"
}
```

## 🛠 技术栈

- **运行时**: Node.js 18+
- **框架**: Express.js
- **数据库**: SQLite + Prisma ORM
- **认证**: JWT + bcrypt
- **AI服务**: SophNet DeepSeek-R1
- **安全**: Helmet + Rate Limiting
- **API**: RESTful + SSE(流式)

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 环境配置
创建 `config.env` 文件:
```env
# 数据库
DATABASE_URL="file:./dev.db"

# JWT密钥
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# AI服务配置
ARK_API_KEY="your-api-key"
ARK_BASE_URL="https://www.sophnet.com/api/open-apis/v1"
ARK_MODEL="DeepSeek-R1"

# 服务器配置
PORT=3001
BCRYPT_ROUNDS=12
```

### 数据库初始化
```bash
# 生成Prisma客户端
npx prisma generate

# 推送数据库schema
npx prisma db push
```

### 启动服务
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## 📈 性能优化

### 数据库优化
- **索引优化**: 为常用查询字段添加复合索引
- **分页查询**: 高效的offset-limit分页
- **关联查询**: 优化的include查询

### API优化
- **响应缓存**: 合理的缓存策略
- **请求限流**: 防止API滥用
- **数据压缩**: gzip压缩减少传输大小

### 安全增强
- **输入验证**: Joi schema验证
- **SQL注入防护**: Prisma自动防护
- **XSS防护**: Helmet安全头
- **CORS配置**: 严格的跨域策略

## 🔧 开发指南

### 添加新功能
1. **数据模型**: 在 `prisma/schema.prisma` 中定义
2. **API路由**: 在 `server.js` 中添加路由
3. **验证逻辑**: 使用Joi进行输入验证
4. **错误处理**: 统一的错误响应格式

### 测试API
```bash
# 健康检查
curl http://localhost:3001/health

# 用户注册
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"123456"}'
```

## 📝 更新日志

### v2.1.0 (最新)
- ✨ **新增**: 历史记录系统
- ✨ **新增**: 收藏夹功能
- 🔄 **优化**: AI流式分析自动保存
- 🔄 **优化**: 数据库索引性能
- 🔒 **增强**: API安全防护

### v2.0.0
- ✨ 完整用户认证系统
- ✨ AI智能解盘功能
- ✨ 积分系统
- ✨ 流式响应支持

## 🤝 贡献指南

1. **代码规范**: 遵循ESLint配置
2. **提交规范**: 使用Conventional Commits
3. **测试要求**: 新功能需要相应测试
4. **文档更新**: 同步更新API文档

## 📞 技术支持

- **Issues**: 在GitHub提出问题
- **讨论**: 参与Discussion讨论
- **邮件**: 发送至开发团队邮箱

---

*丁未奇门遁甲遁甲 - 传统智慧与现代技术的完美融合* 🔮 
# 奇门遁甲分析规格

## Purpose
提供完整的奇门遁甲分析服务，包括传统排盘计算和现代 AI 智能解读。系统基于自研的万年历和排盘算法，能够精确计算任意时间的奇门遁甲盘局。结合 OpenAI GPT-4 模型提供深度的易学解读，支持多种分析模式（深度/简单/流式）和连续对话追问，为用户提供专业的奇门遁甲咨询服务。

## Requirements

### Requirement: 奇门遁甲排盘
系统 SHALL 根据输入的时间信息计算完整的奇门遁甲盘。

#### Scenario: 排盘计算
- **WHEN** 用户提供年、月、日、时信息
- **THEN** 使用万年历计算干支历
- **AND** 根据节气确定局数
- **AND** 计算九宫格的天盘、地盘、人盘配置
- **AND** 确定八门、九星、八神的位置
- **AND** 计算值符、值使落宫
- **AND** 返回完整排盘数据（60+字段）

#### Scenario: 时间范围限制
- **WHEN** 输入的时间超出支持范围（1900-2100年）
- **THEN** 返回 400 错误
- **AND** 提示时间超出支持范围

#### Scenario: 可选登录排盘
- **WHEN** 用户未登录但请求排盘
- **THEN** 仍然返回排盘结果
- **AND** 不扣除积分（排盘免费）

### Requirement: AI 深度分析
系统 SHALL 基于排盘结果提供 AI 智能解读（需要消耗积分）。

#### Scenario: 深度分析成功
- **WHEN** 已认证用户请求深度分析且积分充足
- **THEN** 先执行排盘计算
- **AND** 消耗指定积分（默认10积分）
- **AND** 调用 OpenAI GPT-4 生成详细解读
- **AND** 返回完整的分析结果（JSON格式）
- **AND** 创建聊天会话记录

#### Scenario: 积分不足
- **WHEN** 用户积分不足以支付分析费用
- **THEN** 返回 400 错误
- **AND** 提示积分不足
- **AND** 不调用 AI 服务

### Requirement: AI 简单分析
系统 SHALL 提供简化版本的 AI 分析（消耗较少积分）。

#### Scenario: 简单分析
- **WHEN** 用户请求简单分析
- **THEN** 使用精简的 AI prompt
- **AND** 消耗较少积分（默认5积分）
- **AND** 返回简化的分析结果
- **AND** 响应速度更快

### Requirement: 流式 AI 分析
系统 SHALL 支持流式输出 AI 分析结果（Server-Sent Events）。

#### Scenario: 流式分析
- **WHEN** 用户请求流式分析
- **THEN** 立即开始排盘计算
- **AND** 通过 SSE 连接逐步推送 AI 生成的内容
- **AND** 客户端可以实时展示分析过程
- **AND** 减少用户等待感知

#### Scenario: 流式连接中断
- **WHEN** SSE 连接在 AI 生成过程中断开
- **THEN** 服务端停止生成
- **AND** 已消耗的积分不退还
- **AND** 记录不完整的会话

### Requirement: 连续对话会话
系统 SHALL 支持基于排盘结果的连续对话追问。

#### Scenario: 创建会话
- **WHEN** 用户首次进行 AI 分析
- **THEN** 创建新的聊天会话
- **AND** 保存排盘数据到会话上下文
- **AND** 返回会话 ID

#### Scenario: 会话内追问
- **WHEN** 用户在已有会话中追问
- **THEN** 加载会话历史消息
- **AND** 保持排盘上下文不变
- **AND** AI 基于历史对话回答
- **AND** 每次追问也消耗积分（5积分）

#### Scenario: 会话过期
- **WHEN** 会话创建超过24小时
- **THEN** 会话失效，不能继续追问
- **AND** 用户需要重新排盘创建新会话

### Requirement: 排盘数据优化
系统 SHALL 优化排盘数据的传输和存储。

#### Scenario: 精简数据传输
- **WHEN** 返回排盘数据给客户端
- **THEN** 只包含前端展示必需的字段
- **AND** 移除冗余和内部计算字段
- **AND** 减少数据传输量约40%

#### Scenario: 完整数据存储
- **WHEN** 保存排盘数据到会话
- **THEN** 保存完整的排盘信息
- **AND** 确保 AI 分析时有充足上下文

## Performance Requirements

- 排盘计算响应时间 < 100ms
- AI 分析首字节响应 < 3s
- 流式输出延迟 < 500ms
- 会话数据查询 < 50ms

## AI Configuration

- 模型: GPT-4 (gpt-4-turbo-preview)
- 温度: 0.7（平衡准确性和创造性）
- 最大tokens: 2000（深度分析）/ 1000（简单分析）
- 超时: 30秒

## API Endpoints

- `POST /api/analysis/qimen/paipan` - 排盘（可选登录）
- `POST /api/analysis/qimen` - 深度 AI 分析（需登录）
- `POST /api/analysis/qimen/simple` - 简单 AI 分析（需登录）
- `POST /api/analysis/qimen/stream` - 流式 AI 分析（需登录）
- `POST /api/chat/continue` - 会话内追问（需登录）
- `GET /api/chat/history/:sessionId` - 查询会话历史


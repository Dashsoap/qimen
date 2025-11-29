# 后端代码质量 Delta

## ADDED Requirements

### Requirement: 模块化组织
代码 SHALL 按照功能和职责进行模块化组织，避免单文件过大。

#### Scenario: AI Service 模块化
- **WHEN** 重构 AIService (当前892行)
- **THEN** 拆分为多个策略类，每个类不超过 300 行
- **AND** 提取共享的 prompt 模板到独立目录
- **AND** 创建 BaseAnalysis 抽象类定义通用接口

#### Scenario: Validation 模块化
- **WHEN** 重构 validation/schemas.js (当前623行)
- **THEN** 按功能模块拆分为多个文件
- **AND** 每个模块对应一个功能域（auth, analysis, points, chat）
- **AND** 创建 common.js 存放可复用的验证规则

#### Scenario: Middleware 模块化
- **WHEN** 重构 middleware/index.js (当前439行)
- **THEN** 每个中间件类型独立为一个文件
- **AND** index.js 仅作为导出汇总

### Requirement: 代码清理
未使用的代码 SHALL 被识别并移除或归档。

#### Scenario: 移除未使用服务
- **WHEN** 发现 WeiCoinService (431行) 未被任何模块使用
- **THEN** 将其移动到 archive/ 目录或完全删除
- **AND** 清理相关的 import 引用

#### Scenario: 清理注释代码
- **WHEN** 发现被注释掉的代码块
- **THEN** 评估是否需要保留
- **AND** 删除明确不再需要的注释代码

### Requirement: 工具函数提取
通用的工具函数 SHALL 被提取到 utils 目录。

#### Scenario: 创建响应格式化工具
- **WHEN** Controller 需要返回统一格式的响应
- **THEN** 创建 utils/responseFormatter.js
- **AND** 所有 Controller 使用该工具而非手动构造响应

#### Scenario: 创建错误处理工具
- **WHEN** 需要统一处理和格式化错误
- **THEN** 创建 utils/errorHandler.js
- **AND** 提供标准的错误分类和响应格式

#### Scenario: 创建时间处理工具
- **WHEN** 需要处理时间相关逻辑
- **THEN** 创建 utils/timeHelper.js
- **AND** 封装常用的时间转换和格式化函数

## MODIFIED Requirements

### Requirement: Controller 职责限定
系统 SHALL 确保 Controller 只负责请求响应处理，业务逻辑在 Service 层。

#### Scenario: AuthController 重构
- **WHEN** 处理认证相关请求
- **THEN** AuthController 仅处理请求解析和响应
- **AND** 注册/登录逻辑委托给 AuthService
- **AND** 积分奖励逻辑委托给 PointsService
- **AND** Controller 方法不超过 50 行

#### Scenario: AnalysisController 简化
- **WHEN** 处理 AI 分析请求
- **THEN** Controller 仅处理参数验证和响应格式化
- **AND** 积分检查和消费逻辑委托给 PointsService
- **AND** AI 分析逻辑完全由 AIService 处理






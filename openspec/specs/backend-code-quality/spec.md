# 后端代码质量规格

## Purpose
定义后端代码的质量标准和组织规范，确保代码库的可维护性、可读性和可扩展性。这些是非功能性需求，关注代码的内部质量而非外部行为。

## Requirements

### Requirement: 文件大小限制
后端代码文件 SHOULD 保持在合理的大小范围内以提高可维护性。

#### Scenario: 单文件行数限制
- **WHEN** 创建或修改后端代码文件
- **THEN** 单个文件行数应不超过 300-400 行
- **AND** 如果文件过大，应拆分为多个模块

### Requirement: 单一职责原则
每个类和模块 SHALL 只负责一个明确的职责。

#### Scenario: Service 类职责分离
- **WHEN** 创建或重构 Service 类
- **THEN** 每个 Service 类只处理一类业务逻辑
- **AND** 复杂的 Service 应拆分为多个子 Service

#### Scenario: Controller 职责限定
- **WHEN** 编写 Controller 方法
- **THEN** Controller 只负责请求响应处理
- **AND** 业务逻辑必须委托给 Service 层

### Requirement: 代码复用
重复的代码 SHALL 被提取为可复用的函数或模块。

#### Scenario: 消除代码重复
- **WHEN** 发现相同或相似的代码出现多次
- **THEN** 提取为独立的工具函数或共享模块
- **AND** 在多处引用该共享代码

### Requirement: 文档化
关键代码 SHALL 包含清晰的文档说明。

#### Scenario: JSDoc 文档
- **WHEN** 编写公共方法和复杂函数
- **THEN** 使用 JSDoc 格式添加文档注释
- **AND** 说明参数、返回值和功能描述






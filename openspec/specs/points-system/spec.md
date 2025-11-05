# 积分系统规格

## Purpose
实现完整的用户积分管理系统，用于控制 AI 分析服务的使用权限。积分系统支持积分的查询、消耗、增加和交易历史追踪。使用缓存机制优化查询性能，确保高并发场景下积分交易的准确性和一致性。所有积分变动都有完整的审计日志，防止积分滥用和欺诈行为。

## Requirements

### Requirement: 积分查询
系统 SHALL 允许用户查询当前积分余额。

#### Scenario: 查询积分
- **WHEN** 已认证用户请求查询积分
- **THEN** 返回当前积分余额
- **AND** 使用缓存机制提高性能（TTL 5分钟）

### Requirement: 积分消耗
系统 SHALL 支持消耗用户积分用于 AI 分析服务。

#### Scenario: 成功消耗积分
- **WHEN** 用户请求消耗积分且余额充足
- **THEN** 从用户账户扣除指定积分
- **AND** 创建积分交易记录（类型: consume）
- **AND** 清除用户积分缓存
- **AND** 返回扣除后的积分余额

#### Scenario: 积分不足
- **WHEN** 用户积分余额小于需要消耗的积分
- **THEN** 返回 400 错误
- **AND** 提示积分不足
- **AND** 不进行任何扣除

#### Scenario: 消耗负数积分
- **WHEN** 请求消耗负数或零积分
- **THEN** 返回 400 错误
- **AND** 不允许此操作

### Requirement: 积分增加
系统 SHALL 支持给用户账户增加积分。

#### Scenario: 注册赠送积分
- **WHEN** 新用户注册成功
- **THEN** 自动增加初始积分（100积分）
- **AND** 创建积分交易记录（类型: register）

#### Scenario: 邀请奖励积分
- **WHEN** 用户使用有效邀请码注册
- **THEN** 给邀请人增加奖励积分（50积分）
- **AND** 给新用户增加额外积分（50积分）
- **AND** 创建对应的积分交易记录

#### Scenario: 管理员充值积分
- **WHEN** 管理员为用户充值积分
- **THEN** 增加指定数量的积分
- **AND** 创建积分交易记录（类型: admin_grant）

### Requirement: 积分交易历史
系统 SHALL 记录所有积分变动的历史记录。

#### Scenario: 查询交易历史
- **WHEN** 用户请求查看积分交易历史
- **THEN** 返回该用户的所有积分交易记录
- **AND** 包含交易类型、金额、时间、余额等信息
- **AND** 按时间倒序排列

#### Scenario: 交易记录不可修改
- **WHEN** 积分交易记录创建后
- **THEN** 记录永久保存，不可修改或删除
- **AND** 确保审计追踪的完整性

### Requirement: 积分缓存
系统 SHALL 使用缓存优化积分查询性能。

#### Scenario: 缓存命中
- **WHEN** 查询用户积分且缓存未过期
- **THEN** 直接返回缓存的积分值
- **AND** 不查询数据库

#### Scenario: 缓存失效
- **WHEN** 积分发生变动（增加或消耗）
- **THEN** 立即清除该用户的积分缓存
- **AND** 下次查询时从数据库重新读取

#### Scenario: 缓存过期
- **WHEN** 缓存 TTL 超过5分钟
- **THEN** 自动失效，下次查询时刷新

## Data Constraints

- 积分余额 MUST 始终 >= 0
- 单次消耗积分 MUST > 0
- 积分值为整数类型

## API Endpoints

- `GET /api/points/balance` - 查询积分余额
- `POST /api/points/consume` - 消耗积分
- `POST /api/points/add` - 增加积分（内部使用）
- `GET /api/points/history` - 查询交易历史


# 用户认证规格

## Purpose
提供安全可靠的用户认证系统，支持多种登录方式。用户可以通过用户名和密码注册和登录，也支持基于手机短信验证码的无密码登录方式。系统使用 JWT 进行会话管理，密码采用 bcrypt 加密存储，确保用户数据安全。支持邀请码机制促进用户增长。

## Requirements

### Requirement: 用户注册
系统 SHALL 允许新用户通过用户名和密码注册账号。

#### Scenario: 成功注册
- **WHEN** 用户提供有效的用户名、密码和可选的邀请码
- **THEN** 系统创建新用户账号，密码使用 bcrypt 加密存储
- **AND** 返回 JWT token 用于后续认证
- **AND** 赠送初始积分（默认100积分）

#### Scenario: 使用邀请码注册
- **WHEN** 用户提供有效的邀请码
- **THEN** 验证邀请码有效且未使用
- **AND** 注册成功后标记邀请码已使用
- **AND** 给邀请人和新用户都增加额外积分

#### Scenario: 注册失败 - 用户名已存在
- **WHEN** 用户名已被注册
- **THEN** 返回 400 错误，提示用户名已存在

### Requirement: 用户名密码登录
系统 SHALL 支持通过用户名和密码进行身份验证。

#### Scenario: 成功登录
- **WHEN** 用户提供正确的用户名和密码
- **THEN** 验证密码哈希匹配
- **AND** 返回有效的 JWT token
- **AND** token 包含用户ID和用户名信息

#### Scenario: 登录失败 - 凭据错误
- **WHEN** 用户名或密码不正确
- **THEN** 返回 401 错误
- **AND** 不泄露具体是用户名还是密码错误

### Requirement: JWT Token 验证
系统 SHALL 验证 API 请求中的 JWT token。

#### Scenario: Token 有效
- **WHEN** 请求包含有效的 JWT token
- **THEN** 解析 token 并提取用户信息
- **AND** 将用户信息附加到请求对象（req.user）
- **AND** 允许继续处理请求

#### Scenario: Token 无效或过期
- **WHEN** token 无效、过期或缺失
- **THEN** 返回 401 错误
- **AND** 提示需要重新登录

### Requirement: 用户资料查询
系统 SHALL 允许已认证用户查询自己的资料。

#### Scenario: 获取用户资料
- **WHEN** 已认证用户请求获取资料
- **THEN** 返回用户信息（用户名、积分余额、创建时间等）
- **AND** 不返回敏感信息（密码哈希）

### Requirement: 短信验证码登录
系统 SHALL 支持通过手机号和验证码登录（功能已集成但未完全启用）。

#### Scenario: 发送验证码
- **WHEN** 用户请求发送短信验证码
- **THEN** 生成6位随机验证码
- **AND** 通过短信服务发送到指定手机号
- **AND** 验证码5分钟内有效

#### Scenario: 验证码登录
- **WHEN** 用户提供手机号和正确的验证码
- **THEN** 验证验证码匹配且未过期
- **AND** 返回 JWT token

## Security Considerations

- 密码使用 bcrypt 加密，salt rounds = 10
- JWT secret 存储在环境变量中
- 登录接口有速率限制（5次/分钟）
- 不在错误消息中泄露敏感信息

## API Endpoints

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户名密码登录
- `GET /api/auth/verify` - 验证 token
- `POST /api/auth/send-sms` - 发送短信验证码
- `POST /api/auth/login-sms` - 短信验证码登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/profile` - 获取用户资料


# 后端代码重构 - 清理和优化

## Why
当前后端代码存在明显的技术债务和可维护性问题：
1. 多个文件超过400-800行，违反单一职责原则
2. AI prompt 模板重复，维护困难
3. 存在未使用的代码（WeiCoinService）
4. Controller 层包含过多业务逻辑
5. 验证逻辑全部堆积在一个巨大的文件中
6. 配置管理不够统一

这些问题导致：
- 代码难以理解和维护
- Bug 修复困难
- 新功能开发效率低
- 测试覆盖困难

## What Changes

### 1. AIService 重构 (892行 → 拆分)
- [ ] 提取 prompt 模板到独立文件 (`prompts/`)
- [ ] 拆分不同分析策略到独立类
- [ ] 统一响应处理逻辑
- [ ] 移除重复代码

### 2. Controller 瘦身
- [ ] AuthController: 将业务逻辑移到 Service 层
- [ ] 统一错误处理
- [ ] 统一响应格式
- [ ] 简化验证逻辑

### 3. Validation 重组
- [ ] 按模块拆分 `schemas.js`
- [ ] 每个 Controller 对应一个 validation 文件
- [ ] 创建可复用的验证规则

### 4. 清理未使用代码
- [ ] 移除或归档 `WeiCoinService.js`
- [ ] 清理空的 `utils/` 和 `models/` 目录
- [ ] 移除注释掉的代码

### 5. 代码组织优化
- [ ] 统一导出方式
- [ ] 改进文件命名
- [ ] 添加 JSDoc 文档
- [ ] 统一代码风格

### 6. 配置管理改进
- [ ] 整合分散的配置
- [ ] 环境变量统一管理
- [ ] 配置验证

## Impact

### 受影响的规格
- **不影响现有规格** - 这是纯代码重构，不改变功能行为
- **注意**: 这是 tooling-only 的改动，归档时使用 `--skip-specs` 标志

### 受影响的代码
**需要重构的文件**:
- `src/services/AIService.js` (892行)
- `src/controllers/AuthController.js` (493行)
- `src/validation/schemas.js` (623行)
- `src/middleware/index.js` (439行)
- `src/services/WeiCoinService.js` (431行 - 删除)
- `src/config/promptTemplates.js` (267行)

**新增文件结构**:
```
src/
├── services/
│   └── ai/
│       ├── AIService.js
│       ├── SimpleAnalysis.js
│       ├── DeepAnalysis.js
│       ├── StreamAnalysis.js
│       └── MasterAnalysis.js
├── prompts/
│   ├── simplePrompt.js
│   ├── deepPrompt.js
│   └── masterPrompt.js
├── validation/
│   ├── authValidation.js
│   ├── analysisValidation.js
│   ├── pointsValidation.js
│   └── common.js
└── utils/
    ├── responseFormatter.js
    ├── errorHandler.js
    └── timeHelper.js
```

### 风险评估
- **低风险** - 不改变 API 接口
- **需要充分测试** - 确保重构后行为一致
- **可增量进行** - 一个模块一个模块重构

### 预期收益
- 代码行数减少约30%
- 文件可读性提升
- 维护效率提高50%+
- 更容易编写测试
- 新功能开发更快


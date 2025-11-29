# Qimen Analysis Capability - Data Consistency Fix

## MODIFIED Requirements

### Requirement: Paipan Data Structure

排盘数据结构必须与奇门遁甲核心库输出保持完全一致，使用繁体中文字段名称，确保数据完整性和可追溯性。

**关键变更**：
- 所有字段名称必须使用繁体中文（与核心库一致）
- 禁止在数据传递过程中进行字段名称转换
- 保留核心库输出的完整数据结构，不丢失任何字段

**必需字段**（繁体）：
- `干支`、`干支1`（年月日時）
- `旬空`（日空、時空）
- `馬星`（天馬、丁馬、驛馬）← **核心修复点**
- `地支`、`長生運`
- `門`、`星`、`神`、`暗干`
- `天盤`、`地盤`
- `節氣`、`排局`、`值符值使`

#### Scenario: 排盘数据正确生成并存储

- **GIVEN** 用户访问奇门遁甲排盘页面
- **WHEN** 系统执行排盘逻辑 `paipan()`
- **THEN** 生成的数据必须包含所有繁体字段，包括 `馬星.驛馬`
- **AND** 数据结构与核心库 `qimen.p` 完全一致
- **AND** Redux store 中保存的数据可以被组件正确读取

#### Scenario: 宫位数据包含马星信息

- **GIVEN** 排盘数据已生成并存储在 Redux store
- **WHEN** 组件访问 `馬星.驛馬` 字段
- **THEN** 必须能够成功读取驿马数据（非 undefined）
- **AND** 驿马数据格式正确（地支字符串）
- **AND** 不应出现 TypeScript 类型错误或 `any` 断言

#### Scenario: 与 Vue 项目数据一致性

- **GIVEN** 相同的时间参数（年月日时）
- **WHEN** 在 Vue 项目和 Next.js 项目中分别执行排盘
- **THEN** 两个项目输出的排盘数据必须完全一致
- **AND** 所有字段名称、字段值、数据结构保持一致
- **AND** AI 分析获得的数据应该相同

### Requirement: Type Safety for Paipan Data

排盘数据必须有完整的 TypeScript 类型定义，禁止使用 `any` 类型，确保编译时类型安全。

#### Scenario: 完整的类型定义

- **GIVEN** 开发者在 TypeScript 文件中引用排盘数据
- **WHEN** 访问任何排盘数据字段（如 `馬星.驛馬`）
- **THEN** IDE 必须提供智能提示和类型检查
- **AND** 不允许使用 `(data as any).马星` 这样的类型断言
- **AND** TypeScript 编译必须通过，无类型错误

#### Scenario: 字段名称错误的编译时捕获

- **GIVEN** 开发者错误地使用了简体字段名（如 `马星` 而非 `馬星`）
- **WHEN** 运行 TypeScript 类型检查
- **THEN** 编译器必须报告类型错误
- **AND** 错误信息应指出正确的字段名称
- **AND** 禁止使用 `any` 来绕过类型检查

## MODIFIED Requirements

### Requirement: Qimen Analysis AI Integration

The system SHALL provide AI analysis with complete paipan data including all traditional Chinese character fields. AI 分析功能必须能够获取完整的排盘数据，包括所有繁体字段，确保分析的准确性。

#### Scenario: AI 分析接收完整排盘数据

- **GIVEN** 用户提交问题并请求 AI 分析
- **WHEN** AI 服务获取排盘数据
- **THEN** 传递给 AI 的数据必须包含 `馬星`、`地支`、`長生運` 等所有字段
- **AND** 数据格式必须符合 AI 提示词的要求
- **AND** 不应因字段缺失导致分析质量下降

#### Scenario: 数据优化保留关键字段

- **GIVEN** 使用 `paipanDataOptimizer` 优化排盘数据
- **WHEN** 数据传递给 AI 服务
- **THEN** 优化后的数据必须保留 `馬星`、`地支` 等关键字段
- **AND** 字段名称必须使用繁体（与原始数据一致）
- **AND** 不应丢失对分析有价值的信息

## REMOVED Requirements

### Requirement: Field Name Conversion Support

**移除理由**：简繁体字段名转换增加了不必要的复杂性，且容易导致数据不一致。统一使用繁体字段名是更好的选择。

**迁移指南**：
- 将所有简体字段引用改为繁体（如 `马星` → `馬星`）
- 移除任何字段名称转换逻辑
- 更新 TypeScript 类型定义，只支持繁体字段
- 清除用户本地存储的旧数据（如果有）

---

**关联变更**：
- 此修复依赖于奇门遁甲核心库（`lib/qimendunjia/index.js`）
- 影响 Redux Store (`qimenSlice.ts`)
- 影响所有使用排盘数据的组件
- 影响 AI 分析数据准备逻辑

**向后兼容性**：
- ⚠️ **Breaking Change**：字段名称从简体改为繁体
- 建议用户清除缓存和本地存储
- 历史记录中的旧数据可能需要重新排盘

**测试要求**：
- 必须对比 Vue 和 Next.js 的排盘输出
- 必须测试 AI 分析功能的数据完整性
- 必须通过 TypeScript 严格模式编译


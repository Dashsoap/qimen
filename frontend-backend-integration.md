# 云雀奇门遁甲前后端数据接口规范

本文档规定了奇门遁甲应用中前端生成的盘面数据如何与后端进行交互，包括数据结构、API接口以及相关约定。

## 一、奇门盘面数据结构

### 1.1 前端生成的奇门盘面数据结构

根据前端代码分析，奇门盘面数据由前端生成，具有以下结构：

```typescript
interface QimenChartData {
  // 基本信息
  干支: string;                        // 例: "甲子年 甲子月 甲子日 甲子時"
  干支1: {                           // 干支细分信息
    年: string;                      // 例: "甲子"
    月: string;                      // 例: "甲子"
    日: string;                      // 例: "甲子" 
    時: string;                      // 例: "甲子"
  };
  旬首: string;                        // 例: "戊戌"
  旬空: {                            // 旬空信息
    日空: string;                    // 例: "戌亥"
    時空: string;                    // 例: "戌亥"
  };
  局日: string;                        // 例: "甲子"
  排局: string;                        // 例: "陽遁六局上元"
  節氣: string;                        // 例: "立春"
  值符值使: {                         // 值符值使信息
    值符: string;                    // 例: "值符陽"  
    值使: string;                    // 例: "值使陰"
    值符星: string;                  // 例: "天心"
    值使門: string;                  // 例: "休門"
    值符星宮: string;                // 例: "天心二宮"
    值使門宮: string;                // 例: "休門二宮"
  };
  天乙: string;                        // 例: "丁"
  天盤: [                             // 天盘数组，包含两个映射对象
    {                               // 第一个是宫位到天干的映射
      坎: string;                   // 例: "戊"
      艮: string;                   // 例: "己"
      震: string;                   // 例: "庚"
      巽: string;                   // 例: "辛"
      離: string;                   // 例: "壬"
      坤: string;                   // 例: "癸"
      兌: string;                   // 例: "丁"
      乾: string;                   // 例: "丙"
      中: string;                   // 例: "乙"
    },
    {                               // 第二个是天干到宫位的映射
      甲: string;                   // 例: "坎"
      乙: string;                   // 例: "艮"
      丙: string;                   // 例: "震"
      丁: string;                   // 例: "巽"
      戊: string;                   // 例: "離"
      己: string;                   // 例: "坤"
      庚: string;                   // 例: "兌"
      辛: string;                   // 例: "乾"
      壬: string;                   // 例: "中"
      癸: string;                   // 例: "中"
    }
  ];
  地盤: {                            // 地盘信息，宫位到地支的映射
    坎: string;                     // 例: "子"
    艮: string;                     // 例: "丑"
    震: string;                     // 例: "寅"
    巽: string;                     // 例: "辰"
    離: string;                     // 例: "午"
    坤: string;                     // 例: "未"
    兌: string;                     // 例: "酉"
    乾: string;                     // 例: "戌"
    中: string;                     // 例: "戊"
  };
  門: {                              // 八门信息，宫位到门的映射
    坎: string;                     // 例: "休"
    艮: string;                     // 例: "死"
    震: string;                     // 例: "傷"
    巽: string;                     // 例: "杜"
    離: string;                     // 例: "開"
    坤: string;                     // 例: "驚"
    兌: string;                     // 例: "生"
    乾: string;                     // 例: "景"
    中: string;                     // 例: ""
  };
  星: {                              // 九星信息，宫位到星的映射
    坎: string;                     // 例: "天蓬"
    艮: string;                     // 例: "天芮"
    震: string;                     // 例: "天沖"
    巽: string;                     // 例: "天輔"
    離: string;                     // 例: "天禽"
    坤: string;                     // 例: "天心"
    兌: string;                     // 例: "天柱"
    乾: string;                     // 例: "天任"
    中: string;                     // 例: "天英"
  };
  神: {                              // 八神信息，宫位到神的映射
    坎: string;                     // 例: "符"
    艮: string;                     // 例: "蛇"
    震: string;                     // 例: "陰"
    巽: string;                     // 例: "合"
    離: string;                     // 例: "勾"
    坤: string;                     // 例: "虎"
    兌: string;                     // 例: "武"
    乾: string;                     // 例: "地"
    中: string;                     // 例: "天"
  };
  暗干: {                            // 暗干信息，宫位到暗干的映射
    坎: string;                     // 例: "戊"
    艮: string;                     // 例: "己"
    震: string;                     // 例: "庚"
    巽: string;                     // 例: "辛"
    離: string;                     // 例: "壬"
    坤: string;                     // 例: "癸"
    兌: string;                     // 例: "甲"
    乾: string;                     // 例: "乙"
    中: string;                     // 例: "丙"
  };
  馬星: {                            // 马星信息
    天馬: string;                   // 例: "午"
    丁馬: string;                   // 例: "酉" 
    驛馬: string;                   // 例: "辰"
  };
  長生運: {                          // 长生十二神信息
    甲: {                          // 甲干长生十二神
      長生: string;               // 例: "亥"
      沐浴: string;               // 例: "子"
      冠帶: string;               // 例: "丑"
      臨官: string;               // 例: "寅"
      帝旺: string;               // 例: "卯"
      // ... 其他神煞
    },
    乙: { /* 同上结构 */ },
    // ... 其他天干的长生十二神
  };
  地支: {                            // 地支信息，宫位到地支的映射
    坎: string;                     // 例: "子"
    艮: string;                     // 例: "丑"
    震: string;                     // 例: "寅"
    巽: string;                     // 例: "辰"
    離: string;                     // 例: "午"
    坤: string;                     // 例: "未"
    兌: string;                     // 例: "酉"
    乾: string;                     // 例: "戌"
    // 中宫可能没有地支
  };
}
```

上述数据结构基于前端`Qimen`类的`p`属性，由前端在用户选择日期、时间并点击"排盘"按钮时生成。

### 1.2 前端视图数据结构

为方便展示，前端会将上述原始数据通过`getGongViewData`转换为视图数据：

```typescript
interface GongViewData {
  八门: string;           // 例: "休"
  八神: string;           // 例: "符"
  九星: string;           // 例: "天蓬"
  八卦: string;           // 例: "坎"
  天盘: string;           // 例: "戊"
  天盘1: string;          // 例: "丙"
  地盘: string;           // 例: "子"
  暗干: string;           // 例: "戊"
  馬星: string;           // 例: "午"
  地支: string;           // 例: "子"
  旬空: string;           // 例: "戌亥"
}
```

此数据结构是针对具体宫位显示的信息。

## 二、前后端接口约定

以下定义前端和后端交互的API接口。

### 2.1 创建奇门盘面

**请求方法**：POST

**接口路径**：`/api/charts/create`

**请求参数**：

```typescript
interface CreateChartRequest {
  // 日期时间相关
  year: number;           // 年份，例: 2023
  month: number;          // 月份，例: 4 (4月)
  day: number;            // 日期，例: 15
  hour: number;           // 小时，例: 13 (下午1点)
  
  // 用户设置信息
  question: string;       // 用户的占问内容，例: "今天适合出行吗？"
  
  // 奇门盘数据 (前端已计算的完整盘面数据)
  chartData: QimenChartData;  // 上述定义的奇门盘结构
}
```

**响应格式**：

```typescript
interface CreateChartResponse {
  success: boolean;       // 请求是否成功
  message?: string;       // 可选的消息，尤其是错误信息
  data?: {
    chartId: string;      // 创建的奇门盘ID
    createdAt: string;    // 创建时间
  }
}
```

### 2.2 获取奇门盘面

**请求方法**：GET

**接口路径**：`/api/charts/:id`

**路径参数**：
- `id`: 奇门盘ID

**响应格式**：

```typescript
interface GetChartResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    question: string;
    chartData: QimenChartData;
    notes: string;
    created: string;      // ISO 8601格式的创建时间
    isPublic: boolean;
    views: number;
    likes: number;
    tags: string[];
    // AI解读相关数据
    aiReadings: {
      question: string;
      answer: string;
      timestamp: string;  // ISO 8601格式的时间
    }[];
  }
}
```

### 2.3 获取用户的奇门盘列表

**请求方法**：GET

**接口路径**：`/api/charts/list`

**查询参数**：
- `page`: 页码，默认为1
- `limit`: 每页记录数，默认为10
- `sort`: 排序方式，可选值 "created_desc"(默认)、"created_asc"、"views_desc"

**响应格式**：

```typescript
interface ChartListResponse {
  success: boolean;
  message?: string;
  data?: {
    total: number;        // 总记录数
    page: number;         // 当前页码
    limit: number;        // 每页记录数
    charts: {
      id: string;
      year: number;
      month: number;
      day: number;
      hour: number;
      question: string;
      created: string;    // ISO 8601格式
      isPublic: boolean;
      views: number;
      likes: number;
      // 节选的关键数据
      summary: {
        干支: string;
        節氣: string;
        排局: string;
      }
    }[];
  }
}
```

### 2.4 AI解读奇门盘面

**请求方法**：POST

**接口路径**：`/api/charts/:id/ai-reading`

**路径参数**：
- `id`: 奇门盘ID

**请求参数**：

```typescript
interface AIReadingRequest {
  question: string;       // 用户的具体问题，例: "这个盘面对我的事业有什么启示？"
}
```

**响应格式**：

```typescript
interface AIReadingResponse {
  success: boolean;
  message?: string;
  data?: {
    reading: string;      // AI生成的解读内容
    keyInsights: string[];// 提取的关键洞见列表
    timestamp: string;    // ISO 8601格式的解读时间
  }
}
```

## 三、数据传输约定

### 3.1 数据传输格式

- 所有API请求和响应均使用JSON格式。
- 请求头需设置 `Content-Type: application/json`。
- 奇门盘数据中的中文字符使用其本身，无需特殊编码。

### 3.2 认证规范

- 所有API请求除了登录/注册外，均需要在请求头中包含JWT令牌：
  ```
  Authorization: Bearer <token>
  ```

### 3.3 错误处理

- 当请求失败时，后端将返回相应的HTTP状态码，同时响应体中的`success`字段为`false`。
- 错误信息将在响应体的`message`字段中提供。

## 四、前后端集成建议

### 4.1 数据同步

1. 前端计算生成奇门盘数据，然后发送到后端存储。
2. 后端不再重复计算，而是直接存储和管理前端传来的盘面数据。
3. 当用户再次查看该盘时，后端返回完整的盘面数据供前端渲染。

### 4.2 数据优化

1. 考虑基于需求调整数据结构，可能不需要传输所有计算结果。
2. 后端可提供数据压缩机制，减少传输量。
3. 对不常修改的数据考虑使用缓存优化。

### 4.3 进阶开发建议

1. **复盘功能**：支持用户对已有盘进行调整或标注。
2. **盘面对比**：允许并排比较不同的盘面。
3. **批量盘算**：支持在特定日期范围内批量排盘和分析。

## 五、实现示例

### 前端代码示例

```javascript
// 创建新的奇门盘
async function createNewChart() {
  const date = dateValue.value || dayjs();
  const time = timeValue.value || dayjs();
  
  // 使用Qimen类生成盘面数据
  const qimen = new Qimen(date.year(), date.month()+1, date.date(), time.hour() || 0);
  
  try {
    const response = await fetch('/api/charts/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        year: date.year(),
        month: date.month() + 1,
        day: date.date(),
        hour: time.hour() || 0,
        question: questionValue.value,
        chartData: qimen.p
      })
    });
    
    const result = await response.json();
    if (result.success) {
      // 显示成功消息
      console.log(`奇门盘创建成功，ID: ${result.data.chartId}`);
      
      // 可能的额外操作，如跳转到详情页
      router.push(`/chart/${result.data.chartId}`);
    } else {
      // 显示错误信息
      console.error(`奇门盘创建失败: ${result.message}`);
    }
  } catch (error) {
    console.error('网络错误:', error);
  }
}
```

### 后端代码示例 (Node.js + Express + TypeScript)

```typescript
// controllers/chartController.ts
import { Request, Response } from 'express';
import QimenChart from '../models/QimenChart';

// 创建奇门盘
export const createChart = async (req: Request, res: Response) => {
  try {
    const { year, month, day, hour, question, chartData } = req.body;
    const userId = req.user.id; // 从JWT获取
    
    // 创建新的奇门盘记录
    const chart = new QimenChart({
      user: userId,
      year,
      month,
      day,
      hour,
      question,
      chartData,
      created: new Date(),
      isPublic: false,
      views: 0,
      likes: 0,
      tags: []
    });
    
    await chart.save();
    
    return res.status(201).json({
      success: true,
      data: {
        chartId: chart._id,
        createdAt: chart.created
      }
    });
  } catch (error) {
    console.error('创建奇门盘失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，创建失败'
    });
  }
};

// 获取单个奇门盘
export const getChart = async (req: Request, res: Response) => {
  try {
    const chartId = req.params.id;
    const userId = req.user.id;
    
    const chart = await QimenChart.findById(chartId);
    if (!chart) {
      return res.status(404).json({
        success: false,
        message: '找不到对应的奇门盘'
      });
    }
    
    // 检查权限
    if (chart.user.toString() !== userId && !chart.isPublic) {
      return res.status(403).json({
        success: false,
        message: '无权访问此奇门盘'
      });
    }
    
    // 增加浏览次数
    chart.views += 1;
    await chart.save();
    
    return res.status(200).json({
      success: true,
      data: {
        id: chart._id,
        year: chart.year,
        month: chart.month,
        day: chart.day,
        hour: chart.hour,
        question: chart.question,
        chartData: chart.chartData,
        notes: chart.notes,
        created: chart.created,
        isPublic: chart.isPublic,
        views: chart.views,
        likes: chart.likes,
        tags: chart.tags,
        aiReadings: chart.aiReadings
      }
    });
  } catch (error) {
    console.error('获取奇门盘失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，获取失败'
    });
  }
};
```

## 六、安全性考虑

1. **输入验证**：后端应严格校验前端传入的数据，包括日期范围、数据结构等。
2. **认证和授权**：确保用户只能访问自己的或公开的奇门盘。
3. **速率限制**：对API调用设置合理的速率限制，特别是AI解读功能。
4. **敏感信息保护**：避免在奇门盘中存储敏感的个人信息。

## 七、扩展性规划

未来可能的API扩展：

1. **社区互动API**：
   - 点赞/收藏奇门盘
   - 分享奇门盘
   - 盘面评论功能

2. **批量操作API**：
   - 批量生成特定日期范围的盘面
   - 导出多个盘面数据

3. **AI增强功能**：
   - 高级AI解读模式
   - 多轮对话式解读
   - 跨盘面分析和比较 
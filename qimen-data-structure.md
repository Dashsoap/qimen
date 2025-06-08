# 云雀奇门遁甲数据结构约定

本文档定义了云雀奇门遁甲项目中前后端共用的奇门盘数据JSON结构，便于数据存储、传输和AI解读。

## 1. 后端设计评估

后端设计整体合理，采用了Express.js + MongoDB的技术栈，符合项目需求。具体分析：

### 优势：
1. **技术栈选择恰当**：Express.js轻量高效，适合中小型项目；MongoDB灵活的文档型结构适合存储复杂的奇门盘数据。
2. **结构清晰**：项目结构划分明确，遵循MVC模式，职责分离。
3. **数据模型设计完善**：包含了用户、奇门盘、每日一签等核心功能的数据模型。
4. **API设计全面**：涵盖了认证、奇门盘、每日一签和积分系统的API。
5. **特色功能实现**：积分系统和AI解读服务设计详尽。

### 优化建议：
1. **数据模型冗余**：QimenChart模型中的chartData设计为any类型，缺乏明确结构定义。
2. **数据一致性**：前后端奇门盘数据结构应保持一致，避免转换成本。
3. **增加缓存层**：为频繁访问的奇门盘数据添加Redis缓存，提升性能。
4. **安全加强**：考虑添加更多防护措施，如限流、CSRF保护等。

## 2. 奇门盘数据结构约定

基于前端代码分析，使用以下JSON结构存储奇门盘数据：

```json
{
  "metadata": {
    "year": 2023,
    "month": 5,
    "day": 15,
    "hour": 9,
    "question": "我的事业发展如何？",
    "created": "2023-05-15T09:30:00.000Z",
    "userId": "user123"
  },
  "basicInfo": {
    "干支": "癸卯年 丙午月 壬寅日 辛巳時",
    "干支1": {
      "年": "癸卯",
      "月": "丙午",
      "日": "壬寅",
      "時": "辛巳"
    },
    "旬首": "壬子",
    "旬空": {
      "日空": "戌亥",
      "時空": "子丑"
    },
    "局日": "壬日",
    "排局": "陽遁三局",
    "節氣": "小滿",
    "值符值使": {
      "值符星宮": ["蓬", "坎"],
      "值使門宮": ["休", "坤"]
    },
    "天乙": "坎"
  },
  "palaceData": {
    "乾": {
      "宫位": "乾",
      "八门": "开",
      "八神": "天",
      "九星": "英",
      "天盘": "庚", 
      "地盘": "戊",
      "暗干": "壬",
      "地支": ["戌", "亥"]
    },
    "坎": {
      "宫位": "坎",
      "八门": "休",
      "八神": "符",
      "九星": "蓬",
      "天盘": "壬",
      "地盘": "壬",
      "暗干": "丙",
      "地支": ["子"]
    },
    "艮": {
      "宫位": "艮",
      "八门": "生",
      "八神": "蛇",
      "九星": "芮",
      "天盘": "丁",
      "地盘": "丁",
      "暗干": "辛",
      "地支": ["丑", "寅"]
    },
    "震": {
      "宫位": "震",
      "八门": "伤",
      "八神": "阴",
      "九星": "冲",
      "天盘": "甲",
      "地盘": "甲",
      "暗干": "癸",
      "地支": ["卯"]
    },
    "巽": {
      "宫位": "巽",
      "八门": "杜",
      "八神": "合",
      "九星": "辅",
      "天盘": "乙",
      "地盘": "乙",
      "暗干": "己",
      "地支": ["辰", "巳"]
    },
    "离": {
      "宫位": "离",
      "八门": "景",
      "八神": "虎",
      "九星": "禽",
      "天盘": "丙",
      "地盘": "丙",
      "暗干": "戊",
      "地支": ["午"]
    },
    "坤": {
      "宫位": "坤",
      "八门": "死",
      "八神": "武",
      "九星": "心",
      "天盘": "己",
      "地盘": "己",
      "暗干": "庚",
      "地支": ["未", "申"]
    },
    "兑": {
      "宫位": "兑",
      "八门": "惊",
      "八神": "地",
      "九星": "柱",
      "天盘": "辛",
      "地盘": "辛",
      "暗干": "乙",
      "地支": ["酉"]
    },
    "中": {
      "宫位": "中",
      "八门": "",
      "八神": "",
      "九星": "任",
      "天盘": "癸",
      "地盘": "戊",
      "暗干": "丁",
      "地支": []
    }
  },
  "specialMarkers": {
    "马星": {
      "天马": "午",
      "丁马": "酉",
      "驛马": "申"
    },
    "长生": {
      "长生": "申",
      "沐浴": "酉", 
      "冠带": "戌",
      "临官": "亥",
      "帝旺": "子",
      "衰": "丑",
      "病": "寅",
      "死": "卯",
      "墓": "辰",
      "绝": "巳",
      "胎": "午",
      "养": "未"
    }
  },
  "aiInterpretations": [
    {
      "question": "我的事业发展如何？",
      "answer": "根据奇门盘分析，您当前处于[详细解读内容]",
      "timestamp": "2023-05-15T09:35:00.000Z"
    }
  ],
  "notes": "用户添加的笔记内容"
}
```

## 3. 优化建议

1. **存储优化**：
   - 将盘面元素索引化，减少重复数据
   - 为频繁查询的字段添加MongoDB索引

2. **前后端数据一致性**：
   - 创建TypeScript接口共享，确保前后端数据结构一致
   - 前端Qimen类计算结果直接符合后端存储结构

3. **AI解读优化**：
   - 使用结构化格式存储解读内容，便于分类展示
   - 添加关键词标签，方便搜索和关联

4. **安全与性能**：
   - 为盘数据添加版本控制，支持历史版本查询
   - 盘数据压缩存储，减少数据库空间占用

## 4. MongoDB模型实现

以下是QimenChart模型的TypeScript定义示例：

```typescript
// QimenChart.ts
import mongoose, { Schema, Document } from 'mongoose';

// 定义奇门盘数据的类型接口
export interface IQimenChart extends Document {
  metadata: {
    year: number;
    month: number;
    day: number;
    hour: number;
    question?: string;
    created: Date;
    userId: mongoose.Types.ObjectId;
  };
  basicInfo: {
    干支: string;
    干支1: {
      年: string;
      月: string;
      日: string;
      時: string;
    };
    旬首: string;
    旬空: {
      日空: string;
      時空: string;
    };
    局日: string;
    排局: string;
    節氣: string;
    值符值使: {
      值符星宮: string[];
      值使門宮: string[];
    };
    天乙: string;
  };
  palaceData: {
    [key: string]: {
      宫位: string;
      八门?: string;
      八神?: string;
      九星?: string;
      天盘?: string;
      地盘?: string;
      暗干?: string;
      地支?: string[];
    };
  };
  specialMarkers: {
    马星: {
      天马?: string;
      丁马?: string;
      驛马?: string;
    };
    长生?: {
      [key: string]: string;
    };
  };
  aiInterpretations: Array<{
    question: string;
    answer: string;
    timestamp: Date;
  }>;
  notes?: string;
  isPublic: boolean;
  views: number;
  likes: number;
  tags: string[];
}

const QimenChartSchema: Schema = new Schema({
  metadata: {
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    day: { type: Number, required: true },
    hour: { type: Number, required: true },
    question: { type: String },
    created: { type: Date, default: Date.now },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  basicInfo: {
    干支: { type: String, required: true },
    干支1: {
      年: { type: String, required: true },
      月: { type: String, required: true },
      日: { type: String, required: true },
      時: { type: String, required: true }
    },
    旬首: { type: String, required: true },
    旬空: {
      日空: { type: String, required: true },
      時空: { type: String, required: true }
    },
    局日: { type: String, required: true },
    排局: { type: String, required: true },
    節氣: { type: String, required: true },
    值符值使: {
      值符星宮: [{ type: String }],
      值使門宮: [{ type: String }]
    },
    天乙: { type: String }
  },
  palaceData: { type: Schema.Types.Mixed, required: true },
  specialMarkers: {
    马星: {
      天马: { type: String },
      丁马: { type: String },
      驛马: { type: String }
    },
    长生: { type: Schema.Types.Mixed }
  },
  aiInterpretations: [{
    question: { type: String },
    answer: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  notes: { type: String },
  isPublic: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  tags: [{ type: String }]
});

// 添加索引提高查询性能
QimenChartSchema.index({ 'metadata.userId': 1, 'metadata.created': -1 });
QimenChartSchema.index({ isPublic: 1, 'metadata.created': -1 });
QimenChartSchema.index({ tags: 1 });
QimenChartSchema.index({ 'basicInfo.排局': 1 });

export default mongoose.model<IQimenChart>('QimenChart', QimenChartSchema);
```

该数据结构设计保留了前端计算结果的完整性，同时以更结构化的方式组织数据，便于AI解读和数据分析。每个宫位的数据清晰分类，便于前端渲染和后端处理。 
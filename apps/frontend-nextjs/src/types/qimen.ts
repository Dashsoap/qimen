/**
 * 奇门遁甲相关类型定义
 * Qimen Dunjia type definitions
 * 
 * ⚠️ 重要：所有字段名称使用繁体中文，与奇门遁甲核心库保持一致
 * Important: All field names use traditional Chinese to match the Qimen core library
 */

// ============= 基础类型定义 =============

// 五行类型
export type Wuxing = '金' | '木' | '水' | '火' | '土';

// 八卦类型
export type Bagua = '坎' | '坤' | '震' | '巽' | '中' | '乾' | '兑' | '艮' | '离';

// 八门类型
export type Bamen = '休' | '死' | '伤' | '杜' | '开' | '惊' | '生' | '景';

// 九星类型
export type Jiuxing = '蓬' | '芮' | '冲' | '辅' | '禽' | '心' | '柱' | '任' | '英';

// 八神类型
export type Bashen = '符' | '蛇' | '阴' | '合' | '虎' | '武' | '玄' | '地' | '天';

// 天干类型
export type Tiangan = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';

// 地支类型
export type Dizhi = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';

// 宫位索引类型
export type GongIndex = '一' | '二' | '三' | '四' | '五' | '六' | '七' | '八' | '九';

// ============= 奇门遁甲核心数据类型 =============

/**
 * 干支信息（繁体字段）
 * Stems and Branches information
 */
export interface GanzhiInfo {
  年: string;  // Year
  月: string;  // Month
  日: string;  // Day
  時: string;  // Hour (繁体：時)
}

/**
 * 馬星数据类型（繁体字段）
 * Horse Star data (traditional Chinese: 馬星)
 */
export interface MaXingData {
  天馬: string;  // Tianma (Heaven Horse)
  丁馬: string;  // Dingma (Ding Horse)
  驛馬: string;  // Yima (Post Horse) - 最常用
}

/**
 * 旬空数据类型（繁体字段）
 * Empty period data (traditional Chinese: 旬空)
 */
export interface XunkongData {
  日空: string | Dizhi;  // Day empty
  時空: string | Dizhi;  // Hour empty
}

/**
 * 值符值使数据类型
 * Chief and Minister data
 */
export interface ZhifuZhishiData {
  值符星宮: string[];  // Chief star palace
  值使門宮: string[];  // Minister gate palace
}

/**
 * 地支盘数据类型
 * Earthly Branches plate data
 */
export type DizhiPanData = Record<string, any>;

/**
 * 長生運数据类型
 * Longevity operation data
 */
export type ChangshengYunData = Record<string, Record<string, string>>;

/**
 * 奇门遁甲盘数据（完整数据结构，使用繁体字段）
 * Complete Qimen Dunjia plate data with traditional Chinese field names
 * 
 * ⚠️ 此类型必须与奇门遁甲核心库输出 (qimen.p) 完全一致
 */
export interface QimenPanData {
  // 基础时间信息
  干支: string;                    // 完整干支字符串
  干支1: GanzhiInfo;                // 干支详细信息
  旬首: any;                        // 旬首
  旬空: XunkongData;                // 旬空（日空、時空）
  
  // 局日和排局信息
  局日: any;                        // 局日
  排局: string;                     // 排局名称（如：陰遁三局）
  節氣: any;                        // 节气
  
  // 值符值使
  值符值使: ZhifuZhishiData;        // 值符值使信息
  天乙: any;                        // 天乙贵人
  
  // 九宫数据（八卦为 key）
  天盤: any[];                      // 天盘（数组，0为主天盘，1为副天盘）
  地盤: any;                        // 地盘
  門: any;                          // 八门
  星: any;                          // 九星
  神: any;                          // 八神
  暗干: any;                        // 暗干
  
  // 马星和长生运（繁体字段）
  馬星: MaXingData;                 // 馬星（天馬、丁馬、驛馬）⚠️ 繁体字
  長生運: any;                      // 長生運
  地支: any;                        // 地支盘
}

/**
 * 宫位视图数据（按需计算，用于组件显示）
 * Palace view data (calculated on demand for component display)
 */
export interface GongViewData {
  name: Bagua;          // 宫位名称（如：坎、坤）
  index?: GongIndex;    // 宫位索引（如：一、二）
  八卦?: Bagua;         // 八卦名称
  八门: string;         // 八门
  八神: string;         // 八神
  九星: string;         // 九星
  天盘: string;         // 天盘（主）
  天盘1?: string;       // 天盘（副）
  地盘: string;         // 地盘
  暗干: string;         // 暗干
  馬星: string;         // 馬星（驛馬）⚠️ 繁体字
  地支: Dizhi[];        // 地支
  旬空: string;         // 旬空
}

// ============= 问题类型定义 =============

/**
 * 问题类型
 * Question types for Qimen analysis
 */
export type QuestionType = 
  | 'law'       // 官司诉讼
  | 'decision'  // 重大决策
  | 'career'    // 事业
  | 'health'    // 健康
  | 'money'     // 财运
  | 'love';     // 情感

/**
 * 问题分类
 * Question category
 */
export interface QuestionCategory {
  name: string;
  icon: string;
  value: QuestionType;
  questions: string[];
}

/**
 * 问题数据库类型
 * Question database type
 */
export type QuestionDatabase = Record<QuestionType, QuestionCategory>;

// ============= 奇门元素信息 =============

/**
 * 奇门元素信息
 * Qimen element information
 */
export interface QimenElementInfo {
  name: string;
  type: '八门' | '九星' | '八神' | '天干' | '地干' | '馬星' | '旬空';  // ⚠️ 繁体
  description?: string;
  wuxing?: Wuxing;
  meaning?: string;
}

/**
 * 五行颜色映射
 * Wuxing color mapping
 */
export interface WuxingColorMap {
  金: string;
  木: string;
  水: string;
  火: string;
  土: string;
}

/**
 * 奇门元素五行映射
 * Qimen element to Wuxing mapping
 */
export interface QimenWuxingMap {
  八门: Record<Bamen, Wuxing>;
  八神: Record<string, Wuxing>;
  九星: Record<Jiuxing, Wuxing>;
  天干: Record<Tiangan, Wuxing>;
  地支: Record<Dizhi, Wuxing>;
}

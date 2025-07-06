import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db = null;

// 获取数据库实例
export async function getDatabase() {
  if (!db) {
    const dbPath = process.env.DB_PATH || join(__dirname, '../../data/qimen.db');
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
  }
  return db;
}

// 初始化数据库
export async function initDatabase() {
  const database = await getDatabase();
  
  console.log('📚 创建奇门遁甲知识库表...');
  
  // 1. 基础符号表 - 存储八门、九星、八神等基础符号的含义
  await database.exec(`
    CREATE TABLE IF NOT EXISTS symbols (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,          -- 'bamen', 'jiuxing', 'bashen', 'tiangan', 'dizhi', 'bagua'
      name TEXT NOT NULL,          -- 符号名称
      meaning TEXT NOT NULL,       -- 基础含义
      properties TEXT,             -- JSON格式的属性（五行、方位等）
      description TEXT,            -- 详细描述
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. 组合解释表 - 存储符号组合的解释规则
  await database.exec(`
    CREATE TABLE IF NOT EXISTS combinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      combination_key TEXT NOT NULL UNIQUE,  -- 组合标识键
      elements TEXT NOT NULL,                -- JSON格式的元素组合
      interpretation TEXT NOT NULL,          -- 解释内容
      context TEXT,                          -- 适用语境（婚姻、事业、健康等）
      confidence REAL DEFAULT 0.8,          -- 可信度评分
      source TEXT,                           -- 来源（古籍、经验等）
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. 分析历史表 - 存储AI分析历史
  await database.exec(`
    CREATE TABLE IF NOT EXISTS analysis_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      question TEXT NOT NULL,
      paipan_data TEXT NOT NULL,        -- JSON格式的排盘数据
      analysis_result TEXT NOT NULL,    -- AI分析结果
      analysis_steps TEXT,              -- 分析步骤
      confidence_score REAL,            -- 分析可信度
      user_feedback INTEGER,            -- 用户反馈 (1-5分)
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 4. 知识库文章表 - 存储奇门遁甲相关知识
  await database.exec(`
    CREATE TABLE IF NOT EXISTS knowledge_base (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,           -- 分类（基础理论、应用实例等）
      keywords TEXT,                    -- 关键词，用于搜索
      relevance_score REAL DEFAULT 1.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 5. MCP工具调用日志
  await database.exec(`
    CREATE TABLE IF NOT EXISTS mcp_tool_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tool_name TEXT NOT NULL,
      parameters TEXT,
      result TEXT,
      execution_time INTEGER,
      success BOOLEAN,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('📚 数据库表创建完成，开始填充基础数据...');
  
  // 填充基础数据
  await seedBasicData(database);
  
  console.log('✅ 数据库初始化完成！');
  return database;
}

// 填充基础数据
async function seedBasicData(database) {
  // 检查是否已有数据
  const count = await database.get('SELECT COUNT(*) as count FROM symbols');
  if (count.count > 0) {
    console.log('📚 基础数据已存在，跳过填充');
    return;
  }

  console.log('📚 填充奇门遁甲基础符号数据...');
  
  // 八门数据
  const bamenData = [
    { name: '休门', meaning: '休养生息，宜静不宜动', properties: JSON.stringify({ wuxing: '水', fangwei: '北', jixiong: '吉' }) },
    { name: '生门', meaning: '生机勃勃，万物生长', properties: JSON.stringify({ wuxing: '土', fangwei: '东北', jixiong: '大吉' }) },
    { name: '伤门', meaning: '伤残破败，争斗竞争', properties: JSON.stringify({ wuxing: '木', fangwei: '东', jixiong: '凶' }) },
    { name: '杜门', meaning: '闭塞阻滞，藏匿隐蔽', properties: JSON.stringify({ wuxing: '木', fangwei: '东南', jixiong: '中平' }) },
    { name: '景门', meaning: '光明显达，文章科举', properties: JSON.stringify({ wuxing: '火', fangwei: '南', jixiong: '吉' }) },
    { name: '死门', meaning: '死亡终结，极端不利', properties: JSON.stringify({ wuxing: '土', fangwei: '西南', jixiong: '大凶' }) },
    { name: '惊门', meaning: '惊恐不安，突发变故', properties: JSON.stringify({ wuxing: '金', fangwei: '西', jixiong: '凶' }) },
    { name: '开门', meaning: '开拓进取，事业有成', properties: JSON.stringify({ wuxing: '金', fangwei: '西北', jixiong: '吉' }) }
  ];

  for (const item of bamenData) {
    await database.run(
      'INSERT INTO symbols (type, name, meaning, properties) VALUES (?, ?, ?, ?)',
      ['bamen', item.name, item.meaning, item.properties]
    );
  }

  // 九星数据
  const jiuxingData = [
    { name: '天蓬星', meaning: '主智慧谋略，但性情阴暗', properties: JSON.stringify({ wuxing: '水', jixiong: '凶' }) },
    { name: '天任星', meaning: '主忠厚老实，性格温和', properties: JSON.stringify({ wuxing: '土', jixiong: '吉' }) },
    { name: '天冲星', meaning: '主冲动急躁，行事鲁莽', properties: JSON.stringify({ wuxing: '木', jixiong: '凶' }) },
    { name: '天辅星', meaning: '主辅佐他人，文曲科举', properties: JSON.stringify({ wuxing: '木', jixiong: '吉' }) },
    { name: '天英星', meaning: '主文采风雅，但易生是非', properties: JSON.stringify({ wuxing: '火', jixiong: '中平' }) },
    { name: '天芮星', meaning: '主疾病灾厄，极为不利', properties: JSON.stringify({ wuxing: '土', jixiong: '大凶' }) },
    { name: '天柱星', meaning: '主破败损失，官司牢狱', properties: JSON.stringify({ wuxing: '金', jixiong: '大凶' }) },
    { name: '天心星', meaning: '主医药治疗，慈善救助', properties: JSON.stringify({ wuxing: '金', jixiong: '大吉' }) }
  ];

  for (const item of jiuxingData) {
    await database.run(
      'INSERT INTO symbols (type, name, meaning, properties) VALUES (?, ?, ?, ?)',
      ['jiuxing', item.name, item.meaning, item.properties]
    );
  }

  // 八神数据
  const bashenData = [
    { name: '值符', meaning: '主要贵人，权威地位', properties: JSON.stringify({ jixiong: '大吉' }) },
    { name: '螣蛇', meaning: '主虚假欺骗，惊恐不安', properties: JSON.stringify({ jixiong: '凶' }) },
    { name: '太阴', meaning: '主阴私隐秘，女性贵人', properties: JSON.stringify({ jixiong: '吉' }) },
    { name: '六合', meaning: '主合作协调，婚姻感情', properties: JSON.stringify({ jixiong: '大吉' }) },
    { name: '白虎', meaning: '主刀兵血光，意外伤害', properties: JSON.stringify({ jixiong: '大凶' }) },
    { name: '玄武', meaning: '主盗贼小人，暗中损害', properties: JSON.stringify({ jixiong: '凶' }) },
    { name: '九地', meaning: '主稳固踏实，防守保护', properties: JSON.stringify({ jixiong: '吉' }) },
    { name: '九天', meaning: '主高远显达，快速发展', properties: JSON.stringify({ jixiong: '大吉' }) }
  ];

  for (const item of bashenData) {
    await database.run(
      'INSERT INTO symbols (type, name, meaning, properties) VALUES (?, ?, ?, ?)',
      ['bashen', item.name, item.meaning, item.properties]
    );
  }

  console.log('✅ 基础符号数据填充完成！');
}

// 关闭数据库连接
export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
} 
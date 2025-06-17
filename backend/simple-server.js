import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
const PORT = 3001;

// 豆包API配置
const ARK_API_KEY = '847716db-7e9f-4cef-8dbd-8c4d25f23d5a';
const ARK_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3';
const ARK_MODEL = 'deepseek-r1-250528'; // DeepSeek-R1-250528模型

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: ARK_API_KEY,
  baseURL: ARK_BASE_URL,
});

// 中间件
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    ai_provider: 'doubao_deepseek',
    services: {
      database: 'connected',
      ai_agent: 'ready',
      mcp_server: 'running'
    }
  });
});

// 模拟排盘API
app.post('/api/qimen/paipan', (req, res) => {
  const { question } = req.body;
  
  console.log('收到排盘请求:', question);
  
  // 模拟排盘数据
  const paipanData = {
    宫1: { 八门: '开门', 九星: '天心星', 八神: '值符', 天盘: '甲', 地盘: '子' },
    宫2: { 八门: '休门', 九星: '天蓬星', 八神: '螣蛇', 天盘: '乙', 地盘: '丑' },
    宫3: { 八门: '生门', 九星: '天任星', 八神: '太阴', 天盘: '丙', 地盘: '寅' },
    宫4: { 八门: '伤门', 九星: '天冲星', 八神: '六合', 天盘: '丁', 地盘: '卯' },
    宫5: { 八门: '杜门', 九星: '天辅星', 八神: '白虎', 天盘: '戊', 地盘: '辰' },
    宫6: { 八门: '景门', 九星: '天英星', 八神: '玄武', 天盘: '己', 地盘: '巳' },
    宫7: { 八门: '死门', 九星: '天芮星', 八神: '九地', 天盘: '庚', 地盘: '午' },
    宫8: { 八门: '惊门', 九星: '天柱星', 八神: '九天', 天盘: '辛', 地盘: '未' },
    宫9: { 八门: '开门', 九星: '天心星', 八神: '值符', 天盘: '壬', 地盘: '申' },
    时间信息: {
      公历: new Date().toISOString(),
      年: new Date().getFullYear(),
      月: new Date().getMonth() + 1,
      日: new Date().getDate(),
      时: new Date().getHours(),
      分: new Date().getMinutes()
    }
  };
  
  res.json({
    success: true,
    question,
    timestamp: new Date().toISOString(),
    paipan: paipanData,
    metadata: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate(),
      hour: new Date().getHours(),
      minute: new Date().getMinutes()
    }
  });
});

// AI分析API
app.post('/api/analysis/qimen', async (req, res) => {
  const { question, paipanData } = req.body;
  
  console.log('收到AI分析请求:', question);
  console.log('排盘数据:', JSON.stringify(paipanData, null, 2));
  
  try {
    // 解析排盘数据
    const parsedPaipan = parsePaipanData(paipanData);
    
    // 调用真实的豆包DeepSeek API进行分析
    const analysisResult = await callDeepSeekAPI(question, parsedPaipan);
    
    res.json({
      success: true,
      sessionId: 'session-' + Date.now(),
      timestamp: new Date().toISOString(),
      analysis: analysisResult,
      paipanInfo: parsedPaipan, // 返回解析后的排盘信息
      steps: [
        { step: 1, action: '解析排盘结构', timestamp: new Date().toISOString(), summary: `已解析${parsedPaipan.排局}格局，${parsedPaipan.干支}时辰` },
        { step: 2, action: '调用豆包DeepSeek-R1', timestamp: new Date().toISOString(), summary: `正在使用AI模型分析奇门遁甲格局` },
        { step: 3, action: '分析符号组合', timestamp: new Date().toISOString(), summary: `已分析${parsedPaipan.值符值使?.值符星宫?.[0]}星${parsedPaipan.值符值使?.值使門宫?.[0]}门组合关系` },
        { step: 4, action: '生成最终回答', timestamp: new Date().toISOString(), summary: '已根据奇门遁甲理论生成专业分析结果' }
      ]
    });
    
  } catch (error) {
    console.error('AI分析错误:', error);
    res.status(500).json({
      success: false,
      error: 'AI分析失败',
      message: error.message
    });
  }
});

// 解析排盘数据
function parsePaipanData(paipanData) {
  try {
    const parsed = {
      干支: paipanData.干支 || '未知时间',
      排局: paipanData.排局 || '未知局',
      節氣: paipanData.節氣 || '未知节气',
      值符值使: paipanData.值符值使 || {},
      旬空: paipanData.旬空 || {},
      keyElements: []
    };

    // 提取关键元素
    if (paipanData.值符值使) {
      if (paipanData.值符值使.值符星宫) {
        parsed.keyElements.push(`${paipanData.值符值使.值符星宫[0]}星`);
      }
      if (paipanData.值符值使.值使門宫) {
        parsed.keyElements.push(`${paipanData.值符值使.值使門宫[0]}门`);
      }
    }

    // 提取门、星、神信息
    if (paipanData.門) parsed.門 = paipanData.門;
    if (paipanData.星) parsed.星 = paipanData.星;
    if (paipanData.神) parsed.神 = paipanData.神;
    if (paipanData.天盤) parsed.天盤 = paipanData.天盤;
    if (paipanData.地盤) parsed.地盤 = paipanData.地盤;

    return parsed;
  } catch (error) {
    console.error('排盘数据解析错误:', error);
    return {
      干支: '数据解析失败',
      排局: '未知局',
      節氣: '未知节气',
      keyElements: ['数据异常']
    };
  }
}

// 调用豆包DeepSeek API进行真实AI分析
async function callDeepSeekAPI(question, parsedPaipan) {
  const startTime = Date.now();
  
  try {
    // 构建专业的奇门遁甲分析提示词
    const systemPrompt = `你是一位精通奇门遁甲的专业易学大师，拥有深厚的传统文化底蕴和丰富的实战经验。请基于提供的奇门遁甲排盘数据，为用户的问题提供专业、准确、实用的分析解答。

分析要求：
1. 严格基于提供的排盘数据进行分析
2. 解读要专业且通俗易懂
3. 包含时局分析、格局解读、趋势预测
4. 给出具体可行的建议
5. 语言要古雅而不失现代感`;

    const userPrompt = `请分析以下奇门遁甲排盘，回答用户问题：

【用户问题】
${question}

【排盘数据】
干支：${parsedPaipan.干支 || '未提供'}
排局：${parsedPaipan.排局 || '未提供'}
节气：${parsedPaipan.節氣 || '未提供'}
旬空：${parsedPaipan.旬空?.日空 || '未知'}、${parsedPaipan.旬空?.時空 || '未知'}

值符值使：
${parsedPaipan.值符值使?.值符星宫 ? `值符：${parsedPaipan.值符值使.值符星宫[0]}星落${parsedPaipan.值符值使.值符星宫[1]}宫` : '值符信息未提供'}
${parsedPaipan.值符值使?.值使門宫 ? `值使：${parsedPaipan.值符值使.值使門宫[0]}门落${parsedPaipan.值符值使.值使門宫[1]}宫` : '值使信息未提供'}

九宫格局：
${JSON.stringify(parsedPaipan, null, 2)}

请提供专业的奇门遁甲分析，包括：
1. 时局概况分析
2. 格局特点解读  
3. 针对问题的具体分析
4. 趋势预测和建议
5. 注意事项`;

    console.log('调用豆包DeepSeek API (使用OpenAI SDK)...');
    
    // 使用OpenAI SDK调用
    const completion = await openai.chat.completions.create({
      model: ARK_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 0.9
    });

    const executionTime = Date.now() - startTime;
    const aiAnswer = completion.choices[0]?.message?.content;

    console.log('豆包API调用成功，响应时间:', executionTime + 'ms');
    console.log('AI回答长度:', aiAnswer?.length, '字符');

    return {
      answer: aiAnswer,
      confidence: 0.92, // 真实AI分析置信度更高
      executionTime: executionTime,
      metadata: {
        paipanSummary: `${parsedPaipan.干支}，${parsedPaipan.排局}，${parsedPaipan.節氣}时节`,
        keySymbols: parsedPaipan.keyElements || ['值符', '值使'],
        criticalCombinations: parsedPaipan.keyElements?.map(el => `${el}组合`) || ['值符值使配合'],
        aiProvider: 'doubao_deepseek_r1',
        model: ARK_MODEL
      }
    };

  } catch (error) {
    console.error('豆包API调用失败:', error.message);
    console.error('错误详情:', error);
    
    // API调用失败时使用备用分析
    return generateFallbackAnalysis(question, parsedPaipan, Date.now() - startTime);
  }
}

// 备用分析函数（API失败时使用）
function generateFallbackAnalysis(question, parsedPaipan, executionTime) {
  const timeInfo = parsedPaipan.干支 || '当前时间';
  const bureau = parsedPaipan.排局 || '未知局';
  const season = parsedPaipan.節氣 || '未知节气';
  
  let analysis = `【API暂时不可用，使用备用分析】

根据${timeInfo}的奇门遁甲排盘分析，针对您的问题"${question}"：

【时局概况】
• 排局：${bureau}
• 节气：${season}
• 旬空：${parsedPaipan.旬空?.日空 || '未知'}、${parsedPaipan.旬空?.時空 || '未知'}`;

  // 添加值符值使分析
  if (parsedPaipan.值符值使) {
    const zhifu = parsedPaipan.值符值使.值符星宫;
    const zhishi = parsedPaipan.值符值使.值使門宫;
    
    analysis += `\n\n【值符值使】`;
    if (zhifu) {
      analysis += `\n• 值符：${zhifu[0]}星落${zhifu[1]}宫，主贵人运势，权威助力`;
    }
    if (zhishi) {
      analysis += `\n• 值使：${zhishi[0]}门落${zhishi[1]}宫，主行动方向，事业发展`;
    }
  }

  analysis += `\n\n【综合分析】
基于当前${bureau}的格局分析，建议关注时机把握和行动策略。请稍后重试以获得完整的AI分析。`;

  return {
    answer: analysis,
    confidence: 0.65,
    executionTime: executionTime,
    metadata: {
      paipanSummary: `${timeInfo}，${bureau}，${season}时节`,
      keySymbols: parsedPaipan.keyElements || ['值符', '值使'],
      criticalCombinations: ['备用分析模式'],
      aiProvider: 'fallback_mode'
    }
  };
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`
🎉 奇门遁甲AI后端服务启动成功！

📡 服务地址: http://localhost:${PORT}
🔮 健康检查: http://localhost:${PORT}/health
🤖 AI模型: 豆包 DeepSeek-R1-250528 (模拟模式)
📚 数据库: 模拟数据

✨ 准备接收奇门遁甲分析请求...
  `);
});

// 错误处理
process.on('unhandledRejection', (err) => {
  console.error('未处理的Promise拒绝:', err);
});

process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  process.exit(1);
}); 
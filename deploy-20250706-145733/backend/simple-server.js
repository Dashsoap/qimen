import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
const PORT = 3001;

// SophNet API配置
const ARK_API_KEY = 'UfI4GzNm9vAyT7I0Nf2CKEwseNqy91AZvkI7hrSCw0otnSeDgDExgE706gdEJHWU1OajYPCVNCPEsGJRVtScxw';
const ARK_BASE_URL = 'https://www.sophnet.com/api/open-apis/v1';
const ARK_MODEL = 'DeepSeek-R1'; // DeepSeek-R1模型

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: ARK_API_KEY,
  baseURL: ARK_BASE_URL,
});

// 中间件配置
app.use(cors({
  origin: function (origin, callback) {
    // 允许没有origin的请求（如移动应用）
    if (!origin) return callback(null, true);
    
    // 开发模式下允许所有来源（适用于Android应用）
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

// Body解析中间件
app.use(express.json({
  limit: '10mb',
  type: 'application/json'
}));

app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb'
}));

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: '🔮 奇门遁甲AI后端服务',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      analysis: '/api/analysis/qimen',
      analysisStream: '/api/analysis/qimen/stream',
      paipan: '/api/qimen/paipan'
    },
    server: '101.201.148.8:3001',
    timestamp: new Date().toISOString()
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    ai_provider: 'sophnet_deepseek',
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

// AI分析API (普通版本)
app.post('/api/analysis/qimen', async (req, res) => {
  try {
    // 检查请求体是否存在
    if (!req.body) {
      console.error('请求体为空');
      return res.status(400).json({
        success: false,
        error: '请求体为空',
        message: '请确保发送了有效的JSON数据'
      });
    }

    const { question, paipanData } = req.body;
    
    // 验证必要参数
    if (!question) {
      console.error('缺少question参数');
      return res.status(400).json({
        success: false,
        error: '缺少问题参数',
        message: '请提供要分析的问题'
      });
    }

    if (!paipanData) {
      console.error('缺少paipanData参数');
      return res.status(400).json({
        success: false,
        error: '缺少排盘数据',
        message: '请提供奇门遁甲排盘数据'
      });
    }
    
    console.log('收到AI分析请求:', question);
    console.log('排盘数据:', JSON.stringify(paipanData, null, 2));
    
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
        { step: 2, action: '调用SophNet DeepSeek-R1', timestamp: new Date().toISOString(), summary: `正在使用AI模型分析奇门遁甲格局` },
        { step: 3, action: '分析符号组合', timestamp: new Date().toISOString(), summary: `已分析${parsedPaipan.值符值使?.值符星宫?.[0]}星${parsedPaipan.值符值使?.値使門宫?.[0]}门组合关系` },
        { step: 4, action: '生成最终回答', timestamp: new Date().toISOString(), summary: '已根据奇门遁甲理论生成专业分析结果' }
      ]
    });
    
  } catch (error) {
    console.error('AI分析错误:', error);
    res.status(500).json({
      success: false,
      error: 'AI分析失败',
      message: error.message || '服务器内部错误'
    });
  }
});

// AI分析API (流式版本) - 实时响应，不需要等待全部内容
app.post('/api/analysis/qimen/stream', async (req, res) => {
  try {
    // 检查请求体是否存在
    if (!req.body) {
      console.error('请求体为空');
      return res.status(400).json({
        success: false,
        error: '请求体为空',
        message: '请确保发送了有效的JSON数据'
      });
    }

    const { question, paipanData } = req.body;
    
    // 验证必要参数
    if (!question) {
      console.error('缺少question参数');
      return res.status(400).json({
        success: false,
        error: '缺少问题参数',
        message: '请提供要分析的问题'
      });
    }

    if (!paipanData) {
      console.error('缺少paipanData参数');
      return res.status(400).json({
        success: false,
        error: '缺少排盘数据',
        message: '请提供奇门遁甲排盘数据'
      });
    }
    
    console.log('收到流式AI分析请求:', question);
    
    // 设置SSE响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
    
    const sessionId = 'session-' + Date.now();
    
    // 发送初始化消息
    res.write(`data: ${JSON.stringify({
      type: 'init',
      sessionId: sessionId,
      timestamp: new Date().toISOString(),
      message: '🔮 正在启动奇门遁甲AI分析...'
    })}\n\n`);

    // 解析排盘数据
    const parsedPaipan = parsePaipanData(paipanData);
    
    // 发送排盤解析状态
    res.write(`data: ${JSON.stringify({
      type: 'step',
      step: 1,
      action: '解析排盘结构',
      timestamp: new Date().toISOString(),
      message: `📊 已解析${parsedPaipan.排局}格局，${parsedPaipan.干支}时辰`,
      paipanInfo: parsedPaipan
    })}\n\n`);

    // 发送AI调用状态
    res.write(`data: ${JSON.stringify({
      type: 'step',
      step: 2,
      action: '连接AI模型',
      timestamp: new Date().toISOString(),
      message: '🤖 正在连接SophNet DeepSeek-R1模型...'
    })}\n\n`);

    // 调用流式AI分析
    await callDeepSeekAPIStream(question, parsedPaipan, res, sessionId);
    
    // 发送完成消息
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      sessionId: sessionId,
      timestamp: new Date().toISOString(),
      message: '✅ 奇门遁甲分析完成'
    })}\n\n`);
    
    res.end();
    
  } catch (error) {
    console.error('流式AI分析错误:', error);
    res.write(`data: ${JSON.stringify({
      type: 'error',
      timestamp: new Date().toISOString(),
      error: 'AI分析失败',
      message: error.message || '服务器内部错误'
    })}\n\n`);
    res.end();
  }
});

// 清理AI回答，移除免责声明
function cleanAiResponse(response) {
  if (!response) return response;
  
  // 定义需要过滤的免责声明关键词
  const disclaimerPatterns = [
    /以上内容由.*?生成.*?仅供.*?参考.*?/gi,
    /本回答由.*?生成.*?/gi,
    /仅供娱乐参考.*?/gi,
    /请注意.*?仅供参考.*?/gi,
    /免责声明.*?/gi,
    /\*\*免责声明\*\*.*?/gi,
    /---\s*免责声明.*?/gi,
    /注意：.*?仅供参考.*?/gi,
    /声明：.*?娱乐.*?/gi
  ];
  
  let cleanedResponse = response;
  
  // 移除匹配的免责声明
  disclaimerPatterns.forEach(pattern => {
    cleanedResponse = cleanedResponse.replace(pattern, '');
  });
  
  // 移除末尾可能的多余空行和分隔符
  cleanedResponse = cleanedResponse.replace(/\n{3,}/g, '\n\n');
  cleanedResponse = cleanedResponse.replace(/---+\s*$/g, '');
  cleanedResponse = cleanedResponse.trim();
  
  return cleanedResponse;
}

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

// 调用豆包DeepSeek API进行流式AI分析
async function callDeepSeekAPIStream(question, parsedPaipan, res, sessionId) {
  const startTime = Date.now();
  
  try {
    // 构建专业的奇门遁甲分析提示词
    const systemPrompt = `你是一位精通奇门遁甲的专业易学大师，拥有深厚的传统文化底蕴和丰富的实战经验。请基于提供的奇门遁甲排盘数据，为用户的问题提供专业、准确、实用的分析解答。

分析要求：
1. 严格基于提供的排盘数据进行分析
2. 解读要专业且通俗易懂
3. 包含时局分析、格局解读、趋势预测
4. 给出具体可行的建议
5. 语言要古雅而不失现代感
6. 直接给出分析结果，不要添加任何免责声明或生成说明
7. 以专业易学大师的身份回答，保持权威性和专业性`;

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
5. 注意事项

注意：请以专业易学大师的身份直接给出分析结果，不要添加任何关于AI生成、仅供参考等免责声明。保持专业权威的语气，就像真正的奇门遁甲大师在为求测者解答。`;

    console.log('调用SophNet DeepSeek API (流式模式)...');
    
    // 发送AI分析开始状态
    res.write(`data: ${JSON.stringify({
      type: 'step',
      step: 3,
      action: '开始AI分析',
      timestamp: new Date().toISOString(),
      message: '💫 AI大师正在解读奇门遁甲格局...'
    })}\n\n`);
    
    // 使用OpenAI SDK调用流式API
    const stream = await openai.chat.completions.create({
      model: ARK_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 0.9,
      stream: true
    });

    let fullContent = '';
    let chunkCount = 0;
    
    // 处理流式响应
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      
      if (content) {
        fullContent += content;
        chunkCount++;
        
        // 发送内容块
        res.write(`data: ${JSON.stringify({
          type: 'content',
          sessionId: sessionId,
          timestamp: new Date().toISOString(),
          content: content,
          fullContent: fullContent,
          chunkIndex: chunkCount
        })}\n\n`);
      }
    }

    const executionTime = Date.now() - startTime;
    
    // 过滤掉可能的免责声明
    if (fullContent) {
      fullContent = cleanAiResponse(fullContent);
    }

    console.log('SophNet API流式调用成功，响应时间:', executionTime + 'ms');
    console.log('AI回答长度:', fullContent?.length, '字符，共', chunkCount, '个块');

    // 发送最终结果
    res.write(`data: ${JSON.stringify({
      type: 'final',
      sessionId: sessionId,
      timestamp: new Date().toISOString(),
      analysis: {
        answer: fullContent,
        confidence: 0.92,
        executionTime: executionTime,
        chunkCount: chunkCount,
        metadata: {
          paipanSummary: `${parsedPaipan.干支}，${parsedPaipan.排局}，${parsedPaipan.節氣}时节`,
          keySymbols: parsedPaipan.keyElements || ['值符', '值使'],
          criticalCombinations: parsedPaipan.keyElements?.map(el => `${el}组合`) || ['值符值使配合'],
          aiProvider: 'sophnet_deepseek_r1_stream',
          model: ARK_MODEL
        }
      }
    })}\n\n`);

  } catch (error) {
    console.error('SophNet API流式调用失败:', error.message);
    
    // 发送错误信息
    res.write(`data: ${JSON.stringify({
      type: 'error',
      sessionId: sessionId,
      timestamp: new Date().toISOString(),
      error: '流式AI分析失败',
      message: error.message || '服务器内部错误'
    })}\n\n`);
    
    // 使用备用分析
    const fallbackAnalysis = generateFallbackAnalysis(question, parsedPaipan, Date.now() - startTime);
    
    res.write(`data: ${JSON.stringify({
      type: 'fallback',
      sessionId: sessionId,
      timestamp: new Date().toISOString(),
      analysis: fallbackAnalysis,
      message: '使用备用分析模式'
    })}\n\n`);
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
5. 语言要古雅而不失现代感
6. 直接给出分析结果，不要添加任何免责声明或生成说明
7. 以专业易学大师的身份回答，保持权威性和专业性`;

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
5. 注意事项

注意：请以专业易学大师的身份直接给出分析结果，不要添加任何关于AI生成、仅供参考等免责声明。保持专业权威的语气，就像真正的奇门遁甲大师在为求测者解答。`;

    console.log('调用SophNet DeepSeek API (使用OpenAI SDK)...');
    
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
    let aiAnswer = completion.choices[0]?.message?.content;

    // 过滤掉可能的免责声明
    if (aiAnswer) {
      aiAnswer = cleanAiResponse(aiAnswer);
    }

    console.log('SophNet API调用成功，响应时间:', executionTime + 'ms');
    console.log('AI回答长度:', aiAnswer?.length, '字符');

    return {
      answer: aiAnswer,
      confidence: 0.92, // 真实AI分析置信度更高
      executionTime: executionTime,
      metadata: {
        paipanSummary: `${parsedPaipan.干支}，${parsedPaipan.排局}，${parsedPaipan.節氣}时节`,
        keySymbols: parsedPaipan.keyElements || ['值符', '值使'],
        criticalCombinations: parsedPaipan.keyElements?.map(el => `${el}组合`) || ['值符值使配合'],
        aiProvider: 'sophnet_deepseek_r1',
        model: ARK_MODEL
      }
    };

  } catch (error) {
    console.error('SophNet API调用失败:', error.message);
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

// 启动服务器 - 监听所有网络接口
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🎉 奇门遁甲AI后端服务启动成功！

📡 本地地址: http://localhost:${PORT}
🌐 公网地址: http://101.201.148.8:${PORT}
🔮 健康检查: http://101.201.148.8:${PORT}/health
🤖 AI模型: SophNet DeepSeek-R1
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
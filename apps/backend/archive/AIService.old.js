import OpenAI from 'openai';

/**
 * AI分析策略枚举
 */
export const AnalysisStrategy = {
  SIMPLE: 'simple',
  DEEP: 'deep',
  STREAM: 'stream',
  MASTER: 'master'  // 新增：专业大师解盘模式
};

/**
 * AI服务配置
 */
const AI_CONFIG = {
  ARK_API_KEY: process.env.ARK_API_KEY || 'UfI4GzNm9vAyT7I0Nf2CKEwseNqy91AZvkI7hrSCw0otnSeDgDExgE706gdEJHWU1OajYPCVNCPEsGJRVtScxw',
  ARK_BASE_URL: process.env.ARK_BASE_URL || 'https://www.sophnet.com/api/open-apis/v1',
  ARK_MODEL: process.env.ARK_MODEL || 'DeepSeek-R1',
  MAX_TOKENS: {
    simple: 1000,
    deep: 2000,
    stream: 2000,
    master: 3000  // 专业大师模式需要更多tokens
  },
  TEMPERATURE: {
    simple: 0.5,
    deep: 0.7,
    stream: 0.7,
    master: 0.6   // 专业大师模式稍微降低随机性
  }
};

/**
 * 丁未奇门遁甲分析服务
 */
export class QimenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: AI_CONFIG.ARK_API_KEY,
      baseURL: AI_CONFIG.ARK_BASE_URL,
    });
    
    // 分析策略映射
    this.strategies = {
      [AnalysisStrategy.SIMPLE]: this.simpleAnalysis.bind(this),
      [AnalysisStrategy.DEEP]: this.deepAnalysis.bind(this),
      [AnalysisStrategy.STREAM]: this.streamAnalysis.bind(this),
      [AnalysisStrategy.MASTER]: this.masterAnalysis.bind(this)
    };
  }

  /**
   * 带上下文的AI分析
   * @param {string} question - 用户问题
   * @param {Object} paipanData - 排盘数据
   * @param {Array} contextMessages - 历史消息上下文
   * @param {string} strategy - 分析策略
   * @param {Object} options - 额外选项
   * @returns {Promise<Object>} 分析结果
   */
  async analyzeWithContext(question, paipanData, contextMessages = [], strategy = AnalysisStrategy.SIMPLE, options = {}) {
    options.contextMessages = contextMessages;
    return this.analyze(question, paipanData, strategy, options);
  }

  /**
   * 统一的AI分析入口
   * @param {string} question - 用户问题
   * @param {Object} paipanData - 排盘数据
   * @param {string} strategy - 分析策略
   * @param {Object} options - 额外选项
   * @returns {Promise<Object>} 分析结果
   */
  async analyze(question, paipanData, strategy = AnalysisStrategy.SIMPLE, options = {}) {
    try {
      // 验证输入
      this.validateInput(question, paipanData);
      
      // 解析排盘数据
      const parsedPaipan = this.parsePaipanData(paipanData);
      
      // 选择分析策略
      const analysisMethod = this.strategies[strategy];
      if (!analysisMethod) {
        throw new Error(`不支持的分析策略: ${strategy}`);
      }
      
      // 执行分析
      const startTime = Date.now();
      const result = await analysisMethod(question, parsedPaipan, options);
      const executionTime = Date.now() - startTime;
      
      // 统一响应格式
      return this.formatResponse(result, {
        strategy,
        executionTime,
        question,
        paipanInfo: parsedPaipan,
        ...options
      });
      
    } catch (error) {
      console.error('AI分析错误:', error);
      return this.handleError(error, question, paipanData);
    }
  }

  /**
   * 简单分析策略
   * @param {string} question - 用户问题
   * @param {Object} parsedPaipan - 解析后的排盘数据
   * @param {Object} options - 选项
   * @returns {Promise<string>} 分析结果
   */
  async simpleAnalysis(question, parsedPaipan, options = {}) {
    const prompt = this.buildSimplePrompt(question, parsedPaipan);
    
    const response = await this.openai.chat.completions.create({
      model: AI_CONFIG.ARK_MODEL,
      messages: [
        {
          role: "system",
          content: `你是一位资深的奇门遁甲专家，具备以下能力：
- 精通奇门遁甲理论体系和实战应用
- 能够准确解读九宫八门九星八神组合
- 擅长根据用神状态判断吉凶趋势
- 注重实用性，提供可操作的建议
- 语言简洁专业，逻辑清晰有条理

请始终保持专业、准确、实用的分析风格。`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: AI_CONFIG.TEMPERATURE.simple,
      max_tokens: AI_CONFIG.MAX_TOKENS.simple
    });

    return this.cleanAiResponse(response.choices[0].message.content);
  }

  /**
   * 深度分析策略
   * @param {string} question - 用户问题
   * @param {Object} parsedPaipan - 解析后的排盘数据
   * @param {Object} options - 选项
   * @returns {Promise<string>} 分析结果
   */
  async deepAnalysis(question, parsedPaipan, options = {}) {
    const prompt = this.buildDeepPrompt(question, parsedPaipan);
    
    const response = await this.openai.chat.completions.create({
      model: AI_CONFIG.ARK_MODEL,
      messages: [
        {
          role: "system",
          content: `# 奇门遁甲大师解盘系统

## 🎭 角色与专业定位
你是一位集传统与实践于一体的奇门遁甲大师。你师承多代秘传，精通奇门各派系（三元、三盘、三式），尤其擅长实战应用与预测验证。你具备以下特质：

- 深厚的历史传承，掌握从《太乙遁甲》、《烟波钓叟歌》到《奇门遁甲统宗》的古典精髓
- 精通奇门核心体系：三奇（乙、丙、丁）、六仪（戊、己、庚、辛、壬、癸）、九宫八卦、九星、八门、八神等
- 熟悉各派奇门体系的差异与应用场景，能根据问题选择最适合的盘法
- 理性客观的解读风格，平衡术数传统与现代思维，注重实用性与可操作性
- 卓越的盘面验证能力，能准确将抽象的盘面信息与卦主实际情况对应，形成完整的预测验证闭环

## 🎯 任务目标与成功标准
你的核心任务是根据系统提供的奇门盘信息，进行专业、多层次的解读、验证与指导：

1. 接收并确认系统提供的完整盘面信息
2. 分析卦主当前情况，验证盘面与现实的对应关系
3. 精准解读盘面象意：分析盘中三奇六仪、九星、八门、八神的组合关系及其象意
4. 分析吉凶方位时空：判断有利方位、时间与行为，识别潜在风险
5. 提供切实可行的建议：基于盘面分析给出具体、可操作的指导
6. 传递奇门知识：在解读过程中适当解释理论，帮助用户理解判断依据

## 🧠 解盘分析方法论
解读奇门盘时，你将遵循以下系统化思路：

1. **盘面接收与确认** - 接收系统提供的完整盘面信息，确认盘面类型与格局
2. **卦主情况分析与验证** - 分析卦主当前关键情况特征，验证盘面准确性
3. **整体盘面审视** - 确认奇门体系、判定局数、识别值符值使落宫
4. **用神与主体分析** - 确定用神宫位，分析用神宫所乘之门、所临之神
5. **三传与变化研判** - 分析初传、中传、末传的发展路径
6. **综合吉凶与策略制定** - 结合全盘分析判定总体吉凶，制定行动策略

## 🛡️ 伦理约束
- 始终强调奇门遁甲是中国古代术数智慧传统，而非绝对真理
- 避免做出过于决定性或可能导致严重后果的建议
- 不针对健康、生死、婚姻等重大事项做出确定性预测
- 鼓励用户保持理性思考，将解读作为参考而非唯一依据
- 若盘面信息不足，会明确指出并请求补充，不强行解读
- 遵循"趋吉避凶"原则，即使是凶盘也着重提供应对策略

请严格按照用户提供的专业格式进行解盘分析。`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: AI_CONFIG.TEMPERATURE.deep,
      max_tokens: AI_CONFIG.MAX_TOKENS.deep
    });

    return this.cleanAiResponse(response.choices[0].message.content);
  }

  /**
   * 流式分析策略
   * @param {string} question - 用户问题
   * @param {Object} parsedPaipan - 解析后的排盘数据
   * @param {Object} options - 选项（包含res对象用于流式响应）
   * @returns {Promise<string>} 分析结果
   */
  async streamAnalysis(question, parsedPaipan, options = {}) {
    const { res, sessionId } = options;
    
    if (!res) {
      throw new Error('Response对象未提供，无法进行流式分析');
    }

    // 预防措施：检查响应是否已结束
    if (res.headersSent || res.destroyed) {
      console.warn('⚠️ Response已发送或销毁，跳过流式分析');
      return;
    }

    console.log('🔍 开始解析排盘数据...');
    console.log('📊 排盘数据内容:', JSON.stringify(parsedPaipan, null, 2));

    const prompt = this.buildDeepPrompt(question, parsedPaipan);

    let fullResponse = '';
    let chunkCount = 0;
    
    // 获取当前时间信息
    const currentDate = new Date();
    const currentTimeInfo = {
      年份: currentDate.getFullYear(),
      月份: currentDate.getMonth() + 1,
      日期: currentDate.getDate(),
      时间: currentDate.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
      农历信息: '请基于实际农历时间计算'
    };

    try {
      console.log(`🚀 开始流式分析 - SessionID: ${sessionId}, Question: ${question}`);
      
      // 发送开始事件
      this.sendSSEEvent(res, 'data', {
        type: 'init',
        sessionId,
        question,
        timestamp: new Date().toISOString(),
        message: '🔮 正在启动丁未奇门遁甲分析...',
        paipanInfo: parsedPaipan
      });

      const stream = await this.openai.chat.completions.create({
        model: AI_CONFIG.ARK_MODEL,
        messages: [
          {
            role: "system",
            content: `# 奇门遁甲大师解盘系统

## 🎭 角色与专业定位
你是一位集传统与实践于一体的奇门遁甲大师。你师承多代秘传，精通奇门各派系（三元、三盘、三式），尤其擅长实战应用与预测验证。你具备以下特质：

- 深厚的历史传承，掌握从《太乙遁甲》、《烟波钓叟歌》到《奇门遁甲统宗》的古典精髓
- 精通奇门核心体系：三奇（乙、丙、丁）、六仪（戊、己、庚、辛、壬、癸）、九宫八卦、九星、八门、八神等
- 熟悉各派奇门体系的差异与应用场景，能根据问题选择最适合的盘法
- 理性客观的解读风格，平衡术数传统与现代思维，注重实用性与可操作性
- 卓越的盘面验证能力，能准确将抽象的盘面信息与卦主实际情况对应，形成完整的预测验证闭环

## ⏰ 重要时间提醒
**当前实际时间**: ${currentTimeInfo.时间}
**分析基准年份**: ${currentTimeInfo.年份}年
**分析基准月份**: ${currentTimeInfo.月份}月

⚠️ **关键指示**：
- 你必须基于上述当前实际时间进行所有时间相关的分析和建议
- 在提供"吉利时段"时，必须从当前时间开始计算未来的时间点
- 绝对不可使用2023年、2024年等过去的时间作为建议
- 所有时间建议都应该是从${currentTimeInfo.年份}年${currentTimeInfo.月份}月开始的未来时间

## 🎯 任务目标与成功标准
你的核心任务是根据系统提供的奇门盘信息，进行专业、多层次的解读、验证与指导：

1. 接收并确认系统提供的完整盘面信息
2. 分析卦主当前情况，验证盘面与现实的对应关系
3. 精准解读盘面象意：分析盘中三奇六仪、九星、八门、八神的组合关系及其象意
4. 分析吉凶方位时空：判断有利方位、时间与行为，识别潜在风险
5. 提供切实可行的建议：基于盘面分析给出具体、可操作的指导
6. 传递奇门知识：在解读过程中适当解释理论，帮助用户理解判断依据

## 🧠 解盘分析方法论
解读奇门盘时，你将遵循以下系统化思路：

1. **盘面接收与确认** - 接收系统提供的完整盘面信息，确认盘面类型与格局
2. **卦主情况分析与验证** - 分析卦主当前关键情况特征，验证盘面准确性
3. **整体盘面审视** - 确认奇门体系、判定局数、识别值符值使落宫
4. **用神与主体分析** - 确定用神宫位，分析用神宫所乘之门、所临之神
5. **三传与变化研判** - 分析初传、中传、末传的发展路径
6. **综合吉凶与策略制定** - 结合全盘分析判定总体吉凶，制定行动策略

## 🛡️ 伦理约束
- 始终强调奇门遁甲是中国古代术数智慧传统，而非绝对真理
- 避免做出过于决定性或可能导致严重后果的建议
- 不针对健康、生死、婚姻等重大事项做出确定性预测
- 鼓励用户保持理性思考，将解读作为参考而非唯一依据
- 若盘面信息不足，会明确指出并请求补充，不强行解读
- 遵循"趋吉避凶"原则，即使是凶盘也着重提供应对策略

请严格按照用户提供的专业格式进行解盘分析。`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        stream: true,
        max_tokens: AI_CONFIG.MAX_TOKENS.stream,
        temperature: AI_CONFIG.TEMPERATURE.stream
      });

      console.log('📡 开始接收AI流式响应');

      // 处理流式响应
      for await (const chunk of stream) {
        if (res.destroyed) {
          console.log('⚠️ 连接已断开，停止流式响应');
          break;
        }

        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          chunkCount++;
          fullResponse += content;
          
          // 每10个chunk输出一次日志
          if (chunkCount % 10 === 0) {
            console.log(`📊 已接收 ${chunkCount} 个chunk, 总长度: ${fullResponse.length}`);
          }
          
          this.sendSSEEvent(res, 'data', {
            type: 'content',
            content: content,
            fullContent: fullResponse,
            timestamp: new Date().toISOString()
          });
          
          // 每20个chunk详细调试一次
          if (chunkCount % 20 === 0) {
            console.log(`📊 详细调试 - Chunk ${chunkCount}: content长度=${content.length}, fullResponse长度=${fullResponse.length}`);
            console.log(`📊 fullResponse结尾50字符:`, fullResponse.substring(Math.max(0, fullResponse.length - 50)));
          }
        }
      }

      console.log(`✅ AI流式响应完成 - 总chunk数: ${chunkCount}, 总长度: ${fullResponse.length}`);

      // 发送完成事件
      const executionTime = Date.now() - startTime;
      const cleanedAnswer = this.cleanAiResponse(fullResponse);
      console.log(`🧹 清理前长度: ${fullResponse.length}, 清理后长度: ${cleanedAnswer.length}`);
      console.log(`🧹 原始内容结尾50字符:`, fullResponse.substring(Math.max(0, fullResponse.length - 50)));
      console.log(`🧹 清理后内容结尾50字符:`, cleanedAnswer.substring(Math.max(0, cleanedAnswer.length - 50)));
      
      this.sendSSEEvent(res, 'data', {
        type: 'complete',
        sessionId,
        message: '✅ 分析完成',
        analysis: {
          answer: cleanedAnswer,
          confidence: 0.92,
          executionTime: executionTime
        },
        timestamp: new Date().toISOString()
      });

      console.log(`🎉 流式分析完成 - 耗时: ${executionTime}ms`);

    } catch (error) {
      console.error('❌ 流式分析错误:', error);
      this.sendSSEEvent(res, 'data', {
        type: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      try {
        res.end();
        console.log('🔚 SSE连接已关闭');
      } catch (e) {
        console.warn('⚠️ 关闭SSE连接时出错:', e.message);
      }
    }

    return this.cleanAiResponse(fullResponse);
  }

  /**
   * 专业大师解盘分析策略
   * @param {string} question - 用户问题
   * @param {Object} parsedPaipan - 解析后的排盘数据
   * @param {Object} options - 选项
   * @returns {Promise<string>} 分析结果
   */
  async masterAnalysis(question, parsedPaipan, options = {}) {
    console.log('🎯 开始MASTER模式分析');
    
    // 获取当前时间信息
    const currentDate = new Date();
    const currentTimeInfo = {
      年份: currentDate.getFullYear(),
      月份: currentDate.getMonth() + 1,
      日期: currentDate.getDate(),
      时间: currentDate.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
      农历信息: '请基于实际农历时间计算'
    };

    const prompt = this.buildMasterPrompt(question, parsedPaipan, currentTimeInfo);
    
    const response = await this.openai.chat.completions.create({
      model: AI_CONFIG.ARK_MODEL,
      messages: [
        {
          role: "system",
          content: `# 奇门遁甲大师解盘系统 🎭 

## ⏰ 重要时间提醒
**当前实际时间**: ${currentTimeInfo.时间}
**分析基准年份**: ${currentTimeInfo.年份}年
**分析基准月份**: ${currentTimeInfo.月份}月

⚠️ **关键指示**：
- 你必须基于上述当前实际时间进行所有时间相关的分析和建议
- 在提供"吉利时段"时，必须从当前时间开始计算未来的时间点
- 绝对不可使用2023年、2024年等过去的时间作为建议
- 所有时间建议都应该是从${currentTimeInfo.年份}年${currentTimeInfo.月份}月开始的未来时间

## 角色与专业定位
你是一位集传统与实践于一体的奇门遁甲大师。你师承多代秘传，精通奇门各派系（三元、三盘、三式），尤其擅长实战应用与预测验证。你具备以下特质：

深厚的历史传承，掌握从《太乙遁甲》、《烟波钓叟歌》到《奇门遁甲统宗》的古典精髓
精通奇门核心体系：三奇（乙、丙、丁）、六仪（戊、己、庚、辛、壬、癸）、九宫八卦、九星、八门、八神等
熟悉各派奇门体系的差异与应用场景，能根据问题选择最适合的盘法
理性客观的解读风格，平衡术数传统与现代思维，注重实用性与可操作性
卓越的盘面验证能力，能准确将抽象的盘面信息与卦主实际情况对应，形成完整的预测验证闭环

你的核心任务是根据系统提供的奇门盘信息，进行专业、多层次的解读、验证与指导：

1. 接收并确认系统提供的完整盘面信息
2. 分析卦主当前情况，验证盘面与现实的对应关系
3. 精准解读盘面象意：分析盘中三奇六仪、九星、八门、八神的组合关系及其象意
4. 分析吉凶方位时空：判断有利方位、时间与行为，识别潜在风险
5. 提供切实可行的建议：基于盘面分析给出具体、可操作的指导
6. 传递奇门知识：在解读过程中适当解释理论，帮助用户理解判断依据

请严格按照用户提供的专业格式进行解盘分析。`
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      max_tokens: AI_CONFIG.MAX_TOKENS.master,
      temperature: AI_CONFIG.TEMPERATURE.master
    });


    return this.cleanAiResponse(response.choices[0].message.content);
  }

  /**
   * 构建专业大师解盘提示词
   * @param {string} question - 用户问题
   * @param {Object} parsedPaipan - 解析后的排盘数据
   * @param {Object} currentTimeInfo - 当前时间信息
   * @returns {string} 提示词
   */
  buildMasterPrompt(question, parsedPaipan, currentTimeInfo) {
    return `# 奇门遁甲大师解盘任务

## 🎯 分析任务
**用户问题**: ${question}

## ⏰ 当前时间基准
**实际时间**: ${currentTimeInfo.时间}
**基准年份**: ${currentTimeInfo.年份}年
**基准月份**: ${currentTimeInfo.月份}月

⚠️ **重要提醒**: 所有时间相关的分析和建议必须基于上述当前实际时间，绝对不可使用过去的年份！

## 📊 系统提供的排盘信息
\`\`\`json
{
  "排局": "${parsedPaipan.排局}",
  "干支": "${parsedPaipan.干支}",
  "值符值使": ${JSON.stringify(parsedPaipan.值符值使, null, 2)},
  "九宫格局": ${JSON.stringify(parsedPaipan.九宫格局, null, 2)},
  "时间信息": ${JSON.stringify(parsedPaipan.时间信息 || {}, null, 2)}
}
\`\`\`

## 📋 解盘要求
请严格按照以下专业格式进行解读：

### 📊 盘面确认
【盘法】时家/地家/人盘 【局数】阳/阴遁第X局 【值符】X神落X宫 【值使】X门落X宫 【用神】X宫（说明选取理由）

### 👤 卦主现状分析
【主要特征】基于问题推测的3-5个关键特征
【盘面对应】这些特征在盘面中的体现
【验证结论】盘面与推测情况的吻合度评估

### 🔍 详细盘面分析
**【用神分析】**
- 用神所处环境（乘门临神组合）
- 吉凶格局判断
- 与值符值使关系

**【三传分析】**
- 初传：X宫情况与象意
- 中传：X宫情况与象意  
- 末传：X宫情况与象意
- 三传路径综合研判

**【重点宫位分析】**
- 重点宫位1：组合与象意
- 重点宫位2：组合与象意

### ⚖️ 吉凶判断
【总体格局】吉/凶/中平，原因分析
【有利因素】3-5点关键有利因素
【不利因素】3-5点需注意的风险点
【吉利方位】具体方位及理由
【吉利时段】⚠️ 必须从${currentTimeInfo.年份}年${currentTimeInfo.月份}月开始的未来时间点，如：${currentTimeInfo.年份}年某月某日

### 🧭 行动建议
【核心策略】1-2条总体策略建议
【具体行动】3-5条可执行的具体行动
【避忌要点】2-3条需要规避的行为
【时机选择】最佳行动时机建议（必须是${currentTimeInfo.年份}年之后的时间）

### 🔮 预测与验证
【短期预测】未来7天内可能发生的情况
【中期预测】未来1个月内的发展趋势
【验证要点】用户可关注的验证预测准确性的关键事件或迹象

### 📚 知识延伸
【理论解释】针对本次解盘中的1-2个重要概念进行简明解释
【应用启示】此盘面对未来类似情境的参考价值

---
**【奇门解读仅供参考，重要决策请综合理性判断。本解读基于传统奇门理论，非决定性预言，请辩证看待。奇门遁甲作为中华文化瑰宝，重在智慧启迪而非命运决定。】**`;
  }

  /**
   * 构建简单分析提示词
   * @param {string} question - 用户问题
   * @param {Object} parsedPaipan - 解析后的排盘数据
   * @returns {string} 提示词
   */
  buildSimplePrompt(question, parsedPaipan) {
    // 获取当前时间信息
    const currentDate = new Date();
    const currentTimeInfo = {
      年份: currentDate.getFullYear(),
      月份: currentDate.getMonth() + 1,
      日期: currentDate.getDate(),
      时间: currentDate.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    };

    return `# 奇门遁甲分析任务

## ⏰ 当前时间基准
**实际时间**: ${currentTimeInfo.时间}
**基准年份**: ${currentTimeInfo.年份}年

⚠️ **重要提醒**: 所有时间建议必须基于当前实际时间，不可使用过去的年份！

## 用户问题
${question}

## 排盘信息
- **排局**: ${parsedPaipan.排局}
- **干支**: ${parsedPaipan.干支}
- **值符值使**: ${JSON.stringify(parsedPaipan.值符值使)}

## 分析要求
请作为奇门遁甲专家，用300字以内简洁语言提供：
1. **核心判断**: 针对问题的直接回答（吉/凶/平/待定）
2. **主要依据**: 基于哪些关键符号和组合
3. **实用建议**: 具体可操作的建议（1-2条）
4. **时机提醒**: 最佳行动时间或注意节点（必须是${currentTimeInfo.年份}年之后的时间）

## 回答风格
- 语言简洁专业，避免冗长描述
- 突出重点，条理清晰
`;
  }

  /**
   * 构建专业奇门遁甲分析提示词
   * @param {string} question - 用户问题
   * @param {Object} parsedPaipan - 解析后的排盘数据
   * @returns {string} 提示词
   */
  buildDeepPrompt(question, parsedPaipan) {
    // 获取当前时间信息
    const currentDate = new Date();
    const currentTimeInfo = {
      年份: currentDate.getFullYear(),
      月份: currentDate.getMonth() + 1,
      日期: currentDate.getDate(),
      时间: currentDate.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    };

    return `# 奇门遁甲大师解盘任务

## 🎯 分析任务
**用户问题**: ${question}

## ⏰ 当前时间基准
**实际时间**: ${currentTimeInfo.时间}
**基准年份**: ${currentTimeInfo.年份}年
**基准月份**: ${currentTimeInfo.月份}月

⚠️ **重要提醒**: 所有时间相关的分析和建议必须基于上述当前实际时间，绝对不可使用过去的年份！

## 📊 系统提供的排盘信息
\`\`\`json
{
  "排局": "${parsedPaipan.排局}",
  "干支": "${parsedPaipan.干支}",
  "值符值使": ${JSON.stringify(parsedPaipan.值符值使, null, 2)},
  "九宫格局": ${JSON.stringify(parsedPaipan.九宫格局, null, 2)},
  "时间信息": ${JSON.stringify(parsedPaipan.时间信息 || {}, null, 2)}
}
\`\`\`

## 📋 解盘要求
请严格按照以下专业格式进行解读：

### 📊 盘面确认
【盘法】时家/地家/人盘 【局数】阳/阴遁第X局 【值符】X神落X宫 【值使】X门落X宫 【用神】X宫（说明选取理由）

### 👤 卦主现状分析
【主要特征】基于问题推测的3-5个关键特征
【盘面对应】这些特征在盘面中的体现
【验证结论】盘面与推测情况的吻合度评估

### 🔍 详细盘面分析
**【用神分析】**
- 用神所处环境（乘门临神组合）
- 吉凶格局判断
- 与值符值使关系

**【三传分析】**
- 初传：X宫情况与象意
- 中传：X宫情况与象意  
- 末传：X宫情况与象意
- 三传路径综合研判

**【重点宫位分析】**
- 重点宫位1：组合与象意
- 重点宫位2：组合与象意

### ⚖️ 吉凶判断
【总体格局】吉/凶/中平，原因分析
【有利因素】3-5点关键有利因素
【不利因素】3-5点需注意的风险点
【吉利方位】具体方位及理由
【吉利时段】⚠️ 必须从${currentTimeInfo.年份}年${currentTimeInfo.月份}月开始的未来时间点

### 🧭 行动建议
【核心策略】1-2条总体策略建议
【具体行动】3-5条可执行的具体行动
【避忌要点】2-3条需要规避的行为
【时机选择】最佳行动时机建议（必须是${currentTimeInfo.年份}年之后的时间）

### 🔮 预测与验证
【短期预测】未来7天内可能发生的情况
【中期预测】未来1个月内的发展趋势
【验证要点】用户可关注的验证预测准确性的关键事件或迹象

### 📚 知识延伸
【理论解释】针对本次解盘中的1-2个重要概念进行简明解释
【应用启示】此盘面对未来类似情境的参考价值

---
**【奇门解读仅供参考，重要决策请综合理性判断。本解读基于传统奇门理论，非决定性预言，请辩证看待。奇门遁甲作为中华文化瑰宝，重在智慧启迪而非命运决定。】**`;
  }

  /**
   * 解析排盘数据
   * @param {Object} paipanData - 前端优化后的排盘数据
   * @returns {Object} 解析后的排盘数据
   */
  parsePaipanData(paipanData) {
    if (!paipanData) {
      console.warn('排盘数据为空，使用默认数据');
      return {
        排局: "数据缺失",
        干支: "数据缺失",
        值符值使: {},
        九宫格局: {},
        时间信息: {}
      };
    }

    // 前端已经优化了数据格式，直接使用
    const parsedData = {
      排局: paipanData.排局 || "数据缺失",
      干支: paipanData.干支 || "数据缺失",
      值符值使: paipanData.值符值使 || {},
      九宫格局: paipanData.九宫格局 || {},
      时间信息: paipanData.时间信息 || {}
    };

    // 打印解析结果用于调试
    console.log('🔍 解析排盘数据结果:', {
      排局: parsedData.排局,
      干支: parsedData.干支,
      九宫格局数量: Object.keys(parsedData.九宫格局).length,
      时间信息: Object.keys(parsedData.时间信息).length
    });

    return parsedData;
  }

  /**
   * 清理AI响应内容
   * @param {string} response - AI响应
   * @returns {string} 清理后的响应
   */
  cleanAiResponse(response) {
    if (!response) return '';
    
    return response
      .replace(/^\s+|\s+$/g, '') // 去除首尾空白
      .replace(/\n{3,}/g, '\n\n') // 压缩多余换行
      .replace(/【[\s\S]*?】\s*[:：]?\s*/g, '') // 可选：移除标题格式
      .trim();
  }

  /**
   * 验证输入参数
   * @param {string} question - 用户问题
   * @param {Object} paipanData - 排盘数据
   */
  validateInput(question, paipanData) {
    if (!question || typeof question !== 'string') {
      throw new Error('问题参数无效');
    }
    
    if (!paipanData || typeof paipanData !== 'object') {
      throw new Error('排盘数据无效');
    }
  }

  /**
   * 格式化响应
   * @param {string} analysis - 分析结果
   * @param {Object} metadata - 元数据
   * @returns {Object} 格式化的响应
   */
  formatResponse(analysis, metadata) {
    return {
      success: true,
      sessionId: metadata.sessionId || 'session-' + Date.now(),
      timestamp: new Date().toISOString(),
      strategy: metadata.strategy,
      executionTime: metadata.executionTime,
      analysis: analysis,
      paipanInfo: metadata.paipanInfo,
      question: metadata.question,
      steps: this.generateAnalysisSteps(metadata.strategy, metadata.executionTime)
    };
  }

  /**
   * 生成分析步骤
   * @param {string} strategy - 分析策略
   * @param {number} executionTime - 执行时间
   * @returns {Array} 分析步骤
   */
  generateAnalysisSteps(strategy, executionTime) {
    const baseSteps = [
      { step: 1, action: '解析排盘结构', timestamp: new Date().toISOString(), summary: '已解析奇门遁甲格局' },
      { step: 2, action: '调用AI分析引擎', timestamp: new Date().toISOString(), summary: `使用${strategy}策略分析` },
      { step: 3, action: '生成专业解读', timestamp: new Date().toISOString(), summary: `完成分析，耗时${executionTime}ms` }
    ];

    if (strategy === AnalysisStrategy.DEEP) {
      baseSteps.splice(2, 0, { 
        step: 3, 
        action: '深度符号解析', 
        timestamp: new Date().toISOString(), 
        summary: '分析九宫八门九星组合关系' 
      });
    }

    if (strategy === AnalysisStrategy.MASTER) {
      return [
        { step: 1, action: '盘面确认与验证', timestamp: new Date().toISOString(), summary: '确认盘法局数，选定用神' },
        { step: 2, action: '卦主现状分析', timestamp: new Date().toISOString(), summary: '验证盘面与现实对应关系' },
        { step: 3, action: '详细盘面解读', timestamp: new Date().toISOString(), summary: '用神分析、三传分析、宫位解读' },
        { step: 4, action: '吉凶判断与方位时机', timestamp: new Date().toISOString(), summary: '综合判断格局吉凶，确定有利因素' },
        { step: 5, action: '专业建议与预测', timestamp: new Date().toISOString(), summary: `专业大师解盘完成，耗时${executionTime}ms` }
      ];
    }

    return baseSteps;
  }

  /**
   * 发送SSE事件
   * @param {Object} res - 响应对象
   * @param {string} event - 事件类型
   * @param {Object} data - 事件数据
   */
  sendSSEEvent(res, event, data) {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  /**
   * 错误处理
   * @param {Error} error - 错误对象
   * @param {string} question - 用户问题
   * @param {Object} paipanData - 排盘数据
   * @returns {Object} 错误响应
   */
  handleError(error, question, paipanData) {
    console.error('AI分析服务错误:', error);
    
    // 生成备用分析
    const fallbackAnalysis = this.generateFallbackAnalysis(question, paipanData);
    
    return {
      success: false,
      error: error.message,
      fallbackAnalysis,
      timestamp: new Date().toISOString(),
      question,
      message: 'AI服务暂时不可用，已提供基础分析'
    };
  }

  /**
   * 生成备用分析
   * @param {string} question - 用户问题
   * @param {Object} paipanData - 排盘数据
   * @returns {string} 备用分析
   */
  generateFallbackAnalysis(question, paipanData) {
    return `抱歉，AI分析服务暂时不可用。请稍后再试。

【基础分析】：
根据您提供的问题"${question}"和当前排盘格局，建议您：
1. 关注时间节点的变化
2. 保持冷静和耐心
3. 注意观察周围环境的变化
4. 适时调整策略

【温馨提示】：
奇门遁甲仅供参考，重要决策还需结合实际情况综合考虑。`;
  }
}

// 导出单例
let aiServiceInstance = null;

export function createAIService() {
  if (!aiServiceInstance) {
    aiServiceInstance = new QimenAIService();
  }
  return aiServiceInstance;
}

export function getAIService() {
  if (!aiServiceInstance) {
    throw new Error('AIService not initialized. Call createAIService first.');
  }
  return aiServiceInstance;
} 
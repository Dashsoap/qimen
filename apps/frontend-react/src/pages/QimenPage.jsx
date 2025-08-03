import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import Qimen from '../qimendunjia/index.js';
import Config from '../qimendunjia/config.js';
import QimenItem from '../components/QimenItem';
import StreamAnalysis from '../components/StreamAnalysis';
import MeaningModal from '../components/MeaningModal';
import { setPanData } from '../stores/qimenSlice.js';
import { showPalaceInfo } from '../stores/infoSlice';
import './QimenPage.css';

const QimenPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { panData } = useSelector(state => state.qimen);
  
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  const questionInput = useRef(null);
  const streamAnalysisRef = useRef(null);

  // 专业问卜类型 - 1:1复刻Vue版本
  const professionalQuestions = {
    '官司诉讼': [
      '明天的官司能否胜诉？',
      '这场法律纠纷何时能有结果？',
      '选择哪位律师对案件更有利？',
      '是否应该接受庭外和解？'
    ],
    '事业决策': [
      '这个项目是否值得投资？',
      '何时是跳槽的最佳时机？',
      '与这个合作伙伴的生意能否成功？',
      '公司上市的时机是否合适？'
    ],
    '重大抉择': [
      '是否应该搬到新城市发展？',
      '这段婚姻是否应该继续？',
      '是否应该接受这个工作机会？',
      '何时是购买房产的最佳时机？'
    ],
    '健康疾病': [
      '这次手术的结果如何？',
      '何时能够康复？',
      '选择哪种治疗方案更好？',
      '是否需要更换医生？'
    ],
    '财运投资': [
      '这笔投资是否明智？',
      '何时是出售股票的最佳时机？',
      '这个生意伙伴是否可靠？',
      '是否应该贷款创业？'
    ],
    '人际关系': [
      '这个人是否值得信任？',
      '如何化解与同事的矛盾？',
      '这段感情是否有未来？',
      '是否应该原谅对方？'
    ]
  };

  // 起盘函数 - 1:1复刻Vue版本
  const paipan = () => {
    const now = dayjs();
    try {
      const qimen = new Qimen(now.year(), now.month() + 1, now.date(), now.hour());
      const data = qimen.p;
      
      // 重构数据格式以匹配Vue版本的显示需求
      const formattedData = {
        ...data,
        干支: `${data.干支1?.年}年 ${data.干支1?.月}月 ${data.干支1?.日}日 ${data.干支1?.時}时`,
        節氣: data.節氣,
        排局: data.排局,
        旬空: data.旬空,
        值符值使: data.值符值使,
        gongs: []
      };

      // 构建宫位数据
      const gongsCode = Config.gongs_code || {
        '一': '乾', '二': '坤', '三': '震', '四': '巽', '五': '中',
        '六': '离', '七': '兑', '八': '艮', '九': '坎'
      };

      for (const [index, gongName] of Object.entries(gongsCode)) {
        const gongData = {
          name: gongName,
          index: index,
          暗干: data.暗干?.[gongName] || '',
          八神: data.神?.[gongName] || '',
          九星: data.星?.[gongName] || '',
          八门: data.門?.[gongName] || '',
          天盘: data.天盤?.[0]?.[gongName] || '',
          天盘1: data.天盤?.[1]?.[gongName] || '',
          地盘: data.地盤?.[gongName] || '',
          旬空: data.旬空?.時空 || '',
          馬星: data.馬星?.驛馬 || ''
        };
        formattedData.gongs.push(gongData);
      }
      
      console.log('完整起盘数据:', formattedData);
      dispatch(setPanData(formattedData));
      return formattedData;
    } catch (error) {
      console.error('起盘失败:', error);
      return null;
    }
  };

  // 选择推荐问题 - 1:1复刻Vue版本的自动分析功能
  const selectRecommendedQuestion = async (questionText) => {
    setQuestion(questionText);
    setShowRecommendations(false);
    
    // 短暂延迟确保UI更新完成，然后自动开始分析
    setTimeout(async () => {
      await manualAnalyze(questionText);
    }, 500);
  };

  // 移动端输入法优化的分析函数 - 1:1复刻Vue版本
  const analyze = async () => {
    // 1. 强制输入框失去焦点，确保输入法完成输入
    if (questionInput.current) {
      questionInput.current.blur();
    }
    
    // 2. 等待输入法完成（特别是中文输入法）
    if (isComposing) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // 3. 等待React响应式更新
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 4. 多重验证获取问题内容
    let questionText = question?.trim() || '';
    
    // 如果React的值为空，直接从DOM获取
    if (!questionText && questionInput.current) {
      questionText = questionInput.current.value?.trim() || '';
      // 同步到React
      setQuestion(questionText);
    }
    
    if (!questionText) {
      alert('请输入占卜问题\n\n调试信息：\n' + 
            `React值: "${question}"\n` + 
            `DOM值: "${questionInput.current?.value || ''}"\n` +
            `组合状态: ${isComposing}`);
      return;
    }

    setLoading(true);

    try {
      // 先排盘
      if (!panData) {
        paipan();
      }
      
      if (streamAnalysisRef.current && streamAnalysisRef.current.startStreamAnalysis) {
        await streamAnalysisRef.current.startStreamAnalysis();
      } else {
        console.error('❌ StreamAnalysis组件未找到或方法不存在');
        throw new Error('流式分析组件加载失败');
      }
      
    } catch (error) {
      console.error('💥 启动流式分析失败:', error);
      alert(`启动分析失败: ${error.message}\n\n请刷新页面重试。`);
    } finally {
      setLoading(false);
    }
  };

  // 手动分析函数 - 1:1复刻Vue版本
  const manualAnalyze = async (questionText = null) => {
    const currentQuestion = questionText || question?.trim();
    if (!currentQuestion) {
      alert('请先输入占卜问题');
      return;
    }
    
    // 如果传入了问题文本，更新状态
    if (questionText) {
      setQuestion(questionText);
    }
    
    await analyze();
  };

  // 处理流式分析完成事件 - 1:1复刻Vue版本
  const handleStreamAnalysisComplete = (analysisResult) => {
    console.log('分析完成:', analysisResult);
  };

  // 显示宫位信息 - 1:1复刻Vue版本
  const showPalaceInfoHandler = (palaceName) => {
    const bagua = palaceName.replace('宫', '');
    
    // 从panData中获取宫位数据 - 使用类似Vue版本的逻辑
    let gongData = {};
    if (panData && panData.gongs) {
      const gong = panData.gongs.find(g => g.name === bagua);
      if (gong) {
        gongData = gong;
      }
    }
    
    let info = `${palaceName}信息：\n`;
    if (gongData.八神) info += `八神：${gongData.八神}\n`;
    if (gongData.九星) info += `九星：${gongData.九星}\n`;
    if (gongData.八门) info += `八门：${gongData.八门}\n`;
    
    dispatch(showPalaceInfo({ palaceName, htmlContent: info }));
  };

  // 组件挂载时起盘 - 1:1复刻Vue版本
  useEffect(() => {
    paipan();
    
    // 检查路由参数中是否有问题
    const searchParams = new URLSearchParams(location.search);
    const routeQuestion = searchParams.get('question');
    if (routeQuestion) {
      setQuestion(routeQuestion);
      // 如果有问题，自动开始分析
      setTimeout(async () => {
        await analyze();
      }, 800); // 稍微延迟确保组件完全加载
    }
  }, [location.search]);

  return (
    <div className="qimen-container">
      <div className="input-section">
        <div className="question-input">
          <input
            ref={questionInput}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isComposing) {
                manualAnalyze();
              }
            }}
            type="text"
            className="question-input-field"
            placeholder="请输入占卜问题（如：97年的我明天去打官司能不能赢？）"
          />
          <button 
            onClick={() => setShowRecommendations(!showRecommendations)} 
            className={`recommendation-toggle ${showRecommendations ? 'active' : ''}`}
          >
            {showRecommendations ? '收起' : '📝 推荐'}
          </button>
        </div>
        
        {/* 问题推荐区域 - 1:1复刻Vue版本 */}
        {showRecommendations && (
          <div className="recommendations-panel">
            <h4 className="panel-title">专业问卜类型</h4>
            <div className="recommendation-categories">
              {Object.entries(professionalQuestions).map(([category, questions]) => (
                <div key={category} className="rec-category">
                  <h5 className="rec-category-title">{category}</h5>
                  <div className="rec-question-list">
                    {questions.map((q, index) => (
                      <button 
                        key={index}
                        onClick={() => selectRecommendedQuestion(q)}
                        className="rec-question-btn"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 功能按钮 - 1:1复刻Vue版本 */}
        <div className="function-buttons">
          <button 
            onClick={manualAnalyze}
            className="function-btn analyze-btn"
            disabled={loading}
            title="立即分析"
          >
            <span className="btn-icon">🔮</span>
            <span className="btn-text">{loading ? '分析中...' : '立即分析'}</span>
          </button>
          <button 
            onClick={() => navigate('/history')} 
            className="function-btn history-btn" 
            title="查看历史记录"
          >
            <span className="btn-icon">📜</span>
            <span className="btn-text">历史记录</span>
          </button>
          <button 
            onClick={() => navigate('/favorites')} 
            className="function-btn favorites-btn" 
            title="查看收藏夹"
          >
            <span className="btn-icon">⭐</span>
            <span className="btn-text">我的收藏</span>
          </button>
        </div>
        
        {/* 流式AI分析组件 - 1:1复刻Vue版本 */}
        <StreamAnalysis 
          panData={panData} 
          questionValue={question}
          onAnalysisComplete={handleStreamAnalysisComplete}
          ref={streamAnalysisRef}
        />
      </div>

      {/* 结果显示区域 - 1:1复刻Vue版本 */}
      {panData && (
        <div className="result-section">
          {question && (
            <div className="question-display">
              <div className="question-title">问题：</div>
              <div className="question-content">{question}</div>
            </div>
          )}
          <div className="data-compact">
            <div className="data-row">
              <span className="data-pair">
                <span className="data-label">干支：</span>
                <span className="data-value">{panData.干支}</span>
              </span>
              <span className="data-pair">
                <span className="data-label">節氣：</span>
                <span className="data-value">{panData.節氣}</span>
              </span>
              <span className="data-pair">
                <span className="data-label">排局：</span>
                <span className="data-value">{panData.排局}</span>
              </span>
            </div>
            {panData.旬空 && (
              <div className="data-row">
                {Object.entries(panData.旬空).map(([key, item]) => (
                  <span key={`xunkong-${key}`} className="data-pair">
                    <span className="data-label">{key}：</span>
                    <span className="data-value">{item}</span>
                  </span>
                ))}
              </div>
            )}
            {panData.值符值使 && (
              <div className="data-row">
                {Object.entries(panData.值符值使).map(([key, item]) => (
                  <span key={`zhifu-${key}`} className="data-pair">
                    <span className="data-label">{key}：</span>
                    <span className="data-value">{item}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 奇门遁甲表格 - 1:1复刻Vue版本 */}
      <div className="bagua-wrapper">
        <div className="bagua-background"></div>
        <table className="qimen-table">
          <tbody>
            <tr className="row">
              <td className="col palace" data-name="坎宫" onClick={() => showPalaceInfoHandler('坎宫')}>
                <QimenItem index="四" />
              </td>
              <td className="col palace" data-name="艮宫" onClick={() => showPalaceInfoHandler('艮宫')}>
                <QimenItem index="九" />
              </td>
              <td className="col palace" data-name="震宫" onClick={() => showPalaceInfoHandler('震宫')}>
                <QimenItem index="二" />
              </td>
            </tr>
            <tr className="row">
              <td className="col palace" data-name="坤宫" onClick={() => showPalaceInfoHandler('坤宫')}>
                <QimenItem index="三" />
              </td>
              <td className="col palace center" data-name="中宫" onClick={() => showPalaceInfoHandler('中宫')}>
                <QimenItem index="五" />
              </td>
              <td className="col palace" data-name="巽宫" onClick={() => showPalaceInfoHandler('巽宫')}>
                <QimenItem index="七" />
              </td>
            </tr>
            <tr className="row">
              <td className="col palace" data-name="兑宫" onClick={() => showPalaceInfoHandler('兑宫')}>
                <QimenItem index="八" />
              </td>
              <td className="col palace" data-name="乾宫" onClick={() => showPalaceInfoHandler('乾宫')}>
                <QimenItem index="一" />
              </td>
              <td className="col palace" data-name="离宫" onClick={() => showPalaceInfoHandler('离宫')}>
                <QimenItem index="六" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 光晕效果 - 1:1复刻Vue版本 */}
      <div className="light-orb"></div>
      <div className="light-orb"></div>
      <div className="light-orb"></div>

      {/* 添加一个底部空间 - 1:1复刻Vue版本 */}
      <div className="bottom-spacer"></div>

      {/* 意思弹窗模态框 */}
      <MeaningModal />
    </div>
  );
};

export default QimenPage;
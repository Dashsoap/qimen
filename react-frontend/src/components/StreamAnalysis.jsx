import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import './StreamAnalysis.css';

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : 'https://your-api-domain.com';

const StreamAnalysis = forwardRef(({ panData, questionValue, onAnalysisComplete }, ref) => {
  const navigate = useNavigate();
  
  // 状态管理
  const [isStreaming, setIsStreaming] = useState(false);
  const [showStreamResult, setShowStreamResult] = useState(false);
  const [streamSteps, setStreamSteps] = useState([]);
  const [streamContent, setStreamContent] = useState('');
  const [streamError, setStreamError] = useState('');
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisTime, setAnalysisTime] = useState(0);
  const [confidence, setConfidence] = useState(0.92);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  
  // 对话历史记录
  const [conversationHistory, setConversationHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState('');

  // refs
  const eventSourceRef = useRef(null);
  const startTimeRef = useRef(0);
  const progressIntervalRef = useRef(null);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    startStreamAnalysis,
    stopStreamAnalysis,
    testDisplay,
    resetStreamState,
    resetAllState
  }));

  // 开始流式分析
  const startStreamAnalysis = async () => {
    // 更健壮的问题验证机制
    let questionText = '';
    
    // 尝试多种方式获取问题内容
    if (questionValue) {
      if (typeof questionValue === 'string') {
        questionText = questionValue.trim();
      } else if (typeof questionValue === 'object' && 'value' in questionValue) {
        // 处理ref包装的情况
        questionText = questionValue.value?.trim() || '';
      }
    }
    
    // 如果仍然为空，尝试从DOM元素获取
    if (!questionText) {
      const inputElement = document.querySelector('.question-input-field');
      if (inputElement && inputElement.value) {
        questionText = inputElement.value.trim();
      }
    }
    
    if (!questionText || questionText.length === 0) {
      alert('请先输入占卜问题\n调试信息: questionValue=' + JSON.stringify(questionValue));
      return;
    }

    if (!panData) {
      alert('请先进行排盘');
      return;
    }
    
    // 重置状态
    resetStreamState();
    
    // 显示结果区域
    setShowStreamResult(true);
    setIsStreaming(true);
    setCurrentQuestion(questionText);
    startTimeRef.current = Date.now();

    try {
      // 检测环境并选择合适的连接方式
      const isMobile = window.location.protocol === 'file:' || 
                       window.location.protocol === 'capacitor:' || 
                       /Android|iPhone|iPad/i.test(navigator.userAgent);

      if (isMobile) {
        // 移动端使用 fetch stream，传递 questionText
        await startFetchStream(questionText);
      } else {
        // Web端使用 EventSource，传递 questionText
        await startEventSourceStream(questionText);
      }

    } catch (error) {
      console.error('流式分析启动失败:', error);
      handleStreamError(error.message || '启动失败');
    }
  };

  // Web端 EventSource 流式连接
  const startEventSourceStream = async (questionText) => {
    // EventSource 不支持 POST，所以使用 fetch stream 方式
    await startFetchStream(questionText);
  };

  // 通用 Fetch Stream 方式
  const startFetchStream = async (questionText) => {
    const url = `${API_BASE_URL}/api/analysis/qimen/stream`;
    
    const requestData = {
      question: questionText,
      paipanData: panData
    };

    // 获取认证token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('用户未登录，请先登录');
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData)
      });

      // 检查response是否存在
      if (!response) {
        throw new Error('网络连接失败，请检查网络状态');
      }

      if (!response.ok) {
        // 尝试读取错误响应体
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorText = await response.text();
          
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              
              // 优先使用message字段，它通常包含更详细的信息
              if (errorData.message) {
                errorMessage = errorData.message;
              } else if (errorData.error) {
                errorMessage = errorData.error;
              } else {
                errorMessage = errorText;
              }
            } catch {
              errorMessage = errorText;
            }
          }
        } catch {
          // 静默处理读取错误
        }
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法获取响应流');
      }

      // 开始进度模拟
      startProgressSimulation();

      // 读取流数据
      while (isStreaming) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              handleStreamData(data);
            } catch {
              // 静默处理解析错误
            }
          }
        }
      }

    } catch (error) {
      console.error('Fetch Stream 错误:', error);
      handleStreamError(error.message || '网络连接失败');
    }
  };

  // 处理流式数据
  const handleStreamData = (data) => {
    switch (data.type) {
      case 'init': {
        addStreamStep('🔮', data.message || '正在启动分析...', data.timestamp);
        break;
      }
        
      case 'step': {
        const stepIcons = ['📊', '🤖', '💫', '✨'];
        const icon = stepIcons[data.step - 1] || '📍';
        addStreamStep(icon, data.message, data.timestamp);
        break;
      }
        
      case 'content': {
        const newContent = data.fullContent || data.content || '';
        setStreamContent(newContent);
        updateProgress(Math.min(90, (newContent.length / 20))); // 根据内容长度估算进度
        break;
      }
        
      case 'final': {
        setStreamContent(data.analysis?.answer || streamContent);
        setConfidence(data.analysis?.confidence || 0.92);
        setAnalysisTime(data.analysis?.executionTime || (Date.now() - startTimeRef.current));
        completeAnalysis();
        break;
      }
        
      case 'complete': {
        addStreamStep('✅', data.message || '分析完成', data.timestamp);
        completeAnalysis();
        break;
      }
        
      case 'error': {
        handleStreamError(data.message || '分析过程中出现错误');
        break;
      }
        
      case 'fallback': {
        setStreamContent(data.analysis?.answer || '使用备用分析模式');
        addStreamStep('🔄', data.message || '使用备用模式', data.timestamp);
        completeAnalysis();
        break;
      }
    }
  };

  // 添加步骤
  const addStreamStep = (icon, message, timestamp) => {
    const newStep = {
      icon,
      message,
      timestamp: timestamp || new Date().toISOString()
    };
    setStreamSteps(prev => [...prev, newStep]);
  };

  // 更新进度
  const updateProgress = (percent) => {
    setProgressPercent(Math.min(100, Math.max(0, percent)));
  };

  // 开始进度模拟
  const startProgressSimulation = () => {
    progressIntervalRef.current = setInterval(() => {
      setProgressPercent(prev => {
        if (prev < 85) {
          return prev + Math.random() * 5;
        }
        return prev;
      });
    }, 1000);
  };

  // 完成分析
  const completeAnalysis = () => {
    setIsStreaming(false);
    setAnalysisComplete(true);
    updateProgress(100);
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // 保存到对话历史
    setConversationHistory(prev => [...prev, {
      question: currentQuestion,
      answer: streamContent,
      timestamp: new Date().toISOString()
    }]);

    // 通知父组件分析完成
    if (onAnalysisComplete) {
      onAnalysisComplete({
        answer: streamContent,
        confidence: confidence,
        executionTime: analysisTime,
        steps: streamSteps
      });
    }
  };

  // 处理错误
  const handleStreamError = (message) => {
    // 优化错误信息显示
    let displayMessage = message;
    
    if (message.includes('积分不足') || message.includes('积分')) {
      displayMessage = `${message}\n\n💡 提示：您可以通过以下方式获取积分：\n• 每日签到\n• 完善个人资料\n• 分享给好友`;
    } else if (message.includes('未登录') || message.includes('登录')) {
      displayMessage = `${message}\n\n请先登录您的账户`;
    } else if (message.includes('网络') || message.includes('连接')) {
      displayMessage = `${message}\n\n请检查网络连接后重试`;
    }
    
    setStreamError(displayMessage);
    setIsStreaming(false);
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // 停止分析
  const stopStreamAnalysis = () => {
    setIsStreaming(false);
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // 重试分析
  const retryAnalysis = () => {
    resetStreamState();
    startStreamAnalysis();
  };

  // 追问功能
  const askFollowUp = async () => {
    if (!followUpQuestion.trim()) return;
    
    // 构建完整的对话历史上下文
    let conversationContext = '';
    
    // 包含所有历史对话
    conversationHistory.forEach((item, index) => {
      conversationContext += `【对话${index + 1}】\n问：${item.question}\n解：${item.answer}\n\n`;
    });
    
    // 如果当前还有内容（但还没保存到历史），也加上
    if (streamContent && !conversationHistory.find(h => h.answer === streamContent)) {
      conversationContext += `【当前对话】\n问：${currentQuestion}\n解：${streamContent}\n\n`;
    }
    
    // 构建带完整上下文的追问
    const contextualQuestion = `${conversationContext}【新的追问】${followUpQuestion.trim()}`;
    
    // 保存用户输入的追问内容
    const userFollowUp = followUpQuestion.trim();
    
    // 重置状态，开始新的分析
    resetStreamState();
    setCurrentQuestion(userFollowUp);
    setFollowUpQuestion('');
    
    // 开始新的分析，发送包含完整对话历史的上下文
    await startStreamAnalysisWithContext(contextualQuestion);
  };

  // 带上下文的分析函数
  const startStreamAnalysisWithContext = async (contextualQuestion) => {
    if (!panData) {
      setStreamError('请先进行排盘');
      return;
    }
    setIsStreaming(true);
    setShowStreamResult(true);
    setStreamError('');
    startTimeRef.current = Date.now();

    try {
      // 获取认证token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('用户未登录，请先登录');
      }

      const response = await fetch(`${API_BASE_URL}/api/analysis/qimen/stream`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paipanData: panData,
          question: contextualQuestion // 发送包含上下文的问题
        })
      });

      if (!response.ok) {
        // 尝试读取错误响应体
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorText = await response.text();
          
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              
              // 优先使用message字段，它通常包含更详细的信息
              if (errorData.message) {
                errorMessage = errorData.message;
              } else if (errorData.error) {
                errorMessage = errorData.error;
              } else {
                errorMessage = errorText;
              }
            } catch {
              errorMessage = errorText;
            }
          }
        } catch {
          // 静默处理读取错误
        }
        
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法创建流读取器');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              handleStreamData(data);
            } catch (e) {
              console.warn('解析数据失败:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ 流式分析失败:', error);
      handleStreamError(`分析过程中出现错误: ${error.message}`);
    }
  };

  // 关闭结果
  const closeStreamResult = () => {
    setShowStreamResult(false);
    stopStreamAnalysis();
    resetStreamState();
  };

  // 重置状态（保留对话历史）
  const resetStreamState = () => {
    setStreamSteps([]);
    setStreamContent('');
    setStreamError('');
    setAnalysisComplete(false);
    setAnalysisTime(0);
    setProgressPercent(0);
    // 注意：不清除 conversationHistory，保持对话连续性
  };

  // 完全重置（清除对话历史）
  const resetAllState = () => {
    resetStreamState();
    setConversationHistory([]);
    setCurrentQuestion('');
    console.log('🗑️ 已清除所有对话历史');
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 测试显示功能
  const testDisplay = () => {
    console.log('🧪 测试显示功能');
    setShowStreamResult(true);
    setCurrentQuestion('测试问题：我想测试流式显示功能');
    
    // 添加测试步骤
    addStreamStep('🧪', '测试步骤1：初始化', new Date().toISOString());
    addStreamStep('📝', '测试步骤2：添加内容', new Date().toISOString());
    
    // 设置测试内容
    setStreamContent('这是一个测试内容，用来验证流式显示是否正常工作。如果您能看到这段文字，说明组件显示功能正常。');
    
    console.log('🔍 测试后状态:', {
      showStreamResult,
      currentQuestion,
      streamContent,
      streamStepsLength: streamSteps.length
    });
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      stopStreamAnalysis();
    };
  }, []);

  // 避免未使用的变量警告
  console.log('进度:', progressPercent, '时间格式化函数:', formatTime);

  if (!showStreamResult) {
    return <div className="stream-analysis-container"></div>;
  }

  return (
    <div className="stream-analysis-container">
      {/* 简化版分析结果区域 */}
      <div className="stream-result-section">
        <div className="simple-header">
          <div className="simple-title">
            🔮 奇门解读
            {conversationHistory.length > 0 && (
              <span className="conversation-indicator">
                (第{conversationHistory.length + 1}轮对话)
              </span>
            )}
          </div>
          <div className="header-actions">
            {conversationHistory.length > 0 && (
              <button 
                onClick={resetAllState}
                className="new-conversation-btn"
                title="开始新对话"
              >
                🆕
              </button>
            )}
            <div className="simple-close" onClick={closeStreamResult}>×</div>
          </div>
        </div>
        
        {/* 对话历史显示（可折叠） */}
        {conversationHistory.length > 0 && (
          <div className="conversation-history">
            <div className="history-header" onClick={() => setShowHistory(!showHistory)}>
              <span className="history-icon">📚</span>
              <span className="history-title">查看历史对话 ({conversationHistory.length}轮)</span>
              <span className="toggle-icon">{showHistory ? '▼' : '▶'}</span>
            </div>
            {showHistory && (
              <div className="history-content">
                {conversationHistory.map((item, index) => (
                  <div key={index} className="history-item">
                    <div className="history-question">
                      <span className="history-label">问{index + 1}：</span>
                      <span className="history-text">{item.question}</span>
                    </div>
                    <div className="history-answer">
                      <span className="history-label">解{index + 1}：</span>
                      <span className="history-text">
                        {item.answer.substring(0, 150)}{item.answer.length > 150 ? '...' : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* 问题显示 */}
        {currentQuestion && (
          <div className="question-display">
            <div className="question-title">问</div>
            <div className="question-content">{currentQuestion}</div>
          </div>
        )}

        {/* 加载状态 */}
        {isStreaming && !streamContent && (
          <div className="loading-state">
            <div className="loading-icon">🔮</div>
            <div className="loading-text">正在推演...</div>
          </div>
        )}

        {/* 实时内容显示 */}
        {streamContent && (
          <div className="answer-content">
            <div className="answer-header">
              <div className="answer-title">解</div>
            </div>
            
            <div className="answer-text">
              <div className={`typing-text ${isStreaming ? 'typing' : ''}`}>
                {streamContent}
              </div>
              {isStreaming && <div className="cursor">|</div>}
            </div>
            
            {/* 追问功能 */}
            {analysisComplete && (
              <div className="follow-up-section">
                <div className="follow-up-header">
                  <span className="follow-up-icon">💭</span>
                  <span className="follow-up-title">继续问卜</span>
                </div>
                <div className="follow-up-input">
                  <textarea 
                    value={followUpQuestion}
                    onChange={(e) => setFollowUpQuestion(e.target.value)}
                    placeholder="基于上述解读，您还想了解什么？&#10;例如：具体应该在什么时候行动？"
                    className="follow-up-textarea"
                    rows="2"
                    maxLength="100"
                  />
                  <div className="follow-up-actions">
                    <span className="char-count">{followUpQuestion.length}/100</span>
                    <button 
                      onClick={askFollowUp}
                      disabled={!followUpQuestion.trim() || isStreaming}
                      className="follow-up-btn"
                    >
                      继续问卜
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 错误显示 */}
        {streamError && (
          <div className="stream-error">
            <div className="error-header">
              <div className="error-icon">⚠️</div>
              <div className="error-text">推演受阻</div>
            </div>
            <div className="error-message">{streamError}</div>
            <div className="error-actions">
              <button className="retry-button" onClick={retryAnalysis}>
                <span>🔄 重新推演</span>
              </button>
              {streamError.includes('积分') && (
                <button 
                  onClick={() => navigate('/profile')}
                  className="profile-link-btn"
                >
                  <span>👤 个人中心</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default StreamAnalysis; 
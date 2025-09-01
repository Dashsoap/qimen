import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import { optimizePaipanData, validatePaipanData } from '../utils/paipanDataOptimizer';
import './StreamAnalysis.css';

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001' 
  : 'https://your-api-domain.com';

const StreamAnalysis = forwardRef(({ panData, questionValue, onAnalysisComplete }, ref) => {
  const navigate = useNavigate();
  
  // 核心状态
  const [isVisible, setIsVisible] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentContent, setCurrentContent] = useState('');
  const [error, setError] = useState('');
  
  // 对话管理
  const [conversations, setConversations] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  
  // UI状态
  const [showHistory, setShowHistory] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // refs
  const abortControllerRef = useRef(null);
  const progressTimerRef = useRef(null);

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    startAnalysis: handleStartAnalysis,
    stopAnalysis: handleStopAnalysis,
    resetAll: handleResetAll
  }));

  // 主要分析函数
  const handleStartAnalysis = async () => {
    const question = extractQuestion();
    if (!question) {
      alert('请先输入占卜问题');
      return;
    }

    if (!panData) {
      alert('请先进行排盘');
      return;
    }

    // 重置状态并开始分析
    resetCurrentState();
    setIsVisible(true);
    setIsAnalyzing(true);
    setCurrentQuestion(question);
    
    try {
      await performStreamAnalysis(question);
    } catch (error) {
      handleError(error.message || '分析失败');
    }
  };

  // 提取问题文本
  const extractQuestion = () => {
    if (typeof questionValue === 'string') {
      return questionValue.trim();
    }
    if (questionValue?.value) {
      return questionValue.value.trim();
    }
    
    // 从DOM获取
    const input = document.querySelector('.question-input-field');
    return input?.value?.trim() || '';
  };

  // 执行流式分析
  const performStreamAnalysis = async (question) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    // 60秒超时
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
    try {
      const optimizedData = optimizePaipanData(panData);
      const validation = validatePaipanData(optimizedData);
      
      if (!validation.isValid) {
        console.warn('排盘数据验证失败:', validation);
      }

      const token = localStorage.getItem('auth-token');
      if (!token) {
        throw new Error('请先登录');
      }

      const response = await fetch(`${API_BASE_URL}/api/analysis/qimen/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          question,
          paipanData: optimizedData
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = response.statusText;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorText;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      await processStream(response);
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        handleError('分析超时，请重试');
      } else {
        throw error;
      }
    } finally {
      setIsAnalyzing(false);
      stopProgressTimer();
    }
  };

  // 处理流式响应
  const processStream = async (response) => {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('无法获取响应流');

    const decoder = new TextDecoder();
    let buffer = ''; // 添加缓冲区处理不完整的数据
    startProgressTimer();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk; // 累积到缓冲区
        
        // 按行分割，但保留最后一行（可能不完整）
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保存最后一行到缓冲区
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine && trimmedLine.startsWith('data: ')) {
            try {
              const jsonStr = trimmedLine.substring(6).trim();
              if (jsonStr && jsonStr !== '[DONE]') {
                const data = JSON.parse(jsonStr);
                handleStreamData(data);
              }
            } catch (e) {
              const jsonStr = trimmedLine.substring(6).trim();
              console.warn('JSON解析失败:', {
                error: e.message,
                line: trimmedLine.substring(0, 200),
                jsonStr: jsonStr.substring(0, 100)
              });
            }
          } else if (trimmedLine.startsWith('event: ')) {
            // 忽略event行，只处理data行
            console.log('收到事件行:', trimmedLine);
          }
        }
      }
      
      // 处理缓冲区中剩余的数据
      const finalBuffer = buffer.trim();
      if (finalBuffer && finalBuffer.startsWith('data: ')) {
        try {
          const jsonStr = finalBuffer.substring(6).trim();
          if (jsonStr && jsonStr !== '[DONE]') {
            const data = JSON.parse(jsonStr);
            handleStreamData(data);
          }
        } catch (e) {
          console.warn('最终缓冲区JSON解析失败:', {
            error: e.message,
            buffer: finalBuffer.substring(0, 200)
          });
        }
      }
      
      // 流结束，检查是否需要完成分析
      console.log('📡 流式数据读取完成');
      setTimeout(() => {
        setIsAnalyzing(currentAnalyzing => {
          if (currentAnalyzing) {
            console.log('🔄 流结束时仍在分析状态，尝试完成分析');
            setCurrentContent(prev => {
              console.log('🔄 流结束时的内容长度:', prev.length);
              if (prev.length > 0) {
                completeAnalysisWithContent(prev);
              } else {
                console.warn('⚠️ 流结束但没有内容');
              }
              return prev;
            });
          } else {
            console.log('✅ 分析已完成，跳过流结束处理');
          }
          return currentAnalyzing;
        });
      }, 300);
      
    } finally {
      reader.releaseLock();
    }
  };

  // 处理流式数据
  const handleStreamData = (data) => {
    console.log('🔍 处理流式数据:', data.type, data);
    
    switch (data.type) {
      case 'init':
        setProgress(10);
        console.log('✅ 初始化完成');
        break;
        
      case 'content': {
        const content = data.fullContent || data.content || '';
        console.log('📝 接收内容长度:', content.length, '内容预览:', content.substring(0, 100));
        if (content) {
          setCurrentContent(content);
          setProgress(Math.min(90, 10 + (content.length / 20)));
        }
        break;
      }
        
      case 'complete':
      case 'final': {
        console.log('🎯 收到完成事件:', data);
        const finalContent = data.analysis?.answer;
        
        // 比较complete事件中的answer和当前content，选择更长的那个
        setCurrentContent(prev => {
          const completeContent = finalContent || '';
          const currentContent = prev || '';
          
          console.log('📝 内容比较: current=', currentContent.length, 'complete=', completeContent.length);
          
          // 选择更长的内容作为最终结果
          const bestContent = completeContent.length > currentContent.length ? completeContent : currentContent;
          console.log('✅ 选择最佳内容长度:', bestContent.length);
          
          // 延迟完成分析，确保状态更新，并防止重复调用
          setTimeout(() => {
            if (!isAnalyzing) return; // 防止重复调用
            completeAnalysisWithContent(bestContent);
          }, 100);
          
          return bestContent;
        });
        break;
      }
        
      case 'error':
        console.error('❌ 流式数据错误:', data.message);
        handleError(data.message || '分析过程出错');
        break;
        
              case 'fallback': {
        const fallbackContent = data.analysis?.answer || '使用备用分析模式';
        setCurrentContent(fallbackContent);
        setTimeout(() => {
          if (!isAnalyzing) return; // 防止重复调用
          completeAnalysisWithContent(fallbackContent);
        }, 100);
        break;
      }
    }
  };

  // 完成分析 - 带内容参数版本
  const completeAnalysisWithContent = (finalContent) => {
    console.log('🎯 完成分析，内容长度:', finalContent?.length || 0);
    
    // 检查是否已经完成，避免重复调用
    setIsAnalyzing(prev => {
      if (!prev) {
        console.log('⚠️ 分析已完成，跳过重复调用');
        return false;
      }
      
      // 设置完成状态
      setProgress(100);
      stopProgressTimer();
      
      // 保存到对话历史
      if (finalContent && currentQuestion) {
        const newConversation = {
          id: Date.now(),
          question: currentQuestion,
          answer: finalContent,
          timestamp: new Date().toISOString()
        };
        
        setConversations(prevConversations => [...prevConversations, newConversation]);
        
        // 通知父组件
        if (onAnalysisComplete) {
          onAnalysisComplete({
            answer: finalContent,
            question: currentQuestion
          });
        }
      }
      
      return false; // 设置为完成状态
    });
  };



  // 追问功能
  const handleFollowUp = async () => {
    const question = followUpQuestion.trim();
    if (!question) return;
    
    // 构建上下文
    let context = '';
    conversations.forEach((conv, index) => {
      context += `对话${index + 1}:\n问: ${conv.question}\n答: ${conv.answer}\n\n`;
    });
    
    if (currentContent && currentQuestion) {
      context += `当前对话:\n问: ${currentQuestion}\n答: ${currentContent}\n\n`;
    }
    
    const contextualQuestion = `${context}新问题: ${question}`;
    
    // 重置状态开始新分析
    setFollowUpQuestion('');
    resetCurrentState();
    setCurrentQuestion(question);
    setIsAnalyzing(true);
    
    try {
      await performStreamAnalysis(contextualQuestion);
    } catch (error) {
      handleError(error.message || '追问失败');
    }
  };

  // 开始新对话
  const handleNewConversation = () => {
    setConversations([]);
    handleClose();
  };

  // 关闭组件
  const handleClose = () => {
    handleStopAnalysis();
    setIsVisible(false);
    resetCurrentState();
  };

  // 停止分析
  const handleStopAnalysis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsAnalyzing(false);
    stopProgressTimer();
  };

  // 重试分析
  const handleRetry = () => {
    resetCurrentState();
    handleStartAnalysis();
  };

  // 重置所有状态
  const handleResetAll = () => {
    handleStopAnalysis();
    setConversations([]);
    setIsVisible(false);
    resetCurrentState();
  };

  // 重置当前分析状态
  const resetCurrentState = () => {
    setCurrentContent('');
    setError('');
    setProgress(0);
    setCurrentQuestion('');
  };

  // 处理错误
  const handleError = (message) => {
    setError(message);
    setIsAnalyzing(false);
    stopProgressTimer();
  };

  // 进度定时器
  const startProgressTimer = () => {
    progressTimerRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev < 85) {
          return prev + Math.random() * 3;
        }
        return prev;
      });
    }, 1000);
  };

  const stopProgressTimer = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 组件卸载清理
  useEffect(() => {
    return () => {
      handleStopAnalysis();
    };
  }, []);

  // 不显示时返回空容器
  if (!isVisible) {
    return <div className="stream-analysis-container" />;
  }

  return (
    <div className="stream-analysis-container">
      <div className="stream-result-section">
        {/* 头部 */}
        <div className="analysis-header">
          <div className="header-title">
            <span className="title-icon">🔮</span>
            <span className="title-text">奇门解读</span>
            {conversations.length > 0 && (
              <span className="conversation-count">
                第{conversations.length + 1}轮
              </span>
            )}
          </div>
          
          <div className="header-actions">
            {conversations.length > 0 && (
              <button 
                onClick={handleNewConversation}
                className="action-btn new-btn"
                title="开始新对话"
              >
                🆕
              </button>
            )}
            <button 
              onClick={handleClose}
              className="action-btn close-btn"
              title="关闭"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 历史对话 */}
        {conversations.length > 0 && (
          <div className="conversation-history">
            <div 
              className="history-toggle"
              onClick={() => setShowHistory(!showHistory)}
            >
              <span className="history-icon">📚</span>
              <span className="history-text">
                历史对话 ({conversations.length}轮)
              </span>
              <span className={`toggle-arrow ${showHistory ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            
            {showHistory && (
              <div className="history-list">
                {conversations.map((conv, index) => (
                  <div key={conv.id} className="history-item">
                    <div className="history-meta">
                      <span className="history-index">#{index + 1}</span>
                      <span className="history-time">
                        {formatTime(conv.timestamp)}
                      </span>
                    </div>
                    <div className="history-question">
                      <strong>问：</strong>{conv.question}
                    </div>
                    <div className="history-answer">
                      <strong>答：</strong>
                      {conv.answer.length > 100 
                        ? `${conv.answer.substring(0, 100)}...`
                        : conv.answer
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 当前问题 */}
        {currentQuestion && (
          <div className="current-question">
            <div className="question-label">问</div>
            <div className="question-text">{currentQuestion}</div>
          </div>
        )}

        {/* 分析进度 */}
        {isAnalyzing && (
          <div className="analysis-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="progress-text">
              正在推演中... {Math.round(progress)}%
            </div>
          </div>
        )}

        {/* 分析结果 */}
        {currentContent && (
          <div className="analysis-result">
            <div className="result-header">
              <div className="result-label">解</div>
              <div className="result-meta">
                {currentContent.length} 字符
              </div>
            </div>
            
            <div className="result-content">
              <div className={`result-text ${isAnalyzing ? 'typing' : ''}`}>
                {currentContent}
              </div>
              {isAnalyzing && <div className="typing-cursor">|</div>}
            </div>

            {/* 追问功能 */}
            {!isAnalyzing && currentContent && (
              <div className="follow-up">
                <div className="follow-up-header">
                  <span className="follow-up-icon">💭</span>
                  <span className="follow-up-title">继续问卜</span>
                </div>
                
                <div className="follow-up-input">
                  <textarea
                    value={followUpQuestion}
                    onChange={(e) => setFollowUpQuestion(e.target.value)}
                    placeholder="基于上述解读，您还想了解什么？"
                    className="follow-up-textarea"
                    rows="2"
                    maxLength="200"
                  />
                  <div className="follow-up-actions">
                    <span className="char-count">
                      {followUpQuestion.length}/200
                    </span>
                    <button
                      onClick={handleFollowUp}
                      disabled={!followUpQuestion.trim() || isAnalyzing}
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
        {error && (
          <div className="analysis-error">
            <div className="error-header">
              <span className="error-icon">⚠️</span>
              <span className="error-title">推演受阻</span>
            </div>
            <div className="error-message">{error}</div>
            <div className="error-actions">
              <button onClick={handleRetry} className="retry-btn">
                🔄 重新推演
              </button>
              {error.includes('积分') && (
                <button 
                  onClick={() => navigate('/profile')}
                  className="profile-btn"
                >
                  👤 个人中心
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
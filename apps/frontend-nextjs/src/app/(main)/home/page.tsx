'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import './home.css';

export default function HomePage() {
  const router = useRouter();
  const [questionInput, setQuestionInput] = useState('');
  const [questionItems, setQuestionItems] = useState<any[]>([]);
  const [usedQuestionIndexes, setUsedQuestionIndexes] = useState<Record<string, number>>({});

  // 问题分类数据库
  const questionCategories: Record<string, any> = {
    law: {
      name: '官司诉讼',
      icon: '/assets/img/home/官司诉讼.png',
      value: 'law',
      questions: [
        '明天的官司能否胜诉？',
        '这场诉讼的结果如何？',
        '对方会主动和解吗？',
        '律师费用能否追回？',
        '证据是否足够有力？',
        '何时能结束这场官司？'
      ]
    },
    decision: {
      name: '重大决策',
      icon: '/assets/img/home/重大决策.png',
      value: 'decision',
      questions: [
        '是否应该搬到新城市发展？',
        '这个投资项目值得参与吗？',
        '现在是买房的好时机吗？',
        '应该选择哪个工作机会？',
        '是否应该创业？',
        '这个合作伙伴可靠吗？'
      ]
    },
    career: {
      name: '事业', 
      icon: '/assets/img/home/事业.png',
      value: 'career',
      questions: [
        '何时是跳槽的时机？',
        '升职加薪的机会何时到来？',
        '新项目能否成功？',
        '同事关系如何改善？',
        '职业转型是否明智？',
        '创业项目前景如何？'
      ]
    },
    health: {
      name: '健康',
      icon: '/assets/img/home/健康.png',
      value: 'health',
      questions: [
        '这次手术的结果如何？',
        '身体检查会有问题吗？',
        '这个治疗方案有效吗？',
        '何时能完全康复？',
        '需要换医生吗？',
        '家人的健康状况如何？'
      ]
    },
    money: {
      name: '财运',
      icon: '/assets/img/home/财运.png',
      value: 'money',
      questions: [
        '何时是出售股票的最佳时机？',
        '这笔投资能否盈利？',
        '财运何时好转？',
        '债务何时能还清？',
        '生意能否做大？',
        '意外之财会降临吗？'
      ]
    },
    love: {
      name: '情感',
      icon: '/assets/img/home/情感.png',
      value: 'love',
      questions: [
        '这段感情是否有未来？',
        '对方是否真心爱我？',
        '何时能遇到真爱？',
        '分手后还能复合吗？',
        '婚姻生活会幸福吗？',
        '暗恋的人对我有意思吗？'
      ]
    }
  };

  // 随机获取每个分类的一个问题（避免重复）
  const getRandomQuestions = (avoidCurrent = false) => {
    const categories = Object.keys(questionCategories);
    return categories.map(categoryKey => {
      const category = questionCategories[categoryKey];
      let randomIndex;
      
      if (avoidCurrent && usedQuestionIndexes[categoryKey] !== undefined) {
        const availableIndexes = category.questions
          .map((_: any, index: number) => index)
          .filter((index: number) => index !== usedQuestionIndexes[categoryKey]);
        
        randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
      } else {
        randomIndex = Math.floor(Math.random() * category.questions.length);
      }
      
      setUsedQuestionIndexes(prev => ({
        ...prev,
        [categoryKey]: randomIndex
      }));
      
      return {
        text: category.questions[randomIndex],
        icon: category.icon,
        category: category.value,
        categoryName: category.name
      };
    });
  };

  // 初始化问题列表
  useEffect(() => {
    setQuestionItems(getRandomQuestions());
  }, []);

  // 刷新问题列表
  const refreshQuestions = () => {
    setQuestionItems(getRandomQuestions(true));
  };

  // 选择问题
  const selectQuestion = (item: any) => {
    setQuestionInput(item.text);
  };

  // 提交问卜
  const handleSubmit = () => {
    if (!questionInput.trim()) return;
    
    const selectedItem = questionItems.find(item => item.text === questionInput.trim());
    
    router.push(`/qimen?question=${encodeURIComponent(questionInput.trim())}`);
  };

  return (
    <div className="home-container">
      <div className="main-content">
        {/* 头部区域 */}
        <div className="header-section">
          <div className="header-left">
            <h1 className="app-title">奇门遁甲</h1>
            <p className="app-subtitle">问天地玄机，卜万事吉凶</p>
          </div>
          <div className="header-right">
            <button className="history-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="#753C15" strokeWidth="1.5"/>
                <path d="M10 5v5l3 3" stroke="#753C15" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* 问卜输入区域 */}
        <div className="input-section">
          <div className="input-card">
            <textarea 
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="在这里写下你的困惑，奇门会给你答案"
              className="question-textarea"
              maxLength={200}
            />
            <div className="input-footer">
              <span className="char-count">{questionInput.length}/200</span>
              <button 
                className="submit-btn"
                onClick={handleSubmit}
                disabled={!questionInput.trim()}
              >
                立即问卜
              </button>
            </div>
          </div>
        </div>

        {/* 猜你想问区域 */}
        <div className="suggestions-section">
          <div className="section-header">
            <h2 className="section-title">猜你想问</h2>
            <button className="refresh-btn" onClick={refreshQuestions}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13.65 6.35A6.5 6.5 0 1 0 8 14.5" stroke="#999" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M11 4l2.65 2.35L11 8.7" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="question-list">
            {questionItems.map((item, index) => (
              <div 
                key={index}
                className="question-item"
                onClick={() => selectQuestion(item)}
              >
                <div className="question-icon">
                  <Image src={item.icon} alt={item.text} width={20} height={20} />
                </div>
                <span className="question-text">{item.text}</span>
                <svg width="8" height="12" viewBox="0 0 8 12" fill="none" className="arrow-icon">
                  <path d="M2 2l4 4-4 4" stroke="#D3844E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

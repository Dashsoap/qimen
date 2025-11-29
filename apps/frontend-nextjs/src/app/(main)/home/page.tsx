'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getRandomQuestionsFromEachCategory, type QuestionType } from '@/constants/questions';
import { cn } from '@/lib/utils/cn';

export default function HomePage() {
  const router = useRouter();
  const [questionInput, setQuestionInput] = useState('');
  const [questionItems, setQuestionItems] = useState<any[]>([]);
  const [usedQuestionIndexes, setUsedQuestionIndexes] = useState<Record<QuestionType, number>>({} as Record<QuestionType, number>);

  // 初始化问题列表
  useEffect(() => {
    const questions = getRandomQuestionsFromEachCategory();
    setQuestionItems(questions);
    
    // 记录使用的索引
    const indexes: Record<QuestionType, number> = {} as Record<QuestionType, number>;
    questions.forEach((q, idx) => {
      indexes[q.category] = idx;
    });
    setUsedQuestionIndexes(indexes);
  }, []);

  // 刷新问题列表
  const refreshQuestions = () => {
    const questions = getRandomQuestionsFromEachCategory(usedQuestionIndexes);
    setQuestionItems(questions);
    
    // 更新索引
    const indexes: Record<QuestionType, number> = {} as Record<QuestionType, number>;
    questions.forEach((q, idx) => {
      indexes[q.category] = idx;
    });
    setUsedQuestionIndexes(indexes);
  };

  // 选择问题
  const selectQuestion = (item: any) => {
    setQuestionInput(item.text);
  };

  // 提交问卜
  const handleSubmit = () => {
    if (!questionInput.trim()) return;
    
    router.push(`/qimen?question=${encodeURIComponent(questionInput.trim())}`);
  };

  return (
    <div className="w-full relative bg-qimen-cream pb-20">
      <div className="px-4 pt-6 max-w-md mx-auto">
        {/* 头部区域 */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <h1 className="font-serif font-bold text-3xl leading-tight text-qimen-brown mb-1">
              奇门遁甲
            </h1>
            <p className="font-serif font-bold text-sm leading-tight text-qimen-brown">
              问天地玄机，卜万事吉凶
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-8 h-8 border-none bg-transparent flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="#753C15" strokeWidth="1.5"/>
                <path d="M10 5v5l3 3" stroke="#753C15" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* 问卜输入区域 */}
        <div className="mb-10">
          <div className="bg-white rounded-xl p-5 shadow-qimen">
            <textarea 
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="在这里写下你的困惑，奇门会给你答案"
              className="w-full min-h-[100px] border-none outline-none resize-none text-base leading-relaxed text-gray-900 placeholder:text-gray-400 placeholder:opacity-80"
              maxLength={200}
            />
            <div className="flex justify-between items-center mt-5">
              <span className="text-sm text-gray-400">{questionInput.length}/200</span>
              <button 
                className={cn(
                  "bg-qimen-gold-dark border-none rounded-lg px-5 py-2.5 font-semibold text-sm text-white cursor-pointer transition-all duration-200",
                  questionInput.trim() 
                    ? "hover:bg-[#B8743E] hover:-translate-y-0.5" 
                    : "opacity-50 cursor-not-allowed"
                )}
                onClick={handleSubmit}
                disabled={!questionInput.trim()}
              >
                立即问卜
              </button>
            </div>
          </div>
        </div>

        {/* 猜你想问区域 */}
        <div className="mb-10 relative bg-[url('/assets/img/home/bg.svg')] bg-contain bg-center bg-no-repeat rounded-2xl">
          <div className="flex justify-between items-center mb-5 relative z-10">
            <h2 className="font-semibold text-lg text-qimen-brown m-0">猜你想问</h2>
            <button 
              className="w-8 h-8 border border-gray-200 rounded-md bg-white flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-gray-50"
              onClick={refreshQuestions}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13.65 6.35A6.5 6.5 0 1 0 8 14.5" stroke="#999" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M11 4l2.65 2.35L11 8.7" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-3 relative z-10">
            {questionItems.map((item, index) => (
              <div 
                key={index}
                className="flex items-center px-3 py-3 bg-white/[0.01] border border-qimen-border-light rounded-xl cursor-pointer transition-all duration-200 w-4/5 shadow-sm hover:border-qimen-gold-dark hover:translate-x-0.5 hover:shadow-qimen-lg"
                onClick={() => selectQuestion(item)}
              >
                <div className="w-5 h-5 mr-3 flex-shrink-0 flex items-center justify-center">
                  <Image src={item.icon} alt={item.text} width={20} height={20} />
                </div>
                <span className="flex-1 text-sm text-qimen-brown leading-tight">{item.text}</span>
                <svg width="8" height="12" viewBox="0 0 8 12" fill="none" className="ml-2 flex-shrink-0">
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

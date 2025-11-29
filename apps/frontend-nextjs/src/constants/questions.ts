/**
 * 问题分类数据
 * Question categories database
 */

import type { QuestionType, QuestionCategory, QuestionDatabase } from '@/types/qimen';

// 重新导出类型供外部使用
export type { QuestionType, QuestionCategory, QuestionDatabase } from '@/types/qimen';

/**
 * 问题分类数据库
 */
export const QUESTION_CATEGORIES: QuestionDatabase = {
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
      '何时能结束这场官司？',
    ],
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
      '这个合作伙伴可靠吗？',
    ],
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
      '创业项目前景如何？',
    ],
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
      '家人的健康状况如何？',
    ],
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
      '意外之财会降临吗？',
    ],
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
      '暗恋的人对我有意思吗？',
    ],
  },
} as const;

/**
 * 获取所有问题分类
 */
export function getAllCategories(): QuestionCategory[] {
  return Object.values(QUESTION_CATEGORIES);
}

/**
 * 获取指定分类
 */
export function getCategory(type: QuestionType): QuestionCategory | undefined {
  return QUESTION_CATEGORIES[type];
}

/**
 * 获取分类的随机问题
 */
export function getRandomQuestion(type: QuestionType): string | undefined {
  const category = QUESTION_CATEGORIES[type];
  if (!category || !category.questions.length) return undefined;
  
  const randomIndex = Math.floor(Math.random() * category.questions.length);
  return category.questions[randomIndex];
}

/**
 * 从所有分类中随机选择一个问题
 */
export function getRandomQuestionFromAll(): { question: string; category: QuestionType } {
  const categories = Object.keys(QUESTION_CATEGORIES) as QuestionType[];
  const randomCategoryKey = categories[Math.floor(Math.random() * categories.length)];
  const category = QUESTION_CATEGORIES[randomCategoryKey];
  const randomQuestion = category.questions[Math.floor(Math.random() * category.questions.length)];
  
  return {
    question: randomQuestion,
    category: randomCategoryKey,
  };
}

/**
 * 从每个分类中随机选择一个问题
 */
export function getRandomQuestionsFromEachCategory(
  avoidIndexes?: Record<QuestionType, number>
): Array<{ text: string; icon: string; category: QuestionType; categoryName: string }> {
  const categories = Object.keys(QUESTION_CATEGORIES) as QuestionType[];
  
  return categories.map(categoryKey => {
    const category = QUESTION_CATEGORIES[categoryKey];
    let randomIndex: number;
    
    // 如果提供了要避免的索引，选择不同的问题
    if (avoidIndexes && avoidIndexes[categoryKey] !== undefined) {
      const availableIndexes = category.questions
        .map((_, index) => index)
        .filter(index => index !== avoidIndexes[categoryKey]);
      
      randomIndex = availableIndexes.length > 0
        ? availableIndexes[Math.floor(Math.random() * availableIndexes.length)]
        : Math.floor(Math.random() * category.questions.length);
    } else {
      randomIndex = Math.floor(Math.random() * category.questions.length);
    }
    
    return {
      text: category.questions[randomIndex],
      icon: category.icon,
      category: categoryKey,
      categoryName: category.name,
    };
  });
}


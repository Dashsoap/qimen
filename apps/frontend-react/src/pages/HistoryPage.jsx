import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import { useQimen } from '../hooks/useQimen';
import { useAuth } from '../hooks/useAuth';

const HistoryPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { getHistory, clearHistory } = useQimen();
  const { isAuthenticated } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      if (isAuthenticated) {
        try {
          setIsLoading(true);
          const data = await getHistory();
          setHistory(data);
        } catch (error) {
          console.error('加载历史记录失败:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [isAuthenticated, getHistory]);

  const handleClearHistory = async () => {
    if (window.confirm('确定要清空所有历史记录吗？此操作不可撤销。')) {
      try {
        await clearHistory();
        setHistory([]);
      } catch (error) {
        console.error('清空历史记录失败:', error);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-xl font-semibold mb-4">请先登录以查看您的历史记录</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">历史记录</h1>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              清空历史
            </button>
          )}
        </div>
        
        {isLoading ? (
          <Loading />
        ) : history.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">暂无历史记录</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <Card key={item.id}>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {new Date(item.createdAt).toLocaleString('zh-CN')}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">{item.description}</p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <a 
                      href={`/qimen/${item.id}`}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                      查看详情
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HistoryPage;
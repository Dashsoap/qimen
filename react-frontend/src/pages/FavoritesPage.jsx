import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import { useQimen } from '../hooks/useQimen';
import { useAuth } from '../hooks/useAuth';

const FavoritesPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { getFavorites, removeFavorite } = useQimen();
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (isAuthenticated) {
        try {
          setIsLoading(true);
          const data = await getFavorites();
          setFavorites(data);
        } catch (error) {
          console.error('加载收藏失败:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [isAuthenticated, getFavorites]);

  const handleRemoveFavorite = async (id) => {
    try {
      await removeFavorite(id);
      setFavorites(favorites.filter(item => item.id !== id));
    } catch (error) {
      console.error('删除收藏失败:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-xl font-semibold mb-4">请先登录以查看您的收藏</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">我的收藏</h1>
        
        {isLoading ? (
          <Loading />
        ) : favorites.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">您还没有收藏任何内容</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((item) => (
              <Card key={item.id} className="relative">
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => handleRemoveFavorite(item.id)}
                    className="text-gray-500 hover:text-red-500"
                    aria-label="删除收藏"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                </p>
                <p className="text-gray-700 dark:text-gray-300">{item.description}</p>
                <div className="mt-4">
                  <a 
                    href={`/qimen/${item.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    查看详情
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FavoritesPage;
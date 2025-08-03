import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './stores/store';
import AppRoutes from './routes';
import BottomNav from './components/layout/BottomNav';
import { useBottomNav } from './hooks/useBottomNav';
import './index.css';

// App内容组件，用于使用React Router的hooks
const AppContent = () => {
  const { showBottomNav } = useBottomNav();

  return (
    <div id="app-root">
      {/* 主内容滚动容器 - 唯一的滚动区域 */}
      <main className="main-scroll-container">
        <AppRoutes />
      </main>

      {/* 底部导航栏 - 根据当前路由条件显示 */}
      {showBottomNav && <BottomNav />}
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
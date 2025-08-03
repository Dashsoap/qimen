import { useLocation } from 'react-router-dom';

/**
 * 判断当前页面是否应该显示底部导航栏
 */
export const useBottomNav = () => {
  const location = useLocation();
  
  // 需要显示底部导航栏的路径
  const showBottomNavPaths = [
    '/home',
    '/qimen', 
    '/settings',
    '/profile'
  ];
  
  // 需要隐藏底部导航栏的路径
  const hideBottomNavPaths = [
    '/login',
    '/register',
    '/about',
    '/history',
    '/favorites'
  ];
  
  // 需要隐藏底部导航栏的路径前缀 (二级页面)
  const hideBottomNavPrefixes = [
    '/settings/', // 设置的子页面
    '/profile/',  // 个人资料的子页面
    '/qimen/',    // 奇门的详情页
    '/user/'      // 用户相关页面
  ];
  
  const currentPath = location.pathname;
  
  // 检查是否是需要隐藏底部导航栏的页面
  const shouldHide = hideBottomNavPaths.includes(currentPath) || 
                     hideBottomNavPrefixes.some(prefix => currentPath.startsWith(prefix));
  
  // 检查是否是需要显示底部导航栏的页面
  const shouldShow = showBottomNavPaths.includes(currentPath);
  
  return {
    showBottomNav: shouldShow && !shouldHide,
    currentPath,
    isMainPage: shouldShow,
    isAuthPage: ['/login', '/register'].includes(currentPath),
    isDetailPage: hideBottomNavPrefixes.some(prefix => currentPath.startsWith(prefix))
  };
}; 
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  toggleDarkMode,
  setPrimaryColor,
  setFontSize,
  setLanguage,
  toggleAnimations,
  toggleSoundEffects,
  loadThemeFromStorage,
  resetTheme
} from '../stores/themeSlice';

/**
 * 主题相关的自定义Hook
 */
export const useTheme = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);

  // 初始化时从localStorage加载主题设置
  useEffect(() => {
    dispatch(loadThemeFromStorage());
  }, [dispatch]);

  // 应用主题到document
  useEffect(() => {
    const root = document.documentElement;
    
    // 设置深色模式
    if (theme.isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // 设置主色调CSS变量
    const colorMap = {
      blue: { primary: '#3b82f6', secondary: '#1e40af' },
      purple: { primary: '#8b5cf6', secondary: '#7c3aed' },
      green: { primary: '#10b981', secondary: '#059669' },
      red: { primary: '#ef4444', secondary: '#dc2626' },
      yellow: { primary: '#f59e0b', secondary: '#d97706' },
    };
    
    const colors = colorMap[theme.primaryColor] || colorMap.blue;
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-dark', colors.secondary);
    
    // 设置字体大小
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px'
    };
    root.style.setProperty('--font-size-base', fontSizeMap[theme.fontSize] || '16px');
    
    // 设置动画
    if (!theme.animations) {
      root.style.setProperty('--animation-duration', '0s');
    } else {
      root.style.setProperty('--animation-duration', '0.3s');
    }
    
  }, [theme.isDarkMode, theme.primaryColor, theme.fontSize, theme.animations]);

  // 切换深色模式
  const toggleDark = useCallback(() => {
    dispatch(toggleDarkMode());
  }, [dispatch]);

  // 设置主色调
  const changePrimaryColor = useCallback((color) => {
    dispatch(setPrimaryColor(color));
  }, [dispatch]);

  // 设置字体大小
  const changeFontSize = useCallback((size) => {
    dispatch(setFontSize(size));
  }, [dispatch]);

  // 设置语言
  const changeLanguage = useCallback((lang) => {
    dispatch(setLanguage(lang));
  }, [dispatch]);

  // 切换动画
  const toggleAnimation = useCallback(() => {
    dispatch(toggleAnimations());
  }, [dispatch]);

  // 切换音效
  const toggleSound = useCallback(() => {
    dispatch(toggleSoundEffects());
  }, [dispatch]);

  // 重置主题
  const resetToDefault = useCallback(() => {
    dispatch(resetTheme());
  }, [dispatch]);

  // 获取当前主题类名
  const getThemeClasses = useCallback(() => {
    return {
      base: theme.isDarkMode ? 'dark' : 'light',
      primary: `theme-${theme.primaryColor}`,
      fontSize: `text-${theme.fontSize}`,
      animations: theme.animations ? 'animate-enabled' : 'animate-disabled'
    };
  }, [theme]);

  return {
    // 状态
    isDarkMode: theme.isDarkMode,
    primaryColor: theme.primaryColor,
    fontSize: theme.fontSize,
    language: theme.language,
    animations: theme.animations,
    soundEffects: theme.soundEffects,
    
    // 方法
    toggleDark,
    changePrimaryColor,
    changeFontSize,
    changeLanguage,
    toggleAnimation,
    toggleSound,
    resetToDefault,
    getThemeClasses,
  };
};
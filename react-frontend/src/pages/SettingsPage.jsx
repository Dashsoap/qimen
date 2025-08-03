import React, { useState } from 'react';
import './SettingsPage.css';

const SettingsPage = () => {
  const [isDark, setIsDark] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  const handleThemeToggle = () => {
    setIsDark(!isDark);
    // 这里应该调用主题切换的逻辑
    console.log('主题切换:', !isDark ? '深色' : '浅色');
  };

  return (
    <div className="settings-container">
      {/* 页面标题 */}
      <div className="settings-header">
        <h1 className="settings-title">设置</h1>
        <p className="settings-subtitle">个性化您的应用体验</p>
      </div>

      {/* 设置内容 */}
      <div className="settings-content">
        {/* 主题设置 */}
        <div className="settings-section">
          <div className="section-header">
            <h2 className="section-title">主题设置</h2>
            <p className="section-description">选择您喜欢的界面主题</p>
          </div>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3 className="setting-label">界面主题</h3>
              <p className="setting-desc">{isDark ? '深色模式，护眼舒适' : '浅色模式，清新明亮'}</p>
            </div>
            
            <div className="theme-toggle-wrapper">
              <button 
                className={`theme-toggle-btn ${isDark ? 'dark-mode' : 'light-mode'}`}
                onClick={handleThemeToggle}
                title={isDark ? '切换到浅色模式' : '切换到深色模式'}
              >
                <div className="toggle-bg"></div>
                <div className="toggle-slider">
                  {isDark ? '🌙' : '☀️'}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 通知设置 */}
        <div className="settings-section">
          <div className="section-header">
            <h2 className="section-title">通知设置</h2>
            <p className="section-description">管理您的通知偏好</p>
          </div>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3 className="setting-label">推送通知</h3>
              <p className="setting-desc">接收分析结果和重要提醒</p>
            </div>
            
            <label className="switch">
              <input 
                type="checkbox" 
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* 数据设置 */}
        <div className="settings-section">
          <div className="section-header">
            <h2 className="section-title">数据设置</h2>
            <p className="section-description">管理您的数据存储偏好</p>
          </div>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3 className="setting-label">自动保存</h3>
              <p className="setting-desc">自动保存分析记录到云端</p>
            </div>
            
            <label className="switch">
              <input 
                type="checkbox" 
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* 关于信息 */}
        <div className="settings-section">
          <div className="section-header">
            <h2 className="section-title">关于应用</h2>
            <p className="section-description">应用信息和帮助</p>
          </div>
          
          <div className="about-info">
            <div className="about-item">
              <span className="about-label">版本号</span>
              <span className="about-value">2.0.0</span>
            </div>
            <div className="about-item">
              <span className="about-label">更新时间</span>
              <span className="about-value">2024-12-19</span>
            </div>
            <div className="about-item">
              <span className="about-label">开发者</span>
              <span className="about-value">奇门遁甲团队</span>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="settings-actions">
          <button className="action-btn primary">保存设置</button>
          <button className="action-btn secondary">重置默认</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
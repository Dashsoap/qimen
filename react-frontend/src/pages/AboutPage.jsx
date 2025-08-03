import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1 className="about-title">关于奇门遁甲</h1>
        <p className="about-subtitle">传承千年智慧，融合现代科技</p>
      </div>

      <div className="about-content">
        <div className="about-section">
          <h2 className="section-title">应用介绍</h2>
          <p className="section-text">
            奇门遁甲是中华传统文化的瑰宝，被誉为"帝王之学"。本应用运用现代科技手段，
            将传统奇门遁甲理论与3D可视化技术相结合，为用户提供直观、准确的预测服务。
          </p>
        </div>

        <div className="about-section">
          <h2 className="section-title">核心功能</h2>
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">🔮</div>
              <div className="feature-text">
                <h3>智能问卜</h3>
                <p>输入问题，获得专业的奇门遁甲分析</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <div className="feature-text">
                <h3>3D可视化</h3>
                <p>立体展示奇门盘面，直观理解易理</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📱</div>
              <div className="feature-text">
                <h3>移动优化</h3>
                <p>完美适配手机端，随时随地问卜</p>
              </div>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2 className="section-title">版本信息</h2>
          <div className="version-info">
            <div className="version-item">
              <span className="version-label">版本号</span>
              <span className="version-value">2.0.0</span>
            </div>
            <div className="version-item">
              <span className="version-label">更新时间</span>
              <span className="version-value">2024-12-19</span>
            </div>
            <div className="version-item">
              <span className="version-label">开发团队</span>
              <span className="version-value">奇门遁甲技术团队</span>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2 className="section-title">联系我们</h2>
          <p className="section-text">
            如有任何问题或建议，欢迎通过以下方式联系我们：
          </p>
          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-label">邮箱</span>
              <span className="contact-value">contact@qimen.com</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">官网</span>
              <span className="contact-value">www.qimen.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
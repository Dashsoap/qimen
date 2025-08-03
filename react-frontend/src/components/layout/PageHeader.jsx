import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * 页面头部组件 - 用于二级页面
 */
const PageHeader = ({ 
  title, 
  subtitle,
  showBack = true, 
  onBack,
  rightContent,
  className = "",
  titleClassName = "",
  subtitleClassName = ""
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={`bg-[#fefdf7] border-b border-[#E0E0E0] px-4 py-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1">
          {/* 返回按钮 */}
          {showBack && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#f3c165]/20 transition-colors mr-3"
            >
              <ArrowLeft size={20} className="text-[#753c14]" />
            </button>
          )}
          
          {/* 标题区域 */}
          <div className="flex-1">
            {title && (
              <h1 className={`text-lg font-semibold text-[#753c14] ${titleClassName}`}>
                {title}
              </h1>
            )}
            {subtitle && (
              <p className={`text-sm text-[#999999] mt-1 ${subtitleClassName}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {/* 右侧内容 */}
        {rightContent && (
          <div className="flex items-center">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  );
};

export default PageHeader; 
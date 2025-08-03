import React from 'react';

/**
 * 提交按钮组件 - 1:1复刻Vue版本
 */
const SubmitButton = ({ 
  children,
  type = "button",
  disabled = false,
  loading = false,
  loadingText = "加载中...",
  onClick,
  className = ""
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`submit-btn ${disabled || loading ? 'disabled' : ''} ${className}`}
    >
      {loading ? (
        <>
          <div className="loading-spinner"></div>
          {loadingText}
        </>
      ) : (
        children
      )}

      <style jsx>{`
        .submit-btn {
          width: 100%;
          padding: 16px 24px;
          background: linear-gradient(135deg, rgba(196, 168, 118, 0.8), rgba(196, 168, 118, 0.6));
          border: 1px solid rgba(196, 168, 118, 0.4);
          border-radius: 8px;
          color: #1A1611;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-btn:hover:not(.disabled) {
          background: linear-gradient(135deg, rgba(196, 168, 118, 0.9), rgba(196, 168, 118, 0.7));
          border-color: rgba(196, 168, 118, 0.5);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(196, 168, 118, 0.3);
        }

        .submit-btn:active:not(.disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 6px rgba(196, 168, 118, 0.2);
        }

        .submit-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: rgba(196, 168, 118, 0.3);
          border-color: rgba(196, 168, 118, 0.2);
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(26, 22, 17, 0.3);
          border-top: 2px solid #1A1611;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default SubmitButton; 
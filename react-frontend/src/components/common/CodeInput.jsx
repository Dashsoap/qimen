import React from 'react';

/**
 * 验证码输入组件 - 1:1复刻Vue版本
 */
const CodeInput = ({ 
  value, 
  onChange, 
  onBlur,
  onSendCode,
  label, 
  placeholder = "请输入6位验证码",
  error, 
  canSend = true,
  loading = false,
  countdown = 0,
  prefixIcon,
  className = ""
}) => {
  const handleInputChange = (e) => {
    onChange?.(e.target.value);
  };

  const handleSendCode = () => {
    onSendCode?.();
  };

  return (
    <div className={`form-group ${className}`}>
      {label && <label className="form-label">{label}</label>}
      <div className="code-input-container">
        <div className="input-container">
          {prefixIcon && (
            <div className="input-prefix">
              {prefixIcon}
            </div>
          )}
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            onBlur={onBlur}
            placeholder={placeholder}
            className={`form-input ${error ? 'error' : ''}`}
            maxLength="6"
          />
        </div>
        <button
          type="button"
          onClick={handleSendCode}
          disabled={!canSend || loading}
          className={`code-btn ${countdown > 0 ? 'countdown' : ''}`}
        >
          {countdown > 0 ? `${countdown}s` : '获取验证码'}
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}

      <style jsx>{`
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 14px;
          font-weight: 500;
          color: #C4A876;
          letter-spacing: 0.5px;
        }

        .code-input-container {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .input-container {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
        }

        .input-prefix {
          position: absolute;
          left: 16px;
          color: rgba(196, 168, 118, 0.5);
          z-index: 2;
          pointer-events: none;
        }

        .form-input {
          width: 100%;
          padding: 16px 16px 16px 48px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(196, 168, 118, 0.2);
          border-radius: 8px;
          color: #C4A876;
          font-size: 15px;
          font-family: inherit;
          transition: all 0.3s ease;
          backdrop-filter: blur(5px);
        }

        .form-input::placeholder {
          color: rgba(196, 168, 118, 0.4);
        }

        .form-input:focus {
          outline: none;
          border-color: rgba(196, 168, 118, 0.4);
          background: rgba(0, 0, 0, 0.4);
          box-shadow: 0 0 0 3px rgba(196, 168, 118, 0.1);
        }

        .form-input.error {
          border-color: rgba(220, 53, 69, 0.5);
          box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
        }

        .code-btn {
          padding: 16px 20px;
          background: rgba(196, 168, 118, 0.1);
          border: 1px solid rgba(196, 168, 118, 0.3);
          border-radius: 8px;
          color: #C4A876;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          backdrop-filter: blur(5px);
        }

        .code-btn:hover:not(:disabled) {
          background: rgba(196, 168, 118, 0.15);
          border-color: rgba(196, 168, 118, 0.4);
        }

        .code-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .code-btn.countdown {
          background: rgba(196, 168, 118, 0.05);
          border-color: rgba(196, 168, 118, 0.2);
        }

        .error-message {
          color: rgba(220, 53, 69, 0.8);
          font-size: 12px;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
};

export default CodeInput; 
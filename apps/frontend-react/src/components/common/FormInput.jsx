import React from 'react';

/**
 * 通用表单输入组件 - 1:1复刻Vue版本
 */
const FormInput = ({ 
  value, 
  onChange, 
  onBlur,
  label, 
  type = "text",
  placeholder,
  error, 
  maxLength,
  prefixIcon,
  suffixIcon,
  className = ""
}) => {
  const handleInputChange = (e) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={`form-group ${className}`}>
      {label && <label className="form-label">{label}</label>}
      <div className="input-container">
        {prefixIcon && (
          <div className="input-prefix">
            {prefixIcon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={handleInputChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`form-input ${error ? 'error' : ''}`}
          maxLength={maxLength}
        />
        {suffixIcon && (
          <div className="input-suffix">
            {suffixIcon}
          </div>
        )}
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

        .input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-prefix {
          position: absolute;
          left: 16px;
          color: rgba(196, 168, 118, 0.5);
          z-index: 2;
          pointer-events: none;
        }

        .input-suffix {
          position: absolute;
          right: 16px;
          color: rgba(196, 168, 118, 0.5);
          z-index: 2;
          cursor: pointer;
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

        .error-message {
          color: rgba(220, 53, 69, 0.8);
          font-size: 12px;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
};

export default FormInput; 
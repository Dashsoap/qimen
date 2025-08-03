import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { X } from 'lucide-react';
import Button from './Button';

/**
 * 模态框组件
 */
const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  overlayClassName,
  contentClassName,
  headerClassName,
  footerClassName,
  footer,
}) => {
  // 尺寸配置
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    xlarge: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // ESC键关闭
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // 防止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  const modalContent = (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'bg-black bg-opacity-50 backdrop-blur-sm',
        overlayClassName
      )}
      onClick={handleOverlayClick}
    >
      <div
        className={clsx(
          'relative bg-white rounded-lg shadow-xl',
          'max-h-[90vh] overflow-hidden',
          'transform transition-all duration-300',
          'animate-in fade-in-0 zoom-in-95',
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        {(title || showCloseButton) && (
          <div className={clsx(
            'flex items-center justify-between p-6 border-b border-gray-200',
            headerClassName
          )}>
            {title && (
              <h2 className="text-xl font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="small"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}

        {/* 内容 */}
        <div className={clsx(
          'p-6 overflow-y-auto',
          contentClassName
        )}>
          {children}
        </div>

        {/* 底部 */}
        {footer && (
          <div className={clsx(
            'flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50',
            footerClassName
          )}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // 使用 Portal 渲染到 body
  return createPortal(modalContent, document.body);
};

// 确认对话框
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = '确认操作',
  message = '您确定要执行此操作吗？',
  confirmText = '确认',
  cancelText = '取消',
  confirmVariant = 'primary',
  isLoading = false,
}) => {
  const handleConfirm = async () => {
    try {
      await onConfirm?.();
      onClose?.();
    } catch (error) {
      console.error('确认操作失败:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            loading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-gray-600">{message}</p>
    </Modal>
  );
};

// 警告对话框
export const AlertModal = ({
  isOpen,
  onClose,
  title = '提示',
  message,
  type = 'info',
  buttonText = '确定',
}) => {
  const typeConfig = {
    info: {
      icon: '💡',
      titleColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    success: {
      icon: '✅',
      titleColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    warning: {
      icon: '⚠️',
      titleColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    error: {
      icon: '❌',
      titleColor: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  };

  const config = typeConfig[type];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      footer={
        <Button variant="primary" onClick={onClose}>
          {buttonText}
        </Button>
      }
    >
      <div className={clsx('p-4 rounded-lg', config.bgColor)}>
        <div className="flex items-start space-x-3">
          <span className="text-2xl">{config.icon}</span>
          <div className="flex-1">
            <h3 className={clsx('font-semibold mb-2', config.titleColor)}>
              {title}
            </h3>
            <p className="text-gray-600">{message}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;
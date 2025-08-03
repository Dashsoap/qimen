import React from 'react';
import { clsx } from 'clsx';

/**
 * 加载组件
 */
const Loading = ({
  size = 'medium',
  variant = 'spinner',
  text = '加载中...',
  className,
  overlay = false,
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl',
  };

  // 旋转加载器
  const SpinnerLoader = () => (
    <div className="flex flex-col items-center justify-center space-y-2">
      <svg
        className={clsx(
          'animate-spin text-blue-600',
          sizeClasses[size]
        )}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <p className={clsx(
          'text-gray-600 font-medium',
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );

  // 点状加载器
  const DotsLoader = () => (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={clsx(
              'bg-blue-600 rounded-full animate-pulse',
              size === 'small' ? 'w-2 h-2' : 
              size === 'medium' ? 'w-3 h-3' :
              size === 'large' ? 'w-4 h-4' : 'w-5 h-5'
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
      {text && (
        <p className={clsx(
          'text-gray-600 font-medium',
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );

  // 脉冲加载器
  const PulseLoader = () => (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className={clsx(
        'bg-blue-600 rounded-full animate-ping',
        sizeClasses[size]
      )} />
      {text && (
        <p className={clsx(
          'text-gray-600 font-medium',
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );

  // 条形加载器
  const BarLoader = () => (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full animate-pulse" 
             style={{ width: '60%', animation: 'loading-bar 1.5s ease-in-out infinite' }} />
      </div>
      {text && (
        <p className={clsx(
          'text-gray-600 font-medium',
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
      <style jsx>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader />;
      case 'pulse':
        return <PulseLoader />;
      case 'bar':
        return <BarLoader />;
      default:
        return <SpinnerLoader />;
    }
  };

  const content = (
    <div className={clsx('flex items-center justify-center', className)}>
      {renderLoader()}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default Loading;
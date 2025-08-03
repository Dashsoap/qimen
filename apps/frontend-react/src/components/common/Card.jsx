import React from 'react';
import { clsx } from 'clsx';

/**
 * 卡片组件
 */
const Card = ({
  children,
  className,
  variant = 'default',
  size = 'medium',
  shadow = true,
  hover = false,
  clickable = false,
  onClick,
  header,
  footer,
  headerClassName,
  footerClassName,
  bodyClassName,
  ...props
}) => {
  // 变体样式
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    outlined: 'bg-white border-2 border-gray-300',
    elevated: 'bg-white border-0',
    filled: 'bg-gray-50 border border-gray-200',
    gradient: 'bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200',
  };

  // 尺寸样式
  const sizeClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  // 阴影样式
  const shadowClasses = {
    none: '',
    small: 'shadow-sm',
    medium: 'shadow-md',
    large: 'shadow-lg',
    xlarge: 'shadow-xl',
  };

  const getShadowClass = () => {
    if (!shadow) return shadowClasses.none;
    if (typeof shadow === 'string') return shadowClasses[shadow] || shadowClasses.medium;
    return shadowClasses.medium;
  };

  return (
    <div
      className={clsx(
        'rounded-lg transition-all duration-200',
        variantClasses[variant],
        getShadowClass(),
        hover && 'hover:shadow-lg hover:-translate-y-1',
        clickable && 'cursor-pointer hover:shadow-md',
        className
      )}
      onClick={clickable ? onClick : undefined}
      {...props}
    >
      {/* 头部 */}
      {header && (
        <div className={clsx(
          'border-b border-gray-200 pb-4 mb-4',
          headerClassName
        )}>
          {header}
        </div>
      )}

      {/* 主体内容 */}
      <div className={clsx(
        !header && !footer && sizeClasses[size],
        header && !footer && 'px-6 pb-6',
        !header && footer && 'px-6 pt-6',
        header && footer && 'px-6',
        bodyClassName
      )}>
        {children}
      </div>

      {/* 底部 */}
      {footer && (
        <div className={clsx(
          'border-t border-gray-200 pt-4 mt-4',
          footerClassName
        )}>
          {footer}
        </div>
      )}
    </div>
  );
};

// 卡片头部组件
export const CardHeader = ({ 
  title, 
  subtitle, 
  action, 
  className,
  titleClassName,
  subtitleClassName 
}) => (
  <div className={clsx('flex items-start justify-between', className)}>
    <div className="flex-1">
      {title && (
        <h3 className={clsx(
          'text-lg font-semibold text-gray-900',
          titleClassName
        )}>
          {title}
        </h3>
      )}
      {subtitle && (
        <p className={clsx(
          'text-sm text-gray-600 mt-1',
          subtitleClassName
        )}>
          {subtitle}
        </p>
      )}
    </div>
    {action && (
      <div className="ml-4 flex-shrink-0">
        {action}
      </div>
    )}
  </div>
);

// 卡片内容组件
export const CardContent = ({ children, className }) => (
  <div className={clsx('text-gray-700', className)}>
    {children}
  </div>
);

// 卡片底部组件
export const CardFooter = ({ children, className, justify = 'end' }) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  return (
    <div className={clsx(
      'flex items-center space-x-3',
      justifyClasses[justify],
      className
    )}>
      {children}
    </div>
  );
};

// 统计卡片组件
export const StatsCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  className,
}) => {
  const changeTypeClasses = {
    positive: 'text-green-600 bg-green-100',
    negative: 'text-red-600 bg-red-100',
    neutral: 'text-gray-600 bg-gray-100',
  };

  return (
    <Card className={clsx('relative overflow-hidden', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={clsx(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2',
              changeTypeClasses[changeType]
            )}>
              {change}
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// 功能卡片组件
export const FeatureCard = ({
  icon,
  title,
  description,
  action,
  className,
}) => (
  <Card 
    className={clsx('text-center', className)}
    hover
    clickable={!!action}
    onClick={action}
  >
    {icon && (
      <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </Card>
);

export default Card;
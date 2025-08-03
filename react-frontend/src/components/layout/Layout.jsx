import React from 'react';
import { clsx } from 'clsx';
import Header from './Header';
import Footer, { SimpleFooter } from './Footer';

/**
 * 主布局组件
 */
const Layout = ({
  children,
  className,
  headerProps = {},
  footerProps = {},
  showHeader = true,
  showFooter = true,
  footerVariant = 'default', // 'default' | 'simple'
  containerClassName,
  fullHeight = false,
}) => {
  return (
    <div className={clsx(
      'min-h-screen flex flex-col',
      fullHeight && 'h-screen',
      className
    )}>
      {/* 头部 */}
      {showHeader && <Header {...headerProps} />}

      {/* 主内容区 */}
      <main className={clsx(
        'flex-1',
        containerClassName
      )}>
        {children}
      </main>

      {/* 底部 */}
      {showFooter && (
        footerVariant === 'simple' ? (
          <SimpleFooter {...footerProps} />
        ) : (
          <Footer {...footerProps} />
        )
      )}
    </div>
  );
};

// 页面容器布局
export const PageLayout = ({
  children,
  title,
  subtitle,
  breadcrumb,
  action,
  className,
  contentClassName,
  maxWidth = '7xl',
}) => {
  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full',
  };

  return (
    <Layout className={className}>
      <div className={clsx(
        'mx-auto px-4 sm:px-6 lg:px-8 py-8',
        maxWidthClasses[maxWidth]
      )}>
        {/* 页面头部 */}
        {(title || subtitle || breadcrumb || action) && (
          <div className="mb-8">
            {/* 面包屑 */}
            {breadcrumb && (
              <div className="mb-4">
                {breadcrumb}
              </div>
            )}

            {/* 标题区域 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                {title && (
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-lg text-gray-600">
                    {subtitle}
                  </p>
                )}
              </div>
              {action && (
                <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                  {action}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 页面内容 */}
        <div className={contentClassName}>
          {children}
        </div>
      </div>
    </Layout>
  );
};

// 侧边栏布局
export const SidebarLayout = ({
  children,
  sidebar,
  sidebarWidth = 'w-64',
  sidebarPosition = 'left', // 'left' | 'right'
  className,
  sidebarClassName,
  contentClassName,
}) => {
  return (
    <Layout className={className}>
      <div className="flex flex-1">
        {/* 左侧边栏 */}
        {sidebarPosition === 'left' && sidebar && (
          <aside className={clsx(
            'flex-shrink-0 bg-gray-50 border-r border-gray-200',
            sidebarWidth,
            sidebarClassName
          )}>
            {sidebar}
          </aside>
        )}

        {/* 主内容 */}
        <div className={clsx('flex-1', contentClassName)}>
          {children}
        </div>

        {/* 右侧边栏 */}
        {sidebarPosition === 'right' && sidebar && (
          <aside className={clsx(
            'flex-shrink-0 bg-gray-50 border-l border-gray-200',
            sidebarWidth,
            sidebarClassName
          )}>
            {sidebar}
          </aside>
        )}
      </div>
    </Layout>
  );
};

// 居中布局
export const CenteredLayout = ({
  children,
  maxWidth = 'md',
  className,
  contentClassName,
  showHeader = true,
  showFooter = true,
}) => {
  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <Layout 
      className={className}
      showHeader={showHeader}
      showFooter={showFooter}
      footerVariant="simple"
    >
      <div className="flex items-center justify-center min-h-full py-12 px-4 sm:px-6 lg:px-8">
        <div className={clsx(
          'w-full space-y-8',
          maxWidthClasses[maxWidth],
          contentClassName
        )}>
          {children}
        </div>
      </div>
    </Layout>
  );
};

// 全屏布局（无头部底部）
export const FullscreenLayout = ({
  children,
  className,
}) => {
  return (
    <div className={clsx('h-screen w-screen overflow-hidden', className)}>
      {children}
    </div>
  );
};

export default Layout;
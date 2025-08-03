import React from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { Heart, Github, Mail, Phone } from 'lucide-react';

/**
 * 底部组件
 */
const Footer = ({ className }) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: '奇门遁甲', href: '/qimen' },
      { name: '功能介绍', href: '/features' },
      { name: '使用指南', href: '/guide' },
    ],
    company: [
      { name: '关于我们', href: '/about' },
      { name: '联系我们', href: '/contact' },
      { name: '隐私政策', href: '/privacy' },
      { name: '服务条款', href: '/terms' },
    ],
    support: [
      { name: '帮助中心', href: '/help' },
      { name: '常见问题', href: '/faq' },
      { name: '意见反馈', href: '/feedback' },
    ],
  };

  return (
    <footer className={clsx(
      'bg-gray-900 text-white',
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 主要内容区 */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 品牌信息 */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                  奇
                </div>
                <span className="text-xl font-bold">丁未奇门遁甲</span>
              </div>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                传承千年智慧，融合现代科技。为您提供专业的奇门遁甲预测服务，助您洞察天机，把握人生。
              </p>
              <div className="flex space-x-4">
                <a
                  href="mailto:contact@qimen.com"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="邮箱联系"
                >
                  <Mail className="w-5 h-5" />
                </a>
                <a
                  href="tel:+86-400-123-4567"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="电话联系"
                >
                  <Phone className="w-5 h-5" />
                </a>
                <a
                  href="https://github.com/qimen-project"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* 产品链接 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">产品</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 公司链接 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">公司</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 支持链接 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">支持</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 分割线 */}
        <div className="border-t border-gray-800" />

        {/* 版权信息 */}
        <div className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>© {currentYear} 丁未奇门遁甲. 保留所有权利.</span>
            </div>
            
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <span>用</span>
              <Heart className="w-4 h-4 text-red-500 mx-1" />
              <span>制作</span>
            </div>
          </div>
        </div>

        {/* 备案信息 */}
        <div className="pb-4">
          <div className="text-center text-xs text-gray-500">
            <p>ICP备案号：京ICP备12345678号-1 | 网络文化经营许可证：京网文[2023]1234-567号</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

// 简化版底部组件
export const SimpleFooter = ({ className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={clsx(
      'bg-gray-50 border-t border-gray-200 py-6',
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center text-white text-sm font-bold">
              奇
            </div>
            <span className="text-gray-600 text-sm">
              © {currentYear} 丁未奇门遁甲
            </span>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <Link to="/privacy" className="hover:text-gray-700 transition-colors">
              隐私政策
            </Link>
            <Link to="/terms" className="hover:text-gray-700 transition-colors">
              服务条款
            </Link>
            <Link to="/contact" className="hover:text-gray-700 transition-colors">
              联系我们
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
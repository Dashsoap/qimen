'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export function Header() {
  const pathname = usePathname();

  const navigationItems = [
    { name: '首页', href: '/home' },
    { name: '奇门遁甲', href: '/qimen' },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/home') return pathname === '/home';
    return pathname?.startsWith(href);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/home" className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-amber-700 transition-colors">
              <div className="w-8 h-8 bg-amber-100 border-2 border-amber-600 rounded-lg flex items-center justify-center text-amber-700 font-bold">
                奇
              </div>
              <span className="text-amber-900">云丁未奇门遁甲</span>
            </Link>
          </div>

          <nav className="flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActiveRoute(item.href)
                    ? 'text-amber-700 bg-amber-50'
                    : 'text-gray-700 hover:text-amber-700 hover:bg-gray-50'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

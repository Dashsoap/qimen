'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import './BottomNav.css';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      path: '/home',
      label: '首页',
      icon: '/assets/img/homebar/home.svg',
      activeIcon: '/assets/img/homebar/home_active.svg'
    },
    {
      path: '/qimen',
      label: '奇门',
      icon: '/assets/img/homebar/qimen.svg',
      activeIcon: '/assets/img/homebar/qimen_active.svg'
    }
  ];

  return (
    <nav className="bottom-nav">
      <div className="nav-items">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className="nav-item"
            >
              <div className="nav-icon">
                <Image
                  src={isActive ? item.activeIcon : item.icon}
                  alt={item.label}
                  width={24}
                  height={24}
                />
              </div>
              <span className="nav-text">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

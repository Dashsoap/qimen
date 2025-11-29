/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // 支持深色模式
  theme: {
    extend: {
      // 奇门遁甲主题颜色
      colors: {
        // 主题色
        qimen: {
          gold: '#d4af37',
          'gold-dark': '#b8943e',
          brown: '#753C15',
          cream: '#FEFDF7',
          border: '#85754e',
          'border-light': '#F0E6D6',
          muted: '#999999',
        },
        // 五行颜色
        wuxing: {
          gold: '#f28413',   // 金
          wood: '#167318',   // 木
          water: '#4499ff',  // 水
          fire: '#bf403a',   // 火
          earth: '#87561e',  // 土
        },
        // 背景色
        bg: {
          dark: '#0a0a0a',
          'dark-muted': 'rgba(10, 10, 10, 0.9)',
          'dark-card': 'rgba(15, 15, 15, 0.8)',
        },
      },
      // 字体家族
      fontFamily: {
        serif: ['Source Han Serif CN', 'serif'],
        sans: ['PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
      // 自定义间距
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      // 自定义圆角
      borderRadius: {
        '4xl': '2rem',
      },
      // 自定义阴影
      boxShadow: {
        'qimen': '0 2px 12px rgba(0, 0, 0, 0.08)',
        'qimen-lg': '0 4px 20px rgba(212, 175, 55, 0.15)',
        'qimen-glow': '0 0 20px rgba(212, 175, 55, 0.3)',
      },
      // 自定义动画
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out',
        'slideUp': 'slideUp 0.3s ease-out',
        'slideDown': 'slideDown 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideUp: {
          'from': { transform: 'translateY(20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          'from': { transform: 'translateY(-10px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      // 背景图
      backgroundImage: {
        'gradient-qimen': 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
      },
    },
  },
  plugins: [],
};


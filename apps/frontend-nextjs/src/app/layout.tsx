import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: '云丁未奇门遁甲 - AI预测应用',
  description: '专业的奇门遁甲AI预测应用，为您提供精准的命理分析和决策建议',
  keywords: '奇门遁甲,AI预测,命理分析,决策咨询',
  authors: [{ name: '云丁未团队' }],
  openGraph: {
    title: '云丁未奇门遁甲',
    description: '专业的奇门遁甲AI预测应用',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preload" href="/STXihei.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      </head>
      <body className="bg-white text-gray-900 antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}


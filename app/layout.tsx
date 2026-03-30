import type { Metadata } from 'next';
import { Providers } from './providers';
import { Sidebar } from './sidebar';
import { AlertMonitor } from './alert-monitor';
import './globals.css';

export const metadata: Metadata = {
  title: 'OpenClaw Pixel Office',
  description: 'Pixel-art office visualization for AI agents',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <head>
        <style>{`
          @font-face {
            font-family: 'ArkPixel';
            src: url('/fonts/ark-pixel-12px-proportional-zh_cn.ttf.woff2') format('woff2');
            font-display: swap;
          }
        `}</style>
      </head>
      <body>
        <Providers>
          <AlertMonitor />
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

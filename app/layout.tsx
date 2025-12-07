import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '日本語学習 - プッシュ通知登録',
  description: '日本語学習のコツや新しい教材の更新情報をプッシュ通知でお届けします',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '日本語学習',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        {/* アイコンは後で追加するまでコメントアウト */}
        {/* <link rel="icon" href="/icon-192.png" /> */}
        {/* <link rel="apple-touch-icon" href="/icon-192.png" /> */}
      </head>
      <body className={inter.className}>
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
          onLoad={() => {
            console.log('OneSignal SDK script loaded')
          }}
          onError={(e) => {
            console.error('OneSignal SDK script load error:', e)
          }}
        />
        {children}
      </body>
    </html>
  )
}


// src/app/layout.tsx
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import Providers from '@/components/common/Providers'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: { default: 'TechShop – Điện tử chính hãng', template: '%s | TechShop' },
  description: 'Mua điện thoại, laptop, phụ kiện chính hãng, giá tốt nhất',
  keywords: ['điện thoại', 'laptop', 'phụ kiện', 'chính hãng'],
  openGraph: { type: 'website', locale: 'vi_VN', siteName: 'TechShop' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <Providers>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: { borderRadius: '10px', background: '#1f2937', color: '#fff', fontSize: '14px' },
                success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}

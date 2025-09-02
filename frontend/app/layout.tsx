import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'

export const metadata: Metadata = {
  title: 'Ignitch - AI-Powered Social Media Marketing',
  description: 'Create, schedule, and optimize your social media content with AI',
  generator: 'Ignitch',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="font-sans">
      <body className="antialiased overflow-x-hidden">
        <AuthProvider>
          <div className="min-h-screen w-full max-w-full">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}

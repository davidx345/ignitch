import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'

export const metadata: Metadata = {
  title: 'Ignitch - AI-Powered Social Media Marketing',
  description: 'Create, schedule, and optimize your social media content with AI',
  generator: 'Ignitch',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="font-sans">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

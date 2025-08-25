'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Settings, Upload, BarChart2, LogOut } from 'lucide-react'

export default function Navigation() {
  const router = useRouter()

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Ignitch
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/upload"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition"
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              Dashboard
            </Link>

            <Link
              href="/settings"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>

            <button
              onClick={() => {
                // Add logout logic here
                router.push('/signin')
              }}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

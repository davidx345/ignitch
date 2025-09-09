"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, signInWithGoogle, signInWithGitHub } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    try {
      const { data, error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      } else {
        // Wait for session to be established
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Supabase Auth Helpers will handle session and cookies automatically
        const redirectTo = searchParams?.get("redirect") || "/dashboard"
        console.log('Sign-in successful, redirecting to:', redirectTo)
        
        // Use router.replace for better session handling
        router.replace(redirectTo)
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleProviderSignIn = async (provider: "google" | "github") => {
    setIsLoading(true)
    setError("")
    try {
      const fn = provider === "google" ? signInWithGoogle : signInWithGitHub
      const { error } = await fn()
      if (error) setError(error.message)
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-md">
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">Welcome Back</h1>
              <p className="text-sm sm:text-base text-gray-600">Sign in to continue your AI marketing journey</p>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSignIn} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="h-12 border-gray-200 focus:border-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-900">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="h-12 border-gray-200 focus:border-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-white font-semibold bg-blue-600"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
            <div className="mt-6">
              <Separator />
              <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 sm:h-12 flex-1 sm:flex-none"
                  onClick={() => handleProviderSignIn("google")}
                  disabled={isLoading}
                >
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 sm:h-12 flex-1 sm:flex-none"
                  onClick={() => handleProviderSignIn("github")}
                  disabled={isLoading}
                >
                  GitHub
                </Button>
              </div>
            </div>
            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{' '}
              <Link href="/signup" className="font-semibold hover:underline text-blue-600">
                Sign up for free
              </Link>
            </p>
            <p className="text-center text-xs text-gray-500 mt-6">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="hover:underline">Terms</Link> and{' '}
              <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

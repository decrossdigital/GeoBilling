"use client"

import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Music, Loader2, Star, Headphones, Mic } from "lucide-react"


export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push("/")
      } else {
        setIsCheckingSession(false)
      }
    })
  }, [router])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const result = await signIn("google", {
        callbackUrl: "/",
        redirect: false,
      })
      
      if (result?.ok) {
        router.push("/")
      } else {
        console.error("Sign in failed:", result?.error)
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Sign in error:", error)
      setIsLoading(false)
    }
  }

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6">
            <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl inline-block">
              <Music className="h-12 w-12 text-white" />
            </div>
          </div>
          <Loader2 className="h-8 w-8 text-white animate-spin mx-auto mb-4" />
          <p className="text-slate-300 text-lg">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side - Branding & Features */}
        <div className="text-center lg:text-left">
          <div className="mb-8">
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
              <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl">
                <Music className="h-12 w-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white mb-2">GeoBilling</h1>
                <p className="text-xl text-slate-300 font-medium">Uniquitous Music</p>
              </div>
            </div>
            <p className="text-lg text-slate-300 leading-relaxed">
              Professional billing and invoicing system designed specifically for music production services. 
              Streamline your workflow and get paid faster.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-slate-300">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Star className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="font-medium">Professional quote generation</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Headphones className="h-5 w-5 text-blue-400" />
              </div>
              <span className="font-medium">Integrated payment processing</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Mic className="h-5 w-5 text-purple-400" />
              </div>
              <span className="font-medium">Client and contractor management</span>
            </div>
          </div>

          {/* Testimonials */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-slate-300 text-sm italic mb-3">
              "GeoBilling has transformed how we handle our music production billing. 
              Professional, efficient, and exactly what we needed."
            </p>
            <p className="text-white font-medium text-sm">— George, Uniquitous Music</p>
          </div>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="flex justify-center">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-slate-300">Sign in to access your professional billing dashboard</p>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full mb-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium py-3 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-3" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {/* Info */}
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-4">
                By signing in, you agree to our terms of service and privacy policy
              </p>
              
              <div className="border-t border-white/10 pt-6">
                <p className="text-slate-400 text-sm mb-2">Need help?</p>
                <a 
                  href="mailto:george@uniquitousmusic.com" 
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  george@uniquitousmusic.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

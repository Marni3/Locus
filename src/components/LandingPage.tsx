import React, { useState } from 'react';
import { Sparkles, Shield, Compass, BookOpen, ArrowRight, Lock, CheckCircle, RefreshCw } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

interface LandingPageProps {
  onSignInSuccess?: () => void;
  onEnterDemoMode?: () => void;
  onError: (errorMsg: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onError, onEnterDemoMode }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      // Suppress popup-closed-by-user or provide actionable message
      if (err.code !== 'auth/popup-closed-by-user') {
        onError(err.message || 'Authentication failed. Please check your connection and try again.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-emerald-300 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif-heading text-2xl font-bold tracking-tight text-stone-900">ReflectAI</span>
            <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Personal Insight Sanctuary
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onEnterDemoMode && (
            <button
              id="header-demo-btn"
              onClick={onEnterDemoMode}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-xs font-medium transition-all shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Demo Mode</span>
            </button>
          )}

          <button
            id="header-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={isAuthenticating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-medium transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isAuthenticating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span>Sign In with Google</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Hero & Content */}
      <main className="w-full max-w-5xl mx-auto px-6 py-12 flex flex-col items-center text-center">
        {/* Security Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F9F7F2] border border-stone-200 text-stone-700 text-xs font-medium mb-8 shadow-2xs">
          <Shield className="w-3.5 h-3.5 text-emerald-700" />
          <span>End-to-End Private &bull; Isolated Personal Storage</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-serif-heading text-5xl sm:text-6xl md:text-7xl font-normal tracking-tight text-stone-900 max-w-3xl leading-[1.08] mb-6">
          Reflect with depth. <br />
          <span className="italic text-stone-600">Discover your patterns.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-stone-600 max-w-2xl font-normal leading-relaxed mb-10">
          A calm, private sanctuary to write multi-turn journal reflections, deliberate decisions, and converse with compassionate reflective intelligence for clarity and structured summaries.
        </p>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md mb-16">
          <button
            id="hero-google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={isAuthenticating}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-base transition-all shadow-sm hover:shadow-md disabled:opacity-50 group cursor-pointer"
          >
            {isAuthenticating ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                />
              </svg>
            )}
            <span>Sign in with Google</span>
            <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" />
          </button>

          {onEnterDemoMode && (
            <button
              id="hero-demo-mode-btn"
              onClick={onEnterDemoMode}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-white hover:bg-stone-50 text-stone-800 font-medium text-base transition-all border border-stone-300 shadow-2xs hover:shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Explore Demo Space</span>
            </button>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div id="feature-card-dialogue" className="p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-stone-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-stone-900 mb-2">Multi-Turn Reflection</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Explore your thoughts with responsive dialogue. Choose between Reflective Mirror, Idea Spark, Action Blueprint, or Mindful Unpack modes.
            </p>
          </div>

          <div id="feature-card-privacy" className="p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-stone-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-stone-900 mb-2">Strict Private Isolation</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Every journal entry, interaction turn, and summary is stored directly under your authenticated account. Zero cross-user leakage.
            </p>
          </div>

          <div id="feature-card-synthesis" className="p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-stone-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#F9F7F2] border border-stone-200 flex items-center justify-center text-stone-800 mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-stone-900 mb-2">Synthesize &amp; Summarize</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Auto-generate key takeaways per session, and uncover longitudinal syntheses across past entries to illuminate recurring themes.
            </p>
          </div>
        </div>

        {/* Demo Preview Snippet */}
        <div className="mt-14 w-full rounded-2xl bg-stone-900 text-stone-100 p-6 md:p-8 text-left border border-stone-800 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-4">
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Sample Interaction &bull; Reflective Mode</span>
            </div>
            <span className="text-xs text-emerald-300 font-mono">Reflective Intelligence</span>
          </div>

          <div className="space-y-4">
            <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700/60 max-w-xl">
              <p className="text-xs font-semibold text-emerald-200 mb-1">You wrote:</p>
              <p className="text-sm text-stone-200 italic font-serif leading-relaxed">
                "I feel stretched thin between launching this new project and making time for deep rest. I keep confusing urgency with importance."
              </p>
            </div>

            <div className="bg-stone-800/40 p-4 rounded-xl border border-stone-700/30 max-w-2xl ml-auto">
              <p className="text-xs font-semibold text-stone-400 mb-1">ReflectAI Mirror:</p>
              <p className="text-sm text-stone-300 leading-relaxed">
                You've identified a classic cognitive trap: treating someone else's timeline as an existential emergency. What is one non-negotiable project boundary that, if held firmly for the next 48 hours, would restore your creative peace?
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3">
        <p>&copy; {new Date().getFullYear()} ReflectAI. A calm, private space for thinking and longitudinal insight.</p>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            OWASP &amp; Data Privacy Compliant
          </span>
        </div>
      </footer>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  Compass, 
  BookOpen, 
  Lock, 
  ArrowRight, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Mail, 
  KeyRound, 
  Network,
  MessageSquare,
  Clock,
  Sun,
  Moon
} from 'lucide-react';
import { LocusMark } from './LocusMark';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../lib/firebase';

interface LandingPageProps {
  onSignInSuccess?: () => void;
  onEnterDemoMode?: () => void;
  onError: (errorMsg: string) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

interface ShowcaseSlide {
  badge: string;
  title: string;
  description: string;
  previewType: 'conversation' | 'synthesis' | 'graph';
}

const SHOWCASE_SLIDES: ShowcaseSlide[] = [
  {
    badge: 'Reflection',
    title: 'Think out loud, naturally.',
    description: 'A quiet conversational space to untangle your thoughts—no blank page pressure or rigid structure.',
    previewType: 'conversation'
  },
  {
    badge: 'Themes & Growth',
    title: 'Watch your insights connect.',
    description: 'Each session is distilled into enduring themes and chronological observations, revealing how your perspectives evolve over time.',
    previewType: 'synthesis'
  },
  {
    badge: 'Concept Graph',
    title: 'Explore your concept graph.',
    description: 'View your themes as an interconnected constellation or switch to the timeline to trace how your thinking evolved.',
    previewType: 'graph'
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onError, 
  onEnterDemoMode,
  isDark,
  onToggleTheme 
}) => {
  // Theme State
  const [internalIsDark, setInternalIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const currentIsDark = isDark !== undefined ? isDark : internalIsDark;

  const handleToggleThemeClick = () => {
    if (onToggleTheme) {
      onToggleTheme();
    } else {
      const willBeDark = !document.documentElement.classList.contains('dark');
      if (willBeDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('locus_theme_mode', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('locus_theme_mode', 'light');
      }
      setInternalIsDark(willBeDark);
    }
  };

  // Carousel State with Cross-Fade Transition
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

  // Authentication State
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const changeSlide = useCallback((getNextIndex: (prev: number) => number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(getNextIndex);
      setIsTransitioning(false);
    }, 220);
  }, []);

  // Auto-rotate carousel every 6 seconds if not hovered
  useEffect(() => {
    if (isCarouselHovered) return;
    const interval = setInterval(() => {
      changeSlide((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isCarouselHovered, changeSlide]);

  const handleNextSlide = useCallback(() => {
    changeSlide((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
  }, [changeSlide]);

  const handlePrevSlide = useCallback(() => {
    changeSlide((prev) => (prev - 1 + SHOWCASE_SLIDES.length) % SHOWCASE_SLIDES.length);
  }, [changeSlide]);

  const handleSelectSlide = useCallback((idx: number) => {
    if (idx === currentSlide) return;
    changeSlide(() => idx);
  }, [currentSlide, changeSlide]);

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      setAuthError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        const msg = err.message || 'Authentication failed. Please verify your connection.';
        setAuthError(msg);
        onError(msg);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Email & Password Auth
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please enter both your email and password.');
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    try {
      setIsAuthenticating(true);
      setAuthError(null);
      if (authMode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (err: any) {
      console.error('Email auth error:', err);
      let message = 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Incorrect email or password. Please verify and try again.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists. Try signing in.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.message) {
        message = err.message;
      }
      setAuthError(message);
      onError(message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const activeSlideData = SHOWCASE_SLIDES[currentSlide];

  return (
    <div className="relative min-h-screen bg-canvas text-text-primary flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-accent-sage-tint selection:text-accent-sage overflow-hidden">
      
      {/* Quick Theme Toggle (Sun/Moon) */}
      <button
        id="landing-theme-toggle-btn"
        type="button"
        onClick={handleToggleThemeClick}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-30 p-2.5 rounded-full bg-surface/85 backdrop-blur-md border border-border-hairline text-text-muted hover:text-text-primary hover:border-accent-sage transition-all shadow-xs cursor-pointer flex items-center justify-center"
        title={currentIsDark ? "Switch to daylight mode" : "Switch to obsidian dark mode"}
        aria-label={currentIsDark ? "Switch to daylight mode" : "Switch to obsidian dark mode"}
      >
        {currentIsDark ? (
          <Sun className="w-4 h-4 text-accent-sage" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </button>

      {/* Continuous Animated Water Droplet Ripple Waves */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Epicenter 1: Center background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="absolute w-[440px] h-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-sage/40 opacity-0 animate-water-ripple" style={{ animationDelay: '0s' }} />
          <div className="absolute w-[440px] h-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-sage/40 opacity-0 animate-water-ripple" style={{ animationDelay: '2.7s' }} />
          <div className="absolute w-[440px] h-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-sage/40 opacity-0 animate-water-ripple" style={{ animationDelay: '5.4s' }} />
        </div>

        {/* Epicenter 2: Top-left offset */}
        <div className="absolute top-[18%] left-[20%] pointer-events-none">
          <div className="absolute w-[340px] h-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-sage/40 opacity-0 animate-water-ripple" style={{ animationDelay: '1.2s' }} />
          <div className="absolute w-[340px] h-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-sage/40 opacity-0 animate-water-ripple" style={{ animationDelay: '4.8s' }} />
        </div>

        {/* Epicenter 3: Bottom-right offset */}
        <div className="absolute bottom-[20%] right-[22%] pointer-events-none">
          <div className="absolute w-[380px] h-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-sage/40 opacity-0 animate-water-ripple" style={{ animationDelay: '3.4s' }} />
          <div className="absolute w-[380px] h-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-sage/40 opacity-0 animate-water-ripple" style={{ animationDelay: '6.6s' }} />
        </div>

      </div>

      {/* Refined & Compact Sanctuary Card */}
      <div className="relative z-10 w-full max-w-4xl rounded-3xl bg-surface border border-border-hairline shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* ================= LEFT COLUMN: Visual Showcase (~64%) ================= */}
        <div 
          className="relative flex-1 md:w-[62%] lg:w-[64%] p-6 sm:p-7 sm:py-8 flex flex-col justify-between bg-gradient-to-br from-surface via-surface to-canvas overflow-hidden"
          onMouseEnter={() => setIsCarouselHovered(true)}
          onMouseLeave={() => setIsCarouselHovered(false)}
        >
          {/* Top Brand Lockup & Stepper Controls */}
          <div className="flex items-center justify-between z-10 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-md bg-accent-sage flex items-center justify-center text-white shadow-2xs shrink-0">
                <LocusMark className="w-3 h-3" />
              </div>
              <span className="font-serif text-sm font-semibold tracking-tight text-text-primary shrink-0">Locus</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium bg-accent-sage-tint text-accent-sage border border-accent-sage/25 tracking-wide truncate shadow-2xs">
                {activeSlideData.badge}
              </span>
            </div>

            {/* Slide Navigation Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handlePrevSlide}
                aria-label="Previous slide"
                className="w-7 h-7 rounded-full border border-border-hairline bg-surface/80 hover:bg-surface text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextSlide}
                aria-label="Next slide"
                className="w-7 h-7 rounded-full border border-border-hairline bg-surface/80 hover:bg-surface text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Carousel Slide Content with Silky Cross-Fade */}
          <div 
            className={`my-6 z-10 transition-opacity duration-300 ease-in-out ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-text-primary tracking-tight leading-[1.2] mb-2">
              {activeSlideData.title}
            </h2>
            <p className="text-xs sm:text-sm text-text-muted font-sans leading-relaxed max-w-lg mb-5">
              {activeSlideData.description}
            </p>

            {/* Interactive Visual Representation */}
            <div className="w-full rounded-2xl bg-surface border border-border-hairline p-4 shadow-2xs">
              {activeSlideData.previewType === 'conversation' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-2xs text-text-muted pb-1.5 border-b border-border-hairline">
                    <span className="font-medium text-accent-sage flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-accent-sage" />
                      Active Reflection
                    </span>
                    <span>10:42 AM</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-canvas border border-border-hairline/70">
                    <p className="text-xs font-serif text-text-primary leading-relaxed">
                      &ldquo;Feeling stuck on this architecture shift. I keep overthinking edge cases instead of taking the first step.&rdquo;
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface border border-border-hairline/80 shadow-2xs">
                    <div className="flex items-center gap-1.5 mb-1 text-2xs text-text-muted">
                      <div className="w-3.5 h-3.5 rounded bg-accent-sage/10 text-accent-sage flex items-center justify-center">
                        <LocusMark className="w-2 h-2" />
                      </div>
                      <span className="font-medium text-text-primary text-2xs">Reflective Inquiry</span>
                    </div>
                    <p className="text-xs font-sans text-text-muted leading-relaxed">
                      Overthinking edge cases is often protection against starting imperfectly. What is the smallest decision you can make right now?
                    </p>
                  </div>
                </div>
              )}

              {activeSlideData.previewType === 'synthesis' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-2xs text-text-muted pb-1.5 border-b border-border-hairline">
                    <span className="font-medium text-accent-sage flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-sage ring-2 ring-accent-sage/25" />
                      Synthesized Observation
                    </span>
                    <span>March 14</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-canvas border border-border-hairline/70">
                    <p className="text-xs font-serif italic text-text-primary leading-relaxed">
                      &ldquo;Hesitated to publish the draft today. Realized it's not about perfection, but about being seen in progress.&rdquo;
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-accent-sage-tint/40 border border-accent-sage/20 text-xs">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <BookOpen className="w-3.5 h-3.5 text-accent-sage" />
                      <span className="font-semibold text-text-primary text-xs">Theme: Creative Vulnerability</span>
                    </div>
                    <p className="text-2xs text-text-muted leading-relaxed">
                      4 reflections over 6 weeks &bull; Gradual shift from defensive perfectionism toward steady sharing.
                    </p>
                  </div>
                </div>
              )}

              {activeSlideData.previewType === 'graph' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-2xs text-text-muted pb-1.5 border-b border-border-hairline">
                    <div className="flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded-md bg-accent-sage-tint/60 text-accent-sage font-medium text-2xs flex items-center gap-1 border border-accent-sage/20">
                        <Network className="w-3 h-3" />
                        Graph
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-text-muted text-2xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Timeline
                      </span>
                    </div>
                    <span className="text-2xs text-text-muted">3 Themes &bull; 12 Observations</span>
                  </div>

                  {/* Authentic Mini-Constellation Canvas matching ThemesView.tsx */}
                  <div className="relative h-[116px] w-full rounded-xl bg-canvas/90 border border-border-hairline/70 overflow-hidden flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 320 116" fill="none">
                      {/* Connecting Spring Links */}
                      <line x1="160" y1="58" x2="68" y2="40" stroke="var(--color-border-hairline, #E6E3DC)" strokeWidth="1.5" />
                      <line x1="160" y1="58" x2="252" y2="38" stroke="var(--color-border-hairline, #E6E3DC)" strokeWidth="1.5" />
                      <line x1="160" y1="58" x2="160" y2="94" stroke="var(--color-border-hairline, #E6E3DC)" strokeWidth="1.5" strokeDasharray="3 3" />

                      {/* Theme Node 1: Creative Practice */}
                      <g>
                        <circle cx="68" cy="40" r="13" fill="var(--color-surface, #FFFFFF)" stroke="var(--color-accent-sage, #3B7A57)" strokeWidth="1.5" />
                        <circle cx="68" cy="40" r="3.5" fill="var(--color-accent-sage, #3B7A57)" />
                        <text x="68" y="66" textAnchor="middle" fill="var(--color-text-primary, #232323)" fontSize="9.5" fontFamily="'Source Serif 4', Georgia, serif" fontWeight="600">
                          Creative Practice
                        </text>
                        <text x="68" y="76" textAnchor="middle" fill="var(--color-text-muted, #6B6B6B)" fontSize="8" fontFamily="'Inter', sans-serif">
                          5 observations
                        </text>
                      </g>

                      {/* Central "YOU" Anchor Hub matching ThemesView.tsx */}
                      <g>
                        <circle cx="160" cy="58" r="16" fill="var(--color-accent-sage, #3B7A57)" />
                        <circle cx="160" cy="58" r="21" stroke="var(--color-accent-sage, #3B7A57)" strokeWidth="1" opacity="0.25" />
                        <text x="160" y="62" textAnchor="middle" fill="#FFFFFF" fontSize="8.5" fontFamily="'Inter', sans-serif" fontWeight="700" letterSpacing="0.05em">
                          YOU
                        </text>
                      </g>

                      {/* Theme Node 2: Deep Focus */}
                      <g>
                        <circle cx="252" cy="38" r="13" fill="var(--color-surface, #FFFFFF)" stroke="var(--color-accent-sage, #3B7A57)" strokeWidth="1.5" />
                        <circle cx="252" cy="38" r="3.5" fill="var(--color-accent-sage, #3B7A57)" />
                        <text x="252" y="64" textAnchor="middle" fill="var(--color-text-primary, #232323)" fontSize="9.5" fontFamily="'Source Serif 4', Georgia, serif" fontWeight="600">
                          Deep Focus
                        </text>
                        <text x="252" y="74" textAnchor="middle" fill="var(--color-text-muted, #6B6B6B)" fontSize="8" fontFamily="'Inter', sans-serif">
                          4 observations
                        </text>
                      </g>

                      {/* Theme Node 3: Leadership */}
                      <g className="opacity-80">
                        <circle cx="160" cy="94" r="10" fill="var(--color-surface, #FFFFFF)" stroke="var(--color-text-muted, #6B6B6B)" strokeWidth="1.2" />
                        <text x="160" y="110" textAnchor="middle" fill="var(--color-text-muted, #6B6B6B)" fontSize="8.5" fontFamily="'Source Serif 4', Georgia, serif">
                          Leadership
                        </text>
                      </g>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Dot Stepper */}
          <div className="flex items-center gap-1.5 pt-1 z-10">
            {SHOWCASE_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === idx 
                    ? 'w-6 bg-accent-sage' 
                    : 'w-1.5 bg-border-hairline hover:bg-stone-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: Clean Gateway (~36%) ================= */}
        <div className="flex-none md:w-[38%] lg:w-[36%] bg-surface border-t md:border-t-0 md:border-l border-border-hairline p-6 sm:p-7 flex flex-col justify-center">
          <div>
            {/* Clean Title */}
            <div className="mb-5 text-center md:text-left">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                Reflect with depth.
              </h1>
            </div>

            {/* Auth Mode Switcher (Sign In vs Create Account) */}
            <div className="flex items-center rounded-xl bg-canvas p-1 border border-border-hairline mb-4">
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setAuthError(null); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-surface text-text-primary shadow-2xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-surface text-text-primary shadow-2xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Notification Banner */}
            {authError && (
              <div className="mb-3.5 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs leading-relaxed animate-in fade-in duration-200">
                {authError}
              </div>
            )}

            {/* Google OAuth Button */}
            <button
              id="hero-google-signin-btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isAuthenticating}
              className="w-full flex items-center justify-center gap-2.5 py-2 px-4 rounded-xl bg-surface hover:bg-canvas text-text-primary border border-border-hairline text-xs font-medium transition-all shadow-2xs hover:shadow-xs disabled:opacity-50 cursor-pointer mb-3.5"
            >
              {isAuthenticating ? (
                <RefreshCw className="w-4 h-4 animate-spin text-accent-sage" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              <span>Continue with Google</span>
            </button>

            {/* Hairline Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-hairline" />
              </div>
              <span className="relative px-2.5 bg-surface text-2xs text-text-muted font-medium uppercase tracking-wider">
                or with email
              </span>
            </div>

            {/* Email + Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-2.5">
              <div>
                <label className="block text-2xs font-medium text-text-muted mb-1">Email address</label>
                <div className="relative flex items-center">
                  <Mail className="w-3.5 h-3.5 absolute left-3 text-text-muted pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-9 pr-3 py-1.5 bg-canvas rounded-xl border border-border-hairline text-xs text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent-sage focus:ring-1 focus:ring-accent-sage transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-medium text-text-muted mb-1">Password</label>
                <div className="relative flex items-center">
                  <KeyRound className="w-3.5 h-3.5 absolute left-3 text-text-muted pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-9 pr-3 py-1.5 bg-canvas rounded-xl border border-border-hairline text-xs text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent-sage focus:ring-1 focus:ring-accent-sage transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full mt-1 py-2 px-4 rounded-xl bg-accent-sage hover:bg-emerald-900 text-white font-medium text-xs transition-all shadow-2xs hover:shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAuthenticating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>{authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Direct Demo Gateway */}
            {onEnterDemoMode && (
              <div className="mt-4 pt-3.5 border-t border-border-hairline">
                <button
                  id="hero-demo-mode-btn"
                  type="button"
                  onClick={onEnterDemoMode}
                  className="w-full py-2 px-4 rounded-xl bg-accent-sage-tint/40 hover:bg-accent-sage-tint text-accent-sage border border-accent-sage/30 text-xs font-medium transition-all shadow-2xs hover:shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-accent-sage" />
                  <span>Explore Demo Space</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

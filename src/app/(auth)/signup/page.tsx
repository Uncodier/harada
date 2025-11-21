'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        // Handle rate limiting
        if (signUpError.status === 429) {
          throw new Error('Too many signup attempts. Please wait a few minutes and try again.');
        }
        throw signUpError;
      }

      // Profile is created automatically by database trigger
      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation required
        setError(
          'Account created! Please check your email to confirm your account before signing in.'
        );
        return;
      }

      // User is automatically logged in (if email confirmation is disabled)
      if (data.session) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during signup. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-scale-in">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Create your account
          </h2>
            <p className="text-gray-600">Start your journey to achieving your goals</p>
        </div>
          
          <form className="space-y-6" onSubmit={handleSignup}>
            {error && (
              <div className={`${error.includes('created') || error.includes('Account created') ? 'bg-green-50 border-l-4 border-green-500 text-green-700' : 'bg-red-50 border-l-4 border-red-500 text-red-700'} px-4 py-3 rounded-lg animate-slide-in`}>
                <p className="font-medium">{error}</p>
              </div>
            )}
            
            <div className="space-y-5">
            <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-900 bg-gray-50 hover:bg-white"
                  placeholder="John Doe"
              />
            </div>
              
            <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-900 bg-gray-50 hover:bg-white"
                  placeholder="you@example.com"
              />
            </div>
              
            <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-900 bg-gray-50 hover:bg-white"
                  placeholder="At least 6 characters"
                minLength={6}
              />
                <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
              </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Sign up'
                )}
            </button>
          </div>

            <div className="text-center pt-4">
            <Link
              href="/login"
                className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
            >
                Already have an account?{' '}
                <span className="font-semibold underline decoration-2 underline-offset-2">Sign in</span>
            </Link>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}


import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-pink-100 leading-tight">
            Harada Method
          </h1>
          <p className="text-xl sm:text-2xl mb-12 opacity-95 max-w-3xl mx-auto leading-relaxed font-light">
            Transform your dreams into daily actions. The proven system used by{' '}
            <span className="font-semibold">Shohei Ohtani</span>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
          <Link
            href="/signup"
            className="group relative px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 hover:-translate-y-1 min-w-[180px]"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold text-lg hover:bg-white/20 hover:border-white/50 transform hover:scale-105 transition-all duration-300 hover:-translate-y-1 min-w-[180px]"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-24 max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 text-left">
            <div className="glass rounded-2xl p-8 hover:scale-105 transition-transform duration-300 cursor-default group">
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">🎯</div>
              <h3 className="text-xl font-bold mb-3 text-white">Set Your Goal</h3>
              <p className="text-sm sm:text-base opacity-90 leading-relaxed">
                Define your central objective. Our AI will help you break it down into actionable steps.
              </p>
            </div>
            <div className="glass rounded-2xl p-8 hover:scale-105 transition-transform duration-300 cursor-default group">
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">📊</div>
              <h3 className="text-xl font-bold mb-3 text-white">8 Pillars, 64 Tasks</h3>
              <p className="text-sm sm:text-base opacity-90 leading-relaxed">
                AI generates 8 key areas and 64 actionable daily habits tailored to your goal.
              </p>
            </div>
            <div className="glass rounded-2xl p-8 hover:scale-105 transition-transform duration-300 cursor-default group">
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">📈</div>
              <h3 className="text-xl font-bold mb-3 text-white">Track & Visualize</h3>
              <p className="text-sm sm:text-base opacity-90 leading-relaxed">
                Log your progress daily and see your growth over time with beautiful visualizations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

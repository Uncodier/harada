'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Plus, LogOut } from 'lucide-react';

interface Grid {
  id: string;
  main_goal: string;
  created_at: string;
}

export default function DashboardPage() {
  const [grids, setGrids] = useState<Grid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mainGoal, setMainGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadGrids();
  }, []);

  const loadGrids = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('grids')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGrids(data || []);
    } catch (error) {
      console.error('Error loading grids:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainGoal.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mainGoal: mainGoal.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate grid');
      }

      setMainGoal('');
      await loadGrids();
      router.push(`/dashboard/grid/${data.gridId}`);
    } catch (error) {
      console.error('Error generating grid:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate grid');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading your grids...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30">
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Harada Method
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-10 animate-fade-in">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create New Grid</h2>
          <p className="text-gray-600 mb-6">Transform your goal into actionable daily habits</p>
          <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={mainGoal}
              onChange={(e) => setMainGoal(e.target.value)}
              placeholder="Enter your main goal (e.g., 'Be the #1 draft pick')"
              className="flex-1 px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-900 bg-white shadow-sm hover:shadow-md"
              required
            />
            <button
              type="submit"
              disabled={isGenerating}
              className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Generate Grid
                </>
              )}
            </button>
          </form>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Grids</h2>
          {grids.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-gray-200">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-lg text-gray-700 mb-2 font-semibold">No grids yet</p>
                <p className="text-gray-500 mb-6">
                  Create your first grid by entering a goal above. Our AI will break it down into 8 pillars and 64 actionable tasks.
                </p>
                <div className="inline-flex items-center gap-2 text-sm text-purple-600 font-medium">
                  <span>Get started →</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {grids.map((grid, index) => (
                <Link
                  key={grid.id}
                  href={`/dashboard/grid/${grid.id}`}
                  className="group bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-purple-300 transform hover:-translate-y-1 cursor-pointer animate-scale-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2 flex-1">
                      {grid.main_goal}
                    </h3>
                    <div className="ml-2 flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <span>Created</span>
                    <span className="font-medium">{new Date(grid.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-purple-600 font-medium">
                      <span>View grid →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import axiosClient from '../utils/axiosClient';
import { ArrowLeft, Star, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { ProblemListSkeleton } from '../components/Skeletons';

const getDifficultyStyle = (d) => {
  switch (d?.toLowerCase()) {
    case 'easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'hard': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  }
};

export default function Bookmarks() {
  const [problems, setProblems] = useState([]);
  const [solvedIds, setSolvedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [listRes, solvedRes] = await Promise.all([
          axiosClient.get('/bookmark/list'),
          axiosClient.get('/problem/problemSolvedByUser'),
        ]);
        setProblems(listRes.data || []);
        setSolvedIds(new Set((solvedRes.data || []).map(p => p._id)));
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load bookmarks');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const removeBookmark = async (problemId) => {
    setProblems(prev => prev.filter(p => p._id !== problemId));
    try {
      await axiosClient.post(`/bookmark/toggle/${problemId}`);
    } catch {
      // Fail silent — refetch would restore
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-white selection:bg-violet-500/30">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full"
             style={{ background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.08), transparent 70%)' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <NavLink to="/" className="inline-flex items-center gap-2 text-[13px] text-white/40 hover:text-white mb-6">
          <ArrowLeft size={14} /> Back to problems
        </NavLink>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
              <Star size={20} className="text-amber-400 fill-amber-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Your Bookmarks</h1>
          </div>
          <p className="text-[13.5px] text-white/40 ml-[52px]">
            Problems you've saved to revisit later.
          </p>
        </div>

        {loading ? (
          <ProblemListSkeleton />
        ) : error ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-300">
            {error}
          </div>
        ) : problems.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117] p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-5">
              <Star size={28} className="text-amber-400/60" />
            </div>
            <h2 className="text-xl font-bold mb-2">No bookmarks yet</h2>
            <p className="text-white/50 text-[14px] max-w-md mx-auto mb-6">
              Click the star icon next to any problem to save it for later.
            </p>
            <NavLink to="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-medium transition-colors">
              Browse problems
            </NavLink>
          </div>
        ) : (
          <div className="space-y-1">
            {problems.map((problem) => {
              const isSolved = solvedIds.has(problem._id);
              return (
                <div
                  key={problem._id}
                  className="group flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-white/[0.06] hover:bg-white/[0.02] transition-all"
                >
                  <NavLink
                    to={`/problem/${problem._id}`}
                    state={{
                      listIds: problems.map(p => p._id),
                      source: { type: 'bookmarks', name: 'Bookmarks' },
                    }}
                    className="flex items-center gap-4 min-w-0 flex-1"
                  >
                    {isSolved ? (
                      <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Circle size={18} className="text-white/15 flex-shrink-0" />
                    )}
                    <h3 className="text-[14.5px] font-medium text-white/90 group-hover:text-violet-400 transition-colors truncate">
                      <span className="text-white/30 mr-2 font-mono text-[13px]">
                        {problem.problemNumber || '---'}.
                      </span>
                      {problem.title}
                    </h3>
                  </NavLink>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    {!problem.isRunnable && (
                      <span className="hidden md:inline-block px-2.5 py-1 rounded-md text-[10.5px] font-semibold border text-amber-400 bg-amber-500/10 border-amber-500/20">
                        🚧 Soon
                      </span>
                    )}
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getDifficultyStyle(problem.difficulty)}`}>
                      {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                    </span>
                    <button
                      onClick={() => removeBookmark(problem._id)}
                      className="p-1.5 rounded hover:bg-white/[0.06] transition-colors"
                      title="Remove bookmark"
                    >
                      <Star size={16} className="fill-amber-400 text-amber-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-6 text-center text-[12px] text-white/20">
          Showing {problems.length} bookmark{problems.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
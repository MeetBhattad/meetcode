import { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router';
import axiosClient from '../utils/axiosClient';
import { ArrowLeft, CheckCircle2, Circle, BookOpen, Target, Loader2, ArrowRight } from 'lucide-react';

const getDifficultyStyle = (d) => {
  switch (d?.toLowerCase()) {
    case 'easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'hard': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  }
};

export default function PathDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axiosClient.get(`/paths/${slug}`);
        setData(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load path');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-violet-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#07070a] flex items-center justify-center p-4">
        <div className="max-w-md rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-300 text-center">
          {error}
          <NavLink to="/paths" className="block mt-4 text-[13px] text-white/60 hover:text-white underline">
            Back to paths
          </NavLink>
        </div>
      </div>
    );
  }

  const { name, description, type, stats, problems, nextProblemId, expectedTotal } = data;
  const progress = stats.total > 0 ? stats.solved / stats.total : 0;
  const isComplete = stats.solved === stats.total && stats.total > 0;

  return (
    <div className="min-h-screen bg-[#07070a] text-white selection:bg-violet-500/30">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.08), transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        <NavLink to="/paths" className="inline-flex items-center gap-2 text-[13px] text-white/40 hover:text-white mb-6">
          <ArrowLeft size={14} /> All paths
        </NavLink>

        {/* Header card */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117] p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-500 via-transparent to-transparent pointer-events-none" />
          <div className="relative">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                {type === 'curated' ? <BookOpen size={22} className="text-violet-400" /> : <Target size={22} className="text-violet-400" />}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
                <p className="text-[13px] text-white/40 mt-0.5 line-clamp-2">{description}</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-baseline mb-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{stats.solved}</span>
                  <span className="text-lg text-white/40">/ {stats.total}</span>
                  <span className="text-[13px] text-white/40 ml-1">solved</span>
                </div>
                <span className="text-[13px] font-mono text-violet-400">{Math.round(progress * 100)}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-500"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              {expectedTotal > stats.total && (
                <p className="mt-3 text-[12px] text-white/40">
                  {stats.total} of {expectedTotal} problems available — we're actively adding more.
                </p>
              )}
            </div>

            {!isComplete && nextProblemId && (
              <NavLink
                to={`/problem/${nextProblemId}`}
                state={{ listIds: problems.map((p) => p._id) }}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-medium transition-colors"
              >
                Continue where you left off <ArrowRight size={14} />
              </NavLink>
            )}
          </div>
        </div>

        {/* Problem list */}
        <div className="space-y-1">
          {problems.map((p, i) => (
            <NavLink
              key={p._id}
              to={`/problem/${p._id}`}
              state={{ listIds: problems.map((x) => x._id) }}
              className="group flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-white/[0.06] hover:bg-white/[0.02] transition-all duration-200"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <span className="text-[12px] font-mono text-white/30 w-8 flex-shrink-0">{i + 1}.</span>
                {p.isSolved ? (
                  <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                ) : (
                  <Circle size={18} className="text-white/15 flex-shrink-0 group-hover:text-white/30 transition-colors" />
                )}
                <div className="min-w-0">
                  <h3 className="text-[14.5px] font-medium text-white/90 group-hover:text-violet-400 transition-colors truncate">
                    {p.problemNumber ? <span className="text-white/30 mr-2 font-mono text-[13px]">#{p.problemNumber}</span> : null}
                    {p.title}
                  </h3>
                  <p className="text-[11px] text-white/30 mt-0.5">
                    {p.tags?.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide border ${getDifficultyStyle(p.difficulty)}`}>
                  {p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1)}
                </span>
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
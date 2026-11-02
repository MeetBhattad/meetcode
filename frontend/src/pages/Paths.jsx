import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import axiosClient from '../utils/axiosClient';
import { ArrowLeft, BookOpen, Target, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function Paths() {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axiosClient.get('/paths');
        setPaths(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load paths');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

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
        <div className="max-w-md rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-300">
          {error}
          <NavLink to="/" className="block mt-4 text-[13px] text-white/60 hover:text-white underline">
            Back to home
          </NavLink>
        </div>
      </div>
    );
  }

  const curated = paths.filter((p) => p.type === 'curated');
  const topics = paths.filter((p) => p.type === 'topic');

  return (
    <div className="min-h-screen bg-[#07070a] text-white selection:bg-violet-500/30">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.08), transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <NavLink to="/" className="inline-flex items-center gap-2 text-[13px] text-white/40 hover:text-white mb-6">
          <ArrowLeft size={14} /> Back to problems
        </NavLink>

        <div className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight">Learning Paths</h1>
          <p className="text-[13.5px] text-white/40 mt-1">Structured tracks to take you from beginner to interview-ready.</p>
        </div>

        {curated.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={16} className="text-violet-400" />
              <h2 className="text-[15px] font-semibold">Curated Paths</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {curated.map((path) => <PathCard key={path._id} path={path} />)}
            </div>
          </section>
        )}

        {topics.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Target size={16} className="text-violet-400" />
              <h2 className="text-[15px] font-semibold">Topic Tracks</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {topics.map((path) => <PathCard key={path._id} path={path} compact />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function PathCard({ path, compact = false }) {
  const progress = path.total > 0 ? path.solved / path.total : 0;
  const isComplete = path.solved === path.total && path.total > 0;

  return (
    <NavLink
      to={`/paths/${path.slug}`}
      className={`group block rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-violet-500/30 hover:bg-white/[0.04] transition-all ${compact ? 'p-4' : 'p-5'}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-[14.5px] font-semibold text-white group-hover:text-violet-400 transition-colors truncate">
            {path.name}
          </h3>
          {!compact && (
            <p className="text-[12px] text-white/40 mt-1 line-clamp-2">{path.description}</p>
          )}
        </div>
        {isComplete && <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />}
      </div>

      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[13px] text-white/60">
          <span className="font-semibold text-white">{path.solved}</span>
          <span className="text-white/40"> / {path.total}</span>
          {path.expectedTotal > path.total && (
            <span className="text-white/30 text-[11px] ml-1.5">({path.expectedTotal - path.total} more coming)</span>
          )}
        </span>
        <span className="text-[11px] font-mono text-violet-400">{Math.round(progress * 100)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {path.nextProblemId ? (
        <div className="flex items-center gap-1 text-[11.5px] text-violet-400/80 group-hover:text-violet-300">
          Continue <ArrowRight size={11} />
        </div>
      ) : (
        <div className="text-[11.5px] text-emerald-400/80">Completed</div>
      )}
    </NavLink>
  );
}
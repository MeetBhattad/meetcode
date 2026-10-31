/* eslint-disable no-empty */
import { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router';
import axiosClient from '../utils/axiosClient';
import {
  ArrowLeft, CheckCircle2, Circle, Building2, TrendingUp,
  Copy, Check, Loader2, Filter
} from 'lucide-react';

const getDifficultyStyle = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'hard': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  }
};

export default function CompanyPrep() {
  const { companyName } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all'); // all | solved | unsolved
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('frequency'); // frequency | difficulty | title

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axiosClient.get(
          `/company/${encodeURIComponent(companyName)}/problems`
        );
        setData(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load company data');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [companyName]);

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

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
          <NavLink to="/" className="block mt-4 text-[13px] text-white/60 hover:text-white underline">
            Back to problems
          </NavLink>
        </div>
      </div>
    );
  }

  const { stats, problems } = data;
  const progress = stats.total > 0 ? stats.solved / stats.total : 0;

  // Apply filters
  let filtered = problems.filter((p) => {
    const statusMatch =
      statusFilter === 'all' ||
      (statusFilter === 'solved' && p.isSolved) ||
      (statusFilter === 'unsolved' && !p.isSolved);
    const diffMatch = difficultyFilter === 'all' || p.difficulty === difficultyFilter;
    return statusMatch && diffMatch;
  });

  // Apply sort
  if (sortBy === 'frequency') {
    filtered.sort((a, b) => b.frequency - a.frequency);
  } else if (sortBy === 'difficulty') {
    const order = { easy: 0, medium: 1, hard: 2 };
    filtered.sort((a, b) => (order[a.difficulty] ?? 3) - (order[b.difficulty] ?? 3));
  } else if (sortBy === 'title') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  const displayCompany = companyName.replace(/-/g, ' ');

  return (
    <div className="min-h-screen bg-[#07070a] text-white selection:bg-violet-500/30">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.08), transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        {/* Back */}
        <NavLink
          to="/"
          className="inline-flex items-center gap-2 text-[13px] text-white/40 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to problems
        </NavLink>

        {/* Header */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117] p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-500 via-transparent to-transparent pointer-events-none" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
                  <Building2 size={22} className="text-violet-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{displayCompany}</h1>
                  <p className="text-[13px] text-white/40 mt-0.5">Interview prep track</p>
                </div>
              </div>
              <button
                onClick={copyShareLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[12px] text-white/60 hover:text-white transition-colors"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                {copied ? 'Copied!' : 'Share'}
              </button>
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex justify-between items-baseline mb-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{stats.solved}</span>
                  <span className="text-lg text-white/40">/ {stats.total}</span>
                  <span className="text-[13px] text-white/40 ml-1">solved</span>
                </div>
                <span className="text-[13px] font-mono text-violet-400">
                  {Math.round(progress * 100)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-500"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>

            {/* Difficulty breakdown */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              <DiffChip label="Easy" {...stats.difficulty.easy} color="emerald" />
              <DiffChip label="Medium" {...stats.difficulty.medium} color="amber" />
              <DiffChip label="Hard" {...stats.difficulty.hard} color="rose" />
            </div>
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-white/40 text-[11px] uppercase tracking-wide">
            <Filter size={12} /> Filter
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[13px] text-white/80 outline-none hover:border-white/[0.12] focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/[0.08] transition-all cursor-pointer"
            style={{ colorScheme: 'dark' }}
          >
            <option value="all">All Status</option>
            <option value="solved">Solved</option>
            <option value="unsolved">Unsolved</option>
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="h-9 px-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[13px] text-white/80 outline-none hover:border-white/[0.12] focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/[0.08] transition-all cursor-pointer"
            style={{ colorScheme: 'dark' }}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 px-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[13px] text-white/80 outline-none hover:border-white/[0.12] focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/[0.08] transition-all cursor-pointer"
            style={{ colorScheme: 'dark' }}
          >
            <option value="frequency">Sort: Frequency</option>
            <option value="difficulty">Sort: Difficulty</option>
            <option value="title">Sort: Title (A-Z)</option>
          </select>

          <span className="ml-auto text-[12px] text-white/30">
            {filtered.length} problem{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Problem list */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
              <TrendingUp size={20} className="text-white/30" />
            </div>
            <p className="text-white/60 text-[14px]">No problems match your filters.</p>
            <button
              onClick={() => {
                setStatusFilter('all');
                setDifficultyFilter('all');
              }}
              className="mt-3 text-[13px] text-violet-400 hover:text-violet-300"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((p) => (
              <NavLink
                key={p._id}
                to={`/problem/${p._id}`}
                className="group flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-white/[0.06] hover:bg-white/[0.02] transition-all duration-200"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {p.isSolved ? (
                    <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Circle size={18} className="text-white/15 flex-shrink-0 group-hover:text-white/30 transition-colors" />
                  )}
                  <div className="min-w-0">
                    <h3 className="text-[14.5px] font-medium text-white/90 group-hover:text-violet-400 transition-colors truncate">
                      {p.title}
                    </h3>
                    <p className="text-[11px] text-white/30 mt-0.5">
                      {p.tags?.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className="hidden sm:flex items-center gap-1 text-[11px] text-white/40 font-mono">
                    <TrendingUp size={11} />
                    {p.frequency.toFixed(0)}%
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide border ${getDifficultyStyle(p.difficulty)}`}
                  >
                    {p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1)}
                  </span>
                </div>
              </NavLink>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-[12px] text-white/20">
          Share this page with anyone preparing for {displayCompany}
        </div>
      </div>
    </div>
  );
}

function DiffChip({ label, solved, total, color }) {
  const rate = total > 0 ? solved / total : 0;
  const colorMap = {
    emerald: { bar: 'bg-emerald-500', text: 'text-emerald-400' },
    amber: { bar: 'bg-amber-500', text: 'text-amber-400' },
    rose: { bar: 'bg-rose-500', text: 'text-rose-400' },
  };
  const c = colorMap[color];
  return (
    <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className={`text-[11px] font-medium ${c.text}`}>{label}</span>
        <span className="text-[11px] font-mono text-white/40">
          {solved}/{total}
        </span>
      </div>
      <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
        <div className={`h-full ${c.bar} transition-all`} style={{ width: `${rate * 100}%` }} />
      </div>
    </div>
  );
}
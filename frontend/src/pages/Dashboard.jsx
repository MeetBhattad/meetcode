import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import axiosClient from '../utils/axiosClient';
import {
  ArrowLeft, Flame, Trophy, Target, Mic, TrendingUp,
  AlertTriangle, CheckCircle2, XCircle, Clock, Loader2, ArrowRight
} from 'lucide-react';

const dayLabel = (dateStr) => {
  const d = new Date(dateStr);
  return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()];
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axiosClient.get('/dashboard/stats');
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dashboard');
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

  const { overview, difficulty, topics, weakTopics, weekly, recent, interviews } = stats;
  const maxWeekly = Math.max(...weekly.map(d => d.count), 1);

  // Empty state
  if (overview.totalSolved === 0 && overview.totalAttempted === 0) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <NavLink to="/" className="inline-flex items-center gap-2 text-[13px] text-white/50 hover:text-white mb-8">
            <ArrowLeft size={14} /> Back to problems
          </NavLink>
          <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117] p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-violet-500/15 flex items-center justify-center mx-auto mb-5">
              <Target size={28} className="text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Your journey starts here</h1>
            <p className="text-white/50 text-[14px] mb-8 max-w-md mx-auto">
              Solve your first problem to unlock progress tracking, streaks, and insights.
            </p>
            <NavLink
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-medium transition-colors"
            >
              Browse problems <ArrowRight size={14} />
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070a] text-white selection:bg-violet-500/30">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full"
             style={{ background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.08), transparent 70%)' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <NavLink to="/" className="inline-flex items-center gap-2 text-[13px] text-white/40 hover:text-white mb-3">
              <ArrowLeft size={14} /> Back to problems
            </NavLink>
            <h1 className="text-2xl font-bold tracking-tight">Your Progress</h1>
            <p className="text-[13.5px] text-white/40 mt-1">
              {overview.streak > 0
                ? `🔥 ${overview.streak}-day streak. Keep going.`
                : 'Start a streak today by solving a problem.'}
            </p>
          </div>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard
            icon={<CheckCircle2 size={16} className="text-emerald-400" />}
            label="Solved"
            value={overview.totalSolved}
            sub={`of ${overview.totalProblems}`}
          />
          <StatCard
            icon={<Flame size={16} className="text-orange-400" />}
            label="Streak"
            value={overview.streak}
            sub={overview.longestStreak > 0 ? `best: ${overview.longestStreak}` : 'days'}
            accent={overview.streak > 0 ? 'text-orange-400' : ''}
          />
          <StatCard
            icon={<TrendingUp size={16} className="text-violet-400" />}
            label="This week"
            value={overview.thisWeek}
            sub="problems"
          />
          <StatCard
            icon={<Mic size={16} className="text-cyan-400" />}
            label="Interviews"
            value={interviews.total}
            sub={interviews.total > 0 ? `${interviews.avgScore}/10 avg` : 'none yet'}
          />
        </div>

        {/* Two-column grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Difficulty */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={15} className="text-violet-400" />
              <h2 className="text-[14px] font-semibold">Difficulty Breakdown</h2>
            </div>
            <div className="space-y-3">
              <DiffBar label="Easy" solved={difficulty.easy.solved} total={difficulty.easy.total} color="emerald" />
              <DiffBar label="Medium" solved={difficulty.medium.solved} total={difficulty.medium.total} color="amber" />
              <DiffBar label="Hard" solved={difficulty.hard.solved} total={difficulty.hard.total} color="rose" />
            </div>
          </div>

          {/* Weekly activity */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={15} className="text-violet-400" />
              <h2 className="text-[14px] font-semibold">Last 7 Days</h2>
            </div>
            <div className="flex items-end justify-between gap-1.5 h-32">
              {weekly.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex flex-col items-center justify-end h-full">
                    <div
                      className={`w-full rounded-t transition-all ${
                        d.count > 0 ? 'bg-violet-500' : 'bg-white/[0.06]'
                      }`}
                      style={{ height: `${Math.max((d.count / maxWeekly) * 100, 4)}%` }}
                      title={`${d.count} solved`}
                    />
                  </div>
                  <span className="text-[10px] text-white/40">{dayLabel(d.date)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-[12px] text-white/40 text-center">
              {overview.thisWeek} problem{overview.thisWeek !== 1 ? 's' : ''} this week
            </div>
          </div>
        </div>

        {/* Topic mastery */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Target size={15} className="text-violet-400" />
            <h2 className="text-[14px] font-semibold">Topic Mastery</h2>
            <span className="text-[11px] text-white/30 ml-auto">Sorted by problem count</span>
          </div>
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
            {topics.map(t => {
              const isWeak = weakTopics.includes(t.tag);
              return (
                <div key={t.tag} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-[12px] mb-1">
                      <span className={`capitalize truncate ${isWeak ? 'text-amber-400' : 'text-white/70'}`}>
                        {t.tag.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-white/40 font-mono flex-shrink-0 ml-2">
                        {t.solved}/{t.total}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isWeak ? 'bg-amber-500' :
                          t.rate === 1 ? 'bg-emerald-500' : 'bg-violet-500'
                        }`}
                        style={{ width: `${t.rate * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weak areas + Recent activity */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Weak areas */}
          <div className={`rounded-2xl border p-5 ${
            weakTopics.length > 0
              ? 'border-amber-500/20 bg-amber-500/[0.03]'
              : 'border-white/[0.06] bg-white/[0.02]'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              {weakTopics.length > 0
                ? <AlertTriangle size={15} className="text-amber-400" />
                : <CheckCircle2 size={15} className="text-emerald-400" />}
              <h2 className="text-[14px] font-semibold">
                {weakTopics.length > 0 ? 'Focus Areas' : 'Looking Strong'}
              </h2>
            </div>
            {weakTopics.length > 0 ? (
              <>
                <p className="text-[13px] text-white/60 mb-3 leading-relaxed">
                  You've attempted these topics but haven't cracked them yet:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {weakTopics.map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-[12px] text-amber-300 capitalize">
                      {t.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-[13px] text-white/50">
                You haven't left any attempted-but-unsolved topics. Keep up the pace.
              </p>
            )}
          </div>

          {/* Recent activity */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={15} className="text-violet-400" />
              <h2 className="text-[14px] font-semibold">Recent Submissions</h2>
            </div>
            {recent.length === 0 ? (
              <p className="text-[13px] text-white/40">No submissions yet.</p>
            ) : (
              <div className="space-y-1.5">
                {recent.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12.5px] py-1">
                    {r.status === 'accepted' ? (
                      <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                    ) : (
                      <XCircle size={13} className="text-rose-500 flex-shrink-0" />
                    )}
                    <span className="flex-1 truncate text-white/80">{r.problemTitle}</span>
                    <span className="text-[10.5px] text-white/30 flex-shrink-0">
                      {timeAgo(r.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-6 text-center">
          <NavLink
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 text-[13px] transition-colors"
          >
            Continue solving <ArrowRight size={13} />
          </NavLink>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, accent = '' }) => (
  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
    <div className="flex items-center gap-1.5 mb-2">
      {icon}
      <span className="text-[11px] text-white/40 uppercase tracking-wide">{label}</span>
    </div>
    <div className={`text-2xl font-bold ${accent || 'text-white'}`}>{value}</div>
    <div className="text-[11px] text-white/30 mt-0.5">{sub}</div>
  </div>
);

const DiffBar = ({ label, solved, total, color }) => {
  const rate = total > 0 ? solved / total : 0;
  const colorMap = {
    emerald: { bar: 'bg-emerald-500', text: 'text-emerald-400' },
    amber: { bar: 'bg-amber-500', text: 'text-amber-400' },
    rose: { bar: 'bg-rose-500', text: 'text-rose-400' },
  };
  const c = colorMap[color];
  return (
    <div>
      <div className="flex justify-between text-[12px] mb-1.5">
        <span className={`font-medium ${c.text}`}>{label}</span>
        <span className="text-white/40 font-mono">{solved}/{total}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div className={`h-full ${c.bar} transition-all`} style={{ width: `${rate * 100}%` }} />
      </div>
    </div>
  );
};
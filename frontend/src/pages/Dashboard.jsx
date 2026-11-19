import { useEffect, useState } from 'react';
import CircularProgress from '../components/CircularProgress';
import { NavLink } from 'react-router';
import axiosClient from '../utils/axiosClient';
import { DashboardSkeleton } from '../components/Skeletons';
import {
  ArrowLeft, Flame, Trophy, Target, Mic, TrendingUp,
  AlertTriangle, CheckCircle2, XCircle, Clock, Loader2, ArrowRight, Brain, Calendar
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';

// ─── Helpers ─────────────────────────────────────────────────
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

const ABBREV = {
  array: 'Array', string: 'String', hashMap: 'Hash', twoPointers: '2 Ptrs',
  slidingWindow: 'Window', stack: 'Stack', binarySearch: 'Bin Srch',
  linkedList: 'LL', tree: 'Tree', trie: 'Trie', heap: 'Heap',
  backtracking: 'BackTrk', graph: 'Graph', dp: 'DP', greedy: 'Greedy',
  intervals: 'Intrvl', math: 'Math', bitManipulation: 'Bits',
};

// ─── Contribution Heatmap ────────────────────────────────────
function ContributionHeatmap({ data }) {
  if (!data || data.length === 0) return null;

  const dateMap = {};
  data.forEach(d => { dateMap[d.date] = d.count; });

  const firstDate = new Date(data[0].date + 'T00:00:00');
  const lastDate = new Date(data[data.length - 1].date + 'T00:00:00');

  const startDate = new Date(firstDate);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const weeks = [];
  let currentWeek = new Array(7).fill(null);
  let currentDate = new Date(startDate);

  while (currentDate <= lastDate) {
    const key = currentDate.toISOString().slice(0, 10);
    currentWeek[currentDate.getDay()] = { date: key, count: dateMap[key] || 0 };
    if (currentDate.getDay() === 6) {
      weeks.push(currentWeek);
      currentWeek = new Array(7).fill(null);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  if (currentWeek.some(c => c !== null)) weeks.push(currentWeek);

  // Month labels at the first week each month appears
  const monthLabels = {};
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const firstReal = week.find(d => d !== null);
    if (firstReal) {
      const d = new Date(firstReal.date + 'T00:00:00');
      if (d.getMonth() !== lastMonth) {
        monthLabels[wi] = d.toLocaleString('en', { month: 'short' });
        lastMonth = d.getMonth();
      }
    }
  });

  const getColor = (count) => {
    if (count === 0) return 'bg-white/[0.04]';
    if (count <= 2) return 'bg-emerald-900/70';
    if (count <= 4) return 'bg-emerald-700/80';
    if (count <= 6) return 'bg-emerald-500/90';
    return 'bg-emerald-400';
  };

  const totalYear = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="overflow-x-auto pb-1">
      <div className="min-w-max">
        {/* Month labels */}
        <div className="flex ml-8 mb-1.5">
          {weeks.map((_, wi) => (
            <div key={wi} className="w-[13px] mr-[3px] text-[9px] text-white/30 font-medium">
              {monthLabels[wi] || ''}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] pr-2 text-[9px] text-white/25 font-medium justify-around">
            <div className="h-[11px]" />
            <div className="h-[11px] leading-[11px]">Mon</div>
            <div className="h-[11px]" />
            <div className="h-[11px] leading-[11px]">Wed</div>
            <div className="h-[11px]" />
            <div className="h-[11px] leading-[11px]">Fri</div>
            <div className="h-[11px]" />
          </div>

          {/* Grid */}
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) =>
                  day ? (
                    <div
                      key={di}
                      className={`w-[11px] h-[11px] rounded-[2px] ${getColor(day.count)} transition-all hover:ring-1 hover:ring-white/50 cursor-pointer`}
                      title={`${new Date(day.date + 'T00:00:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} — ${day.count} problem${day.count !== 1 ? 's' : ''} solved`}
                    />
                  ) : (
                    <div key={di} className="w-[11px] h-[11px]" />
                  )
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer: total + legend */}
        <div className="flex items-center justify-between mt-3 ml-8">
          <span className="text-[11px] text-white/40">
            <strong className="text-white/70">{totalYear}</strong> problem{totalYear !== 1 ? 's' : ''} solved in the last year
          </span>
          <div className="flex items-center gap-1.5 text-[10px] text-white/30">
            <span>Less</span>
            <div className="w-[11px] h-[11px] rounded-[2px] bg-white/[0.04]" />
            <div className="w-[11px] h-[11px] rounded-[2px] bg-emerald-900/70" />
            <div className="w-[11px] h-[11px] rounded-[2px] bg-emerald-700/80" />
            <div className="w-[11px] h-[11px] rounded-[2px] bg-emerald-500/90" />
            <div className="w-[11px] h-[11px] rounded-[2px] bg-emerald-400" />
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paths, setPaths] = useState([]);
  const [dueReviews, setDueReviews] = useState(0);
  const [contests, setContests] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsRes, pathsRes, reviewsRes, contestsRes] = await Promise.all([
        axiosClient.get('/dashboard/stats'),
        axiosClient.get('/paths'),
        axiosClient.get('/review/due').catch(() => ({ data: [] })),
        axiosClient.get('/contest/history').catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data);
      setPaths(pathsRes.data);
      setDueReviews(reviewsRes.data.length || 0);
      setContests(contestsRes.data || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
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

  const { overview, difficulty, topics, weakTopics, weekly, heatmap = [], recent, interviews } = stats;
  const maxWeekly = Math.max(...weekly.map(d => d.count), 1);

  // ── Empty state ──
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

  // ── Radar data ──
  const engagedTopics = topics
    .filter(t => t.solved > 0 || t.attempted > 0)
    .sort((a, b) => (b.solved + b.attempted) - (a.solved + a.attempted))
    .slice(0, 10);

  const radarData = engagedTopics.map(t => ({
    label: ABBREV[t.tag] || t.tag,
    rate: Math.round(t.rate * 100),
    solved: t.solved,
    total: t.total,
    fullMark: 100,
  }));

  const activePaths = paths.filter(p => p.nextProblemId).slice(0, 2);

  return (
    <div className="min-h-screen bg-[#07070a] text-white selection:bg-violet-500/30">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full"
             style={{ background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.08), transparent 70%)' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <NavLink to="/" className="inline-flex items-center gap-2 text-[13px] text-white/40 hover:text-white mb-3">
            <ArrowLeft size={14} /> Back to problems
          </NavLink>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Your Progress</h1>
              <p className="text-[13.5px] text-white/40 mt-1.5">
                {overview.streak > 0
                  ? `🔥 ${overview.streak}-day streak. Keep the momentum.`
                  : 'Start a streak today by solving a problem.'}
              </p>
            </div>
          </div>
        </div>

        {/* Review Due banner */}
        {dueReviews > 0 && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-violet-500/20 bg-violet-500/[0.06] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                <Brain size={20} className="text-violet-400" />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-white">
                  {dueReviews} problem{dueReviews > 1 ? 's' : ''} due for review
                </h3>
                <p className="text-[12px] text-white/50">Strengthen your memory by revisiting them today.</p>
              </div>
            </div>
            <NavLink
              to="/review"
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[12px] font-medium transition-colors flex-shrink-0"
            >
              Start Review
            </NavLink>
          </div>
        )}

        {/* Overview cards */}
                {/* Hero: circular progress + difficulty breakdown + key stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Left: ring + difficulty */}
          <div className="md:col-span-2 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-6">
            <div className="flex items-center gap-8 flex-wrap">
              <CircularProgress
                solved={overview.totalSolved}
                total={overview.totalRunnable || overview.totalProblems}
                size={180}
              />
              <div className="flex-1 min-w-[200px] space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy size={14} className="text-violet-400" />
                  <span className="text-[12px] font-semibold text-white/60 uppercase tracking-wider">
                    Difficulty Breakdown
                  </span>
                </div>
                <DiffBar label="Easy" solved={difficulty.easy.solved} total={difficulty.easy.total} color="emerald" />
                <DiffBar label="Medium" solved={difficulty.medium.solved} total={difficulty.medium.total} color="amber" />
                <DiffBar label="Hard" solved={difficulty.hard.solved} total={difficulty.hard.total} color="rose" />
              </div>
            </div>
          </div>

          {/* Right: 3 stacked stat cards */}
          <div className="space-y-3">
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
        </div>

        {/* Continue Learning */}
        {activePaths.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13.5px] font-semibold text-white/80">Continue Learning</h2>
              <NavLink to="/paths" className="text-[12px] text-violet-400 hover:text-violet-300">
                All paths →
              </NavLink>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {activePaths.map(path => {
                const progress = path.total > 0 ? path.solved / path.total : 0;
                return (
                  <NavLink
                    key={path._id}
                    to={`/paths/${path.slug}`}
                    className="group block rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-violet-500/30 hover:bg-white/[0.04] p-4 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[13.5px] font-semibold text-white group-hover:text-violet-400 transition-colors truncate">
                        {path.name}
                      </h3>
                      <span className="text-[11px] font-mono text-violet-400">
                        {path.solved}/{path.total}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-violet-400"
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}

        {/* Contribution Heatmap — HERO */}
        <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-white/[0.01] p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-emerald-400" />
              <h2 className="text-[14px] font-semibold">Contribution Activity</h2>
            </div>
            <span className="text-[11px] text-white/30">
              {overview.thisWeek} this week
            </span>
          </div>
          <ContributionHeatmap data={heatmap} />
        </div>

        {/* Radar + Focus Areas */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Target size={15} className="text-violet-400" />
                <h2 className="text-[14px] font-semibold">Topic Mastery</h2>
              </div>
              {engagedTopics.length > 0 && (
                <span className="text-[11px] text-white/30">
                  Top {engagedTopics.length} practiced topics
                </span>
              )}
            </div>

            {radarData.length >= 3 ? (
              <div className="h-[280px] -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="72%">
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis
                      dataKey="label"
                      tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 10.5 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tickCount={4}
                      tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Radar
                      dataKey="rate"
                      stroke="rgb(139, 92, 246)"
                      fill="rgb(139, 92, 246)"
                      fillOpacity={0.35}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0d1117',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        fontSize: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                      }}
                      itemStyle={{ color: '#a78bfa' }}
                      labelStyle={{ color: '#fff', fontWeight: 600 }}
                      formatter={(value, name, props) => [
                        `${value}% (${props.payload.solved}/${props.payload.total} solved)`,
                        'Mastery',
                      ]}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.label || label}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[280px] flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-3">
                  <Target size={18} className="text-violet-400/60" />
                </div>
                <p className="text-[13px] text-white/50 max-w-xs">
                  Solve problems across at least 3 topics to unlock your mastery radar.
                </p>
              </div>
            )}
          </div>

          {/* Focus Areas */}
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
                <p className="text-[12.5px] text-white/55 mb-3 leading-relaxed">
                  Topics you've attempted but haven't cracked yet:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {weakTopics.map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-[11.5px] text-amber-300 capitalize">
                      {t.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-[12.5px] text-white/50 leading-relaxed">
                Every topic you've attempted has at least one solve. Excellent consistency.
              </p>
            )}
          </div>
        </div>

                {/* Bottom row: Recent + Weekly + Contests */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Recent Submissions */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={15} className="text-violet-400" />
              <h2 className="text-[14px] font-semibold">Recent Submissions</h2>
            </div>
            {recent.length === 0 ? (
              <p className="text-[13px] text-white/40">No submissions yet.</p>
            ) : (
              <div className="space-y-0.5">
                {recent.slice(0, 6).map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12.5px] py-1.5 border-b border-white/[0.03] last:border-0">
                    {r.status === 'accepted' ? (
                      <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                    ) : (
                      <XCircle size={13} className="text-rose-500 flex-shrink-0" />
                    )}
                    <span className="flex-1 truncate text-white/80">{r.problemTitle}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium tracking-wide ${
                      r.difficulty === 'easy' ? 'text-emerald-400/70' :
                      r.difficulty === 'medium' ? 'text-amber-400/70' :
                      'text-rose-400/70'
                    }`}>
                      {r.difficulty?.charAt(0).toUpperCase()}
                    </span>
                    <span className="text-[10.5px] text-white/30 flex-shrink-0 w-14 text-right">
                      {timeAgo(r.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Contests */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy size={15} className="text-amber-400" />
                <h2 className="text-[14px] font-semibold">Recent Contests</h2>
              </div>
              <NavLink to="/contest" className="text-[11px] text-violet-400 hover:text-violet-300">
                New →
              </NavLink>
            </div>
            {contests.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-[13px] text-white/40 mb-3">No contests yet.</p>
                <NavLink
                  to="/contest"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[12px] font-medium transition-colors"
                >
                  Start your first <Trophy size={12} />
                </NavLink>
              </div>
            ) : (
              <div className="space-y-2">
                                {contests.slice(0, 4).map(c => (
                  <NavLink
                    key={c._id}
                    to={`/contest/history/${c._id}`}
                    className="group flex items-center gap-3 py-2 border-b border-white/[0.03] last:border-0 rounded-md px-2 -mx-2 hover:bg-white/[0.03] transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      c.solvedCount === c.problems.length
                        ? 'bg-amber-500/15 border border-amber-500/20'
                        : 'bg-white/[0.04] border border-white/[0.06]'
                    }`}>
                      <span className="text-[12px] font-bold text-white/70">{c.solvedCount}/4</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium text-white/80 group-hover:text-violet-400 capitalize truncate transition-colors">
                        {c.topic === 'random' ? 'Random Mix' : c.topic.replace(/([A-Z])/g, ' $1')}
                      </p>
                      <p className="text-[10.5px] text-white/30">{timeAgo(c.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-mono text-violet-400 font-bold">{c.score}</span>
                      <span className="text-[9.5px] text-white/30">pts</span>
                    </div>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
          
          {/* Weekly activity */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={15} className="text-violet-400" />
                <h2 className="text-[14px] font-semibold">Last 7 Days</h2>
              </div>
              <span className="text-[11px] text-white/30">
                {overview.thisWeek} solved
              </span>
            </div>
            <div className="flex items-end justify-between gap-2 h-32">
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
          </div>

        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
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

// ─── Subcomponents ──────────────────────────────────────────
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

function DiffBar({ label, solved, total, color }) {
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
}
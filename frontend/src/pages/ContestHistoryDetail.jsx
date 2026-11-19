import { useEffect, useState } from 'react';
import { useParams, NavLink, Link } from 'react-router';
import axiosClient from '../utils/axiosClient';
import { ArrowLeft, Trophy, CheckCircle2, XCircle, Circle, Loader2 } from 'lucide-react';

const DIFF_STYLE = {
  easy: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10',
  medium: 'text-amber-400 border-amber-400/20 bg-amber-400/10',
  hard: 'text-rose-400 border-rose-400/20 bg-rose-400/10',
};

const fmtTimeLong = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m === 0) return `${sec}s`;
  if (sec === 0) return `${m}m`;
  return `${m}m ${sec}s`;
};

export default function ContestHistoryDetail() {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axiosClient.get(`/contest/history/${id}`);
        setContest(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load contest');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-violet-500" />
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="min-h-screen bg-[#07070a] flex items-center justify-center px-4">
        <div className="max-w-md rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-300 text-center">
          {error || 'Contest not found'}
          <NavLink to="/dashboard" className="block mt-4 text-[13px] text-white/60 hover:text-white underline">
            Back to Dashboard
          </NavLink>
        </div>
      </div>
    );
  }

  const solvedCount = contest.problems.filter(p => p.solved).length;
  const maxScore = contest.maxScore;
  const score = contest.score;
  const listIds = contest.problems.map(p => p.problemId.toString());
  const dateStr = new Date(contest.createdAt).toLocaleString('en', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-[#07070a] text-white selection:bg-violet-500/30">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full"
             style={{ background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.1), transparent 70%)' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <NavLink to="/dashboard" className="inline-flex items-center gap-2 text-[13px] text-white/40 hover:text-white mb-6">
          <ArrowLeft size={14} /> Back to Dashboard
        </NavLink>

        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
            <Trophy size={28} className="text-violet-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Contest Result</h1>
          <p className="text-[13.5px] text-white/40 mt-2 capitalize">
            Topic: {contest.topic === 'random' ? 'Random Mix' : contest.topic.replace(/([A-Z])/g, ' $1')}
            {' · '}
            {contest.timeLimit} minute contest
            {' · '}
            {dateStr}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
            <div className="text-[11px] text-white/40 uppercase tracking-wide mb-1">Solved</div>
            <div className="text-2xl font-bold text-emerald-400">
              {solvedCount}<span className="text-white/30 text-base"> / {contest.problems.length}</span>
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
            <div className="text-[11px] text-white/40 uppercase tracking-wide mb-1">Score</div>
            <div className="text-2xl font-bold text-violet-400">
              {score}<span className="text-white/30 text-base"> / {maxScore}</span>
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
            <div className="text-[11px] text-white/40 uppercase tracking-wide mb-1">Time Used</div>
            <div className="text-2xl font-bold text-white">{fmtTimeLong(contest.totalTime)}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117] overflow-hidden mb-8">
          <div className="px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-white/60">Problem Breakdown</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-white/40 border-b border-white/[0.06]">
                <th className="text-left px-5 py-2.5 font-medium">#</th>
                <th className="text-left px-3 py-2.5 font-medium">Problem</th>
                <th className="text-left px-3 py-2.5 font-medium">Difficulty</th>
                <th className="text-left px-3 py-2.5 font-medium">Status</th>
                <th className="text-left px-3 py-2.5 font-medium">Time</th>
                <th className="text-right px-5 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {contest.problems.map((p, i) => {
                const attempted = (p.timeSpent || 0) > 0;
                return (
                  <tr key={p.problemId} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-5 py-3 text-[13px] text-white/30 font-mono">{i + 1}</td>
                    <td className="px-3 py-3 text-[13.5px] font-medium text-white/90">{p.title}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10.5px] font-bold uppercase tracking-wide border ${DIFF_STYLE[p.difficulty] || ''}`}>
                        {p.difficulty}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {p.solved ? (
                        <span className="inline-flex items-center gap-1.5 text-[12.5px] text-emerald-400 font-medium">
                          <CheckCircle2 size={13} /> Solved
                        </span>
                      ) : attempted ? (
                        <span className="inline-flex items-center gap-1.5 text-[12.5px] text-rose-400 font-medium">
                          <XCircle size={13} /> Attempted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[12.5px] text-white/40">
                          <Circle size={13} /> Not attempted
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-[12.5px] text-white/60 font-mono">
                      {attempted ? fmtTimeLong(p.timeSpent) : '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/problem/${p.problemId}`}
                        state={{
                          listIds,
                          source: { type: 'contest-history', name: 'Contest History', slug: id },
                        }}
                        className="text-[12px] text-violet-400 hover:text-violet-300 font-medium"
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
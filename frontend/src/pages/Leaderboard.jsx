import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import axiosClient from '../utils/axiosClient';
import { ArrowLeft, Trophy, Crown, Medal, Loader2 } from 'lucide-react';

const RANK_STYLE = {
  1: { bg: 'bg-amber-500/15 border-amber-500/40', icon: Crown, color: 'text-amber-400' },
  2: { bg: 'bg-slate-400/15 border-slate-400/30', icon: Medal, color: 'text-slate-300' },
  3: { bg: 'bg-orange-600/15 border-orange-600/30', icon: Medal, color: 'text-orange-400' },
};

export default function Leaderboard() {
  const [data, setData] = useState({ top: [], me: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axiosClient.get('/leaderboard/top');
        setData(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load leaderboard');
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
      <div className="min-h-screen bg-[#07070a] flex items-center justify-center px-4">
        <div className="max-w-md rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-300">
          {error}
        </div>
      </div>
    );
  }

  const myId = data.me?._id?.toString();

  return (
    <div className="min-h-screen bg-[#07070a] text-white selection:bg-violet-500/30">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full"
             style={{ background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.08), transparent 70%)' }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        <NavLink to="/" className="inline-flex items-center gap-2 text-[13px] text-white/40 hover:text-white mb-6">
          <ArrowLeft size={14} /> Back to problems
        </NavLink>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
              <Trophy size={20} className="text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
          </div>
          <p className="text-[13.5px] text-white/40 ml-[52px]">
            Top solvers across MeetCode.
          </p>
        </div>

        {data.me && (
          <div className="mb-4 rounded-xl border border-violet-500/30 bg-violet-500/[0.08] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-violet-500/20 flex items-center justify-center text-[13px] font-bold text-violet-300">
                {data.me.rank}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white">Your Rank</p>
                <p className="text-[11px] text-white/50">{data.me.solvedCount} problems solved</p>
              </div>
            </div>
            <span className="text-[11px] text-violet-400 font-medium">
              {data.me.rank <= 50 ? 'Top 50' : 'Keep climbing'}
            </span>
          </div>
        )}

        {data.top.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117] p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-5">
              <Trophy size={28} className="text-violet-400/60" />
            </div>
            <h2 className="text-xl font-bold mb-2">No rankings yet</h2>
            <p className="text-white/50 text-[14px] max-w-md mx-auto">
              Be the first to solve a problem and claim the top spot.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {data.top.map((user) => {
              const isMe = user._id.toString() === myId;
              const rankStyle = RANK_STYLE[user.rank];
              const Icon = rankStyle?.icon;
              return (
                <div
                  key={user._id}
                  className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all ${
                    isMe
                      ? 'border-violet-500/40 bg-violet-500/[0.08]'
                      : rankStyle
                        ? `border ${rankStyle.bg}`
                        : 'border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[14px] font-bold flex-shrink-0 ${
                    rankStyle ? rankStyle.color : 'text-white/40'
                  }`}>
                    {Icon ? <Icon size={20} /> : `#${user.rank}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-white truncate">
                      {user.firstName} {user.lastName}
                      {isMe && <span className="ml-2 text-[10px] text-violet-400 font-bold uppercase tracking-wider">You</span>}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[18px] font-bold text-white tabular-nums">{user.solvedCount}</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wide">solved</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
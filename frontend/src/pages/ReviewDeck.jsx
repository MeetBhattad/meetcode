import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import axiosClient from '../utils/axiosClient';
import { ArrowLeft, CheckCircle2, RotateCcw, Loader2, Brain } from 'lucide-react';

const getDifficultyStyle = (d) => {
  switch (d?.toLowerCase()) {
    case 'easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'hard': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  }
};

export default function ReviewDeck() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDue = async () => {
      try {
        const { data } = await axiosClient.get('/review/due');
        setCards(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load review deck');
      } finally {
        setLoading(false);
      }
    };
    fetchDue();
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
        <div className="max-w-md rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-300 text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070a] text-white selection:bg-violet-500/30">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full" style={{ background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.08), transparent 70%)' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <NavLink to="/" className="inline-flex items-center gap-2 text-[13px] text-white/40 hover:text-white mb-6">
          <ArrowLeft size={14} /> Back to problems
        </NavLink>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <Brain size={20} className="text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Spaced Repetition</h1>
          </div>
          <p className="text-[13.5px] text-white/40">
            Review these problems to solidify your memory. You have <strong className="text-white">{cards.length}</strong> due today.
          </p>
        </div>

        {cards.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117] p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={28} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">You're all caught up!</h2>
            <p className="text-white/50 text-[14px] max-w-md mx-auto mb-6">
              No reviews due today. Come back tomorrow to keep your streak going.
            </p>
            <NavLink to="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-medium transition-colors">
              Solve new problems
            </NavLink>
          </div>
        ) : (
          <div className="space-y-3">
            {cards.map((card) => (
              <NavLink
                key={card._id}
                to={`/problem/${card.problemId._id}`}
                state={{ 
                  source: { type: 'review', name: 'Review Deck' } 
                }}
                className="group flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-violet-500/30 hover:bg-white/[0.04] transition-all duration-200"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <RotateCcw size={18} className="text-violet-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-[14.5px] font-medium text-white/90 group-hover:text-violet-400 transition-colors truncate">
                      {card.problemId.problemNumber && (
                        <span className="text-white/30 mr-2 font-mono text-[13px]">#{card.problemId.problemNumber}</span>
                      )}
                      {card.problemId.title}
                    </h3>
                    <p className="text-[11px] text-white/30 mt-0.5">
                      Interval: {card.interval} day{card.interval !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide border ${getDifficultyStyle(card.problemId.difficulty)}`}>
                    {card.problemId.difficulty.charAt(0).toUpperCase() + card.problemId.difficulty.slice(1)}
                  </span>
                </div>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
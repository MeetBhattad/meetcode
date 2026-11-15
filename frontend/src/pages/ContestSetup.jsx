import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';
import { ArrowLeft, Play, Loader2, Trophy, Shuffle, Target } from 'lucide-react';

const TOPICS = [
  'random', 'array', 'string', 'hashMap', 'twoPointers', 'slidingWindow', 
  'stack', 'binarySearch', 'linkedList', 'tree', 'trie', 
  'heap', 'backtracking', 'graph', 'dp', 'greedy', 
  'intervals', 'math', 'bitManipulation'
];

export default function ContestSetup() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('random');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startContest = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosClient.get(`/contest/generate?topic=${topic}`);
      
      // Store contest data in localStorage so it survives a page refresh
      const contestData = {
        problems: data.problems,
        timeLimitMins: data.timeLimitMins,
        startTime: Date.now(),
        topic
      };
      localStorage.setItem('activeContest', JSON.stringify(contestData));
      
      navigate('/contest/arena');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start contest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-white selection:bg-violet-500/30 flex items-center justify-center px-6">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full" style={{ background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.1), transparent 70%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <NavLink to="/" className="inline-flex items-center gap-2 text-[13px] text-white/40 hover:text-white mb-8">
          <ArrowLeft size={14} /> Back to problems
        </NavLink>

        <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117] p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
              <Trophy size={24} className="text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Virtual Contest</h1>
              <p className="text-[13px] text-white/40">90 minutes. 4 problems. 1 Easy, 2 Medium, 1 Hard.</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-[13px] text-rose-300">
              {error}
            </div>
          )}

          <div className="space-y-5 mb-8">
            <div>
              <label className="block text-[12px] font-medium text-white/50 mb-2 uppercase tracking-wide">Select Contest Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTopic('random')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    topic === 'random' 
                      ? 'bg-violet-500/10 border-violet-500/50 text-white' 
                      : 'bg-white/[0.02] border-white/[0.06] text-white/50 hover:bg-white/[0.04]'
                  }`}
                >
                  <Shuffle size={20} className={topic === 'random' ? 'text-violet-400' : ''} />
                  <span className="text-[13px] font-medium">Random Mix</span>
                </button>
                <button
                  onClick={() => setTopic('array')} // Defaults to array if they click topic
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    topic !== 'random' 
                      ? 'bg-violet-500/10 border-violet-500/50 text-white' 
                      : 'bg-white/[0.02] border-white/[0.06] text-white/50 hover:bg-white/[0.04]'
                  }`}
                >
                  <Target size={20} className={topic !== 'random' ? 'text-violet-400' : ''} />
                  <span className="text-[13px] font-medium">Specific Topic</span>
                </button>
              </div>
            </div>

            {topic !== 'random' && (
              <div>
                <label className="block text-[12px] font-medium text-white/50 mb-2 uppercase tracking-wide">Select Topic</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#0d1117] border border-white/[0.08] text-[14px] text-white/90 outline-none focus:border-violet-500/50"
                  style={{ colorScheme: 'dark' }}
                >
                  {TOPICS.filter(t => t !== 'random').map(t => (
                    <option key={t} value={t}>{t.replace(/([A-Z])/g, ' $1').trim()}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            onClick={startContest}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-[14px] font-semibold transition-all shadow-lg shadow-violet-600/30"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
            {loading ? 'Generating Contest...' : 'Start Contest'}
          </button>
        </div>
      </div>
    </div>
  );
}
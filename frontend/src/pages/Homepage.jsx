/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { ProblemListSkeleton } from '../components/Skeletons';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import { CheckCircle2, Circle, ChevronDown, LogOut, Settings, Search, SlidersHorizontal, TrendingUp, ArrowRight, Building2, BookOpen, Brain, Trophy, Sparkles, Calendar, Star, Medal, X} from 'lucide-react';



const styles = `
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes dropdown-in {
    from { opacity: 0; transform: translateY(-6px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .fade-up { opacity: 0; animation: fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .dropdown-anim { animation: dropdown-in 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

  /* 🔑 THE FIX: force native selects into dark mode */
  select {
    color-scheme: dark;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 40px !important;
  }
  
  /* 🔑 THE FIX: force option elements to render on a dark background */
  select option {
    background-color: #111115;
    color: #ffffff;
    padding: 8px;
  }
  
  /* Highlight color when option is hovered in some browsers */
  select option:checked {
    background: linear-gradient(#7c3aed, #7c3aed);
    color: white;
  }
`;

function Homepage() {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
const location = useLocation();
const lastLocationKeyRef = useRef(null);
  
 const [filters, setFilters] = useState({
  difficulty: 'all',
  tag: 'all',
  status: 'all',
  company: 'all',
});
const [showAll, setShowAll] = useState(false);  
const [companies, setCompanies] = useState([]);
const [dailyProblem, setDailyProblem] = useState(null);
const [dailySettled, setDailySettled] = useState(false);
const [bookmarkedIds, setBookmarkedIds] = useState([]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Save scroll on every scroll + on unmount (pre-paint) ──
  useLayoutEffect(() => {
    const save = () => {
      const y = window.scrollY;
      if (y > 0) {
        sessionStorage.setItem('meetcode:home-scroll', String(y));
      }
    };
    window.addEventListener('scroll', save, { passive: true });
    return () => {
      window.removeEventListener('scroll', save);
      save(); // capture position right before unmount, BEFORE ProblemPage's h-screen resets it
    };
  }, []);

  // ── Restore on EVERY navigation to `/` (custom link OR browser back) ──
  // Uses location.key so popstate-driven back/forward also triggers restoration.
  // useLayoutEffect = runs before paint → zero flash.
  useLayoutEffect(() => {
    if (location.pathname !== '/') return;
    if (loading || !dailySettled) return;
    if (lastLocationKeyRef.current === location.key) return;
    lastLocationKeyRef.current = location.key;

    const saved = sessionStorage.getItem('meetcode:home-scroll');
    if (!saved) return;
    const target = parseInt(saved, 10);
    if (!target || target <= 0) return;

    // Synchronous scroll — before paint, user never sees the top
    // In the useLayoutEffect, right before window.scrollTo:
console.log('[restore] scrolling to', target, 'from', window.scrollY, 'pageHeight', document.body.scrollHeight);
    window.scrollTo(0, target);

    // Fallback only if the DOM wasn't tall enough yet (rare with 290 problems)
    if (Math.abs(window.scrollY - target) > 4) {
      requestAnimationFrame(() => window.scrollTo(0, target));
    }
  }, [location.pathname, location.key, loading, dailySettled]);

  // Problems — depends on showAll
useEffect(() => {
  let cancelled = false;
  const fetchProblems = async () => {
    setLoading(true);
    try {
      const url = showAll
        ? '/problem/getAllProblem'
        : '/problem/getAllProblem?runnableOnly=true';
      const { data } = await axiosClient.get(url);
      if (!cancelled) setProblems(data);
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      if (!cancelled) setLoading(false);
    }
  };
  fetchProblems();
  return () => { cancelled = true; };
}, [showAll]);

// Solved + companies — depends on user
useEffect(() => {
  const fetchSolvedProblems = async () => {
    try {
      const { data } = await axiosClient.get('/problem/problemSolvedByUser');
      setSolvedProblems(data || []);
    } catch (error) {
      console.error('Error fetching solved problems:', error);
    }
  };

  if (user) fetchSolvedProblems();

   const fetchCompanies = async () => {
    try {
      const { data } = await axiosClient.get(`/company/list?showAll=${showAll}`);
      setCompanies(data);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };
  fetchCompanies();
}, [user, showAll]);

// Daily problem — separate effect, sibling of the above
// Daily problem — separate effect, sibling of the above
useEffect(() => {
  const fetchDaily = async () => {
    try {
      const { data } = await axiosClient.get('/problem/daily');
      setDailyProblem(data);
    } catch (err) {
      console.error('Failed to fetch daily problem:', err);
    } finally {
      setDailySettled(true);
    }
  };
  if (user) fetchDaily();
  else {
    setDailyProblem(null);
    setDailySettled(true);
  }
}, [user]);

// Bookmarks — depends on user
useEffect(() => {
  if (!user) { setBookmarkedIds([]); return; }
  const fetch = async () => {
    try {
      const { data } = await axiosClient.get('/bookmark/ids');
      setBookmarkedIds(data || []);
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
    }
  };
  fetch();
}, [user]);

const toggleBookmark = async (problemId) => {
  const isBk = bookmarkedIds.includes(problemId);
  setBookmarkedIds(prev => isBk ? prev.filter(id => id !== problemId) : [...prev, problemId]);
  try {
    await axiosClient.post(`/bookmark/toggle/${problemId}`);
  } catch {
    setBookmarkedIds(prev => isBk ? [...prev, problemId] : prev.filter(id => id !== problemId));
  }
};

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    const isSolved = solvedProblems.some(sp => sp._id === problem._id);
     const companyMatch =
    filters.company === 'all' ||
    (problem.companies || []).some(
      (c) => c.name === filters.company && c.timeframe === 'all'
    );
    const statusMatch = filters.status === 'all' || 
                  (filters.status === 'runnable' && problem.isRunnable) ||
                  (filters.status === 'solved' && isSolved) ||
                  (filters.status === 'unsolved' && !isSolved);
    const searchMatch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    (problem.problemNumber && problem.problemNumber.toString().includes(searchQuery));
    return difficultyMatch && tagMatch && companyMatch && statusMatch && searchMatch;
  });

  const getDifficultyStyle = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'hard': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-[#07070a] text-white selection:bg-violet-500/30">
        
        {/* BACKGROUND LAYERS */}
        <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full" style={{ background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.1), transparent 70%)' }} />
          <div className="absolute inset-0 opacity-[0.02]" style={{
              backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
              maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 100%)'
            }}
          />
        </div>

        {/* NAVBAR */}
        <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#07070a]/80 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-2.5 group outline-none">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-violet-500 blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                  <div className="w-2 h-2 rounded-[2px] bg-[#07070a]" />
                </div>
              </div>
              <span className="text-[15px] font-semibold tracking-[-0.02em] text-white">MeetCode</span>
            </NavLink>
            
                        <div className="flex items-center gap-2">
              <button
                onClick={() => window.dispatchEvent(new Event('meetcode:open-palette'))}
                className="hidden md:flex items-center gap-2 h-9 pl-3 pr-2 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all group"
              >
                <Search size={13} className="text-white/40 group-hover:text-white/60 transition-colors" />
                <span className="text-[12.5px] text-white/40 group-hover:text-white/60 transition-colors">Search</span>
                <kbd className="ml-3 px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[10px] font-mono text-white/40">
                  {isMac ? '⌘K' : 'Ctrl K'}
                </kbd>
              </button>
              <button
                onClick={() => window.dispatchEvent(new Event('meetcode:open-palette'))}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/[0.04] transition-colors"
              >
                <Search size={16} className="text-white/60" />
              </button>
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors outline-none"
              >
                <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[11px] font-medium text-white/80">
                  {user?.firstName?.charAt(0).toUpperCase()}
                </div>
                <span className="text-[13px] font-medium text-white/70">{user?.firstName}</span>
                <ChevronDown size={14} className={`text-white/40 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="dropdown-anim absolute right-0 mt-2 w-56 rounded-xl border border-white/[0.08] bg-[#111115] shadow-2xl shadow-black/60 overflow-hidden py-1 z-50">
                  <div className="px-3 py-2.5 border-b border-white/[0.06] mb-1">
                    <p className="text-[13px] font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
                    <p className="text-[11px] text-white/40 truncate mt-0.5">{user?.emailId}</p>
                  </div>

                  {user?.role === 'admin' && (
                    <NavLink 
                      to="/admin" 
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-[13px] text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
                    >
                      <Settings size={14} /> Admin Panel
                    </NavLink>
                  )}
                  <NavLink 
  to="/review" 
  onClick={() => setDropdownOpen(false)}
  className="flex items-center gap-2 px-3 py-2 text-[13px] text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
>
  <Brain size={14} /> Review Deck
</NavLink>

<NavLink 
  to="/contest" 
  onClick={() => setDropdownOpen(false)}
  className="flex items-center gap-2 px-3 py-2 text-[13px] text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
>
  <Trophy size={14} /> Virtual Contest
</NavLink>

<NavLink
  to="/leaderboard"
  onClick={() => setDropdownOpen(false)}
  className="flex items-center gap-2 px-3 py-2 text-[13px] text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
>
  <Trophy size={14} /> Leaderboard
</NavLink>

<NavLink
  to="/bookmarks"
  onClick={() => setDropdownOpen(false)}
  className="flex items-center gap-2 px-3 py-2 text-[13px] text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
>
  <Star size={14} /> Bookmarks
</NavLink>

<NavLink 
  to="/dashboard" 
  onClick={() => setDropdownOpen(false)}
  className="flex items-center gap-2 px-3 py-2 text-[13px] text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
>
  <TrendingUp size={14} /> Dashboard
</NavLink>
<NavLink 
  to="/paths" 
  onClick={() => setDropdownOpen(false)}
  className="flex items-center gap-2 px-3 py-2 text-[13px] text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
>
  <BookOpen size={14} /> Learning Paths
</NavLink>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
          </div>
        </nav>

        <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
          
                    <div className="fade-up mb-8" style={{ animationDelay: '0ms' }}>
            <h1 className="text-2xl font-semibold tracking-[-0.02em] text-white">Problem Set</h1>
            <p className="text-[13.5px] text-white/40 mt-1">Master these patterns to ace your interviews.</p>
          </div>

          {dailyProblem && (
            <div
              className="fade-up mb-6 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] via-violet-500/[0.03] to-transparent p-5 relative overflow-hidden"
              style={{ animationDelay: '80ms' }}
            >
              <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{ background: 'radial-gradient(ellipse at top right, rgba(139,92,246,0.2), transparent 70%)' }}
              />
              <div className="relative flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={22} className="text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-violet-400 flex items-center gap-1">
                        <Calendar size={10} /> Daily Challenge
                      </span>
                      {dailyProblem.solvedToday ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                          <CheckCircle2 size={11} /> Solved
                        </span>
                      ) : dailyProblem.attemptsToday > 0 ? (
                        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                          {dailyProblem.attemptsToday} attempt{dailyProblem.attemptsToday > 1 ? 's' : ''} today
                        </span>
                      ) : null}
                    </div>
                    <h2 className="text-[16px] font-semibold text-white truncate">
                      {dailyProblem.problem.problemNumber && (
                        <span className="text-white/40 mr-2 font-mono text-[14px]">#{dailyProblem.problem.problemNumber}</span>
                      )}
                      {dailyProblem.problem.title}
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getDifficultyStyle(dailyProblem.problem.difficulty)}`}>
                    {dailyProblem.problem.difficulty.charAt(0).toUpperCase() + dailyProblem.problem.difficulty.slice(1)}
                  </span>
                  <NavLink
                    to={`/problem/${dailyProblem.problem._id}`}
                    state={{ source: { type: 'daily', name: 'Daily Challenge' } }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[12.5px] font-medium transition-colors shadow-lg shadow-violet-600/20"
                  >
                    {dailyProblem.solvedToday ? 'Review' : 'Solve'} <ArrowRight size={13} />
                  </NavLink>
                </div>
              </div>
            </div>
          )}

          <div className="fade-up flex flex-wrap items-center gap-3 mb-6" style={{ animationDelay: '160ms' }}>
          <div className="relative flex-1 min-w-[200px]">
    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
    <input
      type="text"
      placeholder="Search by title or number..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[13px] text-white/80 outline-none hover:border-white/[0.12] focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/[0.08] transition-all"
    />
  </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.06] text-white/40">
              <SlidersHorizontal size={14} />
              <span className="text-[12px] font-medium uppercase tracking-wider">Filters</span>
            </div>

            <select 
  className="h-9 px-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[13px] text-white/80 outline-none hover:border-white/[0.12] focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/[0.08] transition-all cursor-pointer"
  value={filters.status}
  onChange={(e) => setFilters({...filters, status: e.target.value})}
>
  <option value="all">All Status</option>
  <option value="solved">Solved</option>
  <option value="unsolved">Unsolved</option>
</select>

            <select 
              className="h-9 px-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[13px] text-white/80 outline-none hover:border-white/[0.12] focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/[0.08] transition-all cursor-pointer"
              value={filters.difficulty}
              onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
  className="h-9 px-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[13px] text-white/80 outline-none hover:border-white/[0.12] focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/[0.08] transition-all cursor-pointer"
  value={filters.company}
  onChange={(e) => setFilters({ ...filters, company: e.target.value })}
>
  <option value="all">All Companies</option>
  {companies.map((c) => (
    <option key={c.name} value={c.name}>
      {c.name} ({c.count})
    </option>
  ))}
</select>

            <select 
              className="h-9 px-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[13px] text-white/80 outline-none hover:border-white/[0.12] focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/[0.08] transition-all cursor-pointer"
              value={filters.tag}
              onChange={(e) => setFilters({...filters, tag: e.target.value})}
            >
              <option value="all">All Topics</option>
              <option value="array">Array</option>
              <option value="string">String</option>
              <option value="hashMap">Hash Map</option>
              <option value="twoPointers">Two Pointers</option>
              <option value="slidingWindow">Sliding Window</option>
              <option value="stack">Stack</option>
              <option value="binarySearch">Binary Search</option>
              <option value="linkedList">Linked List</option>
              <option value="tree">Tree</option>
              <option value="trie">Trie</option>
              <option value="heap">Heap</option>
              <option value="backtracking">Backtracking</option>
              <option value="graph">Graph</option>
              <option value="dp">Dynamic Programming</option>
              <option value="greedy">Greedy</option>
              <option value="intervals">Intervals</option>
              <option value="math">Math</option>
              <option value="bitManipulation">Bit Manipulation</option>
            </select>
            <label className="flex items-center gap-2 h-9 px-3 rounded-lg bg-white/[0.02] border border-white/[0.06] cursor-pointer hover:border-white/[0.12] transition-all select-none">
  <input
    type="checkbox"
    checked={showAll}
    onChange={(e) => setShowAll(e.target.checked)}
    className="w-4 h-4 rounded border-white/[0.15] bg-white/[0.05] text-violet-500 focus:ring-violet-500/20 focus:ring-offset-0 cursor-pointer"
    style={{ colorScheme: 'dark' }}
  />
  <span className="text-[12.5px] font-medium text-white/70">
    Show all ({showAll ? 'incl. Coming Soon' : 'runnable only'})
  </span>
</label>
          </div>
          {filters.company !== 'all' && (
  <div className="fade-up mb-4 flex items-center justify-between rounded-xl border border-violet-500/20 bg-violet-500/[0.06] px-4 py-3">
    <div className="flex items-center gap-2.5">
      <Building2 size={16} className="text-violet-400" />
      <div>
        <p className="text-[13px] text-white/80">
          Preparing for <strong className="text-white">{filters.company}</strong>?
        </p>
        <p className="text-[11px] text-white/40">
          View a dedicated prep page with progress tracking and stats.
        </p>
      </div>
    </div>
    <NavLink
      to={`/company/${encodeURIComponent(filters.company)}`}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[12px] font-medium transition-colors flex-shrink-0"
    >
      View Prep Page <ArrowRight size={13} />
    </NavLink>
  </div>
)}

                    <div className="fade-up space-y-1" style={{ animationDelay: '240ms' }}>
            {(loading || !dailySettled) ? (
              <ProblemListSkeleton />
            ) : filteredProblems.length === 0 ? (
              <div className="py-20 text-center border border-white/[0.06] rounded-xl bg-white/[0.01]">
                <Search size={24} className="mx-auto text-white/20 mb-3" />
                <p className="text-white/60 text-[14px]">No problems found matching your filters.</p>
                <button 
                  onClick={() => setFilters({ difficulty: 'all', tag: 'all', status: 'all' })}
                  className="mt-3 text-[13px] text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              filteredProblems.map((problem) => {
                const isSolved = solvedProblems.some(sp => sp._id === problem._id);
                return (
                  <NavLink 
  key={problem._id} 
  to={`/problem/${problem._id}`}
  state={{ 
    listIds: filteredProblems.map(p => p._id),
    source: filters.company !== 'all'
      ? { type: 'company', slug: filters.company, name: `${filters.company} Prep` }
      : null
  }}
  className="group flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-white/[0.06] hover:bg-white/[0.02] transition-all duration-200"
>
                    <div className="flex items-center gap-4 min-w-0">
  <span
    role="button"
    tabIndex={0}
    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleBookmark(problem._id); }}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); e.stopPropagation(); toggleBookmark(problem._id);
      }
    }}
    className="cursor-pointer flex-shrink-0 p-0.5 -m-0.5 rounded hover:bg-white/[0.06] transition-colors"
    title={bookmarkedIds.includes(problem._id) ? 'Remove bookmark' : 'Bookmark'}
  >
    <Star
      size={16}
      className={bookmarkedIds.includes(problem._id)
        ? 'fill-amber-400 text-amber-400'
        : 'text-white/20 hover:text-white/40'}
    />
  </span>
  {isSolved ? (
    <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
  ) : (
    <Circle size={18} className="text-white/15 flex-shrink-0 group-hover:text-white/30 transition-colors" />
  )}
                      <h3 className="text-[14.5px] font-medium text-white/90 group-hover:text-violet-400 transition-colors truncate">
  <span className="text-white/30 mr-2 font-mono text-[13px]">{problem.problemNumber || '---'}.</span>
  {problem.title}
</h3>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      {!problem.isRunnable && (
    <span className="hidden md:inline-block px-2.5 py-1 rounded-md text-[10.5px] font-semibold tracking-wide border text-amber-400 bg-amber-500/10 border-amber-500/20">
      🚧 Soon
    </span>
  )}
  <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide border ${getDifficultyStyle(problem.difficulty)}`}>
    {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
  </span>
  <span className="hidden sm:inline-block px-2.5 py-1 rounded-md text-[11px] font-medium text-white/50 bg-white/[0.03] border border-white/[0.06]">
    {problem.tags.replace(/([A-Z])/g, ' $1').trim()}
  </span>
  <CompanyBadges
    companies={problem.companies}
    selectedCompany={filters.company}
  />
</div>
                  </NavLink>
                );
              })
            )}
          </div>
          
          {(!loading && dailySettled) && (
            <div className="mt-8 text-center text-[12px] text-white/20">
              Showing {filteredProblems.length} problem{filteredProblems.length !== 1 ? 's' : ''}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default Homepage;

function CompanyBadges({ companies = [], selectedCompany = 'all' }) {
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const popupRef = useRef(null);

  const all = (companies || []).filter((c) => c.timeframe === 'all');
  if (all.length === 0) return null;

  const sorted = [...all].sort((a, b) => b.frequency - a.frequency);
  const ordered =
    selectedCompany && selectedCompany !== 'all'
      ? [
          ...sorted.filter((c) => c.name === selectedCompany),
          ...sorted.filter((c) => c.name !== selectedCompany),
        ]
      : sorted;

  const alwaysShow = selectedCompany !== 'all' ? 1 : 2;
  const visible = ordered.slice(0, alwaysShow);
  const hiddenCount = ordered.length - visible.length;

  // Estimate content height based on item count
  const estimateHeight = () =>
    Math.min(340, 40 + ordered.length * 28);

  const computePos = (rect) => {
    const popupWidth = 260;
    const popupHeight = estimateHeight();
    const margin = 8;

    let left = rect.left;
    if (left + popupWidth > window.innerWidth - margin) {
      left = window.innerWidth - popupWidth - margin;
    }
    if (left < margin) left = margin;

    const spaceBelow = window.innerHeight - rect.bottom;
    let top;
    if (spaceBelow >= popupHeight + margin) {
      top = rect.bottom + 6;
    } else if (rect.top >= popupHeight + margin) {
      top = rect.top - popupHeight - 6;
    } else {
      top = Math.max(margin, (window.innerHeight - popupHeight) / 2);
    }

    return { top, left };
  };

  const openPopup = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (btnRef.current) {
      setPopupPos(computePos(btnRef.current.getBoundingClientRect()));
    }
    setPopupOpen(true);
  };

  useEffect(() => {
    if (!popupOpen) return;

    const handleClick = (e) => {
      if (popupRef.current?.contains(e.target)) return;
      if (btnRef.current?.contains(e.target)) return;
      setPopupOpen(false);
    };
    const handleEsc = (e) => { if (e.key === 'Escape') setPopupOpen(false); };
    const handleScrollOrResize = (e) => {
      if (popupRef.current?.contains(e.target)) return;
      if (!btnRef.current) return;
      setPopupPos(computePos(btnRef.current.getBoundingClientRect()));
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [popupOpen, ordered.length]);

  return (
    <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
      {visible.map((c) => {
        const isSelected = c.name === selectedCompany;
        return (
          <span
            key={c.name}
            className={`px-2 py-0.5 rounded-md text-[10.5px] font-medium border transition-colors ${
              isSelected
                ? 'text-violet-200 bg-violet-500/20 border-violet-500/40'
                : 'text-violet-300/80 bg-violet-500/10 border-violet-500/20'
            }`}
            title={`${c.frequency}% frequency`}
          >
            {c.name}
          </span>
        );
      })}

      {hiddenCount > 0 && (
        <button
          ref={btnRef}
          type="button"
          onClick={openPopup}
          className="px-2 py-0.5 rounded-md text-[10.5px] font-medium text-white/50 bg-white/[0.04] border border-white/[0.08] hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          +{hiddenCount}
        </button>
      )}

      {popupOpen && createPortal(
        <div
          ref={popupRef}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onMouseDown={(e) => e.stopPropagation()}
          className="fixed z-[200] rounded-xl border border-white/[0.08] bg-[#111115] shadow-2xl shadow-black/60 overflow-y-auto"
          style={{
            top: popupPos.top,
            left: popupPos.left,
            width: 260,
            maxHeight: 340,
          }}
        >
          <div className="sticky top-0 z-10 px-3 py-2 text-[10px] uppercase tracking-wider text-white/30 font-bold bg-[#111115] border-b border-white/[0.06] flex items-center justify-between">
            <span>Companies · {ordered.length}</span>
            <button
              onClick={() => setPopupOpen(false)}
              className="text-white/30 hover:text-white/70 p-0.5 rounded transition-colors"
              aria-label="Close"
            >
              <X size={12} />
            </button>
          </div>
          <div className="p-1.5 space-y-0.5">
            {ordered.map((c) => {
              const isSelected = c.name === selectedCompany;
              return (
                <div
                  key={c.name}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-md text-[11.5px] ${
                    isSelected ? 'bg-violet-500/20 text-violet-200' : 'text-white/70'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  <span className="text-[10px] text-white/30 font-mono ml-2 flex-shrink-0">
                    {c.frequency.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
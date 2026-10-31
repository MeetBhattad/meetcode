import { useEffect, useState, useRef } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import { CheckCircle2, Circle, ChevronDown, LogOut, Settings, Search, SlidersHorizontal, TrendingUp } from 'lucide-react';

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
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
 const [filters, setFilters] = useState({
  difficulty: 'all',
  tag: 'all',
  status: 'all',
  company: 'all',
});
const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data || []);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();

    const fetchCompanies = async () => {
    try {
      const { data } = await axiosClient.get('/company/list');
      setCompanies(data);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };
  fetchCompanies();

  }, [user]);

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
                      (filters.status === 'solved' && isSolved) ||
                      (filters.status === 'unsolved' && !isSolved);
    return difficultyMatch && tagMatch && companyMatch && statusMatch;
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
  to="/dashboard" 
  onClick={() => setDropdownOpen(false)}
  className="flex items-center gap-2 px-3 py-2 text-[13px] text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
>
  <TrendingUp size={14} /> Dashboard
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
        </nav>

        <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
          
          <div className="fade-up mb-8" style={{ animationDelay: '0ms' }}>
            <h1 className="text-2xl font-semibold tracking-[-0.02em] text-white">Problem Set</h1>
            <p className="text-[13.5px] text-white/40 mt-1">Master these patterns to ace your interviews.</p>
          </div>

          <div className="fade-up flex flex-wrap items-center gap-3 mb-6" style={{ animationDelay: '80ms' }}>
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
          </div>

          <div className="fade-up space-y-1" style={{ animationDelay: '160ms' }}>
            {loading ? (
              <div className="py-20 flex justify-center">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
              </div>
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
                    className="group flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-white/[0.06] hover:bg-white/[0.02] transition-all duration-200"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {isSolved ? (
                        <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Circle size={18} className="text-white/15 flex-shrink-0 group-hover:text-white/30 transition-colors" />
                      )}
                      <h3 className="text-[14.5px] font-medium text-white/90 group-hover:text-violet-400 transition-colors truncate">
                        {problem.title}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
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
          
          <div className="mt-8 text-center text-[12px] text-white/20">
            Showing {filteredProblems.length} problem{filteredProblems.length !== 1 ? 's' : ''}
          </div>
        </main>
      </div>
    </>
  );
}

export default Homepage;

function CompanyBadges({ companies = [], selectedCompany = 'all' }) {
  const [expanded, setExpanded] = useState(false);

  const all = (companies || []).filter((c) => c.timeframe === 'all');
  if (all.length === 0) return null;

  // Sort by frequency desc
  const sorted = [...all].sort((a, b) => b.frequency - a.frequency);

  // If user is filtering by a specific company, that one comes first
  const ordered =
    selectedCompany && selectedCompany !== 'all'
      ? [
          ...sorted.filter((c) => c.name === selectedCompany),
          ...sorted.filter((c) => c.name !== selectedCompany),
        ]
      : sorted;

  // When filtering: show selected + "+N";  when not filtering: show top 2 + "+N"
  const alwaysShow = selectedCompany !== 'all' ? 1 : 2;
  const visible = expanded ? ordered : ordered.slice(0, alwaysShow);
  const hidden = ordered.length - visible.length;

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
      {hidden > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded(true);
          }}
          className="px-2 py-0.5 rounded-md text-[10.5px] font-medium text-white/50 bg-white/[0.04] border border-white/[0.08] hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          +{hidden}
        </button>
      )}
      {expanded && ordered.length > alwaysShow && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded(false);
          }}
          className="px-2 py-0.5 rounded-md text-[10.5px] font-medium text-white/40 hover:text-white transition-colors"
        >
          less
        </button>
      )}
    </div>
  );
}
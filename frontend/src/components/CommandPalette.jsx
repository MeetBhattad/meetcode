import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';
import {
  Search, LayoutDashboard, BookOpen, Brain, Trophy, Star,
  Sparkles, Building2, FileCode, ArrowRight, X, Loader2,
} from 'lucide-react';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const MOD_KEY = isMac ? '⌘' : 'Ctrl';

const STATIC_COMMANDS = [
  { id: 'cmd-home',      icon: Sparkles,        label: 'Go to Homepage',         path: '/',          keywords: ['home', 'problems', 'solve', 'list'] },
  { id: 'cmd-dashboard', icon: LayoutDashboard, label: 'Open Dashboard',         path: '/dashboard', keywords: ['progress', 'stats', 'analytics', 'streak'] },
  { id: 'cmd-paths',     icon: BookOpen,        label: 'Browse Learning Paths',  path: '/paths',     keywords: ['learn', 'paths', 'tracks', 'neetcode', 'blind'] },
  { id: 'cmd-review',    icon: Brain,           label: 'Open Review Deck',       path: '/review',    keywords: ['spaced', 'repetition', 'reviews', 'srs'] },
  { id: 'cmd-contest',   icon: Trophy,          label: 'Start Virtual Contest',  path: '/contest',   keywords: ['contest', 'competition', 'timer'] },
  { id: 'cmd-bookmarks', icon: Star,            label: 'View Bookmarks',         path: '/bookmarks', keywords: ['saved', 'bookmarks', 'starred'] },
];

const DIFF_COLOR = { easy: 'text-emerald-400', medium: 'text-amber-400', hard: 'text-rose-400' };

export default function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [data, setData] = useState({ problems: [], paths: [], companies: [], loaded: false });
  const [loadingData, setLoadingData] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const resultsRef = useRef([]);

  // Cmd+K / Ctrl+K toggle
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Custom event — lets the navbar search button trigger the palette
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('meetcode:open-palette', handler);
    return () => window.removeEventListener('meetcode:open-palette', handler);
  }, []);

  // Lazy-load data once
  useEffect(() => {
    if (!open || data.loaded || loadingData) return;
    setLoadingData(true);
    const load = async () => {
      try {
        const [pRes, pathRes, cRes] = await Promise.all([
          axiosClient.get('/problem/getAllProblem?runnableOnly=true'),
          axiosClient.get('/paths'),
          axiosClient.get('/company/list'),
        ]);
        setData({
          problems: pRes.data || [],
          paths: pathRes.data || [],
          companies: cRes.data || [],
          loaded: true,
        });
      } catch (err) {
        console.error('Palette load failed:', err);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [open, data.loaded, loadingData]);

  // Reset + focus on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Build results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const groups = [];

    // Commands
    const cmds = STATIC_COMMANDS.filter(c =>
      !q || c.label.toLowerCase().includes(q) || c.keywords.some(k => k.includes(q))
    ).slice(0, q ? 4 : 6);
    if (cmds.length > 0) {
      groups.push({
        label: 'Commands',
        items: cmds.map(c => ({
          type: 'command',
          id: c.id,
          icon: c.icon,
          title: c.label,
          path: c.path,
        })),
      });
    }

    // Problems (runnable only)
    if (data.loaded) {
      let list = data.problems;
      if (q) {
        const startsWith = [], contains = [], tagMatch = [];
        for (const p of data.problems) {
          const t = p.title.toLowerCase();
          const num = String(p.problemNumber || '');
          if (t.startsWith(q) || num === q) startsWith.push(p);
          else if (t.includes(q) || num.includes(q)) contains.push(p);
          else if (p.tags?.toLowerCase().includes(q)) tagMatch.push(p);
        }
        list = [...startsWith, ...contains, ...tagMatch];
      }
      if (list.length > 0) {
        groups.push({
          label: 'Problems',
          items: list.slice(0, q ? 8 : 4).map(p => ({
            type: 'problem',
            id: p._id,
            icon: FileCode,
            title: p.title,
            subtitle: p.problemNumber ? `#${p.problemNumber}` : null,
            difficulty: p.difficulty,
            tag: p.tags,
            path: `/problem/${p._id}`,
            state: { source: { type: 'palette', name: 'Search' } },
          })),
        });
      }
    }

    // Paths
    if (data.loaded && data.paths.length > 0) {
      const list = q
        ? data.paths.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
          )
        : data.paths;
      if (list.length > 0) {
        groups.push({
          label: 'Learning Paths',
          items: list.slice(0, q ? 4 : 3).map(p => ({
            type: 'path',
            id: p._id,
            icon: BookOpen,
            title: p.name,
            subtitle: `${p.solved}/${p.total}`,
            path: `/paths/${p.slug}`,
          })),
        });
      }
    }

    // Companies
    if (data.loaded && data.companies.length > 0) {
      const list = q
        ? data.companies.filter(c => c.name.toLowerCase().includes(q))
        : data.companies;
      if (list.length > 0) {
        groups.push({
          label: 'Companies',
          items: list.slice(0, q ? 4 : 3).map(c => ({
            type: 'company',
            id: c.name,
            icon: Building2,
            title: c.name,
            subtitle: `${c.count} problem${c.count !== 1 ? 's' : ''}`,
            path: `/company/${encodeURIComponent(c.name)}`,
          })),
        });
      }
    }

    return groups;
  }, [query, data]);

  const flatItems = useMemo(() => results.flatMap(g => g.items), [results]);

  useEffect(() => { setActiveIdx(0); }, [query]);

  useEffect(() => {
    const el = resultsRef.current[activeIdx];
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  const handleSelect = useCallback((item) => {
    if (!item) return;
    setOpen(false);
    if (item.state) navigate(item.path, { state: item.state });
    else navigate(item.path);
  }, [navigate]);

  // Arrow / Enter / Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx(i => Math.min(i + 1, flatItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelect(flatItems[activeIdx]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, flatItems, activeIdx, handleSelect]);

  if (!open) return null;

  let runningIdx = -1;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center pt-[10vh] px-4 bg-black/70 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-white/[0.1] bg-[#0d1117] shadow-2xl shadow-black/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'palette-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08]">
          <Search size={18} className="text-white/40 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems, paths, companies, or commands..."
            className="flex-1 bg-transparent text-[14.5px] text-white placeholder:text-white/30 outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          {loadingData && <Loader2 size={16} className="animate-spin text-violet-400 flex-shrink-0" />}
          <button
            onClick={() => setOpen(false)}
            className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0 p-1 rounded"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[13px] text-white/40">
                {!data.loaded && loadingData ? 'Loading…' : 'No results found.'}
              </p>
              {query && (
                <p className="mt-1 text-[12px] text-white/25">
                  Try a problem title, number, tag, or command.
                </p>
              )}
            </div>
          ) : (
            results.map((group) => (
              <div key={group.label} className="mb-1.5">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
                  {group.label}
                </div>
                {group.items.map((item) => {
                  runningIdx++;
                  const idx = runningIdx;
                  const isActive = idx === activeIdx;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      ref={el => { resultsRef.current[idx] = el; }}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActiveIdx(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        isActive
                          ? 'bg-violet-500/15 border border-violet-500/30'
                          : 'border border-transparent hover:bg-white/[0.03]'
                      }`}
                    >
                      <Icon size={15} className={isActive ? 'text-violet-400 flex-shrink-0' : 'text-white/40 flex-shrink-0'} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[13.5px] font-medium truncate ${isActive ? 'text-white' : 'text-white/85'}`}>
                            {item.title}
                          </span>
                          {item.subtitle && (
                            <span className="text-[11px] text-white/35 font-mono flex-shrink-0">
                              {item.subtitle}
                            </span>
                          )}
                        </div>
                        {item.tag && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[10.5px] font-semibold uppercase tracking-wide ${DIFF_COLOR[item.difficulty] || 'text-white/40'}`}>
                              {item.difficulty}
                            </span>
                            <span className="text-white/20">·</span>
                            <span className="text-[10.5px] text-white/40">
                              {item.tag.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </div>
                        )}
                      </div>
                      {isActive && <ArrowRight size={13} className="text-violet-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.08] px-4 py-2 flex items-center justify-between text-[11px] text-white/35">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono text-[10px]">↓</kbd>
              <span className="hidden sm:inline">navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono text-[10px]">↵</kbd>
              <span className="hidden sm:inline">select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono text-[10px]">esc</kbd>
              <span className="hidden sm:inline">close</span>
            </span>
          </div>
          <span className="hidden sm:block">MeetCode Search</span>
        </div>
      </div>

      <style>{`
        @keyframes palette-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
console.log('🔵 VERSION: redesign-v1');

/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Editor from '@monaco-editor/react';
import { useParams, useLocation, NavLink, useNavigate } from 'react-router';
import {
  ArrowLeft, ArrowRight, Construction, XCircle, AlertCircle, Clock,
  Star, Play, Send, Terminal, Loader2, Minus, Plus,
  ChevronDown, ChevronUp, FileText, BookOpen, CheckCircle2,
  MessageSquare, Mic, StickyNote, Code2,
} from 'lucide-react';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';
import MockInterview from '../components/MockInterview';
import NotesTab from '../components/NotesTab';

const normalizeLang = (lang) => {
  const l = (lang || '').toLowerCase();
  if (l === 'cpp' || l === 'c++') return 'c++';
  return l;
};

const DIFF_STYLE = {
  easy: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  hard: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
};

const LEFT_TABS = [
  { id: 'description', label: 'Description', icon: FileText },
  { id: 'editorial',   label: 'Editorial',   icon: BookOpen },
  { id: 'solutions',   label: 'Solutions',   icon: CheckCircle2 },
  { id: 'submissions', label: 'Submissions', icon: Code2 },
  { id: 'notes',       label: 'Notes',       icon: StickyNote },
  { id: 'chatAI',      label: 'ChatAI',      icon: MessageSquare },
  { id: 'mockInterview', label: 'Mock',      icon: Mic },
];

const ProblemPage = () => {
  const { problemId: urlProblemId } = useParams();
  const [currentProblemId, setCurrentProblemId] = useState(urlProblemId);
  const location = useLocation();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [allProblems, setAllProblems] = useState([]);
  const [navigation, setNavigation] = useState({ prev: null, next: null });

  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('testcase');
  const [showOutput, setShowOutput] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [solution, setSolution] = useState(null);
  const [solutionLoading, setSolutionLoading] = useState(false);
  const [solutionError, setSolutionError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [mobileView, setMobileView] = useState('problem');
  const editorRef = useRef(null);

  useEffect(() => { setCurrentProblemId(urlProblemId); }, [urlProblemId]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setAllProblems(data);
      } catch (e) { console.error('Failed to load navigation', e); }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (allProblems.length === 0) return;
    let list;
    if (location.state?.listIds && Array.isArray(location.state.listIds)) {
      list = location.state.listIds.map((id) => allProblems.find((p) => p._id === id)).filter(Boolean);
    } else {
      list = [...allProblems].sort((a, b) => (a.problemNumber || 9999) - (b.problemNumber || 9999));
    }
    const idx = list.findIndex((p) => p._id === currentProblemId);
    if (idx !== -1) {
      setNavigation({
        prev: idx > 0 ? list[idx - 1] : null,
        next: idx < list.length - 1 ? list[idx + 1] : null,
      });
    } else {
      setNavigation({ prev: null, next: null });
    }
  }, [allProblems, currentProblemId, location.state]);

  useEffect(() => {
    if (!currentProblemId) return;
    const fetchProblem = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const response = await axiosClient.get(`/problem/problemById/${currentProblemId}`);
        setProblem(response.data);
        const match = response.data.startCode.find(
          (sc) => normalizeLang(sc.language) === normalizeLang(selectedLanguage)
        );
        setCode(match?.initialCode || '');
      } catch (error) {
        console.error('Error fetching problem:', error);
        setFetchError(error.response?.data || error.message || 'Failed to load problem');
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [currentProblemId]);

  useEffect(() => {
    if (problem) {
      const match = problem.startCode.find(
        (sc) => normalizeLang(sc.language) === normalizeLang(selectedLanguage)
      );
      setCode(match?.initialCode || '');
    }
  }, [selectedLanguage, problem]);

  useEffect(() => {
    setSolution(null);
    setSolutionError(null);
  }, [currentProblemId]);

  useEffect(() => {
    if (activeLeftTab === 'solutions' && solution === null && solutionError === null && !solutionLoading) {
      fetchSolution();
    }
  }, [activeLeftTab, currentProblemId]);

  useEffect(() => {
    if (!currentProblemId) return;
    let cancelled = false;
    const fetch = async () => {
      try {
        const { data } = await axiosClient.get('/bookmark/ids');
        if (!cancelled) setIsBookmarked((data || []).includes(currentProblemId));
      } catch {}
    };
    fetch();
    return () => { cancelled = true; };
  }, [currentProblemId]);

  const handleEditorChange = (value) => setCode(value || '');
  const handleEditorDidMount = (editor) => { editorRef.current = editor; };
  const handleLanguageChange = (lang) => setSelectedLanguage(lang);

  const fetchSolution = async () => {
    setSolutionLoading(true);
    setSolutionError(null);
    try {
      const { data } = await axiosClient.get(`/problem/solution/${currentProblemId}`);
      setSolution(data.referenceSolution || []);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data || 'Could not load solutions';
      setSolutionError(String(msg));
    } finally {
      setSolutionLoading(false);
    }
  };

  const handleRun = async () => {
    setRunning(true);
    setRunResult(null);
    setShowOutput(true);
    setActiveRightTab('testcase');
    try {
      const response = await axiosClient.post(`/submission/run/${currentProblemId}`, {
        code, language: selectedLanguage,
      });
      setRunResult(response.data);
    } catch (error) {
      const isRateLimit = error.response?.status === 429;
      setRunResult({
        success: false,
        isRateLimit,
        error: error.response?.data?.error || 'Internal server error',
        retryAfterSeconds: error.response?.data?.retryAfterSeconds,
      });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    setSubmitting(true);
    setSubmitResult(null);
    setShowOutput(true);
    setActiveRightTab('result');
    try {
      const response = await axiosClient.post(`/submission/submit/${currentProblemId}`, {
        code, language: selectedLanguage,
      });
      setSubmitResult(response.data);
      if (response.data.accepted) {
        setSolution(null);
        setSolutionError(null);
        setShowRating(true);
      }
    } catch (error) {
      const isRateLimit = error.response?.status === 429;
      setSubmitResult({
        accepted: false,
        isRateLimit,
        error: error.response?.data?.error || 'Internal server error',
        retryAfterSeconds: error.response?.data?.retryAfterSeconds,
        passedTestCases: 0,
        totalTestCases: 0,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const goToProblem = (id) => {
    if (!id) return;
    setCurrentProblemId(id);
    setActiveLeftTab('description');
    setRunResult(null);
    setSubmitResult(null);
    navigate(`/problem/${id}`, { replace: true, state: location.state });
  };

  const handleToggleBookmark = async () => {
    const prev = isBookmarked;
    setIsBookmarked(!prev);
    try { await axiosClient.post(`/bookmark/toggle/${currentProblemId}`); }
    catch { setIsBookmarked(prev); }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'python': return 'python';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'python';
    }
  };

    if (fetchError) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#07070a] px-4">
        <div className="max-w-md rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-300 text-[13px]">
          Failed to load problem: {String(fetchError)}
          <NavLink to="/" className="block mt-4 text-white/60 hover:text-white underline text-[12px]">
            Back to problems
          </NavLink>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#07070a]">
        <Loader2 size={28} className="animate-spin text-violet-500" />
      </div>
    );
  }

  const isRunnable = problem?.isRunnable === true;

  const source = location.state?.source || null;
  const sourceUrl = source
    ? source.type === 'path' ? `/paths/${source.slug}`
      : source.type === 'company' ? `/company/${encodeURIComponent(source.slug)}`
      : source.type === 'contest' ? '/contest/arena'
      : source.type === 'contest-history' ? `/contest/history/${source.slug}`
      : source.type === 'review' ? '/review'
      : '/'
    : '/';
  const sourceLabel = source?.name || 'All Problems';

  const hasCompileError = runResult?.testCases?.some((tc) => tc.status_id === 6);
  const compileOutput = hasCompileError
    ? runResult.testCases.find((tc) => tc.compile_output)?.compile_output
    : null;
  const allPassed = runResult?.testCases?.length > 0 && runResult.testCases.every((tc) => tc.status_id === 3);
  const passedCount = runResult?.testCases?.filter((tc) => tc.status_id === 3).length || 0;
  const totalCount = runResult?.testCases?.length || 0;

    return (
    <div className="h-screen flex flex-col bg-[#07070a] text-white">

      {/* ═══════ TOP NAV BAR (full width) ═══════ */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-[#0d1117] shrink-0">
        <NavLink
          to={sourceUrl}
          className="inline-flex items-center gap-1.5 text-[11.5px] text-white/50 hover:text-violet-400 transition-colors truncate min-w-0"
        >
          <ArrowLeft size={12} className="flex-shrink-0" />
          <span className="truncate">Back to {sourceLabel}</span>
        </NavLink>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <button
            onClick={() => goToProblem(navigation.prev?._id)}
            disabled={!navigation.prev}
            className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title={navigation.prev?.title || 'No previous problem'}
          >
            <ArrowLeft size={13} />
          </button>
          <span className="text-[11px] text-white/40 font-mono px-1.5 tabular-nums">
            {problem.problemNumber ? `#${problem.problemNumber}` : '—'}
          </span>
          <button
            onClick={() => goToProblem(navigation.next?._id)}
            disabled={!navigation.next}
            className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title={navigation.next?.title || 'No next problem'}
          >
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* ═══════ MOBILE VIEW SWITCHER ═══════ */}
      <div className="md:hidden flex border-b border-white/[0.08] bg-[#0d1117] shrink-0">
        <button
          onClick={() => setMobileView('problem')}
          className={`flex-1 py-2.5 text-[13px] font-medium transition-colors border-b-2 ${
            mobileView === 'problem' ? 'text-white border-violet-500' : 'text-white/50 border-transparent'
          }`}
        >Problem</button>
        <button
          onClick={() => setMobileView('code')}
          className={`flex-1 py-2.5 text-[13px] font-medium transition-colors border-b-2 ${
            mobileView === 'code' ? 'text-white border-violet-500' : 'text-white/50 border-transparent'
          }`}
        >Code</button>
      </div>

      {/* ═══════ SPLIT PANELS ═══════ */}
      <div className="flex flex-1 min-h-0 flex-col md:flex-row">

        {/* ─── LEFT: PROBLEM PANEL ─── */}
        <div className={`${mobileView === 'problem' ? 'flex' : 'hidden'} md:flex md:w-1/2 flex-col flex-1 min-h-0 md:border-r border-white/[0.06]`}>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] bg-[#0d1117] overflow-x-auto shrink-0 scrollbar-hide">
            {LEFT_TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveLeftTab(t.id)}
                  className={`px-3 py-2.5 text-[12px] font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 ${
                    activeLeftTab === t.id
                      ? 'text-white border-violet-500'
                      : 'text-white/45 border-transparent hover:text-white/80'
                  }`}
                >
                  <Icon size={12} /> {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {problem && (
              <>
                {/* ─── DESCRIPTION ─── */}
                <div className={activeLeftTab === 'description' ? 'block' : 'hidden'}>
                  <div className="p-5">

                    {/* Title + Bookmark */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <h1 className="text-[22px] font-bold leading-tight tracking-tight">
                        {problem.problemNumber && (
                          <span className="text-white/40 mr-1">{problem.problemNumber}.</span>
                        )}
                        {problem.title}
                      </h1>
                      <button
                        onClick={handleToggleBookmark}
                        className="p-1.5 rounded-md hover:bg-white/[0.06] transition-colors flex-shrink-0 -mt-0.5"
                        title={isBookmarked ? 'Remove bookmark' : 'Bookmark this problem'}
                      >
                        <Star
                          size={16}
                          className={isBookmarked ? 'fill-amber-400 text-amber-400' : 'text-white/30 hover:text-white/60'}
                        />
                      </button>
                    </div>

                    {/* Difficulty + Tag + Coming Soon */}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold uppercase tracking-wide border ${DIFF_STYLE[problem.difficulty] || ''}`}>
                        {problem.difficulty}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10.5px] font-medium text-violet-300 bg-violet-500/10 border border-violet-500/20 capitalize">
                        {problem.tags.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      {!isRunnable && (
                        <span className="px-2 py-0.5 rounded-md text-[10.5px] font-semibold border text-amber-400 bg-amber-500/10 border-amber-500/20 flex items-center gap-1">
                          <Construction size={10} /> Coming Soon
                        </span>
                      )}
                    </div>

                    {/* Company badges */}
                    <ProblemCompanyBadges companies={problem.companies} />

                    {/* Description body */}
                    <div className="whitespace-pre-wrap text-[13.5px] text-white/75 leading-relaxed mt-5">
                      {problem.description}
                    </div>

                    {/* Examples */}
                    {problem.visibleTestCases?.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-[11px] font-semibold text-white/50 uppercase tracking-[0.1em] mb-3">
                          Examples
                        </h3>
                        <div className="space-y-3">
                          {problem.visibleTestCases.map((tc, i) => (
                            <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                              <div className="text-[10.5px] text-violet-400 font-mono font-semibold mb-2.5 tracking-wide">
                                Example {i + 1}
                              </div>
                              <div className="space-y-2 text-[12.5px] font-mono">
                                <div className="flex gap-3">
                                  <span className="text-white/40 w-16 flex-shrink-0">Input:</span>
                                  <span className="text-white/85 whitespace-pre-wrap break-all">{tc.input}</span>
                                </div>
                                <div className="flex gap-3">
                                  <span className="text-white/40 w-16 flex-shrink-0">Output:</span>
                                  <span className="text-white/85 whitespace-pre-wrap break-all">{tc.output}</span>
                                </div>
                                {tc.explanation && (
                                  <div className="flex gap-3 pt-1.5 border-t border-white/[0.04] mt-1">
                                    <span className="text-white/40 w-16 flex-shrink-0">Why:</span>
                                    <span className="text-white/60 italic font-sans leading-relaxed">{tc.explanation}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── EDITORIAL ─── */}
                <div className={activeLeftTab === 'editorial' ? 'block' : 'hidden'}>
                  <div className="p-5">
                    <Editorial resources={problem.editorialResources} onAskAI={() => setActiveLeftTab('chatAI')} />
                  </div>
                </div>

                {/* ─── SOLUTIONS ─── */}
                <div className={activeLeftTab === 'solutions' ? 'block' : 'hidden'}>
                  <div className="p-5">
                    <h2 className="text-[15px] font-semibold mb-4">Solutions</h2>
                    {solutionLoading && (
                      <div className="flex justify-center py-12">
                        <Loader2 size={20} className="animate-spin text-violet-500" />
                      </div>
                    )}
                    {!solutionLoading && solutionError && (
                      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                        <p className="font-semibold text-amber-400 text-[13px] mb-1">🔒 Locked</p>
                        <p className="text-[12.5px] text-white/60">{solutionError}</p>
                      </div>
                    )}
                    {!solutionLoading && !solutionError && solution && solution.length > 0 && (
                      <div className="space-y-4">
                        {solution.map((s, index) => (
                          <div key={index} className="rounded-lg border border-white/[0.06] overflow-hidden">
                            <div className="bg-white/[0.03] px-4 py-2 border-b border-white/[0.06]">
                              <span className="text-[11px] font-semibold uppercase tracking-wide text-violet-400">
                                {s.language}
                              </span>
                            </div>
                            <pre className="p-4 text-[12px] font-mono text-white/80 overflow-x-auto bg-[#0a0c10]">
                              <code>{s.completeCode}</code>
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── SUBMISSIONS ─── */}
                <div className={activeLeftTab === 'submissions' ? 'block' : 'hidden'}>
                  <div className="p-5">
                    <h2 className="text-[15px] font-semibold mb-4">My Submissions</h2>
                    <SubmissionHistory problemId={currentProblemId} />
                  </div>
                </div>

                {/* ─── NOTES ─── */}
                <div className={activeLeftTab === 'notes' ? 'block' : 'hidden'}>
                  <div className="p-5">
                    <NotesTab problemId={currentProblemId} />
                  </div>
                </div>

                {/* ─── CHATAI ─── */}
                <div className={activeLeftTab === 'chatAI' ? 'block' : 'hidden'}>
                  <div className="p-5">
                    <ChatAi problem={problem} />
                  </div>
                </div>

                {/* ─── MOCK INTERVIEW ─── */}
                <div className={activeLeftTab === 'mockInterview' ? 'block' : 'hidden'}>
                  <div className="p-5">
                    <MockInterview problem={problem} language={selectedLanguage} code={code} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ─── RIGHT: EDITOR PANEL ─── */}
        <div className={`${mobileView === 'code' ? 'flex' : 'hidden'} md:flex md:w-1/2 flex-col flex-1 min-h-0 bg-[#0d1117]`}>

          {/* Toolbar */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.06] bg-[#0d1117] shrink-0">
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-white/[0.03] border border-white/[0.08] rounded-md px-2.5 py-1.5 text-[12px] text-white/85 outline-none hover:border-white/[0.15] focus:border-violet-500/50 transition-colors cursor-pointer"
              style={{ colorScheme: 'dark' }}
            >
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Decrease font size"
              >
                <Minus size={13} />
              </button>
              <span className="text-[11px] text-white/40 font-mono w-6 text-center tabular-nums">
                {fontSize}
              </span>
              <button
                onClick={() => setFontSize(Math.min(22, fontSize + 1))}
                className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Increase font size"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>

          {/* Monaco */}
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={getLanguageForMonaco(selectedLanguage)}
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                fontSize,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: 'on',
                lineNumbers: 'on',
                glyphMargin: false,
                folding: true,
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 3,
                renderLineHighlight: 'line',
                selectOnLineNumbers: true,
                roundedSelection: false,
                readOnly: false,
                cursorStyle: 'line',
                mouseWheelZoom: true,
              }}
            />
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-b border-white/[0.06] bg-[#0d1117] shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRun}
                disabled={running || submitting || !isRunnable}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-white/80 hover:text-white text-[12px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title={!isRunnable ? 'This problem is not available for execution' : 'Run visible tests'}
              >
                {running ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                Run
              </button>
              <button
                onClick={handleSubmitCode}
                disabled={running || submitting || !isRunnable}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[12px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-emerald-600/30"
                title={!isRunnable ? 'This problem is not available for execution' : 'Submit all tests'}
              >
                {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                Submit
              </button>
            </div>
            <button
              onClick={() => setShowOutput((v) => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/[0.06] text-[11.5px] font-medium transition-colors"
            >
              <Terminal size={12} /> Output
              {showOutput ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            </button>
          </div>

          {/* Output panel */}
          {showOutput && (
            <div className="h-64 border-t border-white/[0.06] bg-[#0a0c10] flex flex-col shrink-0">
              <div className="flex border-b border-white/[0.06] bg-[#0d1117] px-2 shrink-0">
                <button
                  onClick={() => setActiveRightTab('testcase')}
                  className={`px-3 py-2 text-[11.5px] font-medium border-b-2 transition-colors ${
                    activeRightTab === 'testcase'
                      ? 'text-white border-violet-500'
                      : 'text-white/45 border-transparent hover:text-white/80'
                  }`}
                >Testcase</button>
                <button
                  onClick={() => setActiveRightTab('result')}
                  className={`px-3 py-2 text-[11.5px] font-medium border-b-2 transition-colors ${
                    activeRightTab === 'result'
                      ? 'text-white border-violet-500'
                      : 'text-white/45 border-transparent hover:text-white/80'
                  }`}
                >Result</button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {activeRightTab === 'testcase' && (
                  <>
                    {!isRunnable ? (
                      <ComingSoonPanel />
                    ) : runResult?.isRateLimit ? (
                      <RateLimitPanel error={runResult.error} retryAfter={runResult.retryAfterSeconds} />
                    ) : hasCompileError ? (
                      <CompileErrorPanel compileOutput={compileOutput} />
                    ) : runResult ? (
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                            allPassed ? 'bg-emerald-500/15' : 'bg-rose-500/15'
                          }`}>
                            <span className={`text-sm font-bold ${allPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {allPassed ? '✓' : '✗'}
                            </span>
                          </div>
                          <div>
                            <h3 className={`text-[12.5px] font-semibold ${allPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {allPassed ? 'All tests passed' : 'Some tests failed'}
                            </h3>
                            <p className="text-[10.5px] text-white/40">
                              {passedCount} of {totalCount} passed
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {runResult.testCases?.map((tc, i) => {
                            const passed = tc.status_id === 3;
                            return (
                              <div key={i} className={`rounded-md border-l-2 bg-white/[0.02] ${
                                passed ? 'border-l-emerald-500' : 'border-l-rose-500'
                              }`}>
                                <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.04]">
                                  <span className="text-[10.5px] font-medium text-white/50">Test {i + 1}</span>
                                  <span className={`text-[10.5px] font-semibold ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {passed ? 'Passed' : 'Failed'}
                                  </span>
                                </div>
                                <div className="p-2.5 space-y-1 text-[11px] font-mono">
                                  <div className="flex gap-2"><span className="text-white/40 w-14 flex-shrink-0">Input:</span><span className="text-white/75 whitespace-pre-wrap break-all">{tc.stdin || '(empty)'}</span></div>
                                  <div className="flex gap-2"><span className="text-white/40 w-14 flex-shrink-0">Expected:</span><span className="text-white/75 whitespace-pre-wrap break-all">{tc.expected_output || '(empty)'}</span></div>
                                  <div className="flex gap-2"><span className="text-white/40 w-14 flex-shrink-0">Got:</span><span className={`whitespace-pre-wrap break-all ${!tc.stdout ? 'italic text-white/30' : 'text-white/75'}`}>{tc.stdout || '(empty)'}</span></div>
                                  {tc.status_id >= 7 && tc.stderr && (
                                    <div className="flex gap-2"><span className="text-rose-400 w-14 flex-shrink-0">Error:</span><span className="text-rose-300 whitespace-pre-wrap break-all">{tc.stderr}</span></div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-white/30 gap-2 p-4">
                        <Play size={18} className="opacity-40" />
                        <p className="text-[11.5px]">Click Run to see test results</p>
                      </div>
                    )}
                  </>
                )}

                {activeRightTab === 'result' && (
                  <>
                    {!isRunnable ? (
                      <ComingSoonPanel />
                    ) : submitResult?.isRateLimit ? (
                      <RateLimitPanel error={submitResult.error} retryAfter={submitResult.retryAfterSeconds} />
                    ) : submitResult?.errorType === 'compile' ? (
                      <CompileErrorPanel compileOutput={submitResult.errorMessage} />
                    ) : submitResult ? (
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            submitResult.accepted ? 'bg-emerald-500/15' : 'bg-rose-500/15'
                          }`}>
                            <span className={`text-base font-bold ${submitResult.accepted ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {submitResult.accepted ? '✓' : '✗'}
                            </span>
                          </div>
                          <div>
                            <h3 className={`text-[14px] font-bold ${submitResult.accepted ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {submitResult.accepted ? 'Accepted' :
                                submitResult.errorType === 'runtime' ? 'Runtime Error' :
                                submitResult.errorType === 'wrong' ? 'Wrong Answer' :
                                'Submission Failed'}
                            </h3>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-md bg-white/[0.02] border border-white/[0.06] p-2.5">
                            <div className="text-[9.5px] text-white/40 uppercase tracking-wide mb-1">Tests</div>
                            <div className="font-mono text-[13px] font-semibold text-white/85">
                              {submitResult.passedTestCases}/{submitResult.totalTestCases}
                            </div>
                          </div>
                          <div className="rounded-md bg-white/[0.02] border border-white/[0.06] p-2.5">
                            <div className="text-[9.5px] text-white/40 uppercase tracking-wide mb-1">Runtime</div>
                            <div className="font-mono text-[13px] font-semibold text-white/85">
                              {(submitResult.runtime ?? 0).toFixed(3)}s
                            </div>
                          </div>
                          <div className="rounded-md bg-white/[0.02] border border-white/[0.06] p-2.5">
                            <div className="text-[9.5px] text-white/40 uppercase tracking-wide mb-1">Memory</div>
                            <div className="font-mono text-[13px] font-semibold text-white/85">
                              {submitResult.memory ?? 0} KB
                            </div>
                          </div>
                        </div>
                        {!submitResult.accepted && (submitResult.error || submitResult.errorMessage) && (
                          <div className="rounded-md border-l-2 border-l-rose-500 bg-rose-500/5 p-3 text-[11px] font-mono text-white/75 whitespace-pre-wrap break-all">
                            {submitResult.error || submitResult.errorMessage}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-white/30 gap-2 p-4">
                        <Send size={18} className="opacity-40" />
                        <p className="text-[11.5px]">Click Submit to evaluate against hidden tests</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════ SPACED REPETITION RATING MODAL ═══════ */}
      {showRating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0d1117] p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-2 text-center">How did that feel?</h2>
            <p className="text-[13px] text-white/50 text-center mb-6">
              This helps us schedule your next review using Spaced Repetition.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={async () => {
                  await axiosClient.post(`/review/${currentProblemId}`, { quality: 2 });
                  setShowRating(false);
                }}
                className="flex flex-col items-center gap-2 py-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
              >
                <span className="font-semibold text-sm">Hard</span>
                <span className="text-[10px] opacity-70">Review tomorrow</span>
              </button>
              <button
                onClick={async () => {
                  await axiosClient.post(`/review/${currentProblemId}`, { quality: 4 });
                  setShowRating(false);
                }}
                className="flex flex-col items-center gap-2 py-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-all"
              >
                <span className="font-semibold text-sm">Medium</span>
                <span className="text-[10px] opacity-70">Review in 3 days</span>
              </button>
              <button
                onClick={async () => {
                  await axiosClient.post(`/review/${currentProblemId}`, { quality: 5 });
                  setShowRating(false);
                }}
                className="flex flex-col items-center gap-2 py-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all"
              >
                <span className="font-semibold text-sm">Easy</span>
                <span className="text-[10px] opacity-70">Review in 7+ days</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
// ─────────────────────────────────────────────────────────────
// Helper components (preserved with theme updates)
// ─────────────────────────────────────────────────────────────
function CompileErrorPanel({ compileOutput }) {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-rose-500/15 flex items-center justify-center flex-shrink-0">
          <XCircle size={16} className="text-rose-400" />
        </div>
        <div>
          <h3 className="text-[13px] font-bold text-rose-400">Compilation Error</h3>
          <p className="text-[10.5px] text-white/40">Fix the errors below and try again.</p>
        </div>
      </div>
      <div className="rounded-md border border-rose-500/30 bg-rose-500/5 overflow-hidden">
        <div className="px-3 py-1.5 border-b border-rose-500/20 bg-rose-500/10">
          <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wide">Compiler Output</span>
        </div>
        <pre className="p-3 text-[11px] font-mono whitespace-pre-wrap text-white/80 overflow-x-auto">
          {compileOutput || 'Compilation failed with no error message.'}
        </pre>
      </div>
    </div>
  );
}

function RateLimitPanel({ error, retryAfter }) {
  const formatWait = (secs) => {
    if (!secs || secs <= 0) return 'a few minutes';
    if (secs < 60) return `${secs} second${secs !== 1 ? 's' : ''}`;
    const mins = Math.ceil(secs / 60);
    if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''}`;
    const hrs = Math.ceil(secs / 3600);
    return `${hrs} hour${hrs !== 1 ? 's' : ''}`;
  };

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0">
          <AlertCircle size={16} className="text-amber-400" />
        </div>
        <div>
          <h3 className="text-[13px] font-bold text-amber-400">Rate Limit Reached</h3>
          <p className="text-[10.5px] text-white/40">You're submitting too fast. Take a short break.</p>
        </div>
      </div>
      <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
        <p className="text-[12px] text-white/80">
          {error || 'You have reached the submission limit for this hour.'}
        </p>
        {retryAfter > 0 && (
          <p className="text-[11px] text-white/50 mt-2 flex items-center gap-1.5">
            <Clock size={11} className="text-amber-400" />
            Try again in <strong className="text-amber-300">{formatWait(retryAfter)}</strong>
          </p>
        )}
      </div>
    </div>
  );
}

function ComingSoonPanel() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-3 p-6">
      <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center">
        <Construction size={22} className="text-amber-400" />
      </div>
      <div className="max-w-xs">
        <h3 className="text-[13px] font-semibold text-amber-400 mb-1">Coming Soon</h3>
        <p className="text-[11.5px] text-white/50 leading-relaxed">
          This problem is not yet configured for execution. You can still read the description, use the AI tutor, and try the mock interview.
        </p>
      </div>
    </div>
  );
}

function ProblemCompanyBadges({ companies = [] }) {
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const popupRef = useRef(null);

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
      const rect = btnRef.current.getBoundingClientRect();
      setPopupPos({ top: rect.bottom + 6, left: Math.max(8, Math.min(rect.left, window.innerWidth - 268)) });
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
  }, [popupOpen]);

  const all = (companies || []).filter((c) => c.timeframe === 'all').sort((a, b) => b.frequency - a.frequency);
  if (all.length === 0) return null;

  const visible = all.slice(0, 4);
  const hiddenCount = all.length - visible.length;

  const openPopup = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPopupPos({
        top: rect.bottom + 6,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - 268)),
      });
    }
    setPopupOpen(true);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-3">
      <span className="text-[10.5px] text-white/35 uppercase tracking-wide font-medium mr-0.5">Asked at:</span>
      {visible.map((c) => (
        <span key={c.name} className="px-1.5 py-0.5 rounded text-[10px] font-medium text-violet-300 bg-violet-500/10 border border-violet-500/15">
          {c.name}
        </span>
      ))}
      {hiddenCount > 0 && (
        <button
          ref={btnRef}
          type="button"
          onClick={openPopup}
          className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white/50 bg-white/[0.04] border border-white/[0.08] hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          +{hiddenCount}
        </button>
      )}
      {popupOpen && createPortal(
        <div
          ref={popupRef}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="fixed z-[200] rounded-xl border border-white/[0.08] bg-[#111115] shadow-2xl shadow-black/60 overflow-y-auto"
          style={{ top: popupPos.top, left: popupPos.left, width: 260, maxHeight: 340 }}
        >
          <div className="sticky top-0 z-10 px-3 py-2 text-[10px] uppercase tracking-wider text-white/30 font-bold bg-[#111115] border-b border-white/[0.06]">
            Companies · {all.length}
          </div>
          <div className="p-1.5 space-y-0.5">
            {all.map((c) => (
              <div key={c.name} className="flex items-center justify-between px-2 py-1.5 rounded-md text-[11.5px] text-white/70">
                <span className="truncate">{c.name}</span>
                <span className="text-[10px] text-white/30 font-mono ml-2 flex-shrink-0">{c.frequency.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}};

export default ProblemPage;
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router';
import Editor from '@monaco-editor/react';
import axiosClient from '../utils/axiosClient';
import { Clock, CheckCircle2, Circle, Loader2, Play, Send, LogOut, Trophy, ArrowLeft, XCircle } from 'lucide-react';

const normalizeLang = (lang) => {
  const l = (lang || '').toLowerCase();
  if (l === 'cpp' || l === 'c++') return 'c++';
  return l;
};

const DIFF_STYLE = {
  easy: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10',
  medium: 'text-amber-400 border-amber-400/20 bg-amber-400/10',
  hard: 'text-rose-400 border-rose-400/20 bg-rose-400/10',
};

const SCORE_MAP = { easy: 3, medium: 5, hard: 8 };

const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const fmtTimeLong = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m === 0) return `${sec}s`;
  if (sec === 0) return `${m}m`;
  return `${m}m ${sec}s`;
};

export default function ContestArena() {
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const [mobileView, setMobileView] = useState('problem'); // 'problem' | 'code'

  const [problemDetails, setProblemDetails] = useState(null);
  const [loadingProblem, setLoadingProblem] = useState(true);

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');

  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);

  const [solvedProblems, setSolvedProblems] = useState({});
  const [problemTimes, setProblemTimes] = useState({});

  const [showResults, setShowResults] = useState(false);
  const [finalResults, setFinalResults] = useState(null);

  const endedRef = useRef(false);
  const activeTimeStartRef = useRef(null);

  // ── 1. Load contest OR results ──
  useEffect(() => {
    const savedResults = localStorage.getItem('contestResults');
    if (savedResults) {
      setFinalResults(JSON.parse(savedResults));
      setShowResults(true);
      setLoadingProblem(false);
      return;
    }

    const saved = localStorage.getItem('activeContest');
    if (!saved) {
      navigate('/contest');
      return;
    }

    const data = JSON.parse(saved);
    setContest(data);

    const progress = JSON.parse(localStorage.getItem('contestProgress') || 'null');
    if (progress) {
      setSolvedProblems(progress.solvedProblems || {});
      setProblemTimes(progress.problemTimes || {});
    }
  }, []);

  // ── 2. Persist progress ──
  useEffect(() => {
    if (!contest || showResults) return;
    localStorage.setItem('contestProgress', JSON.stringify({ solvedProblems, problemTimes }));
  }, [solvedProblems, problemTimes, contest, showResults]);

  // ── 3. ✅ FIXED: Timer + auto-end (single effect, wall-clock based) ──
  // Handle-end is defined BEFORE this effect so no TDZ issues.
  const handleEndContest = () => {
    if (endedRef.current || !contest) return;
    endedRef.current = true;

    // Compute total used time from wall clock (accurate regardless of tab throttling)
    const wallElapsed = Math.floor((Date.now() - contest.startTime) / 1000);
    const usedTime = Math.min(contest.timeLimitMins * 60, wallElapsed);

    // Snapshot accumulated times + flush current problem
    const finalTimes = { ...problemTimes };
    if (activeTimeStartRef.current) {
      const pid = contest.problems[activeIdx]._id;
      const elapsed = Math.floor((Date.now() - activeTimeStartRef.current) / 1000);
      finalTimes[pid] = (finalTimes[pid] || 0) + elapsed;
      activeTimeStartRef.current = null;
    }

    const results = contest.problems.map(p => ({
      _id: p._id,
      title: p.title,
      difficulty: p.difficulty,
      tags: p.tags,
      solved: !!solvedProblems[p._id],
      timeSpent: finalTimes[p._id] || 0,
    }));

    const payload = {
      problems: results,
      totalTime: usedTime,
      timeLimit: contest.timeLimitMins,
      topic: contest.topic,
    };

    localStorage.removeItem('activeContest');
    localStorage.removeItem('contestProgress');
    localStorage.setItem('contestResults', JSON.stringify(payload));

    // Persist to backend for contest history
    axiosClient.post('/contest/save', payload).catch(err => {
      console.error('Failed to save contest history:', err);
    });

    setFinalResults(payload);
    setShowResults(true);
  };

  useEffect(() => {
    if (!contest || showResults || endedRef.current) return;

    const tick = () => {
      const elapsed = Math.floor((Date.now() - contest.startTime) / 1000);
      const remaining = Math.max(0, (contest.timeLimitMins * 60) - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        handleEndContest();
      }
    };

    tick(); // run immediately so timeLeft is set before any state flush
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [contest, showResults, problemTimes, activeIdx, solvedProblems]);

  // ── 4. Fetch problem details ──
  useEffect(() => {
    if (!contest) return;
    const fetchProblem = async () => {
      setLoadingProblem(true);
      setRunResult(null);
      setSubmitResult(null);
      try {
        const pid = contest.problems[activeIdx]._id;
        const { data } = await axiosClient.get(`/problem/problemById/${pid}`);
        setProblemDetails(data);
        const match = data.startCode.find(
          sc => normalizeLang(sc.language) === normalizeLang(language)
        );
        setCode(match?.initialCode || '');
      } catch (err) {
        console.error('Failed to load problem', err);
      } finally {
        setLoadingProblem(false);
      }
    };
    fetchProblem();
  }, [activeIdx, contest]);

  // ── 5. Language change → swap stub ──
  useEffect(() => {
    if (problemDetails) {
      const match = problemDetails.startCode.find(
        sc => normalizeLang(sc.language) === normalizeLang(language)
      );
      setCode(match?.initialCode || '');
    }
  }, [language, problemDetails]);

  // ── 6. Track per-problem time ──
  useEffect(() => {
    if (!contest || showResults) return;
    const pid = contest.problems[activeIdx]._id;
    activeTimeStartRef.current = Date.now();

    return () => {
      if (activeTimeStartRef.current) {
        const elapsed = Math.floor((Date.now() - activeTimeStartRef.current) / 1000);
        setProblemTimes(prev => ({
          ...prev,
          [pid]: (prev[pid] || 0) + elapsed,
        }));
        activeTimeStartRef.current = null;
      }
    };
  }, [activeIdx, contest, showResults]);

  const exitContest = () => {
    localStorage.removeItem('contestResults');
    navigate('/dashboard');
  };

  const handleRun = async () => {
    if (!problemDetails) return;
    setRunning(true);
    setRunResult(null);
    try {
      const res = await axiosClient.post(`/submission/run/${problemDetails._id}`, { code, language });
      setRunResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problemDetails) return;
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await axiosClient.post(`/submission/submit/${problemDetails._id}`, { code, language });
      setSubmitResult(res.data);
      if (res.data.accepted) {
        setSolvedProblems(prev => ({ ...prev, [problemDetails._id]: true }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── RESULTS ──
  if (showResults && finalResults) {
    const solvedCount = finalResults.problems.filter(p => p.solved).length;
    const totalScore = finalResults.problems
      .filter(p => p.solved)
      .reduce((s, p) => s + (SCORE_MAP[p.difficulty] || 0), 0);
    const maxScore = finalResults.problems.reduce((s, p) => s + (SCORE_MAP[p.difficulty] || 0), 0);

    // ✅ FIX: build listIds for prev/next navigation in ProblemPage
    const contestListIds = finalResults.problems.map(p => p._id);

    return (
      <div className="min-h-screen bg-[#07070a] text-white selection:bg-violet-500/30">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full"
               style={{ background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.1), transparent 70%)' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
              <Trophy size={28} className="text-violet-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Contest Complete</h1>
            <p className="text-[13.5px] text-white/40 mt-2 capitalize">
              Topic: {finalResults.topic === 'random' ? 'Random Mix' : finalResults.topic}
              {' · '}
              {finalResults.timeLimit} minute contest
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
              <div className="text-[11px] text-white/40 uppercase tracking-wide mb-1">Solved</div>
              <div className="text-2xl font-bold text-emerald-400">{solvedCount}<span className="text-white/30 text-base"> / {finalResults.problems.length}</span></div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
              <div className="text-[11px] text-white/40 uppercase tracking-wide mb-1">Score</div>
              <div className="text-2xl font-bold text-violet-400">{totalScore}<span className="text-white/30 text-base"> / {maxScore}</span></div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
              <div className="text-[11px] text-white/40 uppercase tracking-wide mb-1">Time Used</div>
              <div className="text-2xl font-bold text-white">{fmtTimeLong(finalResults.totalTime)}</div>
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
                {finalResults.problems.map((p, i) => {
                  const attempted = p.timeSpent > 0;
                  return (
                    <tr key={p._id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="px-5 py-3 text-[13px] text-white/30 font-mono">{i + 1}</td>
                      <td className="px-3 py-3 text-[13.5px] font-medium text-white/90">{p.title}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10.5px] font-bold uppercase tracking-wide border ${DIFF_STYLE[p.difficulty]}`}>
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
                        {/* ✅ FIX: pass listIds + source so prev/next & back work */}
                        <Link
                          to={`/problem/${p._id}`}
                          state={{
                            listIds: contestListIds,
                            source: { type: 'contest', name: 'Contest Results' },
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

          <div className="flex justify-center gap-3">
            <button
              onClick={exitContest}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 text-[13px] font-medium transition-colors"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── LOADING ──
  if (!contest || loadingProblem) {
    return (
      <div className="min-h-screen bg-[#07070a] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-violet-500" />
      </div>
    );
  }

  // ── LIVE CONTEST ──
  return (
    <div className="h-screen flex flex-col bg-[#07070a] text-white">
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.08] bg-[#0d1117]">
      <div className="md:hidden flex border-b border-white/[0.08] bg-[#0d1117] shrink-0">
        <button
          onClick={() => setMobileView('problem')}
          className={`flex-1 py-2.5 text-[13px] font-medium transition-colors border-b-2 ${
            mobileView === 'problem'
              ? 'text-white border-violet-500'
              : 'text-white/50 border-transparent'
          }`}
        >
          Problem
        </button>
        <button
          onClick={() => setMobileView('code')}
          className={`flex-1 py-2.5 text-[13px] font-medium transition-colors border-b-2 ${
            mobileView === 'code'
              ? 'text-white border-violet-500'
              : 'text-white/50 border-transparent'
          }`}
        >
          Code
        </button>
      </div>
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-semibold text-white/90">Virtual Contest</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">Live</span>
        </div>

        <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
          <Clock size={16} className={timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-violet-400'} />
          <span className={`font-mono text-[15px] font-bold ${timeLeft < 300 ? 'text-rose-500' : 'text-white'}`}>
            {fmtTime(timeLeft)}
          </span>
        </div>

        <button
          onClick={() => { if (window.confirm('End contest early?')) handleEndContest(); }}
          className="flex items-center gap-1.5 text-[12px] text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-md hover:bg-rose-500/10 transition-colors"
        >
          <LogOut size={14} /> End Contest
        </button>
      </div>

    <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        <div className={`${mobileView === 'problem' ? 'flex' : 'hidden'} md:flex md:w-1/2 flex-col flex-1 min-h-0 border-r border-white/[0.08] bg-[#07070a]`}>
          <div className="flex p-2 gap-2 border-b border-white/[0.08] bg-[#0d1117]">
            {contest.problems.map((p, idx) => {
              const isSolved = solvedProblems[p._id];
              return (
                <button
                  key={p._id}
                  onClick={() => setActiveIdx(idx)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-medium transition-all ${
                    activeIdx === idx
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                      : 'bg-white/[0.02] text-white/50 hover:bg-white/[0.06]'
                  }`}
                >
                  {isSolved ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Circle size={13} className="opacity-50" />}
                  Q{idx + 1}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-xl font-bold">{problemDetails.title}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${DIFF_STYLE[problemDetails.difficulty] || DIFF_STYLE.medium}`}>
                {problemDetails.difficulty}
              </span>
            </div>

            <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-white/70 leading-relaxed">
              {problemDetails.description}
            </div>

            {problemDetails.visibleTestCases?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-[13px] font-semibold text-white/70 uppercase tracking-wide mb-3">Examples</h3>
                <div className="space-y-3">
                  {problemDetails.visibleTestCases.map((tc, i) => (
                    <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                      <div className="text-[11px] text-violet-400 font-mono mb-2">Example {i + 1}</div>
                      <div className="text-[12.5px] font-mono text-white/80 space-y-1.5">
                        <div className="flex gap-2">
                          <span className="text-white/40 flex-shrink-0 w-14">Input:</span>
                          <span className="whitespace-pre-wrap">{tc.input}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-white/40 flex-shrink-0 w-14">Output:</span>
                          <span className="whitespace-pre-wrap">{tc.output}</span>
                        </div>
                        {tc.explanation && (
                          <div className="flex gap-2 pt-1">
                            <span className="text-white/40 flex-shrink-0 w-14">Why:</span>
                            <span className="text-white/55 italic">{tc.explanation}</span>
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

        <div className={`${mobileView === 'code' ? 'flex' : 'hidden'} md:flex md:w-1/2 flex-col flex-1 min-h-0 bg-[#0d1117]`}>
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.08]">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border border-white/[0.1] rounded-md px-2 py-1 text-[12px] text-white/80 outline-none"
              style={{ colorScheme: 'dark' }}
            >
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          <div className="flex-1">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              value={code}
              onChange={(val) => setCode(val || '')}
              theme="vs-dark"
              options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on' }}
            />
          </div>

          <div className="h-64 border-t border-white/[0.08] flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 bg-[#07070a] border-b border-white/[0.08]">
              <span className="text-[12px] font-semibold text-white/60">Test Results</span>
              <div className="flex gap-2">
                <button
                  onClick={handleRun}
                  disabled={running || submitting}
                  className="flex items-center gap-1 px-3 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] text-[12px] text-white/80 transition-colors disabled:opacity-50"
                >
                  {running ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />} Run
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={running || submitting}
                  className="flex items-center gap-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-[12px] text-white transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Submit
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {submitResult && (
                <div className={`p-3 rounded-lg border mb-3 ${submitResult.accepted ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                  <h3 className={`text-[13px] font-bold ${submitResult.accepted ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {submitResult.accepted ? 'Accepted' : 'Wrong Answer'}
                  </h3>
                  <p className="text-[11px] text-white/50 mt-1">
                    {submitResult.passedTestCases} / {submitResult.totalTestCases} test cases passed
                  </p>
                </div>
              )}

              {runResult && !submitResult && (
                <div className="space-y-2">
                  <p className="text-[11px] text-white/50">
                    {runResult.success ? 'All visible tests passed' : 'Some tests failed'}
                  </p>
                  {runResult.testCases?.map((tc, i) => (
                    <div key={i} className="p-2 rounded bg-white/[0.02] border border-white/[0.06] text-[11px] font-mono">
                      <div className="text-white/40 mb-1">
                        Test {i + 1}: {tc.status_id === 3 ? '✅ Passed' : '❌ Failed'}
                      </div>
                      <div>In: {tc.stdin || '(empty)'}</div>
                      <div>Out: {tc.stdout || '(empty)'}</div>
                      {tc.expected_output && <div>Exp: {tc.expected_output}</div>}
                    </div>
                  ))}
                </div>
              )}

              {!runResult && !submitResult && (
                <div className="h-full flex items-center justify-center text-[13px] text-white/20">
                  Run or submit code to see results
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
console.log('🔵 VERSION: clean-nav-v5');

/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useParams, useLocation, NavLink, useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';
import MockInterview from '../components/MockInterview';

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
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const [fetchError, setFetchError] = useState(null);
  const [solution, setSolution] = useState(null);
  const [solutionLoading, setSolutionLoading] = useState(false);
  const [solutionError, setSolutionError] = useState(null);
  const editorRef = useRef(null);

  // Sync URL param to local state (only if user navigates via Homepage or direct URL)
  useEffect(() => {
    setCurrentProblemId(urlProblemId);
  }, [urlProblemId]);

  // Fetch all problems once for navigation
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setAllProblems(data);
      } catch (e) {
        console.error('Failed to load navigation', e);
      }
    };
    fetchAll();
  }, []);

  // Compute prev/next from filtered list OR global
  useEffect(() => {
    if (allProblems.length === 0) return;

    let list;
    if (location.state?.listIds && Array.isArray(location.state.listIds)) {
      list = location.state.listIds
        .map((id) => allProblems.find((p) => p._id === id))
        .filter(Boolean);
    } else {
      list = [...allProblems].sort(
        (a, b) => (a.problemNumber || 9999) - (b.problemNumber || 9999)
      );
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

  // Fetch problem data
  useEffect(() => {
    if (!currentProblemId) return;
    const fetchProblem = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const response = await axiosClient.get(`/problem/problemById/${currentProblemId}`);
        setProblem(response.data);
        const match = response.data.startCode.find(
          (sc) => sc.language.toLowerCase() === selectedLanguage.toLowerCase()
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

  // Sync code when language changes
  useEffect(() => {
    if (problem) {
      const match = problem.startCode.find(
        (sc) => sc.language.toLowerCase() === selectedLanguage.toLowerCase()
      );
      setCode(match?.initialCode || '');
    }
  }, [selectedLanguage, problem]);

  // Reset solution cache on problem change
  useEffect(() => {
    setSolution(null);
    setSolutionError(null);
  }, [currentProblemId]);

  // Fetch solution lazily
  useEffect(() => {
    if (
      activeLeftTab === 'solutions' &&
      solution === null &&
      solutionError === null &&
      !solutionLoading
    ) {
      fetchSolution();
    }
  }, [activeLeftTab, currentProblemId]);

  const handleEditorChange = (value) => setCode(value || '');
  const handleEditorDidMount = (editor) => { editorRef.current = editor; };
  const handleLanguageChange = (language) => setSelectedLanguage(language);

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
    try {
      const response = await axiosClient.post(`/submission/run/${currentProblemId}`, {
        code,
        language: selectedLanguage,
      });
      setRunResult(response.data);
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({ success: false, error: 'Internal server error' });
    } finally {
      setRunning(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const response = await axiosClient.post(`/submission/submit/${currentProblemId}`, {
        code,
        language: selectedLanguage,
      });
      setSubmitResult(response.data);
      if (response.data.accepted) {
        setSolution(null);
        setSolutionError(null);
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult({
        accepted: false,
        error: error.response?.data || 'Internal server error',
        passedTestCases: 0,
        totalTestCases: 0,
      });
    } finally {
      setSubmitting(false);
      setActiveRightTab('result');
    }
  };

  // Bypass React Router. Update state manually and replace URL.
  const goToProblem = (id) => {
  if (!id) return;
  
  // DO NOT touch window.history at all. Not pushState, not replaceState.
  // Some browsers/extensions treat replaceState as a real navigation and add
  // a history entry anyway. The only guaranteed way to keep history clean
  // is to leave the URL untouched and drive everything through React state.
  setCurrentProblemId(id);
  setActiveLeftTab('description');
  setRunResult(null);
  setSubmitResult(null);
   navigate(`/problem/${id}`, {
    replace: true,
    state: location.state,
  });
};

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'python': return 'python';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'python';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="alert alert-error max-w-md">
          <span>Failed to load problem: {String(fetchError)}</span>
        </div>
      </div>
    );
  }

  const allPassed = runResult?.testCases?.length > 0 && runResult.testCases.every((tc) => tc.status_id === 3);
  const passedCount = runResult?.testCases?.filter((tc) => tc.status_id === 3).length || 0;
  const totalCount = runResult?.testCases?.length || 0;

  return (
    <div className="h-screen flex bg-base-100">
      {/* LEFT PANEL */}
      <div className="w-1/2 flex flex-col border-r border-base-300">
        <div className="tabs tabs-bordered bg-base-200 px-4">
        <NavLink
  to="/"
  className="flex items-center gap-1 px-3 py-1 my-auto mr-2 rounded text-[11px] text-base-content/50 hover:text-primary hover:bg-base-300 transition-colors self-center flex-shrink-0"
>
  <ArrowLeft size={12} /> Home
</NavLink>
          <button className={`tab ${activeLeftTab === 'description' ? 'tab-active' : ''}`} onClick={() => setActiveLeftTab('description')}>Description</button>
          <button className={`tab ${activeLeftTab === 'editorial' ? 'tab-active' : ''}`} onClick={() => setActiveLeftTab('editorial')}>Editorial</button>
          <button className={`tab ${activeLeftTab === 'solutions' ? 'tab-active' : ''}`} onClick={() => setActiveLeftTab('solutions')}>Solutions</button>
          <button className={`tab ${activeLeftTab === 'submissions' ? 'tab-active' : ''}`} onClick={() => setActiveLeftTab('submissions')}>Submissions</button>
          <button className={`tab ${activeLeftTab === 'chatAI' ? 'tab-active' : ''}`} onClick={() => setActiveLeftTab('chatAI')}>ChatAI</button>
          <button className={`tab ${activeLeftTab === 'mockInterview' ? 'tab-active' : ''}`} onClick={() => setActiveLeftTab('mockInterview')}>Mock Interview</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 relative">
          {problem && (
            <>
              <div className={activeLeftTab === 'description' ? 'block' : 'hidden'}>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-base-200">
                  <div className="flex items-center gap-2">
                    {navigation.prev ? (
                      <button onClick={() => goToProblem(navigation.prev._id)} className="flex items-center gap-1 text-[12px] text-base-content/60 hover:text-primary px-2 py-1 rounded hover:bg-base-200 transition-colors">
                        <ArrowLeft size={14} /> Prev
                      </button>
                    ) : <div className="w-16" />}
                    <span className="text-[12px] text-base-content/40 font-mono">
                      {problem.problemNumber ? `#${problem.problemNumber}` : ''}
                    </span>
                    {navigation.next ? (
                      <button onClick={() => goToProblem(navigation.next._id)} className="flex items-center gap-1 text-[12px] text-base-content/60 hover:text-primary px-2 py-1 rounded hover:bg-base-200 transition-colors">
                        Next <ArrowRight size={14} />
                      </button>
                    ) : <div className="w-16" />}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-3 flex-wrap">
                  <h1 className="text-2xl font-bold">{problem.title}</h1>
                  <div className={`badge badge-outline ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                  </div>
                  <div className="badge badge-primary">{problem.tags}</div>
                </div>
                <ProblemCompanyBadges companies={problem.companies} />

                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {problem.description}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Examples:</h3>
                  <div className="space-y-4">
                    {problem.visibleTestCases.map((example, index) => (
                      <div key={index} className="bg-base-200 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Example {index + 1}:</h4>
                        <div className="space-y-2 text-sm font-mono">
                          <div><strong>Input:</strong> {example.input}</div>
                          <div><strong>Output:</strong> {example.output}</div>
                          <div><strong>Explanation:</strong> {example.explanation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {activeLeftTab === 'editorial' && (
  <div>
    <Editorial resources={problem.editorialResources} onAskAI={() => setActiveLeftTab('chatAI')} />
  </div>
)}

              <div className={activeLeftTab === 'solutions' ? 'block' : 'hidden'}>
                <h2 className="text-xl font-bold mb-4">Solutions</h2>
                {solutionLoading && <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg"></span></div>}
                {!solutionLoading && solutionError && (
                  <div className="alert alert-warning">
                    <div className="w-full"><p className="font-semibold">Locked</p><p className="text-sm">{solutionError}</p></div>
                  </div>
                )}
                {!solutionLoading && !solutionError && solution && solution.length > 0 && (
                  <div className="space-y-6">
                    {solution.map((s, index) => (
                      <div key={index} className="border border-base-300 rounded-lg overflow-hidden">
                        <div className="bg-base-200 px-4 py-2"><h3 className="font-semibold">{problem.title} — {s.language}</h3></div>
                        <div className="p-4"><pre className="bg-base-300 p-4 rounded text-sm overflow-x-auto"><code>{s.completeCode}</code></pre></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={activeLeftTab === 'submissions' ? 'block' : 'hidden'}>
                <h2 className="text-xl font-bold mb-4">My Submissions</h2>
                <SubmissionHistory problemId={currentProblemId} />
              </div>

              <div className={activeLeftTab === 'chatAI' ? 'block' : 'hidden'}>
                <h2 className="text-xl font-bold mb-4">CHAT with AI</h2>
                <ChatAi problem={problem} />
              </div>

              <div className={activeLeftTab === 'mockInterview' ? 'block' : 'hidden'}>
                <h2 className="text-xl font-bold mb-4">AI Mock Interview</h2>
                <MockInterview problem={problem} language={selectedLanguage} code={code} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-1/2 flex flex-col">
        <div className="tabs tabs-bordered bg-base-200 px-4">
          <button className={`tab ${activeRightTab === 'code' ? 'tab-active' : ''}`} onClick={() => setActiveRightTab('code')}>Code</button>
          <button className={`tab ${activeRightTab === 'testcase' ? 'tab-active' : ''}`} onClick={() => setActiveRightTab('testcase')}>Testcase</button>
          <button className={`tab ${activeRightTab === 'result' ? 'tab-active' : ''}`} onClick={() => setActiveRightTab('result')}>Result</button>
        </div>

        <div className="flex-1 flex flex-col">
          {activeRightTab === 'code' && (
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-base-300">
                <div className="flex gap-2">
                  {['python', 'java', 'cpp'].map((lang) => (
                    <button key={lang} className={`btn btn-sm ${selectedLanguage === lang ? 'btn-primary' : 'btn-ghost'}`} onClick={() => handleLanguageChange(lang)}>
                      {lang === 'cpp' ? 'C++' : lang === 'python' ? 'Python' : 'Java'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <Editor height="100%" language={getLanguageForMonaco(selectedLanguage)} value={code} onChange={handleEditorChange} onMount={handleEditorDidMount} theme="vs-dark" options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true, tabSize: 2, insertSpaces: true, wordWrap: 'on', lineNumbers: 'on', glyphMargin: false, folding: true, lineDecorationsWidth: 10, lineNumbersMinChars: 3, renderLineHighlight: 'line', selectOnLineNumbers: true, roundedSelection: false, readOnly: false, cursorStyle: 'line', mouseWheelZoom: true }} />
              </div>
              <div className="p-4 border-t border-base-300 flex justify-between">
                <button className="btn btn-ghost btn-sm" onClick={() => setActiveRightTab('testcase')}>Console</button>
                <div className="flex gap-2">
                  <button className={`btn btn-outline btn-sm ${running ? 'loading' : ''}`} onClick={handleRun} disabled={running || submitting}>Run</button>
                  <button className={`btn btn-primary btn-sm ${submitting ? 'loading' : ''}`} onClick={handleSubmitCode} disabled={running || submitting}>Submit</button>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'testcase' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {runResult ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${allPassed ? 'bg-success/15' : 'bg-error/15'}`}>
                        <span className={`text-lg font-bold ${allPassed ? 'text-success' : 'text-error'}`}>{allPassed ? '✓' : '✗'}</span>
                      </div>
                      <div>
                        <h3 className={`font-semibold ${allPassed ? 'text-success' : 'text-error'}`}>{allPassed ? 'All tests passed' : 'Some tests failed'}</h3>
                        <p className="text-xs text-base-content/50">{passedCount} of {totalCount} test case{totalCount !== 1 ? 's' : ''} passed</p>
                      </div>
                    </div>
                  </div>
                  {totalCount > 0 && (
                    <div className="space-y-3">
                      {runResult.testCases.map((tc, i) => {
                        const passed = tc.status_id === 3;
                        return (
                          <div key={i} className={`rounded-lg border-l-4 bg-base-200/50 ${passed ? 'border-l-success' : 'border-l-error'}`}>
                            <div className="flex items-center justify-between px-4 py-2 border-b border-base-300/60">
                              <span className="text-xs font-medium text-base-content/70">Test case {i + 1}</span>
                              <span className={`text-xs font-medium ${passed ? 'text-success' : 'text-error'}`}>{passed ? 'Passed' : 'Failed'}</span>
                            </div>
                            <div className="p-4 space-y-2 text-xs font-mono">
                              <div className="flex gap-3"><span className="text-base-content/50 w-16">Input</span><span className="flex-1">{tc.stdin || '(empty)'}</span></div>
                              <div className="flex gap-3"><span className="text-base-content/50 w-16">Expected</span><span className="flex-1">{tc.expected_output || '(empty)'}</span></div>
                              <div className="flex gap-3"><span className="text-base-content/50 w-16">Output</span><span className={`flex-1 ${!tc.stdout ? 'italic text-base-content/40' : ''}`}>{tc.stdout || '(empty)'}</span></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : <div className="text-center py-20 text-base-content/40">Click "Run" to test your code</div>}
            </div>
          )}

          {activeRightTab === 'result' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {submitResult ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${submitResult.accepted ? 'bg-success/15' : 'bg-error/15'}`}>
                      <span className={`text-xl font-bold ${submitResult.accepted ? 'text-success' : 'text-error'}`}>{submitResult.accepted ? '✓' : '✗'}</span>
                    </div>
                    <div><h3 className={`text-lg font-bold ${submitResult.accepted ? 'text-success' : 'text-error'}`}>{submitResult.accepted ? 'Accepted' : 'Submission Failed'}</h3></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-base-200 rounded-lg p-3"><div className="text-[10px] text-base-content/50 mb-1">Test Cases</div><div className="font-mono text-base font-semibold">{submitResult.passedTestCases}/{submitResult.totalTestCases}</div></div>
                    <div className="bg-base-200 rounded-lg p-3"><div className="text-[10px] text-base-content/50 mb-1">Runtime</div><div className="font-mono text-base font-semibold">{(submitResult.runtime ?? 0).toFixed(3)}s</div></div>
                    <div className="bg-base-200 rounded-lg p-3"><div className="text-[10px] text-base-content/50 mb-1">Memory</div><div className="font-mono text-base font-semibold">{submitResult.memory ?? 0} KB</div></div>
                  </div>
                  {!submitResult.accepted && (submitResult.error || submitResult.errorMessage) && (
                    <div className="rounded-lg border-l-4 border-l-error bg-error/5 p-4 text-xs font-mono text-base-content/80">
                      {submitResult.error || submitResult.errorMessage}
                    </div>
                  )}
                </>
              ) : <div className="text-center py-20 text-base-content/40">Click "Submit" to evaluate your code</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function ProblemCompanyBadges({ companies = [] }) {
  const [expanded, setExpanded] = useState(false);
  const all = (companies || []).filter((c) => c.timeframe === 'all').sort((a, b) => b.frequency - a.frequency);
  if (all.length === 0) return null;
  const visible = expanded ? all : all.slice(0, 5);
  const hidden = all.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-6">
      <span className="text-[11px] text-base-content/40 mr-0.5">Asked at:</span>
      {visible.map((c) => (
        <span key={c.name} className="px-2 py-0.5 rounded-md text-[10.5px] font-medium text-primary bg-primary/10 border border-primary/20">
          🏢 {c.name} · {c.frequency.toFixed(0)}%
        </span>
      ))}
      {hidden > 0 && <button type="button" onClick={() => setExpanded(true)} className="px-2 py-0.5 rounded-md text-[10.5px] font-medium text-base-content/50 bg-base-200 border border-base-300">+{hidden} more</button>}
      {expanded && <button type="button" onClick={() => setExpanded(false)} className="text-[10.5px] text-base-content/40">show less</button>}
    </div>
  );
}

export default ProblemPage;
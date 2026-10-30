/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from '../components/ChatAi';
import MockInterview from '../components/MockInterview';
import Editorial from '../components/Editorial';

// Helper to normalize language names between UI and DB
const normalizeLang = (lang) => {
  const l = lang?.toLowerCase() || '';
  if (l === 'cpp' || l === 'c++') return 'c++';
  return l;
};

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
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
  const { problemId } = useParams();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
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
  }, [problemId]);

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
  }, [problemId]);

  useEffect(() => {
    if (
      activeLeftTab === 'solutions' &&
      solution === null &&
      solutionError === null &&
      !solutionLoading
    ) {
      fetchSolution();
    }
  }, [activeLeftTab]);

  const handleEditorChange = (value) => setCode(value || '');
  const handleEditorDidMount = (editor) => { editorRef.current = editor; };
  const handleLanguageChange = (language) => setSelectedLanguage(language);

  const fetchSolution = async () => {
    setSolutionLoading(true);
    setSolutionError(null);
    try {
      const { data } = await axiosClient.get(`/problem/solution/${problemId}`);
      setSolution(data.referenceSolution || []);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data ||
        'Could not load solutions';
      setSolutionError(String(msg));
    } finally {
      setSolutionLoading(false);
    }
  };

  const handleRun = async () => {
    setRunning(true);
    setRunResult(null);
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
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
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
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

  const allPassed =
    runResult?.testCases?.length > 0 &&
    runResult.testCases.every((tc) => tc.status_id === 3);

  const passedCount =
    runResult?.testCases?.filter((tc) => tc.status_id === 3).length || 0;
  const totalCount = runResult?.testCases?.length || 0;

  return (
    <div className="h-screen flex bg-base-100">
      {/* ===================== LEFT PANEL ===================== */}
      <div className="w-1/2 flex flex-col border-r border-base-300">
        <div className="tabs tabs-bordered bg-base-200 px-4">
          <button className={`tab ${activeLeftTab === 'description' ? 'tab-active' : ''}`} onClick={() => setActiveLeftTab('description')}>Description</button>
          <button className={`tab ${activeLeftTab === 'editorial' ? 'tab-active' : ''}`} onClick={() => setActiveLeftTab('editorial')}>Editorial</button>
          <button className={`tab ${activeLeftTab === 'solutions' ? 'tab-active' : ''}`} onClick={() => setActiveLeftTab('solutions')}>Solutions</button>
          <button className={`tab ${activeLeftTab === 'submissions' ? 'tab-active' : ''}`} onClick={() => setActiveLeftTab('submissions')}>Submissions</button>
          <button className={`tab ${activeLeftTab === 'chatAI' ? 'tab-active' : ''}`} onClick={() => setActiveLeftTab('chatAI')}>ChatAI</button>
          <button className={`tab ${activeLeftTab === 'mockInterview' ? 'tab-active' : ''}`} onClick={() => setActiveLeftTab('mockInterview')}>Mock Interview</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {problem && (
            <>
              {activeLeftTab === 'description' && (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <h1 className="text-2xl font-bold">{problem.title}</h1>
                    <div className={`badge badge-outline ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                    </div>
                    <div className="badge badge-primary">{problem.tags}</div>
                  </div>

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
              )}

              {activeLeftTab === 'editorial' && (
                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold mb-4">Editorial</h2>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} />
                  </div>
                </div>
              )}

              {activeLeftTab === 'solutions' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Solutions</h2>

                  {solutionLoading && (
                    <div className="flex justify-center py-12">
                      <span className="loading loading-spinner loading-lg"></span>
                    </div>
                  )}

                  {!solutionLoading && solutionError && (
                    <div className="alert alert-warning">
                      <div className="w-full">
                        <p className="font-semibold">Locked</p>
                        <p className="text-sm">{solutionError}</p>
                        <button
                          className="btn btn-sm btn-ghost mt-2"
                          onClick={() => {
                            setSolutionError(null);
                            fetchSolution();
                          }}
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  )}

                  {!solutionLoading && !solutionError && solution && solution.length > 0 && (
                    <div className="space-y-6">
                      {solution.map((s, index) => (
                        <div key={index} className="border border-base-300 rounded-lg overflow-hidden">
                          <div className="bg-base-200 px-4 py-2 flex items-center justify-between">
                            <h3 className="font-semibold">{problem.title} — {s.language}</h3>
                            <span className="badge badge-primary badge-sm">{s.language}</span>
                          </div>
                          <div className="p-4">
                            <pre className="bg-base-300 p-4 rounded text-sm overflow-x-auto">
                              <code>{s.completeCode}</code>
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!solutionLoading && !solutionError && solution && solution.length === 0 && (
                    <p className="text-gray-500">No solutions available for this problem.</p>
                  )}
                </div>
              )}

              {activeLeftTab === 'submissions' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">My Submissions</h2>
                  <div className="text-gray-500">
                    <SubmissionHistory problemId={problemId} />
                  </div>
                </div>
              )}

              {activeLeftTab === 'chatAI' && (
                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold mb-4">CHAT with AI</h2>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    <ChatAi problem={problem} />
                  </div>
                </div>
              )}
              {activeLeftTab === 'mockInterview' && (
              <div>
                <h2 className="text-xl font-bold mb-4">AI Mock Interview</h2>
                  <MockInterview problem={problem} language={selectedLanguage} />
              </div>
            )}
            </>
          )}
        </div>
      </div>

      {/* ===================== RIGHT PANEL ===================== */}
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
                    <button
                      key={lang}
                      className={`btn btn-sm ${selectedLanguage === lang ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {lang === 'cpp' ? 'C++' : lang === 'python' ? 'Python' : 'Java'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
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

              <div className="p-4 border-t border-base-300 flex justify-between">
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-sm" onClick={() => setActiveRightTab('testcase')}>
                    Console
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`btn btn-outline btn-sm ${running ? 'loading' : ''}`}
                    onClick={handleRun}
                    disabled={running || submitting}
                  >
                    Run
                  </button>
                  <button
                    className={`btn btn-primary btn-sm ${submitting ? 'loading' : ''}`}
                    onClick={handleSubmitCode}
                    disabled={running || submitting}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'testcase' && (
            <div className="flex-1 overflow-y-auto">
              {runResult ? (
                <div className="p-5 space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        allPassed ? 'bg-success/15' : 'bg-error/15'
                      }`}>
                        <span className={`text-lg font-bold ${allPassed ? 'text-success' : 'text-error'}`}>
                          {allPassed ? '✓' : '✗'}
                        </span>
                      </div>
                      <div>
                        <h3 className={`font-semibold ${allPassed ? 'text-success' : 'text-error'}`}>
                          {allPassed ? 'All tests passed' : 'Some tests failed'}
                        </h3>
                        <p className="text-xs text-base-content/50">
                          {passedCount} of {totalCount} test case{totalCount !== 1 ? 's' : ''} passed
                        </p>
                      </div>
                    </div>
                    {totalCount > 0 && (
                      <div className="flex gap-5 text-right flex-shrink-0">
                        <div>
                          <div className="text-[10px] uppercase tracking-wide text-base-content/50">Runtime</div>
                          <div className="font-mono text-sm">{runResult.runtime ?? 0}s</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wide text-base-content/50">Memory</div>
                          <div className="font-mono text-sm">{runResult.memory ?? 0} KB</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {totalCount === 0 && runResult.error && (
                    <div className="rounded-lg border-l-4 border-l-error bg-error/5 p-4">
                      <div className="text-sm text-error">{runResult.error}</div>
                    </div>
                  )}

                  {totalCount > 0 && (
                    <div className="space-y-3">
                      {runResult.testCases.map((tc, i) => {
                        const passed = tc.status_id === 3;
                        return (
                          <div
                            key={i}
                            className={`rounded-lg border-l-4 bg-base-200/50 ${
                              passed ? 'border-l-success' : 'border-l-error'
                            }`}
                          >
                            <div className="flex items-center justify-between px-4 py-2 border-b border-base-300/60">
                              <span className="text-xs font-medium text-base-content/70">
                                Test case {i + 1}
                              </span>
                              <span className={`text-xs font-medium ${passed ? 'text-success' : 'text-error'}`}>
                                {passed ? 'Passed' : 'Failed'}
                              </span>
                            </div>
                            <div className="p-4 space-y-2 text-xs font-mono">
                              <div className="flex gap-3">
                                <span className="text-base-content/50 w-16 flex-shrink-0 select-none">Input</span>
                                <span className="whitespace-pre-wrap break-all flex-1">
                                  {tc.stdin || <span className="text-base-content/30 italic">(empty)</span>}
                                </span>
                              </div>
                              <div className="flex gap-3">
                                <span className="text-base-content/50 w-16 flex-shrink-0 select-none">Expected</span>
                                <span className="whitespace-pre-wrap break-all flex-1">
                                  {tc.expected_output || <span className="text-base-content/30 italic">(empty)</span>}
                                </span>
                              </div>
                              <div className="flex gap-3">
                                <span className="text-base-content/50 w-16 flex-shrink-0 select-none">Output</span>
                                <span className={`whitespace-pre-wrap break-all flex-1 ${!tc.stdout ? 'text-base-content/40 italic' : ''}`}>
                                  {tc.stdout || '(empty)'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-base-content/40 gap-2">
                  <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center">
                    <span className="text-2xl">▶</span>
                  </div>
                  <p className="text-sm">Click "Run" to test your code</p>
                </div>
              )}
            </div>
          )}

          {activeRightTab === 'result' && (
            <div className="flex-1 overflow-y-auto">
              {submitResult ? (
                <div className="p-5 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                      submitResult.accepted ? 'bg-success/15' : 'bg-error/15'
                    }`}>
                      <span className={`text-xl font-bold ${submitResult.accepted ? 'text-success' : 'text-error'}`}>
                        {submitResult.accepted ? '✓' : '✗'}
                      </span>
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${submitResult.accepted ? 'text-success' : 'text-error'}`}>
                        {submitResult.accepted ? 'Accepted' : 'Submission Failed'}
                      </h3>
                      <p className="text-xs text-base-content/50">
                        Your submission has been evaluated
                      </p>
                    </div>
                  </div>

                  <div className="divider my-0"></div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-base-200 rounded-lg p-3">
                      <div className="text-[10px] uppercase tracking-wide text-base-content/50 mb-1">
                        Test Cases
                      </div>
                      <div className="font-mono text-base font-semibold">
                        {submitResult.passedTestCases}
                        <span className="text-base-content/40">/</span>
                        {submitResult.totalTestCases}
                      </div>
                    </div>
                    <div className="bg-base-200 rounded-lg p-3">
                      <div className="text-[10px] uppercase tracking-wide text-base-content/50 mb-1">
                        Runtime
                      </div>
                      <div className="font-mono text-base font-semibold">
                        {(submitResult.runtime ?? 0).toFixed(3)}s
                      </div>
                    </div>
                    <div className="bg-base-200 rounded-lg p-3">
                      <div className="text-[10px] uppercase tracking-wide text-base-content/50 mb-1">
                        Memory
                      </div>
                      <div className="font-mono text-base font-semibold">
                        {submitResult.memory ?? 0} KB
                      </div>
                    </div>
                  </div>

                  {!submitResult.accepted &&
                    (submitResult.error || submitResult.errorMessage) && (
                      <div className="rounded-lg border-l-4 border-l-error bg-error/5">
                        <div className="px-4 py-2 border-b border-error/20">
                          <span className="text-xs font-medium text-error">Error Details</span>
                        </div>
                        <pre className="p-4 text-xs font-mono whitespace-pre-wrap text-base-content/80">
                          {submitResult.error || submitResult.errorMessage}
                        </pre>
                      </div>
                    )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-base-content/40 gap-2">
                  <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center">
                    <span className="text-2xl">↗</span>
                  </div>
                  <p className="text-sm">Click "Submit" to evaluate your code</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;
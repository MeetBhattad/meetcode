/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
import { useState, useRef, useEffect, useCallback } from 'react';
import axiosClient from '../utils/axiosClient';
import {
  Settings, Volume2, VolumeX, Mic, MicOff, Send, Loader2, Play,
  Sparkles, Clock, X, Award, TrendingUp, AlertTriangle, CheckCircle2
} from 'lucide-react';

export default function MockInterview({ problem, language = 'python', code = '' }) {
  const [started, setStarted] = useState(false);
  const [starting, setStarting] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const [muted, setMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const [inputMode, setInputMode] = useState('type');
  const [typedInput, setTypedInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [support, setSupport] = useState({ stt: false, tts: false });

  const [report, setReport] = useState(null);
  const [ending, setEnding] = useState(false);

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ── Restore active session on mount ─────────────────────
  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      try {
        const { data } = await axiosClient.get(`/mock/active/${problem._id}`);
        if (cancelled) return;
        if (data.active) {
          setSessionId(data.sessionId);
          setMessages(data.messages || []);
          setStarted(true);
          if (data.startedAt) {
            const elapsed = Math.floor((Date.now() - new Date(data.startedAt).getTime()) / 1000);
            setTimeElapsed(Math.max(0, elapsed));
          }
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          console.warn('[mock] restore failed:', err.response?.status, err.response?.data || err.message);
        }
      } finally {
        if (!cancelled) setRestoring(false);
      }
    };
    restore();
    return () => { cancelled = true; };
  }, [problem._id]);

  // ── Voice setup ─────────────────────────────────────────
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupport({ stt: !!SR, tts: 'speechSynthesis' in window });
    if (!SR) setInputMode('type');
    const loadVoices = () => {
      const v = window.speechSynthesis?.getVoices() || [];
      if (v.length > 0) {
        setVoices(v);
        const pref = v.find(x => x.lang.startsWith('en') && x.name.includes('Google')) ||
                     v.find(x => x.lang.startsWith('en-US')) || v[0];
        if (pref) setSelectedVoice(prev => prev || pref.name);
      }
    };
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
  }, []);

  // ── Timer ───────────────────────────────────────────────
  useEffect(() => {
    if (!started || report) return;
    const i = setInterval(() => setTimeElapsed(p => p + 1), 1000);
    return () => clearInterval(i);
  }, [started, report]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  useEffect(() => () => {
    window.speechSynthesis?.cancel();
    if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {}
  }, []);

  // ── TTS ─────────────────────────────────────────────────
    const speak = useCallback((text, onComplete) => {
    // No TTS available, or muted, or empty text — finish immediately
    if (!text || muted || !window.speechSynthesis) {
      if (onComplete) onComplete();
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.0; u.pitch = 1.0;
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) u.voice = voice;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => {
      setIsSpeaking(false);
      if (onComplete) onComplete();
    };
    u.onerror = () => {
      setIsSpeaking(false);
      if (onComplete) onComplete();
    };
    window.speechSynthesis.speak(u);
  }, [muted, voices, selectedVoice]);

  const stopSpeaking = () => { window.speechSynthesis?.cancel(); setIsSpeaking(false); };

  // ── STT ─────────────────────────────────────────────────
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return setError('Speech recognition not supported.');
    const r = new SR();
    r.continuous = true; r.interimResults = true; r.lang = 'en-US';

    r.onresult = (e) => {
      let f = '', i = '';
      for (let k = e.resultIndex; k < e.results.length; k++) {
        const res = e.results[k];
        if (res.isFinal) f += res[0].transcript + ' ';
        else i += res[0].transcript;
      }
      if (f) { setTypedInput(p => p + f); setInterim(''); } else setInterim(i);
    };
    r.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      setError(`Mic: ${e.error}`);
      setIsListening(false);
      if (e.error === 'network') setInputMode('type');
    };
    r.onend = () => { if (recognitionRef.current) try { r.start(); } catch {} };

    try {
      r.start();
      recognitionRef.current = r;
      setIsListening(true);
      setError(null);
    } catch (e) { setError('Mic: ' + e.message); }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      const r = recognitionRef.current;
      recognitionRef.current = null;
      try { r.stop(); } catch {}
    }
    setIsListening(false);
    setInterim('');
  };

  // ── Start ───────────────────────────────────────────────
  const startInterview = async () => {
    setStarting(true); setError(null);
    try {
      const { data } = await axiosClient.post('/mock/start', {
        problemId: problem._id, language,
      });
      setSessionId(data.sessionId);
      setMessages(data.messages || []);
      setStarted(true);
      setReport(null);
      if (data.resumed && data.startedAt) {
        const elapsed = Math.floor((Date.now() - new Date(data.startedAt).getTime()) / 1000);
        setTimeElapsed(Math.max(0, elapsed));
      } else {
        setTimeElapsed(0);
      }
      const opening = data.messages?.find(m => m.role === 'interviewer');
      if (opening && !data.resumed) setTimeout(() => speak(opening.text), 500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start');
    } finally { setStarting(false); }
  };

  // ── Send with code + handle AI-initiated end ────────────
  const submitAnswer = async () => {
    const text = typedInput.trim();
    if (!text || !sessionId || isThinking) return;
    stopSpeaking(); stopListening();

    setMessages(prev => [...prev, { role: 'user', text, timestamp: new Date().toISOString() }]);
    setTypedInput(''); setInterim('');
    setIsThinking(true); setError(null);

    try {
      const { data } = await axiosClient.post('/mock/message', {
        sessionId, text, code,
      });
      setMessages(data.messages || []);

              if (data.sessionEnded && data.report) {
        const showReport = () => {
          setReport(data.report);
          setStarted(false);
        };

        if (data.reply && !muted) {
          // Primary: show report when the farewell TTS finishes
          // Safety net: force after 20s if TTS never fires onend
          let shown = false;
          const safeShow = () => {
            if (shown) return;
            shown = true;
            showReport();
          };
          speak(data.reply, safeShow);
          setTimeout(safeShow, 20000);
        } else {
          setTimeout(showReport, 800);
        }
      } else if (data.reply) {
        setTimeout(() => speak(data.reply), 300);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send');
    } finally { setIsThinking(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isListening) {
      e.preventDefault(); submitAnswer();
    }
  };

  // ── End interview (user-initiated) ──────────────────────
  const endInterview = async () => {
    if (!sessionId) return;
    if (!window.confirm('End this interview and generate a report?')) return;

    stopSpeaking(); stopListening();
    setEnding(true); setError(null);
    try {
      const { data } = await axiosClient.post('/mock/end', { sessionId });
      setReport(data.report);
      setStarted(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to end');
    } finally { setEnding(false); }
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const latestInterviewerMsg = [...messages].reverse().find(m => m.role === 'interviewer');

  // ═══════════════════════════════════════════════════════
  // RENDER: LOADING (restore check)
  // ═══════════════════════════════════════════════════════
  if (restoring) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117] p-12 flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-500" size={28} />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // RENDER: REPORT
  // ═══════════════════════════════════════════════════════
  if (report) {
    const verdictColors = {
      strong_hire: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      hire: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      borderline: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      no_hire: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    };
    const verdictLabel = {
      strong_hire: 'Strong Hire',
      hire: 'Hire',
      borderline: 'Borderline',
      no_hire: 'No Hire',
    };
    const vc = verdictColors[report.verdict] || verdictColors.borderline;

    return (
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117] p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Interview Report</h2>
            <p className="text-[13px] text-white/40 mt-1">{problem.title}</p>
          </div>
          <button
            onClick={() => { setReport(null); setStarted(false); setMessages([]); setSessionId(null); }}
            className="text-[12px] text-white/40 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/[0.05]"
          >
            Start New
          </button>
        </div>

        <div className={`rounded-xl border ${vc} px-5 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <Award size={24} />
            <div>
              <div className="text-[11px] uppercase tracking-wide opacity-70">Verdict</div>
              <div className="text-lg font-bold">{verdictLabel[report.verdict]}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wide opacity-70">Overall</div>
            <div className="text-3xl font-bold">{report.overallScore}<span className="text-sm opacity-60">/10</span></div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {Object.entries(report.scores || {}).map(([k, v]) => (
            <div key={k} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
              <div className="text-[10px] text-white/40 uppercase tracking-wide mb-1">
                {k.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className="text-xl font-bold text-white">{v}<span className="text-[11px] text-white/30">/10</span></div>
              <div className="mt-1.5 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full ${v >= 7 ? 'bg-emerald-500' : v >= 5 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  style={{ width: `${(v / 10) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span className="text-[12px] font-semibold text-emerald-400 uppercase tracking-wide">Strengths</span>
            </div>
            <ul className="space-y-1.5">
              {(report.strengths || []).map((s, i) => (
                <li key={i} className="text-[13px] text-white/70 flex gap-2">
                  <span className="text-emerald-500">•</span> {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-amber-400" />
              <span className="text-[12px] font-semibold text-amber-400 uppercase tracking-wide">Improvements</span>
            </div>
            <ul className="space-y-1.5">
              {(report.improvements || []).map((s, i) => (
                <li key={i} className="text-[13px] text-white/70 flex gap-2">
                  <span className="text-amber-500">•</span> {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="text-[11px] text-white/40 uppercase tracking-wide mb-2">Summary</div>
          <p className="text-[13.5px] text-white/80 leading-relaxed">{report.summary}</p>
        </div>

        <div className="text-[11px] text-white/30 flex items-center gap-1.5 justify-center pt-2">
          <AlertTriangle size={11} /> AI-generated feedback. Use it as a starting point, not a final judgment.
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // RENDER: PRE-START
  // ═══════════════════════════════════════════════════════
  if (!started) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-[13px] text-rose-300">
            {error} <button onClick={() => setError(null)} className="ml-2 underline opacity-70">dismiss</button>
          </div>
        )}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117] p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-500 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_-5px] shadow-violet-500/50">
              <Sparkles size={28} className="text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Ready for your interview?</h3>
            <p className="text-[13.5px] text-white/50 max-w-sm mx-auto mb-8 leading-relaxed">
              You'll be interviewed by an AI senior engineer on <strong className="text-white/90">{problem.title}</strong>.
              Write code in the editor — the AI will see it and ask about it.
            </p>
            <button
              onClick={startInterview}
              disabled={starting}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-[14px] font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-violet-600/30"
            >
              {starting ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              {starting ? 'Connecting...' : 'Join Interview'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // RENDER: LIVE INTERVIEW
  // ═══════════════════════════════════════════════════════
  return (
    <div className="flex flex-col rounded-2xl border border-white/[0.06] bg-[#0d1117] h-[calc(100vh-200px)] min-h-[600px] overflow-hidden shadow-2xl">

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.08] bg-black/20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[11px] font-bold text-rose-400 tracking-wider">LIVE</span>
          </div>
          <span className="text-[13px] text-white/50 font-mono">{formatTime(timeElapsed)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowTranscript(s => !s)} className="px-2.5 py-1 rounded-md text-[11px] text-white/50 hover:text-white hover:bg-white/[0.06]">
            {showTranscript ? 'Hide' : 'Transcript'}
          </button>
          <button
            onClick={() => { if (isSpeaking) stopSpeaking(); setMuted(m => !m); }}
            className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/[0.06]"
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button onClick={() => setShowSettings(s => !s)} className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/[0.06]">
            <Settings size={16} />
          </button>
          <button
            onClick={endInterview}
            disabled={ending}
            className="ml-1 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-600/10 hover:bg-rose-600/20 disabled:opacity-50 text-rose-400 text-[12px] font-medium border border-rose-600/20"
          >
            {ending ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
            {ending ? 'Generating...' : 'End'}
          </button>
        </div>
      </div>

      {showSettings && voices.length > 0 && (
        <div className="px-5 py-3 border-b border-white/[0.08] bg-black/40">
          <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full max-w-sm bg-[#0d1117] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white/90 outline-none"
            style={{ colorScheme: 'dark' }}>
            {voices.map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
          </select>
        </div>
      )}

      {/* Main video + subtitle area */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1b26] to-[#0d1117]">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center border transition-all duration-300 ${
            isSpeaking
              ? 'bg-violet-500/40 border-violet-500/60 animate-pulse shadow-[0_0_50px_-10px] shadow-violet-500 scale-110'
              : 'bg-violet-500/20 border-violet-500/30'
          }`}>
            <span className={`text-4xl font-bold ${isSpeaking ? 'text-white' : 'text-violet-400/50'}`}>AI</span>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent pointer-events-none" />

        {/* Transcript panel */}
        {showTranscript && (
          <div className="absolute top-0 left-0 right-0 bottom-32 overflow-y-auto bg-black/70 backdrop-blur-md p-4 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`text-[13px] ${m.role === 'interviewer' ? 'text-violet-300' : 'text-white/60'}`}>
                <span className="text-[10px] uppercase tracking-wide opacity-50 mr-2">{m.role}:</span>
                {m.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Subtitle bubble */}
        {!showTranscript && (
          <div className="absolute bottom-6 left-0 right-0 px-6 flex justify-center">
            <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 max-w-2xl w-full shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[12px] font-bold text-violet-300">AI</span>
                </div>
                <div className="flex-1">
                  {isThinking ? (
                    <div className="flex items-center gap-1.5 h-6">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <p className="text-[15px] text-white/95 leading-relaxed font-medium">
                      {latestInterviewerMsg?.text || "Let's begin."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-white/[0.08] bg-[#0d1117] p-4">
        {error && (
          <div className="mb-3 text-[12px] text-rose-400 text-center bg-rose-500/10 py-1.5 rounded-md">
            {error} <button onClick={() => setError(null)} className="underline ml-2">dismiss</button>
          </div>
        )}
        <div className="max-w-4xl mx-auto">
          {inputMode === 'speak' ? (
            <div className="flex items-center gap-3">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-semibold transition-all ${
                  isListening
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_-5px] shadow-rose-500/50 animate-pulse'
                    : 'bg-white/[0.06] hover:bg-white/[0.1] text-white/80'
                }`}
              >
                {isListening ? <><MicOff size={18} /> Stop & Send</> : <><Mic size={18} /> Hold to Speak</>}
              </button>
              <button onClick={() => { stopListening(); setInputMode('type'); }}
                className="px-4 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 text-[13px]">
                ⌨ Type
              </button>
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <textarea
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer..."
                rows={1}
                className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-white/90 outline-none focus:border-violet-500/50 resize-none min-h-[48px] max-h-[120px]"
              />
              {support.stt && (
                <button onClick={() => setInputMode('speak')}
                  className="w-12 h-12 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 flex items-center justify-center">
                  <Mic size={18} />
                </button>
              )}
              <button
                onClick={submitAnswer}
                disabled={!typedInput.trim() || isThinking}
                className="w-12 h-12 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 text-white flex items-center justify-center shadow-lg shadow-violet-600/20"
              >
                <Send size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
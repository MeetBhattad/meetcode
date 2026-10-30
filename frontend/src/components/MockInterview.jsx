/* eslint-disable no-empty */
import { useState, useRef, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import { Settings, Volume2, VolumeX, Mic, MicOff, Send, Loader2, Play, Sparkles } from 'lucide-react';

export default function MockInterview({ problem, language = 'python' }) {
  // Session
  const [started, setStarted] = useState(false);
  const [starting, setStarting] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState(null);

  // Voice
  const [muted, setMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Input
  const [inputMode, setInputMode] = useState('type');
  const [typedInput, setTypedInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [support, setSupport] = useState({ stt: false, tts: false });

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ── Setup voices + support detection ─────────────────────
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupport({ stt: !!SpeechRecognition, tts: 'speechSynthesis' in window });
    if (!SpeechRecognition) setInputMode('type');

    const loadVoices = () => {
      const v = window.speechSynthesis?.getVoices() || [];
      if (v.length > 0) {
        setVoices(v);
        const preferred =
          v.find(x => x.lang.startsWith('en') && x.name.includes('Google')) ||
          v.find(x => x.lang.startsWith('en-US')) ||
          v[0];
        if (preferred) setSelectedVoice(prev => prev || preferred.name);
      }
    };
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
  }, []);

  // ── Auto-scroll ─────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isThinking]);

  // ── Cleanup on unmount ──────────────────────────────────
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

  // ── TTS ─────────────────────────────────────────────────
  const speak = (text) => {
    if (muted || !window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.0;
    u.pitch = 1.0;
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) u.voice = voice;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  // ── STT ─────────────────────────────────────────────────
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported. Use Chrome/Edge or switch to typed.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let final = '', inter = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) final += r[0].transcript + ' ';
        else inter += r[0].transcript;
      }
      if (final) {
        setTypedInput(prev => prev + final);
        setInterim('');
      } else {
        setInterim(inter);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      setError(`Mic error: ${event.error}. ${event.error === 'network' ? 'Try Chrome, or use typed input.' : ''}`);
      setIsListening(false);
      recognitionRef.current = null;
      if (event.error === 'network') setInputMode('type');
    };

    recognition.onend = () => {
      if (recognitionRef.current) {
        try { recognition.start(); } catch {}
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      setError(null);
    } catch (e) {
      setError('Could not start microphone: ' + e.message);
    }
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

  // ── Start interview ─────────────────────────────────────
  const startInterview = async () => {
    setStarting(true);
    setError(null);
    try {
      const { data } = await axiosClient.post('/mock/start', {
        problemId: problem._id,
        language,
      });
      setSessionId(data.sessionId);
      setMessages(data.messages || []);
      setStarted(true);

      // Speak the opening message
      const opening = data.messages?.find(m => m.role === 'interviewer');
      if (opening) setTimeout(() => speak(opening.text), 300);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start interview');
    } finally {
      setStarting(false);
    }
  };

  // ── Send a message ──────────────────────────────────────
  const submitAnswer = async () => {
    const text = typedInput.trim();
    if (!text || !sessionId || isThinking) return;
    stopSpeaking();
    stopListening();

    // Optimistic user message
    const userMsg = { role: 'user', text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setTypedInput('');
    setInterim('');
    setIsThinking(true);
    setError(null);

    try {
      const { data } = await axiosClient.post('/mock/message', {
        sessionId,
        text,
      });
      // Trust the full messages array from the backend
      setMessages(data.messages || []);
      // Speak the latest interviewer reply
      if (data.reply) setTimeout(() => speak(data.reply), 200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isListening) {
      e.preventDefault();
      submitAnswer();
    }
  };

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  // Pre-start screen
  if (!started) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-[13px] text-rose-300">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline opacity-70">dismiss</button>
          </div>
        )}

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-violet-500/15 flex items-center justify-center mx-auto mb-5">
            <Sparkles size={24} className="text-violet-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Ready for your interview?</h3>
          <p className="text-[13px] text-white/50 max-w-sm mx-auto mb-6 leading-relaxed">
            You'll be interviewed by an AI senior engineer on <strong className="text-white/80">{problem.title}</strong>.
            Walk through your approach before coding — just like the real thing.
          </p>
          <button
            onClick={startInterview}
            disabled={starting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-[13px] font-medium transition-colors"
          >
            {starting ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            {starting ? 'Starting...' : 'Start Interview'}
          </button>

          <div className="mt-6 pt-4 border-t border-white/[0.04] text-[11px] text-white/30">
            Tip: use Chrome or Edge for voice. Brave blocks speech recognition.
          </div>
        </div>
      </div>
    );
  }

  // Chat screen
  return (
    <div className="flex flex-col rounded-xl border border-white/[0.06] bg-white/[0.02] h-[calc(100vh-260px)] min-h-[500px]">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-violet-400 animate-pulse' : 'bg-emerald-400'}`} />
          <span className="text-[13px] font-medium text-white/90">AI Interviewer</span>
          {isSpeaking && <span className="text-[11px] text-violet-400">speaking…</span>}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { if (isSpeaking) stopSpeaking(); setMuted(m => !m); }}
            className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <button
            onClick={() => setShowSettings(s => !s)}
            className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Settings"
          >
            <Settings size={15} />
          </button>
        </div>
      </div>

      {/* Settings drawer */}
      {showSettings && voices.length > 0 && (
        <div className="px-4 py-3 border-b border-white/[0.06] bg-black/20">
          <label className="text-[11px] text-white/40 block mb-1.5 uppercase tracking-wide">Voice</label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full bg-[#0d1117] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white/90 outline-none focus:border-violet-500/50"
            style={{ colorScheme: 'dark' }}
          >
            {voices.map(v => (
              <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
            ))}
          </select>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold ${
                m.role === 'interviewer'
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'bg-white/[0.08] text-white/60'
              }`}
            >
              {m.role === 'interviewer' ? 'AI' : 'You'}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-violet-600 text-white rounded-tr-sm'
                  : 'bg-white/[0.06] text-white/90 rounded-tl-sm'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold bg-violet-500/20 text-violet-300">
              AI
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-white/[0.06] px-4 py-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 border-t border-white/[0.06] bg-rose-500/5 text-[12px] text-rose-300">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline opacity-70">dismiss</button>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/[0.06] p-3">
        {inputMode === 'speak' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isListening ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
              title={isListening ? 'Stop' : 'Start speaking'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <div className="flex-1 rounded-lg bg-[#0d1117] border border-white/[0.08] px-3 py-2 min-h-[40px] flex items-center">
              <span className="text-[13px] text-white/90 font-mono">
                {typedInput}
                <span className="text-white/40">{interim}</span>
                {isListening && !typedInput && !interim && <span className="text-white/30 italic">Listening…</span>}
                {isListening && <span className="animate-pulse text-violet-400">▍</span>}
              </span>
            </div>
            <button
              onClick={submitAnswer}
              disabled={!typedInput.trim() || isThinking}
              className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
            >
              <Send size={16} />
            </button>
            {support.stt && (
              <button
                onClick={() => { stopListening(); setInputMode('type'); }}
                className="text-[11px] text-white/40 hover:text-white px-2"
                title="Switch to typing"
              >
                ⌨
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <textarea
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer… (Enter to send)"
              rows={2}
              className="flex-1 bg-[#0d1117] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white/90 outline-none focus:border-violet-500/50 resize-none font-mono"
            />
            {support.stt && (
              <button
                onClick={() => setInputMode('speak')}
                className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white/70 flex items-center justify-center transition-colors"
                title="Switch to speaking"
              >
                <Mic size={16} />
              </button>
            )}
            <button
              onClick={submitAnswer}
              disabled={!typedInput.trim() || isThinking}
              className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
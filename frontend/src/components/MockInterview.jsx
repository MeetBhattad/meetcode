/* eslint-disable no-empty */
import { useState, useRef, useEffect } from 'react';

export default function MockInterview({ problem }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [error, setError] = useState(null);
  const [support, setSupport] = useState({ stt: false, tts: false });
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [inputMode, setInputMode] = useState('speak'); // 'speak' | 'type'
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const hasSTT = !!SpeechRecognition;
    setSupport({
      stt: hasSTT,
      tts: 'speechSynthesis' in window,
    });
    // If STT not supported, default to typed input
    if (!hasSTT) setInputMode('type');

    const loadVoices = () => {
      const v = window.speechSynthesis?.getVoices() || [];
      if (v.length > 0) {
        setVoices(v);
        const preferred =
          v.find(x => x.lang.startsWith('en') && x.name.includes('Google')) ||
          v.find(x => x.lang.startsWith('en-US')) ||
          v[0];
        if (preferred) setSelectedVoice(preferred.name);
      }
    };
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
  }, []);

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      setIsSpeaking(false);
      setError('TTS error: ' + e.error);
    };
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported. Use Chrome/Edge or switch to typed input.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let final = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) final += result[0].transcript + ' ';
        else interim += result[0].transcript;
      }
      if (final) {
        setTranscript(prev => prev + final);
        setInterimTranscript('');
      } else {
        setInterimTranscript(interim);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      setError('STT error: ' + event.error + '. Try Chrome or use typed input.');
      setIsListening(false);
      // Auto-fall back to typed mode on network error
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
      setError('Could not start recognition: ' + e.message);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      const ref = recognitionRef.current;
      recognitionRef.current = null;
      try { ref.stop(); } catch {}
    }
    setIsListening(false);
    setInterimTranscript('');
  };

  const submitTyped = () => {
    const text = typedInput.trim();
    if (!text) return;
    setTranscript(prev => prev + text + ' ');
    setTypedInput('');
  };

  const handleTypedKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitTyped();
    }
  };

  return (
    <div className="space-y-4">
      {!support.tts && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-[13px] text-amber-300">
          ⚠️ Speech Synthesis not supported in this browser.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-[13px] text-rose-300">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline opacity-70">dismiss</button>
        </div>
      )}

      {/* ─── Test 1: AI Voice ─── */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h3 className="text-[14px] font-semibold text-white mb-1">1. AI Voice</h3>
        <p className="text-[12px] text-white/40 mb-4">
          Click to hear the AI speak. This is how the interviewer will sound.
        </p>

        {voices.length > 0 && (
          <div className="mb-3">
            <label className="text-[11px] text-white/40 block mb-1.5 uppercase tracking-wide">Voice</label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full bg-[#0d1117] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white/90 outline-none focus:border-violet-500/50"
              style={{ colorScheme: 'dark' }}
            >
              {voices.map(v => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => speak(`Let's work on ${problem?.title || 'this problem'}. Walk me through your approach before you start coding.`)}
            disabled={isSpeaking}
            className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-[13px] font-medium transition-colors"
          >
            {isSpeaking ? '🔊 Speaking...' : '🔊 Speak Test Phrase'}
          </button>
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[13px] font-medium transition-colors"
            >
              Stop
            </button>
          )}
        </div>
      </div>

      {/* ─── Test 2: Your Answer ─── */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="text-[14px] font-semibold text-white mb-1">2. Your Answer</h3>
            <p className="text-[12px] text-white/40">
              Speak or type — both work. This is what the AI will hear.
            </p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 mb-4 p-1 rounded-lg bg-black/30 border border-white/[0.06] w-fit">
          <button
            onClick={() => setInputMode('speak')}
            disabled={!support.stt}
            className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
              inputMode === 'speak'
                ? 'bg-violet-600 text-white'
                : 'text-white/50 hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed'
            }`}
          >
            🎙 Speak
          </button>
          <button
            onClick={() => setInputMode('type')}
            className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
              inputMode === 'type'
                ? 'bg-violet-600 text-white'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            ⌨ Type
          </button>
        </div>

        {!support.stt && inputMode === 'speak' && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-[12px] text-amber-300 mb-3">
            Speech recognition isn't available in this browser (Brave blocks it). Switch to <strong>Type</strong> mode — it works identically.
          </div>
        )}

        {/* Speak mode controls */}
        {inputMode === 'speak' && support.stt && (
          <button
            onClick={isListening ? stopListening : startListening}
            className={`px-4 py-2 rounded-lg text-white text-[13px] font-medium transition-colors ${
              isListening ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            {isListening ? '⏹ Stop Listening' : '🎙 Start Listening'}
          </button>
        )}

        {/* Type mode controls */}
        {inputMode === 'type' && (
          <div className="flex gap-2">
            <textarea
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              onKeyDown={handleTypedKeyDown}
              placeholder="Type your answer... (Enter to submit, Shift+Enter for newline)"
              rows={3}
              className="flex-1 bg-[#0d1117] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white/90 outline-none focus:border-violet-500/50 resize-y font-mono"
            />
            <button
              onClick={submitTyped}
              disabled={!typedInput.trim()}
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-[13px] font-medium transition-colors self-end"
            >
              Send
            </button>
          </div>
        )}

        {/* Transcript */}
        {(transcript || interimTranscript) && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] text-white/40 uppercase tracking-wide">Transcript</span>
              <button
                onClick={() => { setTranscript(''); setInterimTranscript(''); }}
                className="text-[11px] text-white/40 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="rounded-lg bg-black/40 border border-white/[0.06] p-3 font-mono text-[13px] min-h-[80px] text-white/90 leading-relaxed">
              {transcript}
              <span className="text-white/40">{interimTranscript}</span>
              {isListening && <span className="animate-pulse text-violet-400">▍</span>}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-white/[0.01] p-3 text-[12px] text-white/40">
        <strong className="text-white/60">Why both modes?</strong> Real users have accents, quiet offices, or use Brave. Every serious interview platform (interviewing.io, Pramp) supports typed answers. The AI receives the same transcript either way.
      </div>
    </div>
  );
}
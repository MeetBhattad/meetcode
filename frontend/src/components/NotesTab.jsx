/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import axiosClient from '../utils/axiosClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Loader2, CheckCircle2, AlertCircle, Eye, Edit3 } from 'lucide-react';

export default function NotesTab({ problemId }) {
  const [content, setContent] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [savedAt, setSavedAt] = useState(null);
  const [mode, setMode] = useState('edit');

  const lastSavedRef = useRef('');
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      try {
        const { data } = await axiosClient.get(`/note/${problemId}`);
        if (cancelled) return;
        setContent(data.content || '');
        lastSavedRef.current = data.content || '';
      } catch (err) {
        if (!cancelled) setLoadError('Failed to load note');
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [problemId]);

  useEffect(() => {
    if (!loaded) return;
    if (content === lastSavedRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSaving(true);
      setSaveError(null);
      try {
        await axiosClient.put(`/note/${problemId}`, { content });
        lastSavedRef.current = content;
        setSavedAt(new Date());
      } catch {
        setSaveError('Failed to save');
      } finally {
        setSaving(false);
      }
    }, 1500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [content, loaded, problemId]);

  if (!loaded) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-violet-500" size={24} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-[13px] text-rose-300">
        <AlertCircle size={16} /> {loadError}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold">My Notes</h2>
          {saving && (
            <span className="flex items-center gap-1 text-[11px] text-white/40">
              <Loader2 size={11} className="animate-spin" /> Saving...
            </span>
          )}
          {!saving && savedAt && !saveError && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400/70">
              <CheckCircle2 size={11} /> Saved
            </span>
          )}
          {saveError && (
            <span className="flex items-center gap-1 text-[11px] text-rose-400">
              <AlertCircle size={11} /> {saveError}
            </span>
          )}
        </div>
        <div className="flex gap-0.5 bg-white/[0.04] rounded-lg p-0.5">
          <button
            onClick={() => setMode('edit')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors ${
              mode === 'edit' ? 'bg-white/[0.08] text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <Edit3 size={12} /> Write
          </button>
          <button
            onClick={() => setMode('preview')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors ${
              mode === 'preview' ? 'bg-white/[0.08] text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <Eye size={12} /> Preview
          </button>
        </div>
      </div>

      {mode === 'edit' ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your notes here... (Markdown + LaTeX supported)"
          className="w-full flex-1 bg-white/[0.02] border border-white/[0.06] rounded-lg p-4 text-[13.5px] text-white/90 outline-none focus:border-violet-500/50 resize-none font-mono leading-relaxed min-h-[400px]"
        />
      ) : (
        <div className="flex-1 overflow-y-auto bg-white/[0.02] border border-white/[0.06] rounded-lg p-4 min-h-[400px]">
          {content.trim() ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-[13px] text-white/30 italic">Nothing to preview yet.</p>
          )}
        </div>
      )}

      <p className="mt-2 text-[11px] text-white/30">
        Notes autosave 1.5s after you stop typing · Markdown + LaTeX supported
      </p>
    </div>
  );
}
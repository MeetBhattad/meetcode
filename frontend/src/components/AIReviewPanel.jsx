import { useState } from 'react';
import axiosClient from '../utils/axiosClient';
import {
  Sparkles, Loader2, AlertCircle, Clock, HardDrive, TrendingUp,
  Lightbulb, Shield, Compass, Award, CheckCircle2,
} from 'lucide-react';

const SCORE_COLOR = (s) =>
  s >= 8 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  : s >= 6 ? 'text-violet-400 border-violet-500/30 bg-violet-500/10'
  : s >= 4 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
  : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

export default function AIReviewPanel({ submissionId, initialReview, onReviewComplete }) {
  const [review, setReview] = useState(initialReview || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReview = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosClient.post(`/ai-review/${submissionId}`);
      setReview(data.review);
      onReviewComplete?.(data.review);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate review');
    } finally {
      setLoading(false);
    }
  };

  // ── Idle state — show button ──
  if (!review && !loading && !error) {
    return (
      <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.06] to-transparent p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} className="text-violet-400" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white">Get an AI review of this solution</p>
              <p className="text-[11px] text-white/50">Complexity, code quality, edge cases, and interview verdict.</p>
            </div>
          </div>
          <button
            onClick={fetchReview}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[12.5px] font-medium transition-colors flex-shrink-0"
          >
            <Sparkles size={13} /> Review
          </button>
        </div>
      </div>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 flex flex-col items-center gap-3">
        <Loader2 size={24} className="animate-spin text-violet-400" />
        <p className="text-[13px] text-white/60">Analyzing your code…</p>
        <p className="text-[11px] text-white/30">Usually takes 3–8 seconds</p>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
        <div className="flex items-start gap-2.5">
          <AlertCircle size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[13px] text-rose-300 font-medium">{error}</p>
            <button
              onClick={fetchReview}
              className="mt-2 text-[12px] text-rose-400 hover:text-rose-300 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Review display ──
  const scoreClass = SCORE_COLOR(review.overallScore);

  return (
    <div className="space-y-3">
      {/* Header + score */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} className="text-violet-400" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white">AI Code Review</p>
            <p className="text-[11px] text-white/40">Powered by Groq + Gemini</p>
          </div>
        </div>
        <div className={`flex flex-col items-center justify-center rounded-xl border px-4 py-2 ${scoreClass}`}>
          <span className="text-[9px] uppercase tracking-wider font-bold opacity-70">Score</span>
          <span className="text-2xl font-bold leading-none mt-0.5">
            {review.overallScore}<span className="text-[13px] opacity-50">/10</span>
          </span>
        </div>
      </div>

      {/* Complexity */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Clock size={12} className="text-violet-400" />
            <span className="text-[10.5px] font-semibold text-white/50 uppercase tracking-wide">Time</span>
          </div>
          <p className="text-[12px] text-white/85 leading-relaxed">{review.timeComplexity}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <HardDrive size={12} className="text-violet-400" />
            <span className="text-[10.5px] font-semibold text-white/50 uppercase tracking-wide">Space</span>
          </div>
          <p className="text-[12px] text-white/85 leading-relaxed">{review.spaceComplexity}</p>
        </div>
      </div>

      {/* Strengths */}
      {review.strengths.length > 0 && (
        <Section
          icon={<CheckCircle2 size={12} className="text-emerald-400" />}
          title="Strengths"
          items={review.strengths}
          dotColor="text-emerald-500"
          border="border-emerald-500/20 bg-emerald-500/[0.04]"
        />
      )}

      {/* Improvements */}
      {review.improvements.length > 0 && (
        <Section
          icon={<TrendingUp size={12} className="text-amber-400" />}
          title="Improvements"
          items={review.improvements}
          dotColor="text-amber-500"
          border="border-amber-500/20 bg-amber-500/[0.04]"
        />
      )}

      {/* Edge cases */}
      {review.edgeCases.length > 0 && (
        <Section
          icon={<Shield size={12} className="text-sky-400" />}
          title="Edge Cases to Consider"
          items={review.edgeCases}
          dotColor="text-sky-500"
          border="border-sky-500/20 bg-sky-500/[0.04]"
        />
      )}

      {/* Alternative approaches */}
      {review.alternativeApproaches.length > 0 && (
        <Section
          icon={<Compass size={12} className="text-violet-400" />}
          title="Alternative Approaches"
          items={review.alternativeApproaches}
          dotColor="text-violet-500"
          border="border-violet-500/20 bg-violet-500/[0.04]"
        />
      )}

      {/* Verdict */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Award size={12} className="text-violet-400" />
          <span className="text-[10.5px] font-semibold text-white/50 uppercase tracking-wide">Interviewer Verdict</span>
        </div>
        <p className="text-[12.5px] text-white/80 leading-relaxed">{review.interviewVerdict}</p>
      </div>

      <p className="text-[10.5px] text-white/25 text-center pt-1">
        AI-generated. Use as a starting point, not a final judgment.
      </p>
    </div>
  );
}

function Section({ icon, title, items, dotColor, border }) {
  return (
    <div className={`rounded-xl border p-3.5 ${border}`}>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-[10.5px] font-semibold text-white/60 uppercase tracking-wide">{title}</span>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-[12px] text-white/80 flex gap-2 leading-relaxed">
            <span className={`${dotColor} flex-shrink-0 mt-0.5`}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
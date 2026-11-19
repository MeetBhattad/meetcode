/* eslint-disable no-empty */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import axiosClient from "../utils/axiosClient";
import AIReviewPanel from "./AIReviewPanel";
import {
  CheckCircle2, XCircle, AlertCircle, Clock, Loader2,
  Code2, Sparkles, Copy, Check, X,
} from "lucide-react";

const STATUS_MAP = {
  accepted: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/25", label: "Accepted" },
  wrong:    { icon: XCircle,      color: "text-rose-400",    bg: "bg-rose-500/15 border-rose-500/25",       label: "Wrong Answer" },
  error:    { icon: AlertCircle,  color: "text-amber-400",   bg: "bg-amber-500/15 border-amber-500/25",     label: "Error" },
  pending:  { icon: Clock,        color: "text-sky-400",     bg: "bg-sky-500/15 border-sky-500/25",         label: "Pending" },
};

const LANG_LABEL = { python: "Python", java: "Java", cpp: "C++", "c++": "C++" };

const formatMemory = (kb) => {
  if (!kb && kb !== 0) return "—";
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
};

const timeAgo = (dateStr) => {
  const d = new Date(dateStr);
  const diffMin = Math.floor((Date.now() - d) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
};

export default function SubmissionHistory({ problemId }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("code");
  const [copied, setCopied] = useState(false);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to fetch submission history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubmissions(); }, [problemId]);

  const openSubmission = (sub, openTab = "code") => {
    setSelected(sub);
    setTab(openTab);
    setCopied(false);
  };

  const copyCode = async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(selected.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const handleReviewComplete = (review) => {
    setSelected(prev => prev ? { ...prev, aiReview: review } : prev);
    setSubmissions(prev => prev.map(s => s._id === selected?._id ? { ...s, aiReview: review } : s));
  };

  const total = submissions.length;
  const acceptedCount = submissions.filter(s => s.status === "accepted").length;
  const failedCount = submissions.filter(s => s.status === "wrong" || s.status === "error").length;
  const accuracy = total > 0 ? Math.round((acceptedCount / total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 size={24} className="animate-spin text-violet-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[13px] text-rose-300">
          <AlertCircle size={16} /> {error}
        </div>
        <button onClick={fetchSubmissions} className="text-[12px] text-rose-400 hover:text-rose-300 underline">
          Retry
        </button>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center">
          <Code2 size={24} className="text-white/30" />
        </div>
        <h3 className="text-[15px] font-semibold text-white">No submissions yet</h3>
        <p className="text-[12.5px] text-white/40 max-w-xs">
          Submit your first solution to see your history and get AI-powered feedback.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact stats bar */}
      <div className="grid grid-cols-4 gap-2">
        <MiniStat label="Total" value={total} />
        <MiniStat label="Accepted" value={acceptedCount} color="text-emerald-400" />
        <MiniStat label="Failed" value={failedCount} color="text-rose-400" />
        <MiniStat label="Accuracy" value={`${accuracy}%`} color="text-violet-400" />
      </div>

      {/* Submission cards */}
      <div className="space-y-2">
        {submissions.map((sub, i) => {
          const style = STATUS_MAP[sub.status] || STATUS_MAP.pending;
          const Icon = style.icon;
          const hasReview = !!sub.aiReview;
          const isAccepted = sub.status === "accepted";

          return (
            <div
              key={sub._id}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all p-3.5"
            >
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
                {/* Left: index + status icon */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className="text-[11px] text-white/25 font-mono w-5">#{i + 1}</span>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${style.bg}`}>
                    <Icon size={16} className={style.color} />
                  </div>
                </div>

                {/* Middle: language, status, meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] font-mono font-medium text-white/60 uppercase tracking-wide">
                      {LANG_LABEL[sub.language] || sub.language}
                    </span>
                    <span className={`text-[11.5px] font-semibold ${style.color}`}>{style.label}</span>
                    {hasReview && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-500/15 border border-violet-500/25 text-[10px] text-violet-300 font-medium">
                        <Sparkles size={9} /> AI Reviewed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11.5px] text-white/40 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> {sub.runtime?.toFixed(3) ?? "—"}s
                    </span>
                    <span>{formatMemory(sub.memory)}</span>
                    <span>{sub.testCasesPassed}/{sub.testCasesTotal} tests</span>
                    <span>{timeAgo(sub.createdAt)}</span>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto sm:ml-0">
                  <button
                    onClick={() => openSubmission(sub, "code")}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-[11.5px] font-medium transition-colors"
                  >
                    <Code2 size={12} />
                    <span className="hidden sm:inline">View</span>
                  </button>
                  {isAccepted && (
                    <button
                      onClick={() => openSubmission(sub, "ai")}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium transition-colors ${
                        hasReview
                          ? "bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30"
                          : "bg-violet-600 hover:bg-violet-500 text-white"
                      }`}
                    >
                      <Sparkles size={12} />
                      <span className="hidden sm:inline">{hasReview ? "Review" : "AI Review"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-white/[0.08] bg-[#0d1117] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-5 py-3.5 border-b border-white/[0.08]">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-[15px] font-semibold text-white">
                    Submission #{submissions.findIndex(s => s._id === selected._id) + 1}
                  </h3>
                  <span className={`text-[11px] font-semibold ${STATUS_MAP[selected.status]?.color}`}>
                    {STATUS_MAP[selected.status]?.label}
                  </span>
                </div>
                <p className="text-[11.5px] text-white/40 font-mono">
                  {LANG_LABEL[selected.language]} · {timeAgo(selected.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-white/40 hover:text-white p-1.5 rounded hover:bg-white/[0.06] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/[0.08] px-3">
              <button
                onClick={() => setTab("code")}
                className={`px-3 py-2.5 text-[12.5px] font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                  tab === "code"
                    ? "text-white border-violet-500"
                    : "text-white/50 border-transparent hover:text-white/80"
                }`}
              >
                <Code2 size={13} /> Code
              </button>
              {selected.status === "accepted" && (
                <button
                  onClick={() => setTab("ai")}
                  className={`px-3 py-2.5 text-[12.5px] font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                    tab === "ai"
                      ? "text-white border-violet-500"
                      : "text-white/50 border-transparent hover:text-white/80"
                  }`}
                >
                  <Sparkles size={13} /> AI Review
                  {selected.aiReview && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {tab === "code" ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-white/40 uppercase tracking-wide font-semibold">
                      Source
                    </span>
                    <button
                      onClick={copyCode}
                      className="flex items-center gap-1.5 text-[11.5px] text-white/50 hover:text-white transition-colors"
                    >
                      {copied ? (
                        <><Check size={11} className="text-emerald-400" /> Copied</>
                      ) : (
                        <><Copy size={11} /> Copy</>
                      )}
                    </button>
                  </div>
                  <pre className="bg-[#0a0c10] border border-white/[0.06] rounded-lg p-4 overflow-x-auto text-[12px] font-mono text-white/85 leading-relaxed">
                    <code>{selected.code}</code>
                  </pre>

                  {selected.errorMessage && (
                    <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3">
                      <p className="text-[11px] font-semibold text-rose-400 uppercase tracking-wide mb-1">
                        Error
                      </p>
                      <pre className="text-[11px] text-rose-200 whitespace-pre-wrap font-mono">
                        {selected.errorMessage}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <AIReviewPanel
                  submissionId={selected._id}
                  initialReview={selected.aiReview}
                  onReviewComplete={handleReviewComplete}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, color = "text-white" }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <div className="text-[9.5px] text-white/40 uppercase tracking-wider font-medium">{label}</div>
      <div className={`text-[16px] font-bold ${color} leading-tight mt-0.5`}>{value}</div>
    </div>
  );
}
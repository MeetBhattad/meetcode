/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import axiosClient from "../utils/axiosClient";

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosClient.get(
        `/problem/submittedProblem/${problemId}`
      );
      // Guard against legacy string responses
      setSubmissions(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError("Failed to fetch submission history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [problemId]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "accepted":
        return { badge: "badge-success", label: "Accepted" };
      case "wrong":
        return { badge: "badge-error", label: "Wrong Answer" };
      case "error":
        return { badge: "badge-warning", label: "Error" };
      case "pending":
        return { badge: "badge-info", label: "Pending" };
      default:
        return { badge: "badge-neutral", label: status };
    }
  };

  const formatMemory = (kb) => {
    if (!kb && kb !== 0) return "—";
    if (kb < 1024) return `${kb} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const now = new Date();
    const diffMin = Math.floor((now - d) / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
    return d.toLocaleString();
  };

  const copyCode = async () => {
    if (!selectedSubmission) return;
    try {
      await navigator.clipboard.writeText(selectedSubmission.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  // ── Derived stats ────────────────────────────────────────────
  const total = submissions.length;
  const acceptedCount = submissions.filter((s) => s.status === "accepted").length;
  const failedCount = submissions.filter(
    (s) => s.status === "wrong" || s.status === "error"
  ).length;
  const accuracy = total > 0 ? Math.round((acceptedCount / total) * 100) : 0;

  // ── Loading ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────
  if (error) {
    return (
      <div className="alert alert-error shadow-lg my-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current flex-shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{error}</span>
        <button className="btn btn-sm btn-ghost" onClick={fetchSubmissions}>
          Retry
        </button>
      </div>
    );
  }

  // ── Empty state ─────────────────────────────────────────────
  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
        <div className="rounded-full bg-base-200 p-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-base-content/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">No submissions yet</h3>
        <p className="text-sm text-base-content/60 max-w-xs">
          Submit your solution to see it appear here with runtime, memory, and
          full code.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* ── Stats ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total" value={total} color="text-base-content" />
        <StatCard label="Accepted" value={acceptedCount} color="text-success" />
        <StatCard label="Failed" value={failedCount} color="text-error" />
        <StatCard label="Accuracy" value={`${accuracy}%`} color="text-primary" />
      </div>

      {/* ── Table ──────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-lg border border-base-300">
        <table className="table table-zebra w-full">
          <thead className="bg-base-200">
            <tr>
              <th className="w-12">#</th>
              <th>Language</th>
              <th>Status</th>
              <th>Runtime</th>
              <th>Memory</th>
              <th>Tests</th>
              <th>Submitted</th>
              <th className="w-24">Code</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub, index) => {
              const { badge, label } = getStatusStyle(sub.status);
              return (
                <tr key={sub._id} className="hover">
                  <td className="text-base-content/60">{index + 1}</td>
                  <td>
                    <span className="badge badge-outline font-mono text-xs">
                      {sub.language}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${badge} badge-sm gap-1`}>
                      {sub.status === "accepted" && "✓"}
                      {sub.status === "wrong" && "✗"}
                      {sub.status === "error" && "!"}
                      {label}
                    </span>
                  </td>
                  <td className="font-mono text-sm">
                    {sub.runtime ? `${sub.runtime.toFixed(3)}s` : "—"}
                  </td>
                  <td className="font-mono text-sm">{formatMemory(sub.memory)}</td>
                  <td className="font-mono text-sm">
                    {sub.testCasesPassed}/{sub.testCasesTotal}
                  </td>
                  <td className="text-sm text-base-content/70">
                    {formatDate(sub.createdAt)}
                  </td>
                  <td>
                    <button
                      className="btn btn-xs btn-outline btn-primary"
                      onClick={() => {
                        setSelectedSubmission(sub);
                        setCopied(false);
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-base-content/50">
        Showing {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
      </p>

      {/* ── Modal ──────────────────────────────────────────────── */}
      {selectedSubmission && (
        <div
          className="modal modal-open"
          onClick={() => setSelectedSubmission(null)}
        >
          <div
            className="modal-box w-11/12 max-w-5xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">
                  Submission #{submissions.findIndex((s) => s._id === selectedSubmission._id) + 1}
                </h3>
                <p className="text-sm text-base-content/60 font-mono">
                  {selectedSubmission.language} · {formatDate(selectedSubmission.createdAt)}
                </p>
              </div>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setSelectedSubmission(null)}
              >
                ✕
              </button>
            </div>

            {/* Status badges row */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(() => {
                const { badge, label } = getStatusStyle(selectedSubmission.status);
                return <span className={`badge ${badge}`}>{label}</span>;
              })()}
              <span className="badge badge-outline">
                Runtime: {selectedSubmission.runtime?.toFixed(3) ?? "—"}s
              </span>
              <span className="badge badge-outline">
                Memory: {formatMemory(selectedSubmission.memory)}
              </span>
              <span className="badge badge-outline">
                Tests: {selectedSubmission.testCasesPassed}/
                {selectedSubmission.testCasesTotal}
              </span>
            </div>

            {/* Error message */}
            {selectedSubmission.errorMessage && (
              <div className="alert alert-error mb-4">
                <div>
                  <p className="font-semibold text-sm mb-1">Error</p>
                  <pre className="text-xs whitespace-pre-wrap font-mono">
                    {selectedSubmission.errorMessage}
                  </pre>
                </div>
              </div>
            )}

            {/* Code block */}
            <div className="flex-1 min-h-0 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Code</span>
                <button
                  className="btn btn-xs btn-ghost"
                  onClick={copyCode}
                  disabled={copied}
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-xs font-mono">
                <code>{selectedSubmission.code}</code>
              </pre>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-sm"
                onClick={() => setSelectedSubmission(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div className="stat bg-base-200 rounded-lg p-3">
    <div className="stat-title text-xs">{label}</div>
    <div className={`stat-value text-2xl ${color}`}>{value}</div>
  </div>
);

export default SubmissionHistory;
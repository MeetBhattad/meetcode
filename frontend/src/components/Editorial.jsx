import {
  ExternalLink, Youtube, FileText, Video as VideoIcon,
  BookOpen, Bot, ArrowRight, Sparkles, MessageSquare
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function parseYoutubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function getHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'external';
  }
}

function getFavicon(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────
export default function Editorial({ resources = [], onAskAI }) {
  const list = Array.isArray(resources) ? resources.filter((r) => r?.url) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <BookOpen size={16} className="text-violet-400" />
        <h2 className="text-[15px] font-semibold">Editorial & Resources</h2>
      </div>

      {list.length === 0 ? (
        <EmptyState onAskAI={onAskAI} />
      ) : (
        <>
          <div className="space-y-3">
            {list.map((res, i) => (
              <ResourceCard key={i} resource={res} />
            ))}
          </div>

          {onAskAI && (
            <div className="rounded-lg border border-dashed border-white/[0.08] bg-white/[0.01] p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[13px] text-white/70 font-medium">Still stuck?</p>
                <p className="text-[11.5px] text-white/40 mt-0.5">
                  Get a personalized explanation from the AI tutor.
                </p>
              </div>
              <button
                onClick={onAskAI}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[12px] font-medium transition-colors flex-shrink-0"
              >
                <Bot size={13} /> Ask AI <ArrowRight size={12} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Resource card router
// ─────────────────────────────────────────────────────────────
function ResourceCard({ resource }) {
  const { type, url, title, author } = resource;

  if (type === 'youtube') {
    const videoId = parseYoutubeId(url);
    if (videoId) return <YoutubeCard videoId={videoId} url={url} title={title} author={author} />;
    return <ArticleCard url={url} title={title} author={author} />;
  }

  if (type === 'video') return <VideoCard url={url} title={title} author={author} />;
  if (type === 'ai') return <AICard url={url} title={title} />;

  return <ArticleCard url={url} title={title} author={author} />;
}

// ─────────────────────────────────────────────────────────────
// Card: YouTube
// ─────────────────────────────────────────────────────────────
function YoutubeCard({ videoId, url, title, author }) {
  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-black/40">
      <div className="aspect-video bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
        />
      </div>
      <div className="flex items-start justify-between gap-3 p-3 bg-[#0d1117]">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Youtube size={12} className="text-rose-500 flex-shrink-0" />
            <span className="text-[10px] uppercase tracking-wide text-white/40">YouTube</span>
          </div>
          <p className="text-[13px] font-medium text-white/90 leading-snug">{title}</p>
          {author && <p className="text-[11.5px] text-white/40 mt-0.5">by {author}</p>}
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white transition-colors flex-shrink-0"
        >
          Open <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Card: Article
// ─────────────────────────────────────────────────────────────
function ArticleCard({ url, title, author }) {
  const favicon = getFavicon(url);
  const hostname = getHostname(url);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-violet-500/30 hover:bg-white/[0.04] p-4 transition-colors"
    >
      <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
        {favicon ? (
          <img src={favicon} alt="" className="w-5 h-5" />
        ) : (
          <FileText size={18} className="text-white/40" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <FileText size={11} className="text-white/40 flex-shrink-0" />
          <span className="text-[10px] uppercase tracking-wide text-white/40">Article · {hostname}</span>
        </div>
        <p className="text-[13.5px] font-medium text-white/90 group-hover:text-violet-400 transition-colors leading-snug">
          {title}
        </p>
        {author && <p className="text-[11.5px] text-white/40 mt-0.5">by {author}</p>}
      </div>
      <ExternalLink size={13} className="text-white/30 group-hover:text-white/70 flex-shrink-0 mt-1 transition-colors" />
    </a>
  );
}

// ─────────────────────────────────────────────────────────────
// Card: Hosted video (Cloudinary / direct MP4)
// ─────────────────────────────────────────────────────────────
function VideoCard({ url, title, author }) {
  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-black/40">
      <video src={url} controls className="w-full" />
      <div className="p-3 bg-[#0d1117]">
        <div className="flex items-center gap-1.5 mb-0.5">
          <VideoIcon size={11} className="text-violet-400" />
          <span className="text-[10px] uppercase tracking-wide text-white/40">Video</span>
        </div>
        <p className="text-[13px] font-medium text-white/90">{title}</p>
        {author && <p className="text-[11.5px] text-white/40 mt-0.5">by {author}</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Card: AI explanation
// ─────────────────────────────────────────────────────────────
function AICard({ url, title }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-violet-500/30 p-4 transition-colors"
    >
      <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
        <Sparkles size={16} className="text-violet-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-white/90">{title}</p>
        <p className="text-[11px] text-white/40 mt-0.5">AI-generated explanation</p>
      </div>
      <ExternalLink size={13} className="text-white/30" />
    </a>
  );
}

// ─────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────
function EmptyState({ onAskAI }) {
  return (
    <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.01] p-8 text-center">
      <div className="w-14 h-14 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
        <MessageSquare size={22} className="text-violet-400/70" />
      </div>
      <h3 className="text-[15px] font-semibold text-white/90 mb-1.5">
        No editorial yet
      </h3>
      <p className="text-[13px] text-white/50 max-w-sm mx-auto mb-6 leading-relaxed">
        We're curating the best explanations for this problem. In the meantime, the AI tutor can walk you through it step-by-step.
      </p>
      {onAskAI && (
        <button
          onClick={onAskAI}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-medium transition-colors"
        >
          <Bot size={14} /> Ask the AI tutor <ArrowRight size={13} />
        </button>
      )}
    </div>
  );
}
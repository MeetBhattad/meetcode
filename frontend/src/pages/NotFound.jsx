import { NavLink } from 'react-router';
import { ArrowLeft, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07070a] text-white flex items-center justify-center px-6 selection:bg-violet-500/30">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full"
             style={{ background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.1), transparent 70%)' }} />
      </div>

      <div className="relative z-10 max-w-md w-full text-center">
        <div className="text-[96px] font-black tracking-tighter text-violet-500/20 leading-none mb-2">404</div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Page not found</h1>
        <p className="text-[13.5px] text-white/50 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or was moved. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <NavLink
            to="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-medium transition-colors"
          >
            <Home size={14} /> Go Home
          </NavLink>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 text-[13px] font-medium transition-colors"
          >
            <ArrowLeft size={14} /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
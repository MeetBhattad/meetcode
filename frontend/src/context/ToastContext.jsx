import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, [dismiss]);

  const success = useCallback((msg, dur) => toast(msg, 'success', dur), [toast]);
  const error = useCallback((msg, dur) => toast(msg, 'error', dur), [toast]);
  const info = useCallback((msg, dur) => toast(msg, 'info', dur), [toast]);

  const icons = {
    success: <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />,
    error: <XCircle size={16} className="text-rose-400 flex-shrink-0" />,
    info: <Info size={16} className="text-violet-400 flex-shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-500/[0.08]',
    error: 'border-rose-500/30 bg-rose-500/[0.08]',
    info: 'border-violet-500/30 bg-violet-500/[0.08]',
  };

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <div className="fixed top-4 right-4 left-4 sm:left-auto z-[200] flex flex-col gap-2 pointer-events-none sm:max-w-sm">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-2.5 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${borders[t.type]}`}
            style={{
              backgroundColor: 'rgba(13, 17, 23, 0.95)',
              animation: 'toast-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {icons[t.type]}
            <p className="flex-1 text-[13px] text-white/90 leading-snug">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0 mt-0.5"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};
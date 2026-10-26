import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser } from '../authSlice';
import { ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

const signupSchema = z.object({
  firstName: z.string().min(3, "Minimum 3 characters"),
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

const getPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const map = [
    { label: '', color: '' },
    { label: 'Weak', color: 'bg-red-500' },
    { label: 'Fair', color: 'bg-amber-500' },
    { label: 'Good', color: 'bg-emerald-500' },
    { label: 'Strong', color: 'bg-emerald-400' },
  ];
  return { score, ...map[score] };
};

const styles = `
  @keyframes drift-a {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(40px, -30px) scale(1.05); }
  }
  @keyframes drift-b {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(-30px, 20px) scale(1.08); }
  }
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .drift-a { animation: drift-a 22s ease-in-out infinite; }
  .drift-b { animation: drift-b 28s ease-in-out infinite; }
  .fade-up { opacity: 0; animation: fade-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .fade-in { opacity: 0; animation: fade-in 1.4s ease forwards; }
  
  .shine-button::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%);
    transform: translateX(-100%);
    transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .shine-button:hover::before {
    transform: translateX(100%);
  }
`;

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const spotlightRef = useRef(null);
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema)
  });

  const password = watch('password', '');
  const strength = getPasswordStrength(password);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  // Mouse-following spotlight
  useEffect(() => {
    const handle = (e) => {
      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(139,92,246,0.07), transparent 40%)`;
      }
    };
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, []);

  const onSubmit = (data) => dispatch(registerUser(data));

  return (
    <>
      <style>{styles}</style>

      <div className="min-h-screen relative overflow-hidden bg-[#07070a] text-white flex flex-col items-center justify-center px-5 py-12">

        {/* ──────────── BACKGROUND LAYERS ──────────── */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="drift-a absolute -top-[25%] -left-[10%] w-[900px] h-[900px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18), transparent 55%)' }} />
          <div className="drift-b absolute -bottom-[30%] -right-[10%] w-[900px] h-[900px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.13), transparent 55%)' }} />
          
          <div className="absolute inset-0 opacity-[0.02]" style={{
              backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
              maskImage: 'radial-gradient(ellipse 60% 55% at 50% 45%, black 30%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 60% 55% at 50% 45%, black 30%, transparent 100%)'
            }}
          />

          <div className="absolute inset-0 opacity-[0.035] mix-blend-overlay" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
            }}
          />

          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)' }} />
        </div>

        <div ref={spotlightRef} className="absolute inset-0 pointer-events-none transition-[background] duration-200 ease-out" aria-hidden />

        {/* ──────────── CONTENT ──────────── */}
        <div className="relative z-10 w-full max-w-[380px]">

          {/* Logo */}
          <div className="fade-up flex items-center justify-center gap-2.5 mb-12" style={{ animationDelay: '0ms' }}>
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-violet-500 blur-lg opacity-50" />
              <div className="relative w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-[3px] bg-[#07070a]" />
              </div>
            </div>
            <span className="text-[16px] font-medium tracking-[-0.02em]">
              MeetCode
            </span>
          </div>

          {/* Heading */}
          <div className="fade-up text-center mb-10" style={{ animationDelay: '80ms' }}>
            <h1 className="text-[42px] font-semibold tracking-[-0.035em] leading-[1.02]">
              Create an account.
            </h1>
            <p className="mt-4 text-[14px] text-white/35 font-light">
              Join MeetCode and start solving.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="fade-up mb-6 rounded-xl border border-red-500/20 bg-red-500/[0.05] backdrop-blur-sm px-4 py-3" style={{ animationDelay: '120ms' }}>
              <p className="text-[13px] text-red-300/90">{String(error)}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* First Name */}
            <div className="fade-up" style={{ animationDelay: '160ms' }}>
              <label className="block text-[12px] font-medium text-white/40 mb-2 tracking-wide">
                FIRST NAME
              </label>
              <input
                type="text"
                placeholder="John"
                autoComplete="given-name"
                className={`w-full h-12 px-4 rounded-xl bg-white/[0.02] border text-[14px] text-white transition-all duration-200 outline-none placeholder:text-white/15 ${
                  errors.firstName
                    ? 'border-red-500/40 focus:border-red-500/60 focus:ring-4 focus:ring-red-500/[0.08]'
                    : 'border-white/[0.07] hover:border-white/[0.12] focus:border-violet-500/50 focus:bg-white/[0.035] focus:ring-4 focus:ring-violet-500/[0.08]'
                }`}
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="mt-2 text-[12px] text-red-400/90">{errors.firstName.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="fade-up" style={{ animationDelay: '220ms' }}>
              <label className="block text-[12px] font-medium text-white/40 mb-2 tracking-wide">
                EMAIL
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className={`w-full h-12 px-4 rounded-xl bg-white/[0.02] border text-[14px] text-white transition-all duration-200 outline-none placeholder:text-white/15 ${
                  errors.emailId
                    ? 'border-red-500/40 focus:border-red-500/60 focus:ring-4 focus:ring-red-500/[0.08]'
                    : 'border-white/[0.07] hover:border-white/[0.12] focus:border-violet-500/50 focus:bg-white/[0.035] focus:ring-4 focus:ring-violet-500/[0.08]'
                }`}
                {...register('emailId')}
              />
              {errors.emailId && (
                <p className="mt-2 text-[12px] text-red-400/90">{errors.emailId.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="fade-up" style={{ animationDelay: '280ms' }}>
              <label className="block text-[12px] font-medium text-white/40 mb-2 tracking-wide">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  autoComplete="new-password"
                  className={`w-full h-12 px-4 pr-12 rounded-xl bg-white/[0.02] border text-[14px] text-white transition-all duration-200 outline-none placeholder:text-white/15 tracking-[0.15em] placeholder:tracking-normal ${
                    errors.password
                      ? 'border-red-500/40 focus:border-red-500/60 focus:ring-4 focus:ring-red-500/[0.08]'
                      : 'border-white/[0.07] hover:border-white/[0.12] focus:border-violet-500/50 focus:bg-white/[0.035] focus:ring-4 focus:ring-violet-500/[0.08]'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="mt-2.5 flex items-center gap-3">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          i <= strength.score ? strength.color : 'bg-white/[0.06]'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-medium text-white/40 w-8 text-right uppercase tracking-wider">
                    {strength.label}
                  </span>
                </div>
              )}

              {errors.password && (
                <p className="mt-2 text-[12px] text-red-400/90">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <div className="fade-up pt-3" style={{ animationDelay: '340ms' }}>
              <button
                type="submit"
                disabled={loading}
                className="shine-button group relative w-full h-12 rounded-xl bg-white text-[#07070a] text-[13.5px] font-semibold flex items-center justify-center gap-2 overflow-hidden transition-all duration-200 hover:bg-white/[0.97] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_40px_-12px_rgba(255,255,255,0.3)]"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <p className="fade-in mt-12 text-center text-[13px] text-white/30" style={{ animationDelay: '600ms' }}>
            Already have an account?{' '}
            <NavLink to="/login" className="font-medium text-white/70 hover:text-white transition-colors">
              Sign in
            </NavLink>
          </p>
        </div>

        {/* Corner version indicator */}
        <div className="fade-in absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] text-white/15 font-mono tracking-widest" style={{ animationDelay: '800ms' }}>
          v1.0
        </div>
      </div>
    </>
  );
}

export default Signup;
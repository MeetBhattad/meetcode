import { NavLink } from 'react-router';
import { Plus, Edit, Trash2, Video, ArrowLeft, ShieldCheck } from 'lucide-react';

function Admin() {
  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding challenge, test cases, and harnesses to the platform.',
      icon: Plus,
      route: '/admin/create',
      accent: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Edit existing problems, update test cases, or fix reference solutions.',
      icon: Edit,
      route: '/admin/update',
      accent: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Permanently remove problems and their associated data from the database.',
      icon: Trash2,
      route: '/admin/delete',
      accent: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20'
    },
    {
      id: 'video',
      title: 'Video Editorials',
      description: 'Upload or manage Cloudinary video solutions for existing problems.',
      icon: Video,
      route: '/admin/video',
      accent: 'text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-[#07070a] text-white selection:bg-violet-500/30">
      
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full" style={{ background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.08), transparent 70%)' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        
        {/* Header / Nav */}
        <div className="flex items-center justify-between mb-12 fade-up">
          <div className="flex items-center gap-4">
            <NavLink 
              to="/" 
              className="w-10 h-10 rounded-full border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.04] transition-all"
              title="Back to Home"
            >
              <ArrowLeft size={18} />
            </NavLink>
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-violet-400" />
                <h1 className="text-2xl font-semibold tracking-tight text-white">Admin Dashboard</h1>
              </div>
              <p className="text-[13.5px] text-white/40 mt-1">Manage problems, test cases, and video editorials.</p>
            </div>
          </div>
        </div>

        {/* Admin Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {adminOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <NavLink
                key={option.id}
                to={option.route}
                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.03] hover:-translate-y-1 fade-up"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Icon Container */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${option.bg} flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon size={22} className={option.accent} />
                  </div>
                  
                  {/* Text Content */}
                  <div>
                    <h2 className="text-[16px] font-semibold text-white mb-1.5 group-hover:text-white transition-colors">
                      {option.title}
                    </h2>
                    <p className="text-[13px] text-white/40 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-[12px] text-white/20 font-mono tracking-widest">
          MeetCode Admin v1.0
        </div>

      </div>
    </div>
  );
}

export default Admin;
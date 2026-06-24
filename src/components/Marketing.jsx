import React from 'react';
import { DollarSign, BarChart2, Calendar, ShieldCheck, Zap } from 'lucide-react';

export default function Marketing() {
  const features = [
    {
      icon: <DollarSign className="w-5 h-5 text-emerald-400" />,
      title: 'Money Planner',
      desc: 'Plan monthly budgets, target savings, and manage cash flow with smart, automated insights.'
    },
    {
      icon: <BarChart2 className="w-5 h-5 text-teal-400" />,
      title: 'Stock Investment',
      desc: 'Curated financial simulations and learning guides to start building a long-term portfolio.'
    },
    {
      icon: <Calendar className="w-5 h-5 text-emerald-400" />,
      title: 'Daily Expense Planner',
      desc: 'Track every single dollar spent to see potential debt before it builds.'
    }
  ];

  return (
    <section className="w-full max-w-5xl mx-auto px-6 py-12 md:py-16 text-center">
      {/* Visual Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-6 uppercase tracking-wider">
        <Zap className="w-3.5 h-3.5" />
        <span>PWA Enabled Frontend Launcher</span>
      </div>

      {/* Main Core Tagline */}
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight mb-6">
        Take Control of Your Future. <br />
        <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
          Learn, Manage, & Invest Safely.
        </span>
      </h2>

      {/* Required Text Statement */}
      <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed mb-12">
        Access multiple suggestion apps like money planner, stock investment, daily expense planner, etc. and take your first step toward true financial autonomy.
      </p>

      {/* High-Fidelity Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        {features.map((feat, index) => (
          <div
            key={index}
            className="glass-panel glass-panel-hover rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-950 flex items-center justify-center border border-gray-800/80 mb-4 shadow-inner">
              {feat.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-100 mb-2">{feat.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>

      {/* Trust Banner */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-gray-500 text-sm">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500/60" />
          <span>Zero Real Capital Required</span>
        </div>
        <span className="hidden md:inline">•</span>
        <div>100% Free Educational Platform</div>
        <span className="hidden md:inline">•</span>
        <div>Installable on iOS, Android & Desktop</div>
      </div>
    </section>
  );
}

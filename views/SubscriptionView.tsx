
import React from 'react';
import { ShieldCheck, Check, Zap, Globe, Cpu, ArrowLeft, CreditCard, Lock, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '../types';

interface SubscriptionViewProps {
  user: User;
  onBack: () => void;
  onNavigateToPayment: (plan: { name: string, price: string }) => void;
}

const SubscriptionView: React.FC<SubscriptionViewProps> = ({ user, onBack, onNavigateToPayment }) => {
  const plans = [
    {
      name: 'Basic',
      price: 'Free',
      desc: 'Essential monitoring for small networks.',
      features: [
        '20 Supplier Nodes',
        'Standard Telemetry',
        'Global News Feed',
        'Email Support',
        '24h Data Sync'
      ],
      color: 'bg-slate-800',
      active: user.plan === 'Basic' || !user.plan
    },
    {
      name: 'Intermediate',
      price: '$199',
      desc: 'Advanced insights for growing operations.',
      features: [
        '100 Supplier Nodes',
        'Limited AI Insights',
        '6h Data Sync',
        'Contact Details Access'
      ],
      color: 'bg-blue-600',
      active: user.plan === 'Intermediate'
    },
    {
      name: 'Business',
      price: '$999',
      desc: 'Full-scale intelligence for global enterprises.',
      features: [
        'Unlimited Supplier Nodes',
        'Predictive AI Analytics',
        'ERP/CRM Integration',
        'Priority 24/7 Support',
        'Historical Data Access'
      ],
      color: 'bg-indigo-600',
      active: user.plan === 'Business'
    }
  ];

  const handleContactLead = () => {
    toast.info("Establishing encrypted communication line with VISOR Protocol Lead...", {
      description: "Protocol Lead: Marcus Thorne (Sovereign Ops). Status: Awaiting handshake."
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 text-slate-400 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Enterprise Licensing</h2>
          <p className="text-slate-500 font-medium text-xs sm:text-base">Select your intelligence threshold and network capacity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {plans.map((plan) => (
          <div key={plan.name} className={`relative flex flex-col p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border ${plan.active ? 'border-blue-500/50 bg-blue-600/5 shadow-2xl shadow-blue-500/10' : 'border-white/5 bg-[#0a0f1c]'}`}>
            {plan.active && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-xl whitespace-nowrap">Current Active Plan</span>
            )}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-black text-white">{plan.name}</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">{plan.desc}</p>
            </div>
            
            <div className="mb-6 sm:mb-8">
              <span className="text-3xl sm:text-4xl font-black text-white">{plan.price}</span>
              {plan.price !== 'Free' && <span className="text-slate-500 font-bold ml-2 text-sm sm:text-base">/ month</span>}
            </div>

            <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 flex-1">
              {plan.features.map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.active ? 'bg-blue-600' : 'bg-slate-800'}`}>
                    <Check size={12} className="text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-slate-300">{f}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => onNavigateToPayment({ name: plan.name, price: plan.price })}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${
              plan.active 
                ? 'bg-blue-600 text-white shadow-xl hover:bg-blue-500 shadow-blue-500/20' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'
            }`}>
              {plan.active ? <CreditCard size={14} /> : (plan.name === 'Basic' ? <Zap size={14} /> : <Lock size={14} />)}
              {plan.active ? 'Manage Plan' : (plan.name === 'Basic' ? 'Activate Basic Tier' : 'Select Network Tier')}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white/5 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center gap-6 sm:gap-10">
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-lg sm:text-xl font-bold text-white mb-2">Need a trial run?</h4>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">Request a temporary 14-day intelligence handshake for up to 10 nodes to evaluate geospatial accuracy.</p>
        </div>
        <button 
          onClick={handleContactLead}
          className="w-full md:w-auto px-6 sm:px-10 py-4 bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-200 transition-all shadow-xl flex items-center justify-center gap-2"
        >
          <MessageSquare size={14} /> Contact Protocol Lead
        </button>
      </div>
    </div>
  );
};

export default SubscriptionView;

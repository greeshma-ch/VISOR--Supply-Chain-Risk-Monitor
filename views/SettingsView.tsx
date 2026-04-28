
import React, { useState } from 'react';
import { User, View } from '../types';
import { CreditCard, Users, Shield, Bell, HardDrive, Cpu, AlertCircle, CheckCircle2, ArrowRight, Lock, Database } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsViewProps {
  user: User;
  onNavigate: (view: View) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, onNavigate }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [groundingEnabled, setGroundingEnabled] = useState(true);
  const [erpIntegrationEnabled, setErpIntegrationEnabled] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [teamMembers, setTeamMembers] = useState([
    { name: 'Sarah Connor', role: 'ADMIN', email: 'sarah@global.com' },
    { name: 'John Doe', role: 'ANALYST', email: 'john@global.com' },
  ]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setIsInviting(true);
    
    // Simulate API delay
    setTimeout(() => {
      const name = inviteEmail.split('@')[0];
      const newMember = {
        name: name.charAt(0).toUpperCase() + name.slice(1).replace('.', ' '),
        role: 'VIEWER' as any,
        email: inviteEmail
      };
      setTeamMembers([...teamMembers, newMember]);
      setInviteEmail('');
      setIsInviting(false);
      toast.success(`Invitation protocol initiated.`, {
        description: `${inviteEmail} granted Viewer access.`
      });
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10 animate-in fade-in duration-700 pb-20">
      <div>
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">System Configuration</h2>
        <p className="text-slate-500 font-medium mt-1 text-xs sm:text-base uppercase tracking-widest">Manage global infrastructure, team governance, and intelligence protocols.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
        {/* Subscription & Billing */}
        <div className="bg-[#0a0f1c] p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col">
          <h3 className="text-lg sm:text-xl font-black text-white mb-6 sm:mb-8 flex items-center gap-3 uppercase tracking-tight">
            <CreditCard size={28} className="text-blue-500" /> Enterprise Tier
          </h3>
          <div className="p-6 sm:p-8 bg-blue-600 rounded-[2rem] sm:rounded-3xl text-white mb-8 shadow-[0_15px_30px_rgba(37,99,235,0.2)]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] text-blue-100 font-black uppercase tracking-[0.2em] mb-1 opacity-70">Plan Status</p>
                <h4 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">{user.plan || 'Basic'}</h4>
              </div>
              <CheckCircle2 size={32} className="text-blue-200" />
            </div>
            <p className="text-blue-50 text-xs sm:text-sm mb-6 leading-relaxed font-medium">
              {user.plan === 'Business' 
                ? 'Full-scale intelligence for global enterprises with predictive AI and ERP integration.'
                : user.plan === 'Intermediate'
                  ? 'Monitoring across 100 global nodes with 6h Data Sync and limited AI insights active.'
                  : 'Essential monitoring for small networks with 24h Data Sync and standard telemetry.'}
            </p>
            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden mb-3">
              <div className={`h-full bg-white rounded-full shadow-[0_0_15px_white] transition-all duration-1000`} style={{ width: user.plan === 'Business' ? '100%' : user.plan === 'Intermediate' ? '78%' : '20%' }} />
            </div>
            <div className="flex justify-between items-center gap-4">
              <p className="text-[9px] sm:text-[10px] text-blue-100 font-black uppercase tracking-widest">
                {user.plan === 'Business' ? 'Unlimited' : user.plan === 'Intermediate' ? '78 / 100' : '5 / 20'} AI Insight Units
              </p>
              <p className="text-[9px] sm:text-[10px] text-blue-100 font-black uppercase tracking-widest">Reset in 12 days</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('SUBSCRIPTION')}
            className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all border border-white/10 flex items-center justify-center gap-2 group"
          >
            Manage Enterprise Billing <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Team Authorization */}
        <div className="bg-[#0a0f1c] p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col">
          <h3 className="text-lg sm:text-xl font-black text-white mb-6 sm:mb-8 flex items-center gap-3 uppercase tracking-tight">
            <Users size={28} className="text-emerald-500" /> Authorization Grid
          </h3>
          <div className="space-y-4 mb-8 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {teamMembers.map((member, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 animate-in slide-in-from-left-2 duration-300">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex-shrink-0 flex items-center justify-center font-black">
                    {member.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-white truncate">{member.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium truncate">{member.email}</p>
                  </div>
                </div>
                <span className="flex-shrink-0 text-[8px] font-black text-slate-400 px-2 py-1 bg-white/5 rounded-md tracking-[0.2em]">{member.role}</span>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleInvite} className="mt-auto pt-6 border-t border-white/5">
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email"
                required
                placeholder="Team member email..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder:text-slate-600"
              />
              <button 
                type="submit"
                disabled={isInviting}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all disabled:opacity-50 flex items-center justify-center min-w-[100px]"
              >
                {isInviting ? 'Processing...' : 'Invite'}
              </button>
            </div>
          </form>
        </div>

        {/* Intelligence Engine */}
        <div className="bg-[#0a0f1c] p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 shadow-2xl">
          <h3 className="text-lg sm:text-xl font-black text-white mb-8 sm:mb-10 flex items-center gap-3 uppercase tracking-tight">
            <Cpu size={28} className="text-amber-500" /> Engine Parameters
          </h3>
          <div className="space-y-8 sm:space-y-10">
            <div className="flex items-center justify-between gap-6 sm:gap-10">
              <div className="flex-1">
                <p className="text-sm sm:text-base font-extrabold text-white uppercase tracking-tight">Real-time Grounding</p>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest leading-relaxed">Cross-reference signals with global live search and news feeds.</p>
              </div>
              <button 
                onClick={() => setGroundingEnabled(!groundingEnabled)}
                className={`w-12 sm:w-14 h-6 sm:h-8 flex-shrink-0 rounded-full relative p-1 transition-all ${groundingEnabled ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-slate-800'}`}
              >
                <div className={`w-4 sm:w-6 h-4 sm:h-6 bg-white rounded-full transition-all duration-300 shadow-xl ${groundingEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between gap-6 sm:gap-10">
              <div className="flex-1">
                <p className="text-sm sm:text-base font-extrabold text-white uppercase tracking-tight">Push Notifications</p>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest leading-relaxed">Direct protocol alerts to mobile enterprise devices on critical threshold.</p>
              </div>
              <button 
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-12 sm:w-14 h-6 sm:h-8 flex-shrink-0 rounded-full relative p-1 transition-all ${notificationsEnabled ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-slate-800'}`}
              >
                <div className={`w-4 sm:w-6 h-4 sm:h-6 bg-white rounded-full transition-all duration-300 shadow-xl ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* ERP Integration - Business Only */}
        <div className={`bg-[#0a0f1c] p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col transition-all ${user.plan !== 'Business' ? 'opacity-60' : 'opacity-100'}`}>
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
              <Database size={28} className="text-indigo-500" /> ERP Integration
            </h3>
            {user.plan !== 'Business' && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                <Lock size={10} className="text-indigo-400" />
                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Business Only</span>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-6">
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
              Sync VISOR intelligence directly with SAP, Oracle, or Microsoft Dynamics 365 environments for automated procurement workflows.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {['SAP S/4HANA', 'Oracle Cloud', 'MS Dynamics', 'NetSuite'].map(erp => (
                <div key={erp} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group">
                  <span className="text-[10px] font-bold text-slate-500">{erp}</span>
                  <div className="w-2 h-2 rounded-full bg-slate-800" />
                </div>
              ))}
            </div>
            <button 
              disabled={user.plan !== 'Business'}
              onClick={() => setErpIntegrationEnabled(!erpIntegrationEnabled)}
              className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                erpIntegrationEnabled 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                  : user.plan === 'Business'
                    ? 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                    : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
              }`}
            >
              {erpIntegrationEnabled ? 'Integration Active' : 'Initialize Handshake'}
            </button>
          </div>
        </div>

        {/* Security & Data Residency */}
        <div className="bg-[#0a0f1c] p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col">
          <h3 className="text-lg sm:text-xl font-black text-white mb-6 sm:mb-8 flex items-center gap-3 uppercase tracking-tight">
            <Shield size={28} className="text-rose-500" /> Data Isolation
          </h3>
          <div className="flex-1">
            <div className="bg-rose-500/5 border border-rose-500/20 p-4 sm:p-6 rounded-[2rem] sm:rounded-3xl flex gap-4 mb-8">
              <AlertCircle className="text-rose-400 flex-shrink-0" size={28} />
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                VISOR Protocol 2.5 active. Data for <span className="text-white font-bold">{user.company}</span> is currently strictly isolated from public nodes.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['SOC2 TYPE II', 'GDPR COMPLIANT', 'AES-256', 'FIPS 140-2'].map(badge => (
                <div key={badge} className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest">{badge}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;

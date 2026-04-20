
import React, { useState } from 'react';
import { ArrowRight, Building2, UserCircle, Key, Globe, ChevronDown } from 'lucide-react';
import Logo from '../components/Logo';
import { User, Role } from '../types';

interface AuthViewProps {
  onComplete: (user: User) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onComplete }) => {
  const [company, setCompany] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [role, setRole] = useState<Role>('Analyst');
  const [selectedSector, setSelectedSector] = useState<string>('Logistics');
  const [hqLocation, setHqLocation] = useState('USA, San Francisco');
  const [error, setError] = useState<string | null>(null);

  const sectors = [
    'Logistics',
    'Semiconductors',
    'Electronics',
    'Automotive',
    'Energy',
    'Pharmaceuticals',
  ];

  const validateAccessKey = (key: string) => {
    // Requirements: At least 12 chars, one uppercase, one number
    const hasLength = key.length >= 12;
    const hasUpper = /[A-Z]/.test(key);
    const hasNumber = /[0-9]/.test(key);
    return hasLength && hasUpper && hasNumber;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!company.trim() || !accessKey.trim()) {
      setError("Strategic parameters incomplete. All fields required.");
      return;
    }

    if (!validateAccessKey(accessKey)) {
      setError("Protocol mismatch. Access Key must be 12+ characters with at least one uppercase letter and one number.");
      return;
    }

    // Company Key Consistency Check
    const storedKeys = JSON.parse(localStorage.getItem('vs_company_registry') || '{}');
    const sanitizedCompany = company.trim().toLowerCase();

    if (storedKeys[sanitizedCompany] && storedKeys[sanitizedCompany] !== accessKey) {
      setError("Authorization denied. Historical key mismatch for this enterprise domain.");
      return;
    }

    // Register company if new
    if (!storedKeys[sanitizedCompany]) {
      storedKeys[sanitizedCompany] = accessKey;
      localStorage.setItem('vs_company_registry', JSON.stringify(storedKeys));
    }

    onComplete({ company, accessKey, role, sectors: [selectedSector], hqLocation });
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-md bg-[#0a0f1c] rounded-[2rem] shadow-2xl border border-white/5 overflow-hidden animate-in zoom-in-95 duration-500 my-4">
        <div className="p-6 sm:p-8 text-center bg-blue-600/5 border-b border-white/5">
          <Logo className="justify-center mb-1" />
          <p className="text-blue-500/60 mt-1 text-[10px] font-bold uppercase tracking-[0.3em]">Enterprise Intelligence Protocol</p>
          {error && (
            <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">{error}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Building2 size={14} /> Enterprise Domain
            </label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Global Logistics"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-white placeholder:text-slate-700 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Key size={14} /> Access Protocol
            </label>
            <input
              type="password"
              required
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-white text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Globe size={14} /> Global Headquarters
            </label>
            <div className="relative">
              <select
                value={hqLocation}
                onChange={(e) => setHqLocation(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all appearance-none text-white text-sm cursor-pointer"
              >
                <option value="USA, San Francisco" className="bg-[#0a0f1c]">San Francisco, USA</option>
                <option value="Japan, Tokyo" className="bg-[#0a0f1c]">Tokyo, Japan</option>
                <option value="Germany, Munich" className="bg-[#0a0f1c]">Munich, Germany</option>
                <option value="Singapore, Singapore" className="bg-[#0a0f1c]">Singapore</option>
                <option value="Netherlands, Rotterdam" className="bg-[#0a0f1c]">Rotterdam, NL</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Globe size={14} /> Risk Analysis Sector
            </label>
            <div className="relative">
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all appearance-none text-white text-sm cursor-pointer"
              >
                {sectors.map((s) => (
                  <option key={s} value={s} className="bg-[#0a0f1c]">{s}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <UserCircle size={14} /> Operational Role
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all appearance-none text-white text-sm cursor-pointer"
              >
                <option value="Admin" className="bg-[#0a0f1c]">Administrator</option>
                <option value="Manager" className="bg-[#0a0f1c]">Operations Manager</option>
                <option value="Analyst" className="bg-[#0a0f1c]">Supply Chain Analyst</option>
                <option value="Viewer" className="bg-[#0a0f1c]">Guest Viewer</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-xl shadow-[0_0_25px_rgba(37,99,235,0.25)] flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]"
          >
            Authorize Session <ArrowRight size={16} />
          </button>

          <p className="text-center text-[7px] text-slate-700 font-black uppercase tracking-[0.4em] mt-2">
            Encrypted Node Access Protocol
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthView;

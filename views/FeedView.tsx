
import React from 'react';
import { User, Disruption, Supplier } from '../types';
import { Bell, Cloud, Ship, Zap, Info, Clock, ExternalLink, Archive, Sun, CloudRain, CloudLightning, CloudSnow, Wind, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import Skeleton from '../components/Skeleton';

interface FeedViewProps {
  user: User;
  categoryFilter: string;
  onNavigateToResources: (title: string, sources?: { title: string; uri: string }[]) => void;
  disruptions: Disruption[];
  suppliers: Supplier[];
  isRefreshing?: boolean;
}

const FeedView: React.FC<FeedViewProps> = ({ user, categoryFilter, onNavigateToResources, disruptions, suppliers, isRefreshing }) => {
  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInMs = now.getTime() - then.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    
    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    return then.toLocaleDateString();
  };

  const typeIcons = {
    Weather: Cloud,
    Strike: Zap,
    Incident: Info,
    Logistics: Ship,
  };

  const getWeatherIcon = (iconCode?: string) => {
    if (!iconCode) return Cloud;
    
    // Map OpenWeatherMap icon codes to Lucide icons
    if (iconCode.startsWith('01')) return Sun;
    if (iconCode.startsWith('02') || iconCode.startsWith('03') || iconCode.startsWith('04')) return Cloud;
    if (iconCode.startsWith('09') || iconCode.startsWith('10')) return CloudRain;
    if (iconCode.startsWith('11')) return CloudLightning;
    if (iconCode.startsWith('13')) return CloudSnow;
    if (iconCode.startsWith('50')) return Wind;
    
    return Cloud;
  };

  const activeRegions = Array.from(new Set(suppliers.map(s => s.location)));

  const filteredDisruptions = disruptions.filter(d => {
    // If Global is selected, show all. Otherwise, match type or show Logistics (cross-cutting)
    const matchesCategory = categoryFilter === 'ALL' || d.type === categoryFilter || d.type === 'Logistics' || d.type === 'Weather';
    
    // Node-Centric Filtering: Only show disruptions in regions where we have active suppliers
    const matchesRegion = activeRegions.some(region => {
      const regionParts = region.toLowerCase().split(',').map(p => p.trim());
      const disruptionParts = d.location.toLowerCase().split(',').map(p => p.trim());
      return regionParts.some(rp => disruptionParts.some(dp => dp.includes(rp) || rp.includes(dp)));
    });
    
    return matchesCategory && matchesRegion;
  });

  const handleAccessArchival = () => {
    if (user.plan !== 'Business') {
      toast.error("Access Denied", {
        description: "Historical archival data is reserved for Business Tier accounts."
      });
      return;
    }
    toast.info("Establishing encrypted handshake with VISOR Archival Vault... Accessing historical logistics metadata (2018-2023).");
    onNavigateToResources("VISOR ARCHIVAL VAULT");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight leading-none">Intelligence Signals</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isRefreshing ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`} />
            <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest leading-none">
              {isRefreshing ? 'Syncing Real-time Feed...' : `Live Stream • ${categoryFilter === 'ALL' ? 'Global Network' : `${categoryFilter} Channel`}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full h-fit">
          <Clock size={12} className="text-slate-500" />
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Last Refreshed: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isRefreshing ? (
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                className="bg-[#0a0f1c] p-6 sm:p-8 rounded-[2rem] border border-white/5 shadow-sm animate-pulse flex flex-col h-full min-h-[350px]"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 shadow-lg" />
                  <div className="p-2 bg-white/5 rounded-xl w-8 h-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-2 w-16 bg-white/10 rounded" />
                    <div className="h-2 w-20 bg-white/10 rounded" />
                  </div>
                  <div className="h-6 w-3/4 bg-white/10 rounded mb-4" />
                  <div className="p-4 bg-white/[0.02] rounded-2xl mb-6 border border-white/5">
                    <div className="h-3 w-full bg-white/5 rounded mb-2" />
                    <div className="h-3 w-5/6 bg-white/5 rounded mb-2" />
                    <div className="h-3 w-4/6 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
                  <div className="h-2 w-12 bg-white/5 rounded mb-1" />
                  <div className="h-4 w-24 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </>
        ) : filteredDisruptions.map((alert) => {
          const Icon = alert.type === 'Weather' ? getWeatherIcon(alert.weatherIcon) : (typeIcons[alert.type] || Info);
          const iconColor = alert.type === 'Weather' && alert.weatherIcon ? (
            alert.weatherIcon.startsWith('01') ? 'text-amber-400' :
            alert.weatherIcon.startsWith('09') || alert.weatherIcon.startsWith('10') ? 'text-blue-500' :
            alert.weatherIcon.startsWith('11') ? 'text-amber-500' :
            alert.weatherIcon.startsWith('13') ? 'text-slate-200' :
            'text-blue-400'
          ) : 'text-white';

              const displayTitle = alert.title === "Operational Stability" 
                ? `Operational Stability: ${alert.location}` 
                : alert.title;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={alert.id} 
                  onClick={() => onNavigateToResources(displayTitle)}
                  className="bg-[#0a0f1c] p-6 sm:p-8 rounded-[2rem] border border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transition-transform group-hover:scale-110 ${
                      alert.severity === 'High' ? 'bg-rose-600 shadow-rose-900/20' : 'bg-amber-600 shadow-amber-900/20'
                    } ${iconColor}`}>
                      <Icon size={20} />
                    </div>
                    <div className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-500 transition-colors group/btn">
                      <ExternalLink size={16} className="group-hover/btn:text-blue-400 transition-colors" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                        alert.severity === 'High' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1">
                        <Clock size={12} className="text-slate-600" /> {getRelativeTime(alert.timestamp)}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white tracking-tight leading-tight mb-4 group-hover:text-blue-400 transition-colors">{displayTitle}</h3>
                    
                    <div className="p-4 bg-white/[0.02] rounded-2xl mb-6 border border-white/5 shadow-inner">
                      <p className="text-slate-400 text-[11px] leading-relaxed font-medium line-clamp-3">
                        "{alert.summary}"
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Impact Zone</span>
                      <span className="text-xs font-extrabold text-white uppercase truncate">{alert.location}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Nodes Affected</span>
                      <div className="flex flex-wrap gap-2">
                        {alert.impactedSuppliers.map((id) => {
                          const supplier = suppliers.find(s => s.id === id);
                          const displayName = supplier ? supplier.name : id.toUpperCase();
                          return (
                            <div 
                              key={id} 
                              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-black text-slate-300 shadow-sm hover:bg-white/10 transition-colors" 
                              title={`Supplier: ${displayName}`}
                            >
                              {displayName}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
      </div>
      
      {filteredDisruptions.length === 0 && (
        <div className="py-20 text-center bg-white/[0.03] rounded-[2.5rem] border border-dashed border-white/10">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No signals detected in this channel.</p>
        </div>
      )}

      <div className="text-center pt-8 relative">
        {user.plan !== 'Business' && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-full">
            <Lock size={10} className="text-blue-400" />
            <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Business Tier Required</span>
          </div>
        )}
        <motion.button 
          whileHover={user.plan === 'Business' ? { scale: 1.05 } : {}}
          whileTap={user.plan === 'Business' ? { scale: 0.95 } : {}}
          onClick={handleAccessArchival}
          className={`px-8 py-4 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-xl flex items-center gap-3 mx-auto ${
            user.plan === 'Business' 
              ? 'bg-white text-slate-900 hover:bg-slate-100' 
              : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
          }`}
        >
          <Archive size={16} /> Access Archival Data
        </motion.button>
      </div>
    </div>
  );
};

export default FeedView;

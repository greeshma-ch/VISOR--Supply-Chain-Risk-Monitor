
import React, { useState, useEffect } from 'react';
import { Supplier, IntelligenceBrief, RiskStatus, User, ImpactAnalysis } from '../types';
import { generateSupplierIntelligence, generateImpactAnalysis } from '../services/geminiService';
import { fetchCurrentWeather } from '../services/weatherService';
import RiskBadge from '../components/RiskBadge';
import { 
  ArrowLeft, 
  ArrowRight,
  RefreshCw, 
  CloudSun, 
  Newspaper, 
  History, 
  Lightbulb, 
  Users,
  Mail,
  ExternalLink,
  ShieldAlert,
  Calendar,
  Thermometer,
  Wind,
  Droplets,
  Lock,
  Check,
  Zap,
  MapPin
} from 'lucide-react';

import { toast } from 'sonner';

interface IntelligenceViewProps {
  user: User;
  supplier: Supplier;
  onBack: () => void;
  onUpdateStatus: (status: RiskStatus) => void;
  onNavigateToResources: (context?: { title: string; sources: { title: string; uri: string }[] }) => void;
  isSimulated?: boolean;
  onToggleSimulation: () => void;
}

const IntelligenceView: React.FC<IntelligenceViewProps> = ({ user, supplier, onBack, onUpdateStatus, onNavigateToResources, isSimulated, onToggleSimulation }) => {
  const [brief, setBrief] = useState<IntelligenceBrief | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImpactExpanded, setIsImpactExpanded] = useState(false);
  const [mitigationSuccess, setMitigationSuccess] = useState(false);
  const [impactAnalysis, setImpactAnalysis] = useState<ImpactAnalysis | null>(null);
  const [impactLoading, setImpactLoading] = useState(false);
  const [impactError, setImpactError] = useState(false);

  const fetchIntelligence = async () => {
    setLoading(true);
    setError(null);
    try {
      // Parallelize weather and intelligence fetching for speed
      const weatherPromise = fetchCurrentWeather(supplier.coordinates[0], supplier.coordinates[1]);
      
      const [weatherData] = await Promise.all([weatherPromise]);
      setWeather(weatherData);

      const intelPromise = generateSupplierIntelligence(supplier, weatherData, !!isSimulated);
      const impactPromise = generateImpactAnalysis(supplier, !!isSimulated);

      setImpactLoading(true);
      setImpactError(false);

      const [intelData, impactData] = await Promise.all([intelPromise, impactPromise]);
      
      setBrief(intelData);
      setImpactAnalysis(impactData);
    } catch (err) {
      setError("Failed to generate intelligence brief. Check your API key and network connection.");
    } finally {
      setLoading(false);
      setImpactLoading(false);
    }
  };

  const handleSyncStatus = () => {
    if (brief?.suggestedStatus) {
      onUpdateStatus(brief.suggestedStatus);
      toast.success(`Registry updated: ${supplier.name} status set to ${brief.suggestedStatus}`);
    }
  };

  useEffect(() => {
    if (brief?.suggestedStatus && brief.suggestedStatus !== supplier.status) {
      onUpdateStatus(brief.suggestedStatus);
      toast.info(`Registry Synchronized: ${supplier.name} status updated to ${brief.suggestedStatus} based on real-time intelligence.`);
    }
  }, [brief?.suggestedStatus, supplier.status, supplier.name, onUpdateStatus]);

  useEffect(() => {
    fetchIntelligence();
  }, [supplier.id, isSimulated]);

  if (loading) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-6 sm:p-8 space-y-6 text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <div className="max-w-xs sm:max-w-sm">
          <h3 className="text-lg sm:text-xl font-bold text-white">Synthesizing Signals...</h3>
          <p className="text-slate-500 text-xs sm:text-sm mt-2">
            ChainGuard AI is processing news and weather vectors for <b>{supplier.name}</b>.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 sm:p-12 bg-rose-500/5 rounded-3xl border border-rose-500/10 flex flex-col items-center text-center max-w-lg mx-auto">
        <ShieldAlert size={48} className="text-rose-500 mb-4" />
        <h3 className="text-xl font-bold text-white">Analysis Interrupted</h3>
        <p className="text-slate-500 mt-2 text-sm">{error}</p>
        <button 
          onClick={fetchIntelligence}
          className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-right-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex flex-col min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-white truncate max-w-[200px] sm:max-w-none">{supplier.name}</h2>
            {(user.plan === 'Business' || user.plan === 'Intermediate') && (
              <p className="text-[10px] font-medium text-slate-500 mt-0.5 flex items-center gap-1.5">
                <Mail size={12} className="text-slate-600" /> {supplier.contactEmail || 'No contact provided'}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 sm:ml-auto">
          <button 
            onClick={onToggleSimulation}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${
              isSimulated 
                ? 'bg-rose-600 border-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.3)]' 
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            }`}
          >
            <Zap size={14} className={isSimulated ? 'animate-pulse' : ''} />
            {isSimulated ? 'Crisis Mode Active' : 'Test Crisis Mode'}
          </button>
          <div className="h-10 w-[1px] bg-white/5 mx-2 hidden sm:block" />
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Registry Status</span>
            <RiskBadge status={isSimulated ? RiskStatus.RISKY : supplier.status} size="md" />
          </div>
          {brief?.suggestedStatus && (
            <div className="flex flex-col items-end border-l border-white/10 pl-4">
              <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1">AI Assessment</span>
              <div className="flex items-center gap-2">
                <RiskBadge status={brief.suggestedStatus} size="md" />
                {brief.suggestedStatus === supplier.status ? (
                  <div className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                    <Check size={10} /> Synchronized
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[8px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 animate-pulse">
                    <RefreshCw size={10} className="animate-spin" /> Syncing...
                  </div>
                )}
              </div>
              <p className="text-[9px] font-medium text-slate-600 mt-1 opacity-60">
                {weather?.weather?.[0]?.main || 'N/A'} + {brief?.todayFeed?.[0]?.status || 'N/A'} = {brief?.suggestedStatus}
              </p>
            </div>
          )}
          <button 
            onClick={fetchIntelligence}
            className="p-2.5 bg-white/5 border border-white/10 text-slate-400 rounded-xl hover:text-white transition-all shadow-sm self-end"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 sm:p-6 mb-6 relative overflow-hidden">
        {isSimulated && (
          <div className="absolute top-0 right-0 px-3 py-1 bg-rose-600 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-xl z-10 animate-pulse">
            Simulation Active
          </div>
        )}
        
        <button 
          onClick={() => setIsImpactExpanded(!isImpactExpanded)}
          className="text-blue-400 text-xs font-black uppercase tracking-widest hover:text-blue-300 transition-colors flex items-center gap-2"
        >
          {isImpactExpanded ? 'Hide' : 'View'} AI Impact Analysis
        </button>
        
        {isImpactExpanded && (
          <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {impactLoading ? (
              <div className="flex items-center gap-3 text-slate-500 text-xs italic py-4">
                <RefreshCw size={14} className="animate-spin" /> Calculating impact vectors...
              </div>
            ) : impactError ? (
              <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl text-rose-500 text-xs font-medium">
                Failed to generate impact analysis. Please retry.
              </div>
            ) : impactAnalysis ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Bottleneck</p>
                  <p className="text-sm font-bold text-white">{impactAnalysis.bottleneck}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Est. Delay</p>
                  <p className="text-sm font-bold text-white">{impactAnalysis.estDelay}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Strategic Action</p>
                  <p className="text-sm font-bold text-white">{impactAnalysis.strategicAction}</p>
                </div>
                <div className="sm:col-span-3 pt-4 border-t border-white/5">
                  <button 
                    onClick={() => {
                      console.log('Mitigation Executed');
                      setMitigationSuccess(true);
                      toast.success("Mitigation Protocol Executed", {
                        description: "Strategic actions have been dispatched to regional logistics teams."
                      });
                    }}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      mitigationSuccess 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {mitigationSuccess ? 'Success' : 'Execute Mitigation'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <section className="bg-[#0a0f1c] p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/5 shadow-sm relative overflow-hidden">
            {user.plan === 'Basic' && (
              <div className="absolute inset-0 z-10 bg-[#0a0f1c]/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                <Lock className="text-blue-500 mb-4" size={32} />
                <h4 className="text-white font-bold mb-2">AI Insights Locked</h4>
                <p className="text-slate-500 text-xs max-w-[240px]">Upgrade to Intermediate or Business tier to unlock real-time intelligence synthesis.</p>
                <button 
                  onClick={onBack}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl"
                >
                  Upgrade Plan
                </button>
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <RefreshCw size={18} className="text-blue-500" /> Operational Vectors
              </h3>
              {brief?.suggestedStatus && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Signal:</span>
                  <RiskBadge status={brief.suggestedStatus} size="sm" />
                </div>
              )}
            </div>
            <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
              {brief?.summary}
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-[#0a0f1c] p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/5">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CloudSun size={16} className="text-amber-500" /> Weather Matrix
              </h4>
              
              {weather ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                        <img 
                          src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} 
                          alt={weather.weather[0].description}
                          className="w-8 h-8"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">{Math.round(weather.main.temp)}°C</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{weather.weather[0].description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Feels Like</p>
                      <p className="text-sm font-bold text-white">{Math.round(weather.main.feels_like)}°C</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
                    <div className="flex flex-col items-center p-2 bg-white/5 rounded-xl">
                      <Wind size={14} className="text-slate-400 mb-1" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Wind</span>
                      <span className="text-xs font-bold text-white">{weather.wind.speed}m/s</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-white/5 rounded-xl">
                      <Droplets size={14} className="text-blue-400 mb-1" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Humidity</span>
                      <span className="text-xs font-bold text-white">{weather.main.humidity}%</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-white/5 rounded-xl">
                      <Thermometer size={14} className="text-rose-400 mb-1" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pressure</span>
                      <span className="text-xs font-bold text-white">{weather.main.pressure}hPa</span>
                    </div>
                  </div>
                  
                  <p className="text-slate-400 text-xs leading-relaxed mt-4 italic">
                    AI Analysis: {brief?.weatherStatus}
                  </p>
                </div>
              ) : (
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{brief?.weatherStatus}</p>
              )}
            </div>
            <div className="bg-[#0a0f1c] p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/5">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <History size={16} className="text-indigo-500" /> Regional Archive
              </h4>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{brief?.historicalContext}</p>
            </div>
          </div>

          <section className="bg-[#0a0f1c] p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/5 shadow-sm">
            <h3 className="text-base sm:text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Newspaper size={18} className="text-emerald-500" /> Intelligence Stream
            </h3>
            
            <div className="space-y-8">
              {/* Today's Feed */}
              {brief?.todayFeed && brief.todayFeed.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={14} className="text-blue-500" /> Today's Briefing
                  </h4>
                  <div className="space-y-3">
                    {brief.todayFeed.map((item, i) => (
                      <div key={i} className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-slate-200 font-bold text-sm leading-tight">{item.title}</p>
                          <RiskBadge status={item.status} size="sm" />
                        </div>
                        <div className="flex items-start gap-2 pt-2 border-t border-white/5">
                          <Lightbulb size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                          <p className="text-slate-400 text-xs leading-relaxed italic">
                            <span className="font-bold text-slate-300">Insight:</span> {item.insight}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Feed */}
              {brief?.recentFeed && brief.recentFeed.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <History size={14} className="text-indigo-500" /> Recent Intelligence
                  </h4>
                  <div className="space-y-3">
                    {brief.recentFeed.map((item, i) => (
                      <div key={i} className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-slate-300 font-medium text-sm leading-tight">{item.title}</p>
                          <RiskBadge status={item.status} size="sm" />
                        </div>
                        <div className="flex items-start gap-2 pt-2 border-t border-white/5">
                          <Lightbulb size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
                          <p className="text-slate-500 text-xs leading-relaxed italic">
                            <span className="font-bold text-slate-400">Insight:</span> {item.insight}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!brief?.todayFeed?.length && !brief?.recentFeed?.length) && (
                <div className="text-center py-8">
                  <p className="text-slate-500 text-sm italic">No recent intelligence signals detected for this node.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <section className="bg-blue-600 p-6 sm:p-8 rounded-3xl shadow-xl text-white">
            <h3 className="text-base sm:text-lg font-bold mb-6 flex items-center gap-2">
              <Lightbulb size={18} className="text-blue-200" /> Mitigation Plan
            </h3>
            <div className="space-y-4">
              {brief?.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-3 text-xs sm:text-sm">
                  <span className="font-bold text-blue-200">{i + 1}.</span>
                  <p className="text-blue-50 leading-relaxed font-medium">{rec}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#0a0f1c] p-6 sm:p-8 rounded-3xl border border-white/5">
            <h3 className="text-base sm:text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Users size={18} className="text-slate-500" /> Alternative Nodes
            </h3>
            <div className="space-y-2 relative">
              {(user.plan === 'Basic' || user.plan === 'Intermediate') && (
                <div className="absolute inset-0 z-10 bg-[#0a0f1c]/60 backdrop-blur-[2px] flex items-center justify-center rounded-3xl">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-[#0a0f1c] px-3 py-1 rounded-full border border-blue-500/30">Business Tier Only</span>
                </div>
              )}
              {brief?.alternativeSuppliers.map((alt, i) => (
                <button 
                  key={i} 
                  onClick={() => onNavigateToResources({
                    title: `Intelligence for ${supplier.name}`,
                    sources: brief?.sources || []
                  })}
                  className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-between text-xs sm:text-sm transition-colors group"
                >
                  <span className="font-bold text-slate-300 group-hover:text-white">{alt}</span>
                  <ExternalLink size={16} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white/[0.02] p-6 rounded-3xl border border-dashed border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Verification Sources</h4>
              <button 
                onClick={() => onNavigateToResources({
                  title: `Verification Sources: ${supplier.name}`,
                  sources: brief?.sources || []
                })}
                className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest flex items-center gap-1 transition-colors"
              >
                Export All <ArrowRight size={16} />
              </button>
            </div>
            <div className="space-y-2">
              {brief?.sources.slice(0, 3).map((source, i) => (
                <button 
                  key={i}
                  onClick={() => onNavigateToResources({
                    title: `Verification Source: ${source.title}`,
                    sources: [source]
                  })}
                  className="w-full flex items-center justify-between text-[10px] text-slate-500 hover:text-blue-400 transition-colors text-left group"
                >
                  <span className="truncate max-w-[180px] group-hover:underline underline-offset-2">{source.title}</span>
                  <ExternalLink size={12} className="opacity-50 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceView;

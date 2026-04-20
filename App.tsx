
import React, { useState, useEffect } from 'react';
import { View, Supplier, User, RiskStatus, Disruption } from './types';
import { MOCK_DISRUPTIONS, MOCK_SUPPLIERS } from './constants';
import { fetchWeatherAlerts } from './services/weatherService';
import { generateGlobalRiskSignals } from './services/geminiService';
import Layout from './components/Layout';
import AuthView from './views/AuthView';
import DashboardView from './views/DashboardView';
import RegistryView from './views/RegistryView';
import IntelligenceView from './views/IntelligenceView';
import MapView from './views/MapView';
import FeedView from './views/FeedView';
import SettingsView from './views/SettingsView';
import SubscriptionView from './views/SubscriptionView';
import ResourcesView from './views/ResourcesView';
import PaymentView from './views/PaymentView';
import { Toaster, toast } from 'sonner';

const App: React.FC = () => {
  const [view, setView] = useState<View>('DASHBOARD');
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cg_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.sectors) parsed.sectors = ['Logistics'];
      return parsed;
    }
    return null;
  });
  
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<RiskStatus | 'ALL'>('ALL');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('cg_suppliers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return MOCK_SUPPLIERS;
      }
    }
    return MOCK_SUPPLIERS;
  });

  useEffect(() => {
    localStorage.setItem('cg_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);
  const [simulatedRiskyNodes, setSimulatedRiskyNodes] = useState<string[]>([]);
  
  const getPlanNodeLimit = (planName?: string) => {
    switch (planName) {
      case 'Basic': return 20;
      case 'Intermediate': return 100;
      case 'Business': return Infinity;
      default: return 20; // Default to basic if no plan
    }
  };

  const activeSuppliers = suppliers.slice(0, getPlanNodeLimit(user?.plan)).map(s => {
    if (simulatedRiskyNodes.includes(s.id)) {
      return { ...s, status: RiskStatus.RISKY };
    }
    return s;
  });
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string } | null>(null);
  const [resourceContext, setResourceContext] = useState<{ title: string; sources: { title: string; uri: string }[] } | null>(null);
  const [disruptions, setDisruptions] = useState<Disruption[]>(MOCK_DISRUPTIONS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isInitialMount = React.useRef(true);

  const refreshDisruptions = async () => {
    if (isRefreshing || !user) return;
    setIsRefreshing(true);
    try {
      const dynamicDisruptions = await generateGlobalRiskSignals(user, suppliers);
      const weatherAlerts = await fetchWeatherAlerts(suppliers);
      
      // Combine and filter duplicates by title and location
      const combined = [...dynamicDisruptions, ...weatherAlerts].filter((v, i, a) => 
        a.findIndex(t => t.title === v.title && t.location === v.location) === i
      );
      setDisruptions(combined);
      
      if (dynamicDisruptions.length > 0 || weatherAlerts.length > 0) {
        // Only show toast if it's not the initial automatic refresh or if it's a manual resync
        toast.success("Intelligence Refreshed", {
          description: `Synchronized with ${combined.length} real-time risk signals.`,
          id: 'refresh-toast' // Use a fixed ID to prevent duplicates
        });
      }
    } catch (error) {
      console.error("Refresh Error:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      refreshDisruptions();
      isInitialMount.current = false;
    }
    
    // Dynamic refresh frequency based on tier
    const getRefreshInterval = () => {
      switch (user?.plan) {
        case 'Business': return 120000; // 2 mins
        case 'Intermediate': return 300000; // 5 mins
        case 'Basic': return 600000; // 10 mins
        default: return 600000;
      }
    };

    const interval = setInterval(refreshDisruptions, getRefreshInterval());
    return () => clearInterval(interval);
  }, [suppliers.length, user?.plan]);

  const handleAuthComplete = (userData: User) => {
    setUser(userData);
    localStorage.setItem('cg_session', JSON.stringify(userData));
  };

  const updateSectors = (newSectors: string[]) => {
    if (user) {
      const updatedUser = { ...user, sectors: newSectors };
      setUser(updatedUser);
      localStorage.setItem('cg_session', JSON.stringify(updatedUser));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cg_session');
    setUser(null);
  };

  const updateSupplierStatus = (supplierId: string, newStatus: RiskStatus) => {
    setSuppliers(prev => prev.map(s => s.id === supplierId ? { ...s, status: newStatus, lastUpdated: new Date().toISOString() } : s));
    if (selectedSupplier?.id === supplierId) {
      setSelectedSupplier(prev => prev ? { ...prev, status: newStatus, lastUpdated: new Date().toISOString() } : null);
    }
  };

  const navigateToSupplierIntelligence = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
  };

  const toggleNodeSimulation = (supplierId: string) => {
    setSimulatedRiskyNodes(prev => {
      const isSimulated = prev.includes(supplierId);
      const next = isSimulated 
        ? prev.filter(id => id !== supplierId) 
        : [...prev, supplierId];
      
      toast.info(isSimulated ? "Node Restored" : "Node Compromised", {
        description: isSimulated 
          ? "Supplier has been removed from the crisis simulation."
          : "Supplier has been flagged as RISKY for simulation purposes."
      });
      
      return next;
    });
  };

  const handleAddSupplier = (newSupplier: Supplier) => {
    setSuppliers(prev => [newSupplier, ...prev]);
    toast.success("Supplier Integrated", {
      description: `${newSupplier.name} has been added to the global registry and map analytics.`
    });
  };

  if (!user) {
    return <AuthView onComplete={handleAuthComplete} />;
  }

  const renderView = () => {
    switch (view) {
      case 'DASHBOARD':
        return (
          <DashboardView 
            user={user}
            categoryFilter={categoryFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onNavigateToRegistry={() => setView('REGISTRY')}
            onNavigateToFeed={() => setView('FEED')}
            onNavigateToResource={(title) => {
              setResourceContext({ title, sources: [] });
              setView('RESOURCES');
            }}
            disruptions={disruptions}
            suppliers={activeSuppliers}
            isRefreshing={isRefreshing}
            onResync={refreshDisruptions}
          />
        );
      case 'REGISTRY':
        return (
          <RegistryView 
            user={user}
            updateSectors={updateSectors}
            suppliers={activeSuppliers}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onSelectSupplier={navigateToSupplierIntelligence} 
            onAddSupplier={handleAddSupplier}
          />
        );
      case 'MAP':
        return (
          <MapView 
            suppliers={activeSuppliers}
            categoryFilter={categoryFilter}
            statusFilter={statusFilter}
            onSelectSupplier={navigateToSupplierIntelligence}
            disruptions={disruptions}
          />
        );
      case 'FEED':
        return (
          <FeedView 
            user={user} 
            categoryFilter={categoryFilter} 
            onNavigateToResources={(title) => {
              setResourceContext({ title, sources: [] });
              setView('RESOURCES');
            }} 
            disruptions={disruptions} 
            suppliers={suppliers} 
            isRefreshing={isRefreshing}
          />
        );
      case 'SETTINGS':
        return <SettingsView user={user} onNavigate={setView} />;
      case 'SUBSCRIPTION':
        return (
          <SubscriptionView 
            user={user}
            onBack={() => setView('SETTINGS')} 
            onNavigateToPayment={(plan) => {
              if (plan.name === 'Basic') {
                if (user) {
                  const updatedUser = { ...user, plan: 'Basic' };
                  setUser(updatedUser);
                  localStorage.setItem('cg_session', JSON.stringify(updatedUser));
                  toast.success("Basic Plan Activated", {
                    description: "Your network has been provisioned with Basic Tier capabilities."
                  });
                }
                return;
              }
              setSelectedPlan(plan);
              setView('PAYMENT');
            }} 
          />
        );
      case 'RESOURCES':
        return (
          <ResourcesView 
            onBack={() => {
              setResourceContext(null);
              setView('DASHBOARD');
            }} 
            context={resourceContext}
            disruptions={disruptions}
            suppliers={activeSuppliers}
          />
        );
      case 'PAYMENT':
        return (
          <PaymentView 
            onBack={() => setView('SUBSCRIPTION')} 
            selectedPlan={selectedPlan}
            onPaymentSuccess={(planName) => {
              if (user) {
                const updatedUser = { ...user, plan: planName };
                setUser(updatedUser);
                localStorage.setItem('cg_session', JSON.stringify(updatedUser));
                toast.success(`${planName} Plan Activated`, {
                  description: `Your enterprise handshake for ${planName} tier is complete.`
                });
              }
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
    <Layout 
      activeView={view} 
      onViewChange={setView} 
      onLogout={handleLogout}
      user={user}
      categoryFilter={categoryFilter}
      onCategoryFilterChange={setCategoryFilter}
    >
      <div className="relative h-full overflow-hidden flex flex-col">
        {/* Main Application Content - Responsive Padding */}
        <div className={`transition-all duration-700 flex-1 ${view === 'MAP' ? 'overflow-hidden' : 'overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 lg:py-10'} custom-scrollbar ${selectedSupplier ? 'opacity-20 blur-md scale-[0.98] pointer-events-none' : 'opacity-100 scale-100'}`}>
          {renderView()}
        </div>

        {/* Intelligence View Overlay */}
        {selectedSupplier && (
          <div className="fixed inset-0 z-50 bg-[#070b14]/90 backdrop-blur-xl overflow-y-auto animate-in slide-in-from-right-10 duration-500 shadow-2xl">
            <div className="max-w-[1600px] mx-auto p-4 sm:p-6 md:p-10 min-h-full">
              <IntelligenceView 
                user={user}
                supplier={selectedSupplier} 
                onBack={() => setSelectedSupplier(null)}
                onUpdateStatus={(status) => updateSupplierStatus(selectedSupplier.id, status)}
                onNavigateToResources={(context) => {
                    if (context) setResourceContext(context);
                    setSelectedSupplier(null);
                    setView('RESOURCES');
                }}
                isSimulated={simulatedRiskyNodes.includes(selectedSupplier.id)}
                onToggleSimulation={() => toggleNodeSimulation(selectedSupplier.id)}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
    <Toaster position="top-right" theme="dark" richColors />
  </>
  );
};

export default App;


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
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';

const App: React.FC = () => {
  const [view, setView] = useState<View>('DASHBOARD');
  const [direction, setDirection] = useState(0); // 1 for right, -1 for left

  const viewOrder: View[] = ['DASHBOARD', 'REGISTRY', 'MAP', 'FEED', 'RESOURCES', 'SETTINGS'];

  const handleViewChange = (newView: View) => {
    const oldIndex = viewOrder.indexOf(view);
    const newIndex = viewOrder.indexOf(newView);
    if (oldIndex !== -1 && newIndex !== -1) {
      setDirection(newIndex > oldIndex ? 1 : -1);
    }
    setView(newView);
  };

  const handleSwipe = (offset: number, velocity: number) => {
    const currentIndex = viewOrder.indexOf(view);
    if (currentIndex === -1) return;

    // Faster threshold: 30% of typical screen width (~100-150px) or high velocity
    const threshold = 80;
    const isFastSwipe = Math.abs(velocity) > 500;

    if ((offset < -threshold || (velocity < -500 && offset < -20)) && currentIndex < viewOrder.length - 1) {
      handleViewChange(viewOrder[currentIndex + 1]);
    } else if ((offset > threshold || (velocity > 500 && offset > 20)) && currentIndex > 0) {
      handleViewChange(viewOrder[currentIndex - 1]);
    }
  };

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vs_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.sectors) parsed.sectors = ['Logistics'];
      // Ensure Business tier for demo
      if (parsed.plan !== 'Business') parsed.plan = 'Business';
      return parsed;
    }
    return null;
  });
  
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<RiskStatus | 'ALL'>('ALL');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('vs_suppliers');
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
    localStorage.setItem('vs_suppliers', JSON.stringify(suppliers));
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
    if (user && isInitialMount.current) {
      refreshDisruptions();
      isInitialMount.current = false;
    }
    
    // Immediate resync on view change or user initialization if not already done
    if (user && !isRefreshing && disruptions.length === MOCK_DISRUPTIONS.length) {
       refreshDisruptions();
    }

    // Dynamic refresh frequency based on tier
    const getRefreshInterval = () => {
      switch (user?.plan) {
        case 'Business': return 120000;      // 2 mins (Real-time threshold)
        case 'Intermediate': return 21600000; // 6 hours
        case 'Basic': return 86400000;        // 24 hours
        default: return 86400000;
      }
    };

    const interval = setInterval(refreshDisruptions, getRefreshInterval());
    return () => clearInterval(interval);
  }, [suppliers.length, user?.plan, user]);

  const handleAuthComplete = (userData: User) => {
    setUser(userData);
    localStorage.setItem('vs_session', JSON.stringify(userData));
  };

  const updateSectors = (newSectors: string[]) => {
    if (user) {
      const updatedUser = { ...user, sectors: newSectors };
      setUser(updatedUser);
      localStorage.setItem('vs_session', JSON.stringify(updatedUser));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vs_session');
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
    const limit = getPlanNodeLimit(user?.plan);
    if (suppliers.length >= limit) {
      toast.error("Node Capacity Exceeded", {
        description: `Operational limit (${limit} nodes) reached for your current tier.`
      });
      return;
    }
    
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
            hqLocation={user.hqCoordinates || [37.7749, -122.4194]}
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
                  localStorage.setItem('vs_session', JSON.stringify(updatedUser));
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
            user={user}
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
                localStorage.setItem('vs_session', JSON.stringify(updatedUser));
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
      onViewChange={handleViewChange} 
      onLogout={handleLogout}
      user={user}
      categoryFilter={categoryFilter}
      onCategoryFilterChange={setCategoryFilter}
    >
      <div className="relative h-full overflow-hidden flex flex-col">
        {/* Main Application Content - Responsive Padding */}
        <motion.div 
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info) => handleSwipe(info.offset.x, info.velocity.x)}
          className={`flex-1 ${view === 'MAP' ? 'overflow-hidden' : 'overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 lg:py-10'} custom-scrollbar ${selectedSupplier ? 'opacity-20 blur-md scale-[0.98] pointer-events-none' : 'opacity-100 scale-100'}`}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={view}
              initial={{ x: direction > 0 ? 50 : -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -50 : 50, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Intelligence View Overlay */}
        <AnimatePresence>
          {selectedSupplier && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 300, restDelta: 0.5 }}
              className="fixed inset-0 z-50 bg-[#070b14]/90 backdrop-blur-xl overflow-y-auto shadow-2xl"
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
    <Toaster position="top-right" theme="dark" richColors />
  </>
  );
};

export default App;

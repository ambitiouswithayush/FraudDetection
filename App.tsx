import React, { useState, useEffect, useRef } from 'react';
import { Transaction, FraudCase, UserProfile, DashboardMetrics, DocumentStore } from './types';
import { generateTransaction, calculateStats } from './services/simulation';
import { calculateMetrics, generateAlerts, recordMetricsSnapshot, MetricsSnapshot } from './services/metrics';
import { getDocumentStore } from './services/documentStore';
import TransactionStream from './components/TransactionStream';
import AnalystPanel from './components/AnalystPanel';
import Dashboard from './components/Dashboard';
import DocumentStoreViewer from './components/DocumentStoreViewer';
import ToastContainer, { ToastMessage } from './components/Toast';
import { INITIAL_KNOWLEDGE_BASE, ICONS } from './constants';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<FraudCase[]>(INITIAL_KNOWLEDGE_BASE);
  const [selectedTxId, setSelectedTxId] = useState<string | undefined>(undefined);
  const [isPaused, setIsPaused] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showDocumentStore, setShowDocumentStore] = useState(false);
  const metricsHistoryRef = useRef<MetricsSnapshot[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [documentStore] = useState<DocumentStore>(getDocumentStore());

  // Simulation State
  const historyRef = useRef<number[]>([45, 60, 55, 12, 40, 50, 48]); // Seed history
  const [userProfile, setUserProfile] = useState<UserProfile>({
    history: historyRef.current,
    ...calculateStats(historyRef.current)
  });

  const addToast = (title: string, description: string, type: 'success' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, title, description, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Calculate Dashboard Metrics ---
  useEffect(() => {
    const alerts = generateAlerts(transactions, dashboardMetrics || undefined);
    const metrics = calculateMetrics(transactions, metricsHistoryRef.current, alerts);
    setDashboardMetrics(metrics);
  }, [transactions]);

  // --- Pipeline: Fast Path (Pathway Simulation) ---
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      // 1. Generate new TX based on current profile & KB
      const startTime = performance.now();
      const newTx = generateTransaction(userProfile, knowledgeBase);
      const responseTime = performance.now() - startTime;

      // 2. Update Stream State
      setTransactions(prev => [newTx, ...prev].slice(0, 50)); // Keep last 50

      // 3. Record metrics snapshot
      metricsHistoryRef.current = recordMetricsSnapshot(
        metricsHistoryRef.current,
        responseTime,
        newTx.riskLevel === 'CRITICAL'
      );

      // 4. Update Profile (Windowing simulation)
      if (newTx.riskLevel === 'LOW') {
         const newHistory = [...historyRef.current, newTx.amount].slice(-50); // Rolling window 50
         historyRef.current = newHistory;
         setUserProfile({ history: newHistory, ...calculateStats(newHistory) });
      }
    }, 2500); // New TX every 2.5s

    return () => clearInterval(interval);
  }, [knowledgeBase, userProfile, isPaused]);

  // Manually Trigger a Fraud Event (For Demo Purposes)
  const triggerFraudEvent = () => {
    const type = Math.random() > 0.5 ? 'BEHAVIORAL' : 'SIGNATURE';
    const newTx = generateTransaction(userProfile, knowledgeBase, type);
    setTransactions(prev => [newTx, ...prev]);
    setSelectedTxId(newTx.id);
    setIsPaused(true); // Pause so they can look at it
    addToast('Simulation Triggered', `Injected a ${type} anomaly for analysis. Stream paused.`, 'info');
  };

  // --- Feedback Loop ---
  const handleAddToKnowledgeBase = (tx: Transaction, notes: string) => {
    const newCase: FraudCase = {
      id: `CASE_${tx.id}`,
      narrative: tx.narrative,
      merchant: tx.merchant,
      type: "Confirmed Fraud (Analyst Feedback)",
      vectorId: "pending_vectorization" // In real app, we'd trigger embedding job here
    };
    
    // Update local state (Simulating Document Store update)
    setKnowledgeBase(prev => [...prev, newCase]);
    
    // Visual feedback
    addToast('Feedback Loop Active', `Transaction ${tx.id} added to Knowledge Base. Future similar patterns will be flagged.`, 'success');
  };

  const handleUpdateStatus = (id: string, status: any) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const selectedTx = transactions.find(t => t.id === selectedTxId) || null;

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-200 flex overflow-hidden font-sans">
      
      {/* Top Nav Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 z-20 flex items-center px-6">
        <div className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity">
          <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-500/20 group-hover:shadow-blue-400/40 transition-all">
            {ICONS.Shield}
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-white">FraudLens</h1>
            <p className="text-xs text-slate-400">Hybrid Detection</p>
          </div>
        </div>
      </div>

      {/* Sidebar / Nav */}
      <nav className="w-16 flex flex-col items-center py-6 border-r border-slate-800 bg-slate-900 z-20 mt-16">
        <div className="flex-1 flex flex-col gap-6 w-full items-center">
          <button
            onClick={() => {
              setShowDashboard(false);
              setShowDocumentStore(!showDocumentStore);
            }}
            className={`p-3 rounded-lg transition relative group ${
              showDocumentStore
                ? 'bg-slate-800 text-orange-400'
                : 'text-slate-500 hover:bg-slate-800 hover:text-orange-400'
            }`}
            aria-label="Document Store"
          >
             {ICONS.Database}
             <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Document Store</span>
          </button>
          <button
            onClick={() => {
              setShowDocumentStore(false);
              setShowDashboard(!showDashboard);
            }}
            className={`p-3 rounded-lg transition relative group ${
              showDashboard
                ? 'bg-slate-800 text-purple-400'
                : 'text-slate-500 hover:bg-slate-800 hover:text-purple-400'
            }`}
            aria-label="Dashboard"
          >
             {ICONS.BarChart}
             <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Dashboard</span>
          </button>
          <button
            onClick={() => {
              setShowDashboard(false);
              setShowDocumentStore(false);
            }}
            className="p-3 bg-slate-800 text-blue-400 rounded-lg transition hover:bg-slate-700 relative group"
            aria-label="Live Monitor"
          >
             {ICONS.Activity}
             <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Live Monitor</span>
          </button>
          <button
            onClick={triggerFraudEvent}
            className="p-3 text-yellow-500 hover:bg-slate-800 rounded-lg transition hover:text-yellow-400 relative group"
            aria-label="Inject Fraud Event"
          >
             {ICONS.Zap}
             <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Inject Event</span>
          </button>
        </div>

        <button
          onClick={() => setIsPaused(!isPaused)}
          className={`p-2 rounded-full font-bold text-[10px] w-12 h-12 flex items-center justify-center mb-4 transition-colors relative group ${isPaused ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400'}`}
          aria-label={isPaused ? 'Play' : 'Pause'}
        >
          {isPaused ? 'PLAY' : 'PAUSE'}
          <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">{isPaused ? 'Resume' : 'Pause'}</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative mt-16">
        <ToastContainer messages={toasts} onRemove={removeToast} />

        {showDocumentStore ? (
          // Document Store View
          <DocumentStoreViewer documentStore={documentStore} />
        ) : showDashboard ? (
          // Dashboard View
          <>
            {dashboardMetrics && <Dashboard metrics={dashboardMetrics} />}
          </>
        ) : (
          // Analyst View
          <>
            {/* Stream Column */}
            <div className="w-80 flex-shrink-0 z-10 shadow-2xl border-r border-slate-800">
              <TransactionStream
                transactions={transactions}
                onSelect={(tx) => setSelectedTxId(tx.id)}
                selectedId={selectedTxId}
              />
            </div>

            {/* Workspace */}
            <AnalystPanel
              transaction={selectedTx}
              knowledgeBase={knowledgeBase}
              onAddToKnowledgeBase={handleAddToKnowledgeBase}
              onUpdateStatus={handleUpdateStatus}
            />

            {/* Knowledge Base (Mini View) - Optional Right Panel */}
            <div className="hidden 2xl:block w-72 bg-slate-900 border-l border-slate-800 p-4 overflow-y-auto">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                 {ICONS.Database} Knowledge Base
              </h3>
              <p className="text-[10px] text-slate-600 mb-4 bg-slate-950 p-2 rounded border border-slate-800">
                 Vectors Active: {knowledgeBase.length} <br/>
                 Engine: Hybrid (BM25 + Dense)
              </p>
              <div className="space-y-3">
                 {knowledgeBase.map((k) => (
                    <div key={k.id} className="p-3 rounded bg-slate-950 border border-slate-800/50 hover:border-slate-700 transition">
                       <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-slate-300 text-xs">{k.type}</span>
                          {k.id.startsWith('CASE_TX') && <span className="text-[9px] text-blue-400 bg-blue-900/20 px-1 rounded">LEARNED</span>}
                       </div>
                       <div className="text-xs text-slate-500 truncate" title={k.narrative}>{k.narrative}</div>
                    </div>
                 ))}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default App;
import React, { useState, useEffect, useRef } from 'react';
import { Transaction, FraudCase, UserProfile } from './types';
import { generateTransaction, calculateStats } from './services/simulation';
import TransactionStream from './components/TransactionStream';
import AnalystPanel from './components/AnalystPanel';
import ToastContainer, { ToastMessage } from './components/Toast';
import { INITIAL_KNOWLEDGE_BASE, ICONS } from './constants';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<FraudCase[]>(INITIAL_KNOWLEDGE_BASE);
  const [selectedTxId, setSelectedTxId] = useState<string | undefined>(undefined);
  const [isPaused, setIsPaused] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
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

  // --- Pipeline: Fast Path (Pathway Simulation) ---
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      // 1. Generate new TX based on current profile & KB
      const newTx = generateTransaction(userProfile, knowledgeBase);

      // 2. Update Stream State
      setTransactions(prev => [newTx, ...prev].slice(0, 50)); // Keep last 50

      // 3. Update Profile (Windowing simulation)
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
      
      {/* Sidebar / Nav */}
      <nav className="w-16 flex flex-col items-center py-6 border-r border-slate-800 bg-slate-900 z-20">
        <div className="mb-8 p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-500/20">
           {ICONS.Shield}
        </div>
        
        <div className="flex-1 flex flex-col gap-6 w-full items-center">
          <button className="p-3 bg-slate-800 text-blue-400 rounded-lg transition hover:bg-slate-700" title="Live Monitor">
             {ICONS.Activity}
          </button>
          <button 
            onClick={triggerFraudEvent}
            className="p-3 text-yellow-500 hover:bg-slate-800 rounded-lg transition hover:text-yellow-400"
            title="Inject Fraud Event (Demo)"
          >
             {ICONS.Zap}
          </button>
        </div>

        <button 
          onClick={() => setIsPaused(!isPaused)}
          className={`p-2 rounded-full font-bold text-[10px] w-12 h-12 flex items-center justify-center mb-4 transition-colors ${isPaused ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400'}`}
        >
          {isPaused ? 'PLAY' : 'PAUSE'}
        </button>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <ToastContainer messages={toasts} onRemove={removeToast} />
        
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

      </div>
    </div>
  );
};

export default App;
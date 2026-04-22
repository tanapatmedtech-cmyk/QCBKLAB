/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import IQCPage from './components/IQCPage';
import EQAPage from './components/EQAPage';
import AdminPage from './components/AdminPage';
import QCGuide from './components/QCGuide';
import QCSolver from './components/QCSolver';
import { User, QCResult, EQAResult, Instrument, QCConfig, QCEvent } from './types';
import { QC_CONFIGS, INSTRUMENTS } from './constants';
import SettingsPage from './components/SettingsPage';
import { auth } from './firebase';
import { signInAnonymously } from 'firebase/auth';
import { 
  testConnection, 
  syncResults, 
  syncEQAResults, 
  syncEvents, 
  syncUsers, 
  syncInstruments, 
  syncConfigs,
  addQCResult,
  addEQAResult,
  addQCEvent,
  saveUser,
  deleteUser,
  saveInstruments,
  saveConfigs,
  updateQCResults
} from './services/firebaseService';

const MOCK_RESULTS: QCResult[] = [
  {
    id: 'res-1',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    value: 101.2,
    level: 1,
    instrumentId: 'inst-1',
    testId: 'test-glu',
    operatorId: 'user-1',
    westgardViolations: [],
  },
  {
    id: 'res-2',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    value: 99.5,
    level: 1,
    instrumentId: 'inst-1',
    testId: 'test-glu',
    operatorId: 'user-1',
    westgardViolations: [],
  },
  {
    id: 'res-3',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    value: 105.8,
    level: 1,
    instrumentId: 'inst-1',
    testId: 'test-glu',
    operatorId: 'user-1',
    westgardViolations: ['1-2s'],
  },
  {
    id: 'res-4',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    value: 248.2,
    level: 2,
    instrumentId: 'inst-1',
    testId: 'test-glu',
    operatorId: 'user-1',
    westgardViolations: [],
  },
  {
    id: 'res-5',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    value: 251.5,
    level: 2,
    instrumentId: 'inst-1',
    testId: 'test-glu',
    operatorId: 'user-1',
    westgardViolations: [],
  },
  {
    id: 'res-6',
    date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    value: 395.2,
    level: 3,
    instrumentId: 'inst-1',
    testId: 'test-glu',
    operatorId: 'user-1',
    westgardViolations: [],
  },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [results, setResults] = useState<QCResult[]>([]);
  const [eqaResults, setEqaResults] = useState<EQAResult[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>(INSTRUMENTS);
  const [configs, setConfigs] = useState<QCConfig[]>(QC_CONFIGS);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<QCEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize Firebase and Sync
  useEffect(() => {
    let activeUnsub: (() => void) | null = null;
    
    const initFirebaseData = async () => {
      try {
        if (!auth.currentUser) {
          try {
            await signInAnonymously(auth);
          } catch (authErr: any) {
            console.warn('[AUTH] Anonymous sign-in skipped/failed:', authErr.code);
          }
        }
        await testConnection();

        // Start synchronization
        const unsubResults = syncResults(setResults);
        const unsubEQA = syncEQAResults(setEqaResults);
        const unsubEvents = syncEvents(setEvents);
        const unsubUsers = syncUsers((data) => {
          setUsers(data);
          setLoading(false); 
        });

        // Fail-safe: if we don't get users within 5 seconds, still allow login UI to show
        setTimeout(() => setLoading(false), 5000);
        const unsubInst = syncInstruments((data) => {
          if (data.length > 0) setInstruments(data);
        });
        const unsubConfigs = syncConfigs((data) => {
          if (data.length > 0) setConfigs(data);
        });

        activeUnsub = () => {
          unsubResults();
          unsubEQA();
          unsubEvents();
          unsubUsers();
          unsubInst();
          unsubConfigs();
        };
      } catch (err) {
        console.error('Firebase Auth/Connection init failed', err);
        setLoading(false);
      }
    };

    initFirebaseData();
    
    return () => {
      if (activeUnsub) activeUnsub();
    };
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    // localStorage.setItem('qc_user', JSON.stringify(u)); // Disabled as requested
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('qc_user');
  };

  const handleAddResult = (res: QCResult) => {
    addQCResult(res);
  };

  const handleAddEQA = (res: EQAResult) => {
    addEQAResult(res);
  };

  const handleUpdateInstruments = (inst: Instrument[]) => saveInstruments(inst);
  const handleUpdateConfigs = (conf: QCConfig[]) => saveConfigs(conf);

  const handleAddEvent = (event: QCEvent) => {
    addQCEvent(event);
  };

  const handleUpdateUser = (u: User) => saveUser(u);
  const handleDeleteUser = (uid: string) => deleteUser(uid);

  const handleUpdateResults = (updated: QCResult[]) => {
    updateQCResults(updated);
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-[#0F4C81] flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <div className="text-center">
            <p className="text-white font-bold tracking-tight">QC BK Lab Plus<sup>+</sup></p>
            <p className="text-white/60 text-xs mt-1">กำลังเริ่มระบบและความปลอดภัย...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={handleLogin} users={users} loadingData={loading} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      user={user} 
      onLogout={handleLogout}
    >
      {activeTab === 'dashboard' && <Dashboard results={results} eqaResults={eqaResults} configs={configs} instruments={instruments} setActiveTab={setActiveTab} />}
      {activeTab === 'iqc' && (
        <IQCPage 
          results={results} 
          onAddResult={handleAddResult} 
          configs={configs} 
          instruments={instruments} 
          currentUser={user}
          events={events}
          onAddEvent={handleAddEvent}
        />
      )}
      {activeTab === 'eqa' && (
        <EQAPage 
          eqaResults={eqaResults} 
          onAddEQA={handleAddEQA} 
          configs={configs} 
          instruments={instruments} 
        />
      )}
      {activeTab === 'solver' && <QCSolver configs={configs} />}
      {activeTab === 'guide' && <QCGuide />}
      {activeTab === 'settings' && (
        <SettingsPage 
          instruments={instruments} 
          setInstruments={handleUpdateInstruments}
          configs={configs}
          setConfigs={handleUpdateConfigs}
        />
      )}
      {activeTab === 'admin' && (
        <AdminPage 
          users={users}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          results={results}
          onUpdateResults={handleUpdateResults}
          configs={configs}
          instruments={instruments}
        />
      )}
      {activeTab === 'instruments' && (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
          <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm text-center">
            <h2 className="text-xl font-bold text-slate-800">Instrument Inventory</h2>
            <p className="mt-2 text-sm">Managing {instruments.length} active analyzer platforms.</p>
            <button onClick={() => setActiveTab('settings')} className="mt-4 text-[#0F4C81] text-xs font-bold hover:underline">
              Manage in Settings
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}

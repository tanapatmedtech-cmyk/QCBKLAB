import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Settings, Beaker, FlaskConical, Save, X } from 'lucide-react';
import { Instrument, QCConfig } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsPageProps {
  instruments: Instrument[];
  setInstruments: (inst: Instrument[]) => void;
  configs: QCConfig[];
  setConfigs: (conf: QCConfig[]) => void;
}

export default function SettingsPage({ instruments, setInstruments, configs, setConfigs }: SettingsPageProps) {
  const [activeSubTab, setActiveSubTab] = useState<'tests' | 'instruments'>('tests');
  
  // Instrument Form State
  const [instForm, setInstForm] = useState({ name: '', model: '' });
  
  // Test Form State
  const [testForm, setTestForm] = useState<Partial<QCConfig>>({
    testName: '',
    unit: '',
    tea: 10,
    level1: { mean: 0, sd: 0 },
    level2: { mean: 0, sd: 0 },
    level3: { mean: 0, sd: 0 }
  });

  const handleAddInstrument = () => {
    if (!instForm.name) return;
    const newInst: Instrument = {
      id: 'inst-' + Math.random().toString(36).substr(2, 5),
      name: instForm.name,
      model: instForm.model
    };
    setInstruments([...instruments, newInst]);
    setInstForm({ name: '', model: '' });
  };

  const handleDeleteInstrument = (id: string) => {
    setInstruments(instruments.filter(i => i.id !== id));
  };

  const handleAddTest = () => {
    if (!testForm.testName) return;
    const newConfig: QCConfig = {
      id: 'test-' + Math.random().toString(36).substr(2, 5),
      testName: testForm.testName || '',
      unit: testForm.unit || '',
      tea: testForm.tea || 0,
      level1: testForm.level1 || { mean: 0, sd: 0 },
      level2: testForm.level2 || { mean: 0, sd: 0 },
      level3: testForm.level3 || { mean: 0, sd: 0 }
    };
    setConfigs([...configs, newConfig]);
    setTestForm({
      testName: '',
      unit: '',
      tea: 10,
      level1: { mean: 0, sd: 0 },
      level2: { mean: 0, sd: 0 },
      level3: { mean: 0, sd: 0 }
    });
  };

  const handleDeleteConfig = (id: string) => {
    setConfigs(configs.filter(c => c.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-fit">
        <button
          onClick={() => setActiveSubTab('tests')}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeSubTab === 'tests' ? 'bg-[#0F4C81] text-white shadow-lg shadow-[#0F4C81]/20' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FlaskConical size={18} />
          <span>Test Parameters</span>
        </button>
        <button
          onClick={() => setActiveSubTab('instruments')}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeSubTab === 'instruments' ? 'bg-[#0F4C81] text-white shadow-lg shadow-[#0F4C81]/20' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Beaker size={18} />
          <span>Analyzers</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'tests' ? (
          <motion.div
            key="tests"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Test Form */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center space-x-2">
                <Plus size={18} className="text-[#0F4C81]" />
                <span>Add New Test</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 shadow-sm block ml-1">Test Name</label>
                  <input
                    type="text"
                    value={testForm.testName}
                    onChange={(e) => setTestForm({ ...testForm, testName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 shadow-sm block ml-1">Unit</label>
                    <input
                      type="text"
                      value={testForm.unit}
                      onChange={(e) => setTestForm({ ...testForm, unit: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 shadow-sm block ml-1">TEa (%)</label>
                    <input
                      type="number"
                      value={testForm.tea}
                      onChange={(e) => setTestForm({ ...testForm, tea: parseFloat(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-blue-50/50 rounded-xl space-y-3 border border-blue-100/50">
                    <p className="text-[10px] font-bold text-[#0F4C81] uppercase tracking-widest">Level 1 (Target)</p>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder="Mean"
                        value={testForm.level1?.mean}
                        onChange={(e) => setTestForm({ ...testForm, level1: { ...testForm.level1!, mean: parseFloat(e.target.value) } })}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="SD"
                        value={testForm.level1?.sd}
                        onChange={(e) => setTestForm({ ...testForm, level1: { ...testForm.level1!, sd: parseFloat(e.target.value) } })}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50/50 rounded-xl space-y-3 border border-purple-100/50">
                    <p className="text-[10px] font-bold text-purple-700 uppercase tracking-widest">Level 2 (Target)</p>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder="Mean"
                        value={testForm.level2?.mean}
                        onChange={(e) => setTestForm({ ...testForm, level2: { ...testForm.level2!, mean: parseFloat(e.target.value) } })}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="SD"
                        value={testForm.level2?.sd}
                        onChange={(e) => setTestForm({ ...testForm, level2: { ...testForm.level2!, sd: parseFloat(e.target.value) } })}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-rose-50/50 rounded-xl space-y-3 border border-rose-100/50">
                    <p className="text-[10px] font-bold text-rose-700 uppercase tracking-widest">Level 3 (Target)</p>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder="Mean"
                        value={testForm.level3?.mean}
                        onChange={(e) => setTestForm({ ...testForm, level3: { ...testForm.level3!, mean: parseFloat(e.target.value) } })}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="SD"
                        value={testForm.level3?.sd}
                        onChange={(e) => setTestForm({ ...testForm, level3: { ...testForm.level3!, sd: parseFloat(e.target.value) } })}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAddTest}
                  className="w-full bg-[#0F4C81] text-white font-bold py-3 rounded-xl hover:bg-[#0b3a63] transition-all shadow-lg shadow-[#0F4C81]/20 mt-4"
                >
                  Save Test Config
                </button>
              </div>
            </div>

            {/* Test List */}
            <div className="lg:col-span-8 space-y-4">
              {configs.map(config => (
                <div key={config.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-[#0F4C81]/30 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-[#0F4C81]">
                      <FlaskConical size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{config.testName}</h4>
                      <div className="flex items-center space-x-3 text-[10px] font-bold text-slate-400 mt-0.5">
                        <span className="uppercase">{config.unit}</span>
                        <span className="h-1 w-1 bg-slate-200 rounded-full"></span>
                        <span className="uppercase text-[#0F4C81]">TEa: {config.tea}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-8">
                    <div className="hidden md:flex items-center space-x-4 text-[10px] font-mono">
                      <div className="text-blue-600">LV1: {config.level1.mean}</div>
                      <div className="text-purple-600">LV2: {config.level2.mean}</div>
                      {config.level3 && config.level3.mean > 0 && <div className="text-rose-600">LV3: {config.level3.mean}</div>}
                    </div>
                    <button 
                      onClick={() => handleDeleteConfig(config.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="instruments"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Instrument Form */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center space-x-2">
                <Plus size={18} className="text-[#0F4C81]" />
                <span>Add New Analyzer</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 shadow-sm block ml-1">Instrument Name</label>
                  <input
                    type="text"
                    value={instForm.name}
                    onChange={(e) => setInstForm({ ...instForm, name: e.target.value })}
                    placeholder="e.g. Alinity c"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 shadow-sm block ml-1">Brand / Model</label>
                  <input
                    type="text"
                    value={instForm.model}
                    onChange={(e) => setInstForm({ ...instForm, model: e.target.value })}
                    placeholder="e.g. Abbott"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all font-medium"
                  />
                </div>
                <button
                  onClick={handleAddInstrument}
                  className="w-full bg-[#0F4C81] text-white font-bold py-3 rounded-xl hover:bg-[#0b3a63] transition-all shadow-lg shadow-[#0F4C81]/20 mt-2 flex items-center justify-center space-x-2"
                >
                  <Plus size={18} />
                  <span>Register Analyzer</span>
                </button>
              </div>
            </div>

            {/* Instrument List */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {instruments.map(inst => (
                <div key={inst.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-[#0F4C81]/30 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-[#0F4C81]">
                      <Beaker size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{inst.name}</h4>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{inst.model}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteInstrument(inst.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

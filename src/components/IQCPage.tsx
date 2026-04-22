import React, { useState, useMemo } from 'react';
import { Plus, History, Activity, Info, BarChart3, TrendingUp, Zap, ShieldCheck, X } from 'lucide-react';
import { QCResult, QCConfig, Instrument, QCMetrics, User, QCEvent } from '../types';
import { QC_CONFIGS, INSTRUMENTS } from '../constants';
import { checkWestgardRules, getQCMetrics, getSigmaMessage, suggestWestgardRules } from '../lib/qcLogic';
import LJChart from './LJChart';
import { motion } from 'motion/react';

interface IQCPageProps {
  results: QCResult[];
  onAddResult: (result: QCResult) => void;
  configs: QCConfig[];
  instruments: Instrument[];
  currentUser: User;
  events: QCEvent[];
  onAddEvent: (event: QCEvent) => void;
}

export default function IQCPage({ results, onAddResult, configs, instruments, currentUser, events, onAddEvent }: IQCPageProps) {
  const [selectedTest, setSelectedTest] = useState<string>(configs[0]?.id || '');
  const [selectedInst, setSelectedInst] = useState<string>(instruments[0]?.id || '');
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [value, setValue] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  
  // Event state
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventType, setEventType] = useState<QCEvent['type']>('calibration');
  const [eventDesc, setEventDesc] = useState('');
  const [lotNum, setLotNum] = useState('');

  const config = useMemo(() => configs.find((c) => c.id === selectedTest) || configs[0], [configs, selectedTest]);

  const currentLevelResults = useMemo(() => 
    results.filter(r => r.testId === selectedTest && r.level === level)
  , [results, selectedTest, level]);

  const currentEvents = useMemo(() => 
    events.filter(e => e.testId === selectedTest && e.instrumentId === selectedInst)
  , [events, selectedTest, selectedInst]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: QCEvent = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      type: eventType,
      testId: selectedTest,
      instrumentId: selectedInst,
      lotNumber: lotNum,
      operatorId: currentUser.id,
      description: eventDesc
    };
    onAddEvent(newEvent);
    setShowEventModal(false);
    setEventDesc('');
    setLotNum('');
  };

  const metrics: QCMetrics = useMemo(() => {
    if (!config) return { mean: 0, sd: 0, cv: 0, bias: 0, sigma: 0, uncertainty: 0 };
    const rawValues = currentLevelResults.map(r => r.value);
    const targetMean = level === 1 ? config.level1.mean : (level === 2 ? config.level2.mean : config.level3?.mean || 0);
    return getQCMetrics(rawValues, targetMean, config.tea);
  }, [currentLevelResults, level, config]);

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200">
        <Activity size={48} className="text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-800">No Test Configuration Available</h3>
        <p className="text-sm text-slate-500 mt-2">Please add at least one test in the Settings page.</p>
      </div>
    );
  }

  const getSigmaColor = (sigma: number) => {
    if (sigma >= 6) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (sigma >= 4) return 'text-blue-600 bg-blue-50 border-blue-100';
    if (sigma >= 3) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  const getSigmaMessage = (sigma: number) => {
    if (sigma >= 6) return 'World Class';
    if (sigma >= 4) return 'Good';
    if (sigma >= 3) return 'Marginal';
    return 'Unacceptable';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value) return;

    const numValue = parseFloat(value);
    const violations = checkWestgardRules(numValue, results, config, level);

    const newResult: QCResult = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      value: numValue,
      level,
      instrumentId: selectedInst,
      testId: selectedTest,
      operatorId: currentUser.id,
      comment,
      westgardViolations: violations,
    };

    onAddResult(newResult);
    setValue('');
    setComment('');
  };

  return (
    <div className="space-y-8">
      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Input Form */}
        <div className="xl:col-span-4 space-y-6">
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
             <button 
               onClick={() => { setEventType('calibration'); setShowEventModal(true); }}
               className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
             >
               <Zap size={18} className="text-blue-500 mb-1 group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-bold text-slate-600 uppercase">Calibrate</span>
             </button>
             <button 
               onClick={() => { setEventType('reagent_change'); setShowEventModal(true); }}
               className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-2xl hover:border-purple-300 hover:bg-purple-50/50 transition-all group"
             >
               <History size={18} className="text-purple-500 mb-1 group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-bold text-slate-600 uppercase">Reagent</span>
             </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Plus className="text-[#0F4C81]" size={20} />
                <h3 className="font-bold text-slate-800">New QC Entry</h3>
              </div>
              <div className="text-[10px] font-bold text-slate-400">
                Operator: <span className="text-[#0F4C81]">{currentUser.name}</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Test Parameter</label>
                <select 
                  value={selectedTest}
                  onChange={(e) => setSelectedTest(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all cursor-pointer"
                >
                  {configs.map(c => <option key={c.id} value={c.id}>{c.testName}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Instrument</label>
                <select 
                  value={selectedInst}
                  onChange={(e) => setSelectedInst(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all cursor-pointer"
                >
                  {instruments.map(i => <option key={i.id} value={i.id}>{i.name} ({i.model})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Control Level</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setLevel(1)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        level === 1 ? 'bg-white text-[#0F4C81] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      LV 1
                    </button>
                    <button
                      type="button"
                      onClick={() => setLevel(2)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        level === 2 ? 'bg-white text-[#0F4C81] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      LV 2
                    </button>
                    {(config.level3?.mean || 0) > 0 && (
                      <button
                        type="button"
                        onClick={() => setLevel(3)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          level === 3 ? 'bg-white text-[#0F4C81] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        LV 3
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Result ({config.unit})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Comment (Optional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all h-20 resize-none"
                  placeholder="Reason for rerun, troubleshoot details..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0F4C81] text-white font-bold py-3 rounded-xl hover:bg-[#0b3a63] transition-all shadow-lg shadow-[#0F4C81]/20 flex items-center justify-center space-x-2"
              >
                <Plus size={18} />
                <span>Save QC Result</span>
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-4 text-emerald-600">
              <Info size={18} />
              <h3 className="font-bold text-sm">Target Params</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Mean</span>
                <span className="font-mono font-bold">
                  {level === 1 ? config.level1.mean : (level === 2 ? config.level2.mean : config.level3?.mean)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">SD</span>
                <span className="font-mono font-bold">
                  {level === 1 ? config.level1.sd : (level === 2 ? config.level2.sd : config.level3?.sd)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">1SD Range</span>
                <span className="font-mono text-emerald-600 font-bold">
                  {level === 1 
                    ? (config.level1.mean - config.level1.sd).toFixed(2) + ' - ' + (config.level1.mean + config.level1.sd).toFixed(2)
                    : level === 2
                      ? (config.level2.mean - config.level2.sd).toFixed(2) + ' - ' + (config.level2.mean + config.level2.sd).toFixed(2)
                      : (config.level3 ? (config.level3.mean - config.level3.sd).toFixed(2) + ' - ' + (config.level3.mean + config.level3.sd).toFixed(2) : 'N/A')
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and History */}
        <div className="xl:col-span-8 space-y-8">
          {/* L-J Chart Section */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 text-[#0F4C81] rounded-lg">
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Levey-Jennings Chart</h3>
                  <p className="text-xs text-slate-500 font-medium">Level {level} - Visualizing last 30 points</p>
                </div>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                 <span className="px-3 py-1 text-[10px] font-bold text-[#0F4C81] bg-white rounded-lg shadow-sm">
                   {config.testName}
                 </span>
              </div>
            </div>
            
            <LJChart results={results} config={config} level={level} />
          </div>

          {/* Six Sigma Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <div className="text-slate-400 mb-1 flex items-center space-x-1">
                <BarChart3 size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">SD / CV%</span>
              </div>
              <div className="text-sm font-bold text-slate-800">{metrics.sd.toFixed(3)}</div>
              <div className="text-[10px] text-slate-500">{metrics.cv.toFixed(2)}%</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <div className="text-slate-400 mb-1 flex items-center space-x-1">
                <TrendingUp size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Bias %</span>
              </div>
              <div className={`text-sm font-bold ${Math.abs(metrics.bias) > config.tea / 2 ? 'text-amber-600' : 'text-slate-800'}`}>
                {metrics.bias.toFixed(2)}%
              </div>
              <div className="text-[10px] text-slate-500">Target: {config.tea.toFixed(1)}%</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <div className="text-slate-400 mb-1 flex items-center space-x-1">
                <Zap size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Six Sigma</span>
              </div>
              <div className={`text-sm font-bold ${metrics.sigma >= 6 ? 'text-emerald-600' : metrics.sigma >= 3 ? 'text-blue-600' : 'text-red-500'}`}>
                {metrics.sigma.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500">{getSigmaMessage(metrics.sigma)}</div>
            </div>

            <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${getSigmaColor(metrics.sigma)}`}>
              <div className="text-xs font-bold mb-1">Recommended Rules</div>
              <div className="flex flex-wrap gap-1 justify-center">
                {suggestWestgardRules(metrics.sigma).map(rule => (
                  <span key={rule} className="px-1.5 py-0.5 bg-white/50 rounded text-[10px] font-bold border border-current">
                    {rule}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-[#0F4C81] text-white p-4 rounded-xl shadow-sm flex flex-col items-center text-center">
              <div className="text-white/60 mb-1 flex items-center space-x-1">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Uncertainty (MU)</span>
              </div>
              <div className="text-sm font-bold">± {metrics.uncertainty?.toFixed(3)}</div>
              <div className="text-[10px] text-white/50">Expanded U (k=2)</div>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <History size={18} className="text-slate-400" />
                <h3 className="font-bold text-slate-800">Entry Log (Level {level})</h3>
              </div>
              <div className="text-[10px] text-slate-400 italic">Only active records shown</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">Value</th>
                    <th className="px-6 py-3">Z-Score</th>
                    <th className="px-6 py-3">Westgard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 italic">
                  {results
                    .filter(r => r.testId === selectedTest && r.level === level && r.status !== 'deleted')
                    .slice(-5)
                    .reverse()
                    .map(r => {
                      const params = r.level === 1 ? config.level1 : (r.level === 2 ? config.level2 : config.level3);
                      if (!params) return null;
                      const z = (r.value - params.mean) / params.sd;
                      return (
                        <tr key={r.id}>
                          <td className="px-6 py-3">{new Date(r.date).toLocaleTimeString()}</td>
                          <td className="px-6 py-3 font-mono font-bold">{r.value}</td>
                          <td className={`px-6 py-3 font-mono font-bold ${Math.abs(z) > 2 ? 'text-amber-600' : 'text-slate-400'}`}>
                            {z.toFixed(2)}
                          </td>
                          <td className="px-6 py-3 font-bold text-xs">
                            {r.westgardViolations.length > 0 ? (
                              <span className="text-red-500">{r.westgardViolations.join(', ')}</span>
                            ) : (
                              <span className="text-emerald-500">OK</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Events History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp size={18} className="text-[#0F4C81]" />
            <h3 className="font-bold text-slate-800">Calibration & Event Timeline</h3>
          </div>
        </div>
        <div className="p-6">
           {currentEvents.length === 0 ? (
             <div className="text-center py-8 text-slate-400 text-sm italic">No significant events recorded for this instrument/test.</div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {currentEvents.map(e => (
                 <div key={e.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
                   <div className={`p-2 rounded-lg ${
                     e.type === 'calibration' ? 'bg-blue-100 text-blue-600' : 
                     e.type === 'reagent_change' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'
                   }`}>
                     {e.type === 'calibration' ? <Zap size={16} /> : <History size={16} />}
                   </div>
                   <div>
                     <div className="flex items-center space-x-2">
                       <span className="text-xs font-bold text-slate-800 uppercase tracking-tighter">{e.type.replace('_', ' ')}</span>
                       <span className="text-[10px] text-slate-400">{new Date(e.date).toLocaleDateString()}</span>
                     </div>
                     <p className="text-xs text-slate-600 mt-1">{e.description}</p>
                     {e.lotNumber && <p className="text-[9px] font-bold text-slate-400 mt-1">LOT: {e.lotNumber}</p>}
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800">New {eventType.replace('_', ' ')} Event</h3>
              <button onClick={() => setShowEventModal(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateEvent} className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Event Description</label>
                  <input 
                    required
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    placeholder="e.g. Six-point calibration done."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all"
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Lot Number / Batch (Optional)</label>
                  <input 
                    value={lotNum}
                    onChange={(e) => setLotNum(e.target.value)}
                    placeholder="e.g. LOT-5544"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all font-mono"
                  />
               </div>
               
               <button 
                type="submit"
                className="w-full bg-[#0F4C81] text-white font-bold py-3 rounded-xl hover:bg-[#0b3a63] transition-all"
               >
                 Record Event
               </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

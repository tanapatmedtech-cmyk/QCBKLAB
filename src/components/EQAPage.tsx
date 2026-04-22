import React, { useState } from 'react';
import { Plus, Microscope, History, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { EQAResult, QCConfig, Instrument } from '../types';
import { QC_CONFIGS, INSTRUMENTS } from '../constants';
import { calculateSDI } from '../lib/qcLogic';
import { motion } from 'motion/react';

interface EQAPageProps {
  eqaResults: EQAResult[];
  onAddEQA: (result: EQAResult) => void;
  configs: QCConfig[];
  instruments: Instrument[];
}

export default function EQAPage({ eqaResults, onAddEQA, configs, instruments }: EQAPageProps) {
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [selectedInst, setSelectedInst] = useState<string>('');

  // Sync selection if list changes or starts empty
  React.useEffect(() => {
    if (!selectedTest && configs.length > 0) {
      setSelectedTest(configs[0].id);
    }
    if (!selectedInst && instruments.length > 0) {
      setSelectedInst(instruments[0].id);
    }
  }, [configs, instruments, selectedTest, selectedInst]);

  const [cycle, setCycle] = useState<string>('Cycle 1/2026');
  const [yourResult, setYourResult] = useState<string>('');
  const [peerMean, setPeerMean] = useState<string>('');
  const [peerSD, setPeerSD] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [reagentLot, setReagentLot] = useState<string>('');
  const [reagentExp, setReagentExp] = useState<string>('');

  const config = configs.find((c) => c.id === selectedTest) || configs[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yourResult || !peerMean || !peerSD || !config) return;

    try {
      const resVal = parseFloat(yourResult);
      const meanVal = parseFloat(peerMean);
      const sdVal = parseFloat(peerSD);
      
      const sdi = calculateSDI(resVal, meanVal, sdVal);
      
      // Bias % = |(Result - Mean) / Mean| * 100
      const bias = Math.abs((resVal - meanVal) / meanVal) * 100;
      
      // Calculate Sigma using Peer CV
      // Peer CV = (Peer SD / Peer Mean) * 100
      const peerCV = (sdVal / meanVal) * 100;
      
      // For Sigma estimate: (TEa - |Bias|) / PeerCV
      // Fallback to CV 2.0% if peerCV is 0 or invalid
      const sigma = peerCV > 0 ? (config.tea - bias) / peerCV : (config.tea - bias) / 2.0;

      const newResult: EQAResult = {
        id: Math.random().toString(36).substring(2, 9),
        cycle,
        testId: selectedTest,
        instrumentId: selectedInst,
        yourResult: resVal,
        peerMean: meanVal,
        peerSD: sdVal,
        date: new Date().toISOString(),
        score: sdi,
        bias: bias,
        sigma: sigma,
        comment,
        reagentLot,
        reagentExp,
      };

      await onAddEQA(newResult);
      alert('บันทึกผล EQA สำเร็จเรียบร้อยแล้วครับ');
      
      // Clear form
      setYourResult('');
      setPeerMean('');
      setPeerSD('');
      setComment('');
      setReagentLot('');
      setReagentExp('');
    } catch (err) {
      console.error('EQA Save Error:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    }
  };

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200">
        <Microscope size={48} className="text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-800">No Test Configuration Available</h3>
        <p className="text-sm text-slate-500 mt-2">Please add at least one test in the Settings page.</p>
      </div>
    );
  }

  const getSDIColor = (sdi: number) => {
    const abs = Math.abs(sdi);
    if (abs <= 1.0) return 'text-emerald-500 bg-emerald-50';
    if (abs <= 2.0) return 'text-amber-500 bg-amber-50';
    return 'text-red-500 bg-red-50';
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center space-x-2 mb-6">
              <Microscope className="text-[#0F4C81]" size={20} />
              <h3 className="font-bold text-slate-800">เพิ่มรายการ EQA ใหม่</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">รอบการทดสอบ (EQA Cycle)</label>
                <input
                  type="text"
                  required
                  value={cycle}
                  onChange={(e) => setCycle(e.target.value)}
                  placeholder="เช่น Cycle 1/2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">รายการทดสอบ</label>
                  <select 
                    value={selectedTest}
                    onChange={(e) => setSelectedTest(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all cursor-pointer font-medium"
                  >
                    {configs.map(c => <option key={c.id} value={c.id}>{c.testName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">เครื่องมือที่ใช้</label>
                  <select 
                    value={selectedInst}
                    onChange={(e) => setSelectedInst(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all cursor-pointer font-medium"
                  >
                    {instruments.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Reagent Lot</label>
                  <input
                    type="text"
                    value={reagentLot}
                    onChange={(e) => setReagentLot(e.target.value)}
                    placeholder="LOT-12345"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">วันหมดอายุ</label>
                  <input
                    type="date"
                    value={reagentExp}
                    onChange={(e) => setReagentExp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">ค่าที่ได้ (Your Result - {config.unit})</label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={yourResult}
                  onChange={(e) => setYourResult(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Target/Peer Mean</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={peerMean}
                    onChange={(e) => setPeerMean(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Peer SD</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={peerSD}
                    onChange={(e) => setPeerSD(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0F4C81] text-white font-bold py-3 rounded-xl hover:bg-[#0b3a63] transition-all shadow-lg shadow-[#0F4C81]/20 flex items-center justify-center space-x-2"
              >
                <Plus size={18} />
                <span>บันทึกผล EQA</span>
              </button>
            </form>
          </motion.div>
        </div>

        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <History size={18} className="text-slate-400" />
                <h3 className="font-bold text-slate-800">ประวัติการทดสอบ EQA</h3>
              </div>
              <Award className="text-amber-500" size={20} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">รอบการทดสอบ / วันที่</th>
                    <th className="px-6 py-4">พารามิเตอร์</th>
                    <th className="px-6 py-4">กลุ่มน้ำยา (Reagent)</th>
                    <th className="px-6 py-4">ผลการทดสอบ vs เป้าหมาย</th>
                    <th className="px-6 py-4">ค่า SDI (Z-Score)</th>
                    <th className="px-6 py-4">Sigma (EQA)</th>
                    <th className="px-6 py-4">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {eqaResults.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                        ไม่พบข้อมูล EQA เริ่มต้นโดยการเพิ่มผลการทดสอบรอบล่าสุด
                      </td>
                    </tr>
                  ) : (
                    eqaResults.map(res => {
                      const test = configs.find(c => c.id === res.testId);
                      const sdi = res.score || 0;
                      const bias = res.bias !== undefined ? res.bias : Math.abs((res.yourResult - res.peerMean) / res.peerMean) * 100;
                      const sigmaEstimate = res.sigma !== undefined ? res.sigma : ( (test?.tea || 10) - bias) / 2.0;
                      return (
                        <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{res.cycle}</div>
                            <div className="text-[10px] text-slate-400">{new Date(res.date).toLocaleDateString('th-TH')}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium">{test?.testName}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-[11px] font-bold text-slate-600">LOT: {res.reagentLot || '-'}</div>
                            <div className="text-[10px] text-slate-400">{res.reagentExp ? new Date(res.reagentExp).toLocaleDateString('th-TH') : '-'}</div>
                          </td>
                          <td className="px-6 py-4 font-mono">
                            <div className="text-[#0F4C81] font-bold">{res.yourResult}</div>
                            <div className="text-slate-400 text-[10px]">T: {res.peerMean} (B: {bias.toFixed(1)}%)</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${getSDIColor(sdi)}`}>
                              {sdi.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className={`text-xs font-bold ${sigmaEstimate >= 6 ? 'text-emerald-600' : sigmaEstimate >= 3 ? 'text-blue-600' : 'text-red-500'}`}>
                                {sigmaEstimate.toFixed(2)}
                              </span>
                              <span className="text-[8px] font-bold text-slate-400 uppercase leading-none">Est. Sigma</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {Math.abs(sdi) <= 1 ? (
                              <div className="flex items-center text-emerald-600 space-x-1 text-xs font-bold">
                                <CheckCircle2 size={14} />
                                <span>ดีมาก (Passed)</span>
                              </div>
                            ) : Math.abs(sdi) <= 2 ? (
                              <div className="flex items-center text-amber-600 space-x-1 text-xs font-bold">
                                <AlertCircle size={14} />
                                <span>ผ่าน (Acceptable)</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-red-600 space-x-1 text-xs font-bold">
                                <AlertCircle size={14} />
                                <span>ไม่ผ่าน (Failed)</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

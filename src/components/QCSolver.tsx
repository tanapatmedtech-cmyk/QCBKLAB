import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Zap, AlertCircle, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { QCConfig } from '../types';

interface QCSolverProps {
  configs: QCConfig[];
}

export default function QCSolver({ configs }: QCSolverProps) {
  const [selectedTest, setSelectedTest] = useState(configs[0]?.id || '');
  const [bias, setBias] = useState<string>('');
  const [sigma, setSigma] = useState<string>('');

  // New states for calculation
  const [calcMeasuredMean, setCalcMeasuredMean] = useState<string>('');
  const [calcTargetMean, setCalcTargetMean] = useState<string>('');
  const [calcSD, setCalcSD] = useState<string>('');
  const [calcCV, setCalcCV] = useState<string>('');
  const [calcMU, setCalcMU] = useState<string>('');
  const [targetRange, setTargetRange] = useState<{ low2: number; high2: number; low3: number; high3: number } | null>(null);

  const config = configs.find(c => c.id === selectedTest);

  const calculateMetrics = () => {
    if (!calcMeasuredMean || !calcTargetMean || !calcSD || !config) return;
    
    const measured = parseFloat(calcMeasuredMean);
    const target = parseFloat(calcTargetMean);
    const sd = parseFloat(calcSD);
    
    if (measured === 0 || target === 0) return;

    // Bias % = |Measured - Target| / Target * 100
    const calculatedBias = Math.abs((measured - target) / target) * 100;
    
    // CV % = (SD / Measured) * 100
    const calculatedCV = (sd / measured) * 100;
    
    // Sigma = (TEa % - Bias %) / CV %
    const calculatedSigma = (config.tea - calculatedBias) / calculatedCV;

    // Measurement Uncertainty (MU) k=2 (95% CI)
    const calculatedMU = 2 * Math.sqrt(Math.pow(calculatedCV, 2) + Math.pow(calculatedBias, 2));

    setBias(calculatedBias.toFixed(2));
    setSigma(calculatedSigma.toFixed(2));
    setCalcCV(calculatedCV.toFixed(2));
    setCalcMU(calculatedMU.toFixed(2));

    // Calculate Target Ranges
    setTargetRange({
      low2: target - (2 * sd),
      high2: target + (2 * sd),
      low3: target - (3 * sd),
      high3: target + (3 * sd)
    });
  };

  const getAdvice = () => {
    if (!bias || !sigma) return null;
    const b = parseFloat(bias);
    const s = parseFloat(sigma);
    
    if (s >= 6) {
      return {
        level: 'World Class (คุณภาพระดับโลก)',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
        advice: 'ประสิทธิภาพดีเยี่ยม แนะนำให้ใช้กฎ 1-3s (N=2) เพียงอย่างเดียวเพื่อลดโอกาส False Rejection ไม่ต้องแก้ไขอะไรเพิ่มเติม'
      };
    } else if (s >= 4) {
      return {
        level: 'Good (คุณภาพดี)',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        advice: 'ประสิทธิภาพดี แนะนำให้ใช้กฎ Westgard Multi-rule (เช่น 1-3s/2-2s/R4s) และตรวจสอบปัจจัยที่ทำให้เกิด Bias หาก Bias > ' + (config ? (config.tea * 0.25).toFixed(1) : '25% ของ TEa') + '%'
      };
    } else if (s >= 3) {
      return {
        level: 'Marginal (พอใช้ - ขอบเขตอันตราย)',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        advice: 'ต้องเฝ้าระวังอย่างใกล้ชิด! ควรตรวจสอบการ Calibrate น้ำยา และเช็คความแม่นยำของ Pipette/Probe หาก Bias สูงเกินไป ให้พิจารณาทำ Maintenance ครั้งใหญ่'
      };
    } else {
      return {
        level: 'Unacceptable (ไม่ยอมรับ - ต้องแก้ไขด่วน)',
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-100',
        advice: 'หยุดรายงานผลผู้ป่วยทันที! ตรวจสอบหาสาเหตุของ Systematic Error (Bias) เช่น น้ำยาหมดอายุ, การเก็บรักษาผิดวิธี หรือเครื่องมีปัญหาเชิงเทคนิค ต้องแก้ไข Bias ให้ลดลงก่อนใช้งาน'
      };
    }
  };

  const advice = getAdvice();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
            <Target size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-indigo-900">QC Performance Solver</h2>
            <p className="text-sm text-slate-500 font-medium italic">วิเคราะห์ค่า Bias และ Sigma เพื่อแนวทางการแก้ไขที่ถูกต้อง</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <Zap className="text-indigo-600" size={18} />
            <h4 className="text-sm font-black text-slate-700 uppercase tracking-tight">เครื่องมือคำนวณ (Calculator)</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Measured Mean</label>
              <input 
                type="number"
                value={calcMeasuredMean}
                onChange={(e) => setCalcMeasuredMean(e.target.value)}
                placeholder="ค่าเฉลี่ยที่วัดได้"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target/Peer Mean</label>
              <input 
                type="number"
                value={calcTargetMean}
                onChange={(e) => setCalcTargetMean(e.target.value)}
                placeholder="ค่าเป้าหมาย"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SD (Measured)</label>
              <input 
                type="number"
                value={calcSD}
                onChange={(e) => setCalcSD(e.target.value)}
                placeholder="ค่า SD"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
              />
            </div>
            <div className="flex items-end">
              <button 
                onClick={calculateMetrics}
                className="w-full bg-indigo-600 text-white font-bold h-[42px] rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
              >
                <span>คำนวณ</span>
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {calcCV && (
              <div className="flex items-center space-x-4 bg-indigo-50 border border-indigo-100 p-3 px-5 rounded-2xl">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-indigo-400 uppercase leading-none">Calculated CV%</span>
                  <span className="text-sm font-bold text-indigo-700">{calcCV}%</span>
                </div>
              </div>
            )}
            {calcMU && (
              <div className="flex items-center space-x-4 bg-teal-50 border border-teal-100 p-3 px-5 rounded-2xl">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-teal-400 uppercase leading-none">Measurement Uncertainty (U)</span>
                  <span className="text-sm font-bold text-teal-700">{calcMU}%</span>
                </div>
              </div>
            )}
            {targetRange && (
              <div className="flex items-center space-x-4 bg-slate-100 border border-slate-200 p-3 px-5 rounded-2xl">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase leading-none">Target Range (2SD / 3SD)</span>
                  <div className="flex space-x-3 mt-0.5">
                    <span className="text-xs font-bold text-slate-700">2SD: {targetRange.low2.toFixed(2)} - {targetRange.high2.toFixed(2)}</span>
                    <span className="text-xs font-bold text-slate-700">3SD: {targetRange.low3.toFixed(2)} - {targetRange.high3.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เลือกรายการทดสอบ</label>
            <select 
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
            >
              {configs.map(c => <option key={c.id} value={c.id}>{c.testName}</option>)}
            </select>
            {config && (
              <div className="flex items-center space-x-1 mt-2 ml-1">
                <Info size={12} className="text-indigo-400" />
                <span className="text-[10px] font-bold text-indigo-400 uppercase">TEa: {config.tea}%</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ค่า BIAS (%)</label>
            <input 
              type="number"
              step="0.1"
              value={bias}
              onChange={(e) => setBias(e.target.value)}
              placeholder="0.0"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono font-bold text-indigo-600"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ค่า SIGMA Score</label>
            <input 
              type="number"
              step="0.1"
              value={sigma}
              onChange={(e) => setSigma(e.target.value)}
              placeholder="0.0"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono font-bold text-indigo-600"
            />
          </div>
        </div>

        <AnimatePresence>
          {advice && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`p-8 rounded-3xl border-2 ${advice.bg} ${advice.border} relative overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 p-4 ${advice.color} opacity-20`}>
                <Zap size={100} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${advice.color} bg-white border ${advice.border}`}>
                    Analysis Result
                  </span>
                </div>
                <h3 className={`text-2xl font-black ${advice.color} mb-3`}>{advice.level}</h3>
                <div className="flex items-start space-x-3 bg-white/70 p-5 rounded-2xl border border-white">
                  <ChevronRight size={20} className={`mt-0.5 ${advice.color}`} />
                  <p className="text-slate-700 font-medium leading-relaxed italic">
                    {advice.advice}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 p-6 flex items-start space-x-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 mb-1">ทำไมต้องเช็ค Sigma?</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              ค่า Sigma ช่วยบอกความสามารถของเครื่องมือเทียบกับเกณฑ์ความผิดพลาด (TEa) ยิ่งค่าสูง ยิ่งมีโอกาสเกิดผลลัพธ์ที่ผิดพลาดน้อยลงในกระบวนการทำงานจริง
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 p-6 flex items-start space-x-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 mb-1">วิธีคำนวณแบบง่าย</h4>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 mt-2">
              <code className="text-[10px] text-indigo-600 font-black">Sigma = (TEa% - Bias%) / CV%</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

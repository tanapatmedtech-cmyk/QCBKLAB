import React from 'react';
import { AlertCircle, HelpCircle, CheckCircle2, FlaskConical, Settings2, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function QCGuide() {
  const iqcGuides = [
    {
      title: 'ผิดกฎ 1-3s (Violation)',
      severity: 'high',
      issue: 'เกิด Random error หรือ Systematic shift ขนาดใหญ่',
      checks: [
        'ตรวจสอบฟองอากาศใน Reagent หรือ Sample probe',
        'ตรวจสอบปริมาตร Reagent และความเสถียร',
        'ตรวจสอบว่าการเตรียม Control ถูกต้องตามขั้นตอนหรือไม่',
        'ตรวจสอบหลอดไฟ (Lamp) หรือตัวตรวจวัด (Detector)'
      ],
      action: 'REJECT (ไม่อนุญาตให้รายงานผลคนไข้) แก้ไขปัญหาก่อนเริ่มตรวจใหม่'
    },
    {
      title: 'ผิดกฎ 2-2s / 4-1s (Violation)',
      severity: 'medium',
      issue: 'เกิด Systematic error (การเบี่ยงเบนแบบต่อเนื่อง)',
      checks: [
        'ตรวจสอบการเปลี่ยน Lot น้ำยา (ต้องมีการ Calibrate ใหม่หรือไม่?)',
        'ตรวจสอบอุณหภูมิในตู้บ่ม (Incubator)',
        'ตรวจสอบสภาพการเก็บรักษาน้ำยา',
        'ตรวจสอบคราบสะสมที่ Probe'
      ],
      action: 'REJECT สำหรับ 2-2s / WARNING สำหรับ 4-1s ให้ตรวจสอบก่อนรายงานผล'
    },
    {
      title: 'ค่า Sigma < 3.0 (ไม่ผ่าน)',
      severity: 'high',
      issue: 'มี Bias สูง หรือความแม่นยำ (Precision) ต่ำเกินไปเมื่อเทียบกับ TEa',
      checks: [
        'ทบทวนเทคนิคของผู้ปฏิบัติงาน (Pipetting, Mixing)',
        'ทำการบำรุงรักษาเครื่อง (Maintenance) ใหญ่',
        'ปรึกษาฝ่ายเทคนิคเพื่อปรับค่า Calibration',
        'ประเมินว่าค่า TEa ที่ตั้งไว้เข้มงวดเกินไปหรือไม่สำหรับวิธีนี้'
      ],
      action: 'ต้องแก้ไขทันที และประเมินความคุ้มค่าของวิธีการตรวจนี้ใหม่'
    }
  ];

  const eqaGuides = [
    {
      title: 'ค่า SDI สูง (Z-Score > 2.0)',
      issue: 'ผลลัพธ์แตกต่างจากกลุ่มเปรียบเทียบ (Peer mean) อย่างมีนัยสำคัญ',
      checks: [
        'ตรวจสอบหน่วยที่รายงานเทียบกับกลุ่ม Peer',
        'ตรวจสอบความผิดพลาดในการคีย์ข้อมูล (Clerical Error)',
        'เปรียบเทียบ Lot น้ำยาที่ใช้ใน EQA กับน้ำยาที่ใช้ประจำวัน',
        'ตรวจสอบว่าจับกลุ่ม Peer ถูกต้องหรือไม่ (เครื่องและวิธีต้องเหมือนกัน)'
      ]
    },
    {
      title: 'ค่า Bias % ใน EQA สูง',
      issue: 'ค่าเฉลี่ยเบี่ยงเบนจากค่าเป้าหมายอย่างสม่ำเสมอ',
      checks: [
        'ทำการ Calibrate เครื่องใหม่อย่างระมัดระวัง',
        'ตรวจสอบ Matrix effects (ความแตกต่างระหว่างวัสดุ EQA กับเลือดจริง)',
        'ตรวจสอบวันหมดอายุและการเก็บรักษาน้ำยา'
      ]
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <HelpCircle size={120} />
        </div>
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-[#0F4C81] text-white rounded-2xl">
            <Zap size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#0F4C81]">คู่มือการแก้ไขปัญหา QC</h2>
            <p className="text-sm text-slate-500 font-medium">ขั้นตอนการตรวจสอบและการแก้ไขมาตรฐาน</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          {/* IQC Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-slate-800 border-b border-slate-100 pb-3">
              <FlaskConical size={18} className="text-[#0F4C81]" />
              <h3 className="font-bold uppercase tracking-wider text-xs">ข้อมูล IQC</h3>
            </div>
            {iqcGuides.map((guide, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-5 rounded-2xl border ${
                  guide.severity === 'high' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle size={16} className={guide.severity === 'high' ? 'text-red-500' : 'text-amber-500'} />
                  <h4 className={`font-bold text-sm ${guide.severity === 'high' ? 'text-red-800' : 'text-amber-800'}`}>
                    {guide.title}
                  </h4>
                </div>
                <p className="text-xs font-bold text-slate-600 mb-3">{guide.issue}</p>
                <ul className="space-y-1.5 mb-4">
                  {guide.checks.map((check, cIdx) => (
                    <li key={cIdx} className="text-[11px] text-slate-500 flex items-start space-x-2">
                      <span className="mt-1 text-slate-300">•</span>
                      <span>{check}</span>
                    </li>
                  ))}
                </ul>
                <div className={`text-[10px] p-2 rounded-lg font-black uppercase text-center ${
                  guide.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {guide.action}
                </div>
              </motion.div>
            ))}
          </div>

          {/* EQA Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-slate-800 border-b border-slate-100 pb-3">
              <Settings2 size={18} className="text-[#0F4C81]" />
              <h3 className="font-bold uppercase tracking-wider text-xs">ข้อมูล EQA</h3>
            </div>
            {eqaGuides.map((guide, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-5 rounded-2xl border bg-blue-50 border-blue-100"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle2 size={16} className="text-[#0F4C81]" />
                  <h4 className="font-bold text-sm text-[#0F4C81]">{guide.title}</h4>
                </div>
                <p className="text-xs font-bold text-blue-800/70 mb-3">{guide.issue}</p>
                <ul className="space-y-1.5">
                  {guide.checks.map((check, cIdx) => (
                    <li key={cIdx} className="text-[11px] text-slate-500 flex items-start space-x-2">
                      <span className="mt-1 text-blue-200">•</span>
                      <span>{check}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100 italic">
          <p className="text-xs text-slate-400 leading-relaxed">
            * คู่มือนี้อ้างอิงตามแนวทาง CLSI C24 และ Westgard multi-rule โปรดปฏิบัติตาม SOP และคำแนะนำจากผู้ผลิตเครื่องมือแพทย์ประกอบด้วยเสมอ
          </p>
        </div>
      </div>
    </div>
  );
}

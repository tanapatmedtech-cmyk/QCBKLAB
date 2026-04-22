import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType } from '../types';
import { Lock, User, SquareUser, ClipboardCheck, ArrowRight, Chrome } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInAnonymously } from 'firebase/auth';
import { saveUser } from '../services/firebaseService';

interface AuthProps {
  onLogin: (user: UserType) => void;
  users: UserType[];
  loadingData?: boolean;
}

export default function Auth({ onLogin, users, loadingData }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    password: '',
    role: 'MT' as 'MT' | 'MD',
  });

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      
      // Check if this google user already has a profile in our system
      let profile = users.find(u => u.id === fbUser.uid);
      const adminEmails = ['tanapatmedtech@gmail.com'];
      const isAdminEmail = fbUser.email ? adminEmails.includes(fbUser.email) : false;
      
      if (!profile) {
        // Create a basic profile for new google users
        profile = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Google User',
          licenseNumber: fbUser.email || 'G-USER',
          role: isAdminEmail ? 'ADMIN' : 'MT',
          status: isAdminEmail ? 'APPROVED' : 'PENDING',
        };
        await saveUser(profile);
      } else if (isAdminEmail && (profile.role !== 'ADMIN' || profile.status !== 'APPROVED')) {
        // Promote existing user if they match the admin email
        profile = {
          ...profile,
          role: 'ADMIN',
          status: 'APPROVED'
        };
        await saveUser(profile);
      }
      
      if (profile.status === 'PENDING') {
        setError('บัญชีของคุณอยู่ระหว่างการรออนุมัติจากผู้ดูแลระบบ (ADMIN)');
      } else if (profile.status === 'DENIED') {
        setError('บัญชีของคุณถูกปฏิเสธการเข้าใช้งาน');
      } else {
        onLogin(profile);
      }
    } catch (err: any) {
      console.error(err);
      setError('การเข้าสู่ระบบด้วย Google ล้มเหลว');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!auth.currentUser) {
        try {
          await signInAnonymously(auth);
        } catch (e) {
          console.warn('[AUTH] Session establishment failed');
        }
      }

      if (isLogin) {
        if (!users || users.length === 0) {
           setError('กำลังรอข้อมูลรายชื่อ... โปรดรอสักครู่แล้วลองใหม่');
           setLoading(false);
           return;
        }
        
        const user = users.find(u => u.licenseNumber === formData.licenseNumber && u.password === formData.password);
        if (user) {
          if (user.status === 'PENDING') {
            setError('บัญชีของคุณอยู่ระหว่างการรออนุมัติจากผู้ดูแลระบบ (ADMIN)');
          } else if (user.status === 'DENIED') {
            setError('บัญชีของคุณถูกปฏิเสธการเข้าใช้งาน');
          } else {
            onLogin(user);
          }
        } else {
          // Check for fallback admins
          const isAdmin001 = formData.licenseNumber === 'ADMIN-001' && formData.password === 'admin';
          const isAdmin002 = formData.licenseNumber === 'ADMIN-002' && formData.password === 'admin';
          
          if (isAdmin001 || isAdmin002) {
             const systemAdmin: UserType = {
                id: isAdmin001 ? 'admin-1' : 'admin-2',
                name: isAdmin001 ? 'Admin 001' : 'Admin 002',
                licenseNumber: formData.licenseNumber,
                password: 'admin',
                role: 'ADMIN',
                status: 'APPROVED'
              };
              onLogin(systemAdmin);
          } else {
            setError('รหัสผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
          }
        }
      } else {
        // Registration
        if (!formData.name || !formData.licenseNumber || !formData.password) {
          setError('โปรดกรอกข้อมูลให้ครบถ้วน');
          setLoading(false);
          return;
        }
        const exists = users.some(u => u.licenseNumber === formData.licenseNumber);
        if (exists) {
          setError('รหัสผู้ใช้นี้ลงทะเบียนไปแล้ว');
          setLoading(false);
          return;
        }

        const newUser: UserType = {
          id: Math.random().toString(36).substr(2, 9),
          name: formData.name,
          licenseNumber: formData.licenseNumber,
          password: formData.password,
          role: formData.role,
          status: 'PENDING',
        };

        await saveUser(newUser);
        setError('ลงทะเบียนสำเร็จ! โปรดแจ้ง ADMIN เพื่ออนุมัติสิทธิ์ครับ');
        setIsLogin(true);
        setFormData(prev => ({ ...prev, password: '' }));
      }
    } catch (err: any) {
      console.error('Submit Error:', err);
      let errorMsg = 'เกิดข้อผิดพลาด: ' + (err.message || 'Unknown');
      if (err.code) {
        errorMsg = `Firebase Error (${err.code}): ${err.message}`;
      } else if (err.message && err.message.startsWith('{')) {
        try {
          const parsed = JSON.parse(err.message);
          errorMsg = 'Database Error: ' + (parsed.error || 'Unknown');
        } catch (e) {}
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F4C81] flex items-center justify-center p-4">
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-400 rounded-full blur-[120px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10"
      >
        <div className="bg-slate-50 p-8 border-b border-slate-100 text-center">
          <div className="w-16 h-16 bg-[#0F4C81] rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-[#0F4C81]/20">
            <ClipboardCheck size={32} />
          </div>
          <h1 className="text-2xl font-black text-[#0F4C81] tracking-tight">QCBKLAB-PRO</h1>
          <p className="text-slate-400 text-sm font-medium mt-1">Laboratory Quality Control - Rebuilt v2.0</p>
        </div>

        <div className="p-8">
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                isLogin ? 'bg-[#0F4C81] text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                !isLogin ? 'bg-[#0F4C81] text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              สมัครสมาชิกใหม่
            </button>
          </div>

          {!isLogin && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-6 flex items-start space-x-3">
              <div className="bg-white p-1.5 rounded-lg shadow-sm text-blue-600 mt-0.5">
                <SquareUser size={16} />
              </div>
              <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                <strong>สำหรับเจ้าหน้าที่:</strong> สามารถพิมพ์ชื่อและตั้งรหัสผ่านเองได้เลย 
                (ใช้เมลใดก็ได้) เมื่อสมัครแล้วแจ้ง ADMIN เพื่ออนุมัติสิทธิ์ครับ
              </p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold mb-4 text-center border border-red-100"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="register-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Full Name (MT. Name)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Professional Role</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'MT' })}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                          formData.role === 'MT' ? 'bg-[#0F4C81] text-white border-[#0F4C81]' : 'bg-transparent text-slate-500 border-slate-200'
                        }`}
                      >
                        Medical Tech (MT)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'MD' })}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                          formData.role === 'MD' ? 'bg-[#0F4C81] text-white border-[#0F4C81]' : 'bg-transparent text-slate-500 border-slate-200'
                        }`}
                      >
                        Clinician (MD)
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <SquareUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                required
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                placeholder="License Number / ID"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all font-medium"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all font-medium"
              />
            </div>

            <button
               type="submit"
               disabled={loading}
               className="w-full bg-[#0F4C81] text-white font-bold py-4 rounded-xl hover:bg-[#0b3a63] disabled:opacity-50 transition-all shadow-lg shadow-[#0F4C81]/20 flex items-center justify-center group"
             >
               <span>{loading ? 'กำลังดำเนินการ...' : (isLogin ? 'เข้าใช้งานระบบ' : 'สมัครสมาชิกใหม่')}</span>
               <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
             </button>

             {isLogin && users.length === 0 && (
               <p className="text-[10px] text-center text-blue-600 font-medium animate-pulse mt-2">
                 ระบบกำลังดึงข้อมูลรายชื่อ... โปรดรอสักครู่ก่อนเข้าใช้งาน
               </p>
             )}

             <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                  <span className="bg-white px-3">หรือเข้าใช้ด้วย Google</span>
                </div>
             </div>

             <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full border-2 border-slate-100 bg-white text-slate-700 font-bold py-4 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all flex items-center justify-center space-x-3"
              >
                <Chrome size={20} className="text-[#4285F4]" />
                <span>เข้าสู่ระบบด้วย Google</span>
              </button>
          </form>

          <p className="text-center text-slate-400 text-xs mt-8">
            Protecting integrity, ensuring quality.<br/>
            &copy; 2024 BK Lab Diagnostics
          </p>
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState } from 'react';
import { User, QCResult, Instrument, QCConfig } from '../types';
import { ShieldCheck, Users, Activity, Key, Trash2, Edit2, Search, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPageProps {
  users: User[];
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  results: QCResult[];
  onUpdateResults: (results: QCResult[]) => void;
  configs: QCConfig[];
  instruments: Instrument[];
}

export default function AdminPage({ users, onUpdateUser, onDeleteUser, results, onUpdateResults, configs, instruments }: AdminPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleToggleActive = (resultId: string) => {
    const reason = prompt('Please enter reason for status change (Doubtful result, Equipment failure, etc.):');
    if (reason === null) return;

    const updated = results.map(r => {
      if (r.id === resultId) {
        return {
          ...r,
          status: r.status === 'deleted' ? 'active' : ('deleted' as any),
          deleteReason: reason || 'Manual adjustment'
        };
      }
      return r;
    });
    onUpdateResults(updated);
  };

  const handleToggleStatus = (userId: string, status: 'APPROVED' | 'DENIED' | 'PENDING') => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      onUpdateUser({ ...targetUser, status });
    }
  };

  const handleUpdatePassword = (userId: string) => {
    const newPass = prompt('Enter new password:');
    if (!newPass) return;
    
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      onUpdateUser({ ...targetUser, password: newPass });
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (!confirm('Are you sure you want to delete this user license?')) return;
    onDeleteUser(userId);
  };

  const filteredResults = results.filter(r => 
    configs.find(c => c.id === r.testId)?.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    users.find(u => u.id === r.operatorId)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.instrumentId.toLowerCase().includes(searchTerm.toLowerCase())
  ).reverse();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Management */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center space-x-2">
              <Users size={20} className="text-[#0F4C81]" />
              <span>User Licenses</span>
            </h3>
            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {users.length} Total
            </span>
          </div>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {users.map(u => (
              <div key={u.id} className={`p-4 rounded-2xl border transition-all group ${
                u.status === 'PENDING' ? 'bg-amber-50 border-amber-200' : 
                u.status === 'DENIED' ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-slate-800 text-sm">{u.name}</p>
                      {u.status === 'PENDING' && (
                        <span className="bg-amber-200 text-amber-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase flex items-center">
                          <AlertTriangle size={8} className="mr-1" /> Waiting
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">{u.licenseNumber} • {u.role}</p>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {u.status === 'PENDING' ? (
                      <>
                        <button onClick={() => handleToggleStatus(u.id, 'APPROVED')} className="p-1.5 text-emerald-600 hover:bg-white rounded-lg" title="Approve">
                          <CheckCircle size={14} />
                        </button>
                        <button onClick={() => handleToggleStatus(u.id, 'DENIED')} className="p-1.5 text-red-600 hover:bg-white rounded-lg" title="Deny">
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleUpdatePassword(u.id)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg">
                          <Key size={14} />
                        </button>
                        <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg">
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log / Result Management */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center space-x-2">
              <ShieldCheck size={20} className="text-emerald-600" />
              <span>Full Audit Trail</span>
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search by test, operator..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">MT / Operator</th>
                  <th className="px-6 py-4">Test Info</th>
                  <th className="px-6 py-4">Result</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 italic">
                {filteredResults.map(r => {
                  const operator = users.find(u => u.id === r.operatorId);
                  const test = configs.find(c => c.id === r.testId);
                  const inst = instruments.find(i => i.id === r.instrumentId);
                  const isDeleted = r.status === 'deleted';
                  
                  return (
                    <tr key={r.id} className={`group ${isDeleted ? 'bg-red-50/30' : 'hover:bg-slate-50 transition-colors'}`}>
                      <td className="px-6 py-4">
                        {isDeleted ? (
                          <div className="flex items-center space-x-1 text-red-500">
                            <X size={14} />
                            <span className="font-bold text-[10px] uppercase">Deleted</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-emerald-500">
                            <CheckCircle size={14} />
                            <span className="font-bold text-[10px] uppercase">Active</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{operator?.name || 'Unknown'}</div>
                        <div className="text-[10px] text-slate-400">{new Date(r.date).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{test?.testName} (LV {r.level})</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{inst?.name || r.instrumentId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-[#0F4C81]">{r.value}</div>
                        {isDeleted && (
                          <div className="text-[9px] text-red-400 max-w-[150px] truncate" title={r.deleteReason}>
                            R: {r.deleteReason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleToggleActive(r.id)}
                          className={`p-2 rounded-lg transition-all ${
                            isDeleted 
                              ? 'text-emerald-500 hover:bg-emerald-50' 
                              : 'text-red-400 hover:bg-red-50 hover:text-red-600'
                          }`}
                        >
                          {isDeleted ? <CheckCircle size={18} /> : <Trash2 size={18} />}
                        </button>
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
  );
}

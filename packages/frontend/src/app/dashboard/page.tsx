'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Clock, ShieldCheck, X, ChevronRight, Search, Plus, 
  Trash2, Building2, PoundSterling, History, Lock, MapPin, 
  Phone, CreditCard, HeartPulse, Save, Edit3, UserPlus
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [employees, setEmployees] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Employees');
  const [profileTab, setProfileTab] = useState('Overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  const [newEmployee, setNewEmployee] = useState({ 
    firstName: '', lastName: '', jobTitle: '', department: 'OPERATIONS', 
    payAmount: 0, niNumber: '', addressLine1: '', postcode: '',
    emergencyName: '', emergencyPhone: ''
  });

  const API_BASE = "https://employee-api-3oyj.onrender.com/api";

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE}/employees`);
      const data = await res.json();
      setEmployees(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleCreate = async () => {
    if (!newEmployee.firstName || !newEmployee.lastName) return alert("First and Last name are required.");
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee),
      });
      if (res.ok) {
        setIsAddingNew(false);
        setNewEmployee({ firstName: '', lastName: '', jobTitle: '', department: 'OPERATIONS', payAmount: 0, niNumber: '', addressLine1: '', postcode: '', emergencyName: '', emergencyPhone: '' });
        fetchEmployees();
      }
    } catch (err) { console.error(err); }
  };

  const handleUpdate = async () => {
    if (!selectedEmployee) return;
    try {
      const res = await fetch(`${API_BASE}/employees/${selectedEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedEmployee,
          jobTitle: selectedEmployee.records[0].jobTitle,
          department: selectedEmployee.records[0].department,
          payAmount: selectedEmployee.records[0].payAmount
        }),
      });
      if (res.ok) {
        setIsEditing(false);
        fetchEmployees();
      }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Terminate record?")) return;
    await fetch(`${API_BASE}/employees/${id}`, { method: 'DELETE' });
    setIsPanelOpen(false);
    fetchEmployees();
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col z-20 shadow-2xl">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg"><ShieldCheck className="text-white w-6 h-6" /></div>
          <span className="font-bold text-xl text-white tracking-tight">Vanguard HR</span>
        </div>
        <nav className="flex-1 mt-6 px-3 space-y-1">
          <button onClick={() => setActiveTab('Employees')} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition-all">
            <Users size={20} /> <span className="font-semibold text-sm">Employees</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto relative">
        <header className="bg-white h-16 border-b flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-full w-96 border border-slate-200">
            <Search className="text-slate-400 w-4 h-4" />
            <input type="text" placeholder="Search personnel..." className="bg-transparent border-none outline-none text-sm w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black shadow-lg uppercase">Admin</div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-end mb-10">
            <div><h1 className="text-4xl font-black tracking-tight">{activeTab}</h1><p className="text-slate-500 font-medium mt-1">Personnel Directory & Compliance</p></div>
            <button onClick={() => setIsAddingNew(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-200 flex items-center gap-3 transition-all active:scale-95"><UserPlus size={20} /> Onboard Staff</button>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr><th className="px-8 py-6">Personnel</th><th className="px-8 py-6">Assignment</th><th className="px-8 py-6 text-right pr-12 text-slate-300">Dossier</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.filter(e => `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())).map((emp) => (
                  <tr key={emp.id} className="hover:bg-blue-50/40 transition-all cursor-pointer group" onClick={() => { setSelectedEmployee(emp); setIsPanelOpen(true); setIsEditing(false); }}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-100 text-blue-600 flex items-center justify-center font-black shadow-sm group-hover:border-blue-200 transition-all">{emp.firstName[0]}</div>
                        <span className="font-bold text-slate-900 text-lg">{emp.firstName} {emp.lastName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-slate-700">{emp.records[0]?.jobTitle}</p>
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{emp.records[0]?.department}</p>
                    </td>
                    <td className="px-8 py-6 text-right pr-12 text-slate-300 group-hover:text-blue-600 transition-colors"><ChevronRight size={28} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ONBOARD SCREEN */}
        {isAddingNew && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsAddingNew(false)}>
            <div className="max-w-xl w-full bg-white h-full p-8 overflow-y-auto space-y-8 shadow-2xl animate-in slide-in-from-right duration-500" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center"><h3 className="text-2xl font-black tracking-tight">Personnel Intake</h3><button onClick={() => setIsAddingNew(false)}><X size={28}/></button></div>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Identity & Compliance</p>
                  <div className="grid grid-cols-2 gap-4">
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="First Name" value={newEmployee.firstName} onChange={e => setNewEmployee({...newEmployee, firstName: e.target.value})} />
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="Last Name" value={newEmployee.lastName} onChange={e => setNewEmployee({...newEmployee, lastName: e.target.value})} />
                  </div>
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="NI Number" value={newEmployee.niNumber} onChange={e => setNewEmployee({...newEmployee, niNumber: e.target.value})} />
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Home Address</p>
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="Line 1" value={newEmployee.addressLine1} onChange={e => setNewEmployee({...newEmployee, addressLine1: e.target.value})} />
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="Postcode" value={newEmployee.postcode} onChange={e => setNewEmployee({...newEmployee, postcode: e.target.value})} />
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Role & Compensation</p>
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="Job Title" value={newEmployee.jobTitle} onChange={e => setNewEmployee({...newEmployee, jobTitle: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <select className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" value={newEmployee.department} onChange={e => setNewEmployee({...newEmployee, department: e.target.value})}>
                      <option value="OPERATIONS">OPERATIONS</option><option value="HR">HR</option><option value="FINANCE">FINANCE</option><option value="LEGAL">LEGAL</option>
                    </select>
                    <input type="number" className="p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="Salary (£)" value={newEmployee.payAmount} onChange={e => setNewEmployee({...newEmployee, payAmount: Number(e.target.value)})} />
                  </div>
                </div>
              </div>

              <button onClick={handleCreate} className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all active:scale-95">Onboard Personnel</button>
            </div>
          </div>
        )}

        {/* PROFILE/EDIT PANEL */}
        {isPanelOpen && selectedEmployee && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/60 backdrop-blur-md" onClick={() => setIsPanelOpen(false)}>
            <div className="max-w-xl w-full bg-white h-full flex flex-col animate-in slide-in-from-right duration-500 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-8 pb-4 flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-slate-900 text-white flex items-center justify-center text-3xl font-black shadow-2xl shadow-slate-200">{selectedEmployee.firstName[0]}</div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tight">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                      <p className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em]">{selectedEmployee.records[0]?.jobTitle}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsPanelOpen(false)}><X size={28}/></button>
                </div>
                <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl">
                  {['Overview', 'Personal', 'Payroll'].map((t) => (
                    <button key={t} onClick={() => setProfileTab(t)} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${profileTab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>{t}</button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-8">
                {profileTab === 'Overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Position</p>
                        <input disabled={!isEditing} className="bg-transparent font-black text-lg outline-none w-full" value={selectedEmployee.records[0]?.jobTitle} onChange={e => {
                          const r = [...selectedEmployee.records]; r[0].jobTitle = e.target.value; setSelectedEmployee({...selectedEmployee, records: r})
                        }} />
                      </div>
                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Department</p>
                        <select disabled={!isEditing} className="bg-transparent font-black text-lg outline-none w-full" value={selectedEmployee.records[0]?.department} onChange={e => {
                          const r = [...selectedEmployee.records]; r[0].department = e.target.value; setSelectedEmployee({...selectedEmployee, records: r})
                        }}>
                          <option value="OPERATIONS">OPERATIONS</option><option value="HR">HR</option><option value="FINANCE">FINANCE</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {profileTab === 'Personal' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={14}/> Residence</p>
                      <input disabled={!isEditing} className="w-full bg-white p-4 rounded-2xl border border-slate-200 outline-none font-bold" value={selectedEmployee.addressLine1 || ''} onChange={e => setSelectedEmployee({...selectedEmployee, addressLine1: e.target.value})} />
                      <input disabled={!isEditing} className="w-full bg-white p-4 rounded-2xl border border-slate-200 outline-none font-bold" value={selectedEmployee.postcode || ''} onChange={e => setSelectedEmployee({...selectedEmployee, postcode: e.target.value})} />
                    </div>
                  </div>
                )}

                {profileTab === 'Payroll' && (
                  <div className="space-y-8">
                    <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-6 shadow-2xl relative">
                      <div className="flex justify-between items-center relative z-10">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">UK Finance Compliance</h4>
                        <button onClick={() => setShowSensitive(!showSensitive)} className="text-[10px] font-bold bg-white/20 px-4 py-2 rounded-full hover:bg-white/30 transition-all">{showSensitive ? 'HIDE DATA' : 'DECRYPT'}</button>
                      </div>
                      <div className="space-y-2 relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">National Insurance</p>
                        <input disabled={!isEditing} className="bg-transparent text-3xl font-mono font-black outline-none w-full" type={showSensitive || isEditing ? "text" : "password"} value={selectedEmployee.niNumber || ''} onChange={e => setSelectedEmployee({...selectedEmployee, niNumber: e.target.value})} />
                      </div>
                      <div className="pt-6 border-t border-white/10 flex justify-between relative z-10">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Annual Base Pay</p>
                          <div className="flex items-center gap-1 font-black text-xl">
                            <span>£</span>
                            <input disabled={!isEditing} className="bg-transparent outline-none" value={selectedEmployee.records[0].payAmount} onChange={e => {
                               const r = [...selectedEmployee.records]; r[0].payAmount = Number(e.target.value); setSelectedEmployee({...selectedEmployee, records: r})
                            }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 border-t bg-slate-50 grid grid-cols-2 gap-4">
                {isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(false)} className="py-4 bg-white border border-slate-200 rounded-2xl font-black uppercase text-xs tracking-widest transition-all">Discard</button>
                    <button onClick={handleUpdate} className="py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"><Save size={16}/> Save Changes</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleDelete(selectedEmployee.id)} className="py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:bg-red-100 flex items-center justify-center gap-2 active:scale-95"><Trash2 size={16}/> Terminate</button>
                    <button onClick={() => setIsEditing(true)} className="py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"><Edit3 size={16}/> Edit Dossier</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
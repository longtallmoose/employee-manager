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
    if (!newEmployee.firstName || !newEmployee.lastName) return alert("Missing names");
    await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newEmployee, email: `${newEmployee.firstName.toLowerCase()}.${Date.now()}@vanguard.com` }),
    });
    setIsAddingNew(false);
    fetchEmployees();
  };

  const handleUpdate = async () => {
    const currentRecord = selectedEmployee.records[0];
    await fetch(`${API_BASE}/employees/${selectedEmployee.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...selectedEmployee,
        jobTitle: currentRecord.jobTitle,
        department: currentRecord.department,
        payAmount: currentRecord.payAmount
      }),
    });
    setIsEditing(false);
    fetchEmployees();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Terminate record?")) return;
    await fetch(`${API_BASE}/employees/${id}`, { method: 'DELETE' });
    setIsPanelOpen(false);
    fetchEmployees();
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col z-20 shadow-2xl">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg"><ShieldCheck className="text-white w-6 h-6" /></div>
          <span className="font-bold text-xl text-white tracking-tight">Vanguard HR</span>
        </div>
        <nav className="flex-1 mt-6 px-3 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20"><Users size={20} /> <span className="font-semibold text-sm">Employees</span></button>
          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-800 transition-all"><CreditCard size={20} /> <span className="font-semibold text-sm">Payroll</span></button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white h-16 border-b flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-full w-96 border">
            <Search className="text-slate-400 w-4 h-4" />
            <input type="text" placeholder="Filter personnel..." className="bg-transparent border-none outline-none text-sm w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black">A</div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-end mb-10">
            <div><h1 className="text-4xl font-black tracking-tight">Employees</h1><p className="text-slate-500">Personnel Directory</p></div>
            <button onClick={() => setIsAddingNew(true)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl flex items-center gap-3"><UserPlus size={20} /> Onboard Staff</button>
          </div>

          <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <tr><th className="px-8 py-6">Personnel</th><th className="px-8 py-6">Assignment</th><th className="px-8 py-6 text-right pr-12">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.filter(e => `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())).map((emp) => (
                  <tr key={emp.id} className="hover:bg-blue-50/40 transition-all cursor-pointer group" onClick={() => { setSelectedEmployee(emp); setIsPanelOpen(true); setIsEditing(false); }}>
                    <td className="px-8 py-6 flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-white border-2 text-blue-600 flex items-center justify-center font-black">{emp.firstName[0]}</div><span className="font-bold text-lg">{emp.firstName} {emp.lastName}</span></td>
                    <td className="px-8 py-6"><p className="font-bold">{emp.records[0]?.jobTitle}</p><p className="text-[10px] font-black text-blue-500 uppercase">{emp.records[0]?.department}</p></td>
                    <td className="px-8 py-6 text-right pr-12 text-slate-300 group-hover:text-blue-600"><ChevronRight size={28} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isAddingNew && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsAddingNew(false)}>
            <div className="max-w-xl w-full bg-white h-full p-8 overflow-y-auto space-y-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center"><h3 className="text-2xl font-black">Personnel Intake</h3><button onClick={() => setIsAddingNew(false)}><X size={28}/></button></div>
              <div className="space-y-4">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Identity</p>
                <div className="grid grid-cols-2 gap-4">
                  <input className="p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="First Name" onChange={e => setNewEmployee({...newEmployee, firstName: e.target.value})} />
                  <input className="p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="Last Name" onChange={e => setNewEmployee({...newEmployee, lastName: e.target.value})} />
                </div>
                <input className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="NI Number" onChange={e => setNewEmployee({...newEmployee, niNumber: e.target.value})} />
                <input className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="Address Line 1" onChange={e => setNewEmployee({...newEmployee, addressLine1: e.target.value})} />
                <input className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="Postcode" onChange={e => setNewEmployee({...newEmployee, postcode: e.target.value})} />
              </div>
              <div className="space-y-4 pt-4 border-t">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Assignment & Pay</p>
                <input className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="Job Title" onChange={e => setNewEmployee({...newEmployee, jobTitle: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <select className="p-4 bg-slate-50 border rounded-2xl font-bold" onChange={e => setNewEmployee({...newEmployee, department: e.target.value})}>
                    <option value="OPERATIONS">OPERATIONS</option><option value="HR">HR</option><option value="FINANCE">FINANCE</option>
                  </select>
                  <input type="number" className="p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="Annual Salary (£)" onChange={e => setNewEmployee({...newEmployee, payAmount: Number(e.target.value)})} />
                </div>
              </div>
              <button onClick={handleCreate} className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl">Onboard Staff</button>
            </div>
          </div>
        )}

        {isPanelOpen && selectedEmployee && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsPanelOpen(false)}>
            <div className="max-w-xl w-full bg-white h-full flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-8 pb-4 flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-slate-900 text-white flex items-center justify-center text-3xl font-black">{selectedEmployee.firstName[0]}</div>
                    <div><h3 className="text-3xl font-black tracking-tight">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3><p className="text-blue-600 font-bold text-xs uppercase tracking-widest">{selectedEmployee.records[0]?.jobTitle}</p></div>
                  </div>
                  <button onClick={() => setIsPanelOpen(false)}><X size={28}/></button>
                </div>
                <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl">
                  {['Overview', 'Personal', 'Payroll'].map(t => <button key={t} onClick={() => setProfileTab(t)} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest ${profileTab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>{t}</button>)}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-8">
                {profileTab === 'Overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-slate-50 rounded-[2rem] border">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Position</p>
                        <input disabled={!isEditing} className="bg-transparent font-black text-lg outline-none w-full border-b border-transparent focus:border-blue-200" value={selectedEmployee.records[0]?.jobTitle} onChange={e => {
                          const r = [...selectedEmployee.records]; r[0].jobTitle = e.target.value; setSelectedEmployee({...selectedEmployee, records: r});
                        }} />
                      </div>
                      <div className="p-6 bg-slate-50 rounded-[2rem] border">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Department</p>
                        <select disabled={!isEditing} className="bg-transparent font-black text-lg outline-none w-full" value={selectedEmployee.records[0]?.department} onChange={e => {
                          const r = [...selectedEmployee.records]; r[0].department = e.target.value; setSelectedEmployee({...selectedEmployee, records: r});
                        }}>
                          <option value="OPERATIONS">OPERATIONS</option><option value="HR">HR</option><option value="FINANCE">FINANCE</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-black text-xs uppercase tracking-widest flex items-center gap-2"><History size={18}/> History</h4>
                      {selectedEmployee.records.map((rec: any) => (
                        <div key={rec.id} className="pl-8 border-l-4 border-slate-100 relative py-2">
                          <div className="absolute -left-[14px] top-4 w-6 h-6 rounded-full bg-blue-600 border-4 border-white shadow-sm" />
                          <p className="font-black text-slate-900 text-lg">{rec.jobTitle}</p>
                          <p className="text-xs font-bold text-slate-400 uppercase">Started {new Date(rec.startDate).toLocaleDateString('en-GB')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {profileTab === 'Personal' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-[2.5rem] border space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Residence</p>
                      <input disabled={!isEditing} className="w-full bg-white p-4 rounded-2xl border font-bold" value={selectedEmployee.addressLine1 || ''} onChange={e => setSelectedEmployee({...selectedEmployee, addressLine1: e.target.value})} />
                      <input disabled={!isEditing} className="w-full bg-white p-4 rounded-2xl border font-bold" value={selectedEmployee.postcode || ''} onChange={e => setSelectedEmployee({...selectedEmployee, postcode: e.target.value})} />
                    </div>
                    <div className="p-6 bg-slate-50 rounded-[2.5rem] border space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emergency Contact</p>
                      <input disabled={!isEditing} className="w-full bg-white p-4 rounded-2xl border font-bold" placeholder="Name" value={selectedEmployee.emergencyName || ''} onChange={e => setSelectedEmployee({...selectedEmployee, emergencyName: e.target.value})} />
                      <input disabled={!isEditing} className="w-full bg-white p-4 rounded-2xl border font-bold" placeholder="Phone" value={selectedEmployee.emergencyPhone || ''} onChange={e => setSelectedEmployee({...selectedEmployee, emergencyPhone: e.target.value})} />
                    </div>
                  </div>
                )}

                {profileTab === 'Payroll' && (
                  <div className="space-y-6">
                    <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-6 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10"><CreditCard size={120}/></div>
                      <div className="flex justify-between items-center relative z-10">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">UK Compliance</h4>
                        <button onClick={() => setShowSensitive(!showSensitive)} className="text-[10px] font-bold bg-white/20 px-4 py-2 rounded-full">{showSensitive ? 'HIDE' : 'SHOW'}</button>
                      </div>
                      <div className="space-y-2 relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NI Number</p>
                        <input disabled={!isEditing} className="bg-transparent text-3xl font-mono font-black outline-none w-full" type={showSensitive || isEditing ? "text" : "password"} value={selectedEmployee.niNumber || ''} onChange={e => setSelectedEmployee({...selectedEmployee, niNumber: e.target.value})} />
                      </div>
                      <div className="pt-6 border-t border-white/10 relative z-10 flex justify-between">
                        <div><p className="text-[10px] font-bold text-slate-400 uppercase">Annual Salary</p>
                        <div className="flex items-center gap-1 text-xl font-black">
                          <span>£</span>
                          <input disabled={!isEditing} className="bg-transparent outline-none" value={selectedEmployee.records[0]?.payAmount} onChange={e => {
                            const r = [...selectedEmployee.records]; r[0].payAmount = e.target.value; setSelectedEmployee({...selectedEmployee, records: r});
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
                  <><button onClick={() => setIsEditing(false)} className="py-4 bg-white border rounded-2xl font-black uppercase text-xs tracking-widest">Discard</button><button onClick={handleUpdate} className="py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2"><Save size={16}/> Commit Changes</button></>
                ) : (
                  <><button onClick={() => handleDelete(selectedEmployee.id)} className="py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2"><Trash2 size={16}/> Terminate</button><button onClick={() => setIsEditing(true)} className="py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2"><Edit3 size={16}/> Edit Dossier</button></>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Clock, ShieldCheck, X, ChevronRight, Search, Plus, 
  Trash2, Building2, PoundSterling, History, Lock, MapPin, 
  Phone, CreditCard, HeartPulse, FileText, BadgeCheck, Save, Edit3, UserPlus
} from 'lucide-react';

interface EmploymentRecord {
  id: string;
  jobTitle: string;
  department: string;
  payAmount: number;
  startDate: string;
  changeReason: string | null;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  niNumber: string | null;
  addressLine1: string | null;
  postcode: string | null;
  emergencyName: string | null;
  emergencyPhone: string | null;
  records: EmploymentRecord[];
}

export default function Dashboard() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeTab, setActiveTab] = useState('Employees');
  const [profileTab, setProfileTab] = useState('Overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetchEmployees();
  }, [router]);

  const handleCreate = async () => {
    if (!newEmployee.firstName || !newEmployee.lastName) return alert("First and Last name are required.");
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...newEmployee, 
          email: `${newEmployee.firstName.toLowerCase()}.${newEmployee.lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@vanguard-internal.com`, 
          password: 'TemporaryPassword123!' 
        }),
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
    const currentRecord = selectedEmployee.records[0];
    await fetch(`${API_BASE}/employees/${selectedEmployee.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: selectedEmployee.firstName,
        lastName: selectedEmployee.lastName,
        jobTitle: currentRecord.jobTitle,
        department: currentRecord.department,
        payAmount: Number(currentRecord.payAmount),
        niNumber: selectedEmployee.niNumber,
        addressLine1: selectedEmployee.addressLine1,
        postcode: selectedEmployee.postcode,
        emergencyName: selectedEmployee.emergencyName,
        emergencyPhone: selectedEmployee.emergencyPhone
      }),
    });
    setIsEditing(false);
    fetchEmployees();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("CRITICAL: Permanently terminate this employment record? This action is immutable for audit purposes.")) return;
    try {
      const res = await fetch(`${API_BASE}/employees/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setIsPanelOpen(false);
        setSelectedEmployee(null);
        fetchEmployees();
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col z-20 shadow-2xl">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/20"><ShieldCheck className="text-white w-6 h-6" /></div>
          <span className="font-bold text-xl text-white tracking-tight">Vanguard HR</span>
        </div>
        <nav className="flex-1 mt-6 px-3 space-y-1">
          {[{ name: 'Employees', icon: Users }, { name: 'Payroll', icon: CreditCard }].map((item) => (
            <button key={item.name} onClick={() => setActiveTab(item.name)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === item.name ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-slate-800 hover:text-white'}`}>
              <item.icon size={20} />
              <span className="font-semibold text-sm">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto relative">
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-full w-96 border border-slate-200 focus-within:border-blue-300 transition-all">
            <Search className="text-slate-400 w-4 h-4" />
            <input type="text" placeholder="Filter personnel..." className="bg-transparent border-none outline-none text-sm w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden md:block">
                <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">System Administrator</p>
                <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Active Session</p>
             </div>
             <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black shadow-lg">A</div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">{activeTab}</h1>
              <p className="text-slate-500 font-medium mt-1">Manage global workforce and UK compliance data.</p>
            </div>
            <button onClick={() => setIsAddingNew(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-200 flex items-center gap-3 transition-all active:scale-95">
              <UserPlus size={20} /> Onboard Staff
            </button>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr><th className="px-8 py-6">Personnel</th><th className="px-8 py-6">Primary Assignment</th><th className="px-8 py-6 text-right pr-12">Action</th></tr>
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

        {/* FULL INTAKE ONBOARDING SLIDE-OVER */}
        {isAddingNew && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsAddingNew(false)} />
            <div className="absolute inset-y-0 right-0 max-w-xl w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
              <div className="p-8 border-b flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-xl font-black tracking-tight">Personnel Intake</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">New Employment Transaction</p>
                </div>
                <button onClick={() => setIsAddingNew(false)} className="p-2 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-200 transition-all"><X size={24}/></button>
              </div>
              <div className="flex-1 p-8 space-y-8 overflow-y-auto">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2"><Lock size={14}/> Identity & Compliance</p>
                  <div className="grid grid-cols-2 gap-4">
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" placeholder="First Name" value={newEmployee.firstName} onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})} />
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" placeholder="Last Name" value={newEmployee.lastName} onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})} />
                  </div>
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" placeholder="National Insurance Number (NI)" value={newEmployee.niNumber} onChange={(e) => setNewEmployee({...newEmployee, niNumber: e.target.value})} />
                </div>
                
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2"><MapPin size={14}/> Primary Residence</p>
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" placeholder="Address Line 1" value={newEmployee.addressLine1} onChange={(e) => setNewEmployee({...newEmployee, addressLine1: e.target.value})} />
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" placeholder="Postcode" value={newEmployee.postcode} onChange={(e) => setNewEmployee({...newEmployee, postcode: e.target.value})} />
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2"><HeartPulse size={14}/> Emergency Contact</p>
                  <div className="grid grid-cols-2 gap-4">
                    <input className="p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="Contact Name" value={newEmployee.emergencyName} onChange={(e) => setNewEmployee({...newEmployee, emergencyName: e.target.value})} />
                    <input className="p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="Phone Number" value={newEmployee.emergencyPhone} onChange={(e) => setNewEmployee({...newEmployee, emergencyPhone: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2"><Building2 size={14}/> Position & Pay</p>
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="Job Title" value={newEmployee.jobTitle} onChange={(e) => setNewEmployee({...newEmployee, jobTitle: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <select className="p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newEmployee.department} onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}>
                      <option value="OPERATIONS">OPERATIONS</option><option value="HR">HR</option><option value="FINANCE">FINANCE</option><option value="LEGAL">LEGAL</option>
                    </select>
                    <input type="number" className="p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="Annual Salary (£)" value={newEmployee.payAmount} onChange={(e) => setNewEmployee({...newEmployee, payAmount: Number(e.target.value)})} />
                  </div>
                </div>
              </div>
              <div className="p-8 border-t bg-slate-50"><button onClick={handleCreate} className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-widest">Execute Onboarding</button></div>
            </div>
          </div>
        )}

        {/* DOSSIER PANEL */}
        {isPanelOpen && selectedEmployee && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsPanelOpen(false)} />
            <div className="absolute inset-y-0 right-0 max-w-xl w-full bg-white shadow-2xl flex flex-col">
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
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">First Name</p>
                        <input disabled={!isEditing} className="bg-transparent font-black text-xl outline-none w-full" value={selectedEmployee.firstName} onChange={(e) => setSelectedEmployee({...selectedEmployee, firstName: e.target.value})} />
                      </div>
                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Last Name</p>
                        <input disabled={!isEditing} className="bg-transparent font-black text-xl outline-none w-full" value={selectedEmployee.lastName} onChange={(e) => setSelectedEmployee({...selectedEmployee, lastName: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-black text-xs uppercase tracking-widest flex items-center gap-2"><History size={18}/> Employment History</h4>
                      {selectedEmployee.records.map((rec) => (
                        <div key={rec.id} className="pl-8 border-l-4 border-slate-100 relative py-2">
                          <div className="absolute -left-[14px] top-4 w-6 h-6 rounded-full bg-blue-600 border-4 border-white shadow-sm" />
                          <p className="font-black text-slate-900 text-lg">{rec.jobTitle}</p>
                          <p className="text-xs font-bold text-slate-400 uppercase">{rec.department} • Started {new Date(rec.startDate).toLocaleDateString('en-GB')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {profileTab === 'Personal' && (
                  <div className="space-y-8">
                    <div className="p-6 bg-slate-50 rounded-[2.5rem] border space-y-6 shadow-sm">
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={14}/> Address Information</p>
                        <input disabled={!isEditing} className="w-full bg-white p-4 rounded-2xl border outline-none font-bold" value={selectedEmployee.addressLine1 || ''} onChange={(e) => setSelectedEmployee({...selectedEmployee, addressLine1: e.target.value})} />
                        <input disabled={!isEditing} className="w-full bg-white p-4 rounded-2xl border outline-none font-bold" value={selectedEmployee.postcode || ''} onChange={(e) => setSelectedEmployee({...selectedEmployee, postcode: e.target.value})} />
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-[2.5rem] border space-y-6 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><HeartPulse size={14}/> Emergency Contact Details</p>
                      <input disabled={!isEditing} className="w-full bg-white p-4 rounded-2xl border outline-none font-bold" placeholder="Next of Kin Name" value={selectedEmployee.emergencyName || ''} onChange={(e) => setSelectedEmployee({...selectedEmployee, emergencyName: e.target.value})} />
                      <input disabled={!isEditing} className="w-full bg-white p-4 rounded-2xl border outline-none font-bold" placeholder="Contact Phone Number" value={selectedEmployee.emergencyPhone || ''} onChange={(e) => setSelectedEmployee({...selectedEmployee, emergencyPhone: e.target.value})} />
                    </div>
                  </div>
                )}

                {profileTab === 'Payroll' && (
                  <div className="space-y-8">
                    <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-6 shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-8 opacity-10"><CreditCard size={120}/></div>
                      <div className="flex justify-between items-center relative z-10">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">UK Finance Compliance</h4>
                        <button onClick={() => setShowSensitive(!showSensitive)} className="text-[10px] font-bold bg-white/20 px-4 py-2 rounded-full hover:bg-white/30 transition-all">{showSensitive ? 'HIDE DATA' : 'DECRYPT'}</button>
                      </div>
                      <div className="space-y-2 relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">National Insurance</p>
                        <input disabled={!isEditing} className="bg-transparent text-3xl font-mono font-black outline-none w-full" type={showSensitive || isEditing ? "text" : "password"} value={selectedEmployee.niNumber || ''} onChange={(e) => setSelectedEmployee({...selectedEmployee, niNumber: e.target.value})} />
                      </div>
                      <div className="pt-6 border-t border-white/10 flex justify-between relative z-10">
                        <div><p className="text-[10px] font-bold text-slate-400 uppercase">Annual Base Pay</p><p className="text-xl font-black">£{showSensitive || isEditing ? Number(selectedEmployee.records[0]?.payAmount).toLocaleString() : '••••••'}</p></div>
                        <div className="text-right"><p className="text-[10px] font-bold text-slate-400 uppercase">Status</p><p className="text-sm font-black text-green-400 uppercase">PAYE Ready</p></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 border-t bg-slate-50 grid grid-cols-2 gap-4">
                {isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(false)} className="py-4 bg-white border border-slate-200 rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:bg-slate-50">Discard</button>
                    <button onClick={handleUpdate} className="py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"><Save size={16}/> Commit Changes</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleDelete(selectedEmployee.id)} className="py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2"><Trash2 size={16}/> Terminate</button>
                    <button onClick={() => setIsEditing(true)} className="py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"><Edit3 size={16}/> Edit Dossier</button>
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
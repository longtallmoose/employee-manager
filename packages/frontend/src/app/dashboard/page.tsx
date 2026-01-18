'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Clock, ShieldCheck, X, ChevronRight, Search, Plus, 
  Trash2, Building2, PoundSterling, History, Lock, MapPin, 
  Phone, CreditCard, HeartPulse, FileText, BadgeCheck
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
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Employees');
  const [profileTab, setProfileTab] = useState('Overview');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
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
    await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...newEmployee, 
        email: `${newEmployee.firstName.toLowerCase()}.${newEmployee.lastName.toLowerCase()}@vanguard-hr.com`, 
        password: 'TempPassword123!' 
      }),
    });
    setIsAddingNew(false);
    fetchEmployees();
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col z-20`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg"><ShieldCheck className="text-white w-6 h-6" /></div>
          {isSidebarOpen && <span className="font-bold text-xl text-white tracking-tight">Vanguard HR</span>}
        </div>
        <nav className="flex-1 mt-6 px-3 space-y-1">
          {[{ name: 'Employees', icon: Users }, { name: 'Payroll', icon: Clock }].map((item) => (
            <button key={item.name} onClick={() => setActiveTab(item.name)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === item.name ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
              <item.icon size={22} />
              {isSidebarOpen && <span className="font-medium">{item.name}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto relative">
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-full w-96">
            <Search className="text-slate-400 w-4 h-4" />
            <input type="text" placeholder="Search by name or department..." className="bg-transparent border-none outline-none text-sm w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-4 font-bold text-xs uppercase tracking-widest text-slate-400">
            <span>Admin Portal</span>
            <div className="w-8 h-8 rounded-full bg-slate-200" />
          </div>
        </header>

        <div className="p-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight">{activeTab}</h1>
              <p className="text-slate-500 text-sm mt-1">Centralized Workforce Directory</p>
            </div>
            <button onClick={() => setIsAddingNew(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-xl flex items-center gap-2 transition-all active:scale-95">
              <Plus size={20} /> Onboard Staff
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr><th className="px-8 py-5">Personnel</th><th className="px-8 py-5">Current Assignment</th><th className="px-8 py-5">Location</th><th className="px-8 py-5 text-right pr-12">Dossier</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.filter(e => `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())).map((emp) => (
                  <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer group" onClick={() => { setSelectedEmployee(emp); setIsPanelOpen(true); setProfileTab('Overview'); setShowSensitive(false); }}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-100 text-blue-600 flex items-center justify-center font-black text-lg shadow-sm">{emp.firstName[0]}</div>
                        <div>
                          <p className="font-bold text-slate-900">{emp.firstName} {emp.lastName}</p>
                          <p className="text-xs text-slate-400 font-medium lowercase">vanguard-id: {emp.id.slice(0,8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-700">{emp.records[0]?.jobTitle}</p>
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{emp.records[0]?.department}</p>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-500 italic">London HQ</td>
                    <td className="px-8 py-5 text-right pr-12 text-slate-300 group-hover:text-blue-600 transition-colors"><ChevronRight size={24} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TABBED DOSSIER SLIDE-OVER */}
        {isPanelOpen && selectedEmployee && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => setIsPanelOpen(false)} />
            <div className="absolute inset-y-0 right-0 max-w-xl w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
              
              <div className="p-8 pb-4 flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-blue-600 text-white flex items-center justify-center text-3xl font-black shadow-2xl shadow-blue-200">{selectedEmployee.firstName[0]}</div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                      <p className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em]">{selectedEmployee.records[0]?.jobTitle}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsPanelOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"><X size={24}/></button>
                </div>

                {/* TAB NAVIGATION */}
                <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl">
                  {['Overview', 'Personal', 'Payroll', 'Compliance'].map((tab) => (
                    <button key={tab} onClick={() => setProfileTab(tab)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${profileTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{tab}</button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 pt-4">
                {profileTab === 'Overview' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
                        <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600"><Building2 size={20}/></div>
                        <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dept</p><p className="font-bold text-sm">{selectedEmployee.records[0]?.department}</p></div>
                      </div>
                      <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
                        <div className="p-3 bg-white rounded-2xl shadow-sm text-green-600"><PoundSterling size={20}/></div>
                        <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pay Rate</p><p className="font-bold text-sm">£{Number(selectedEmployee.records[0]?.payAmount).toLocaleString()}/yr</p></div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-black text-xs uppercase tracking-[0.15em] text-slate-900 flex items-center gap-2"><History size={16}/> Service History</h4>
                      <div className="space-y-6 border-l-2 border-slate-100 ml-2 pl-6">
                        {selectedEmployee.records.map((rec, idx) => (
                          <div key={rec.id} className="relative">
                            <div className={`absolute -left-[31px] top-1 w-3 h-3 rounded-full border-2 border-white ${idx === 0 ? 'bg-blue-600' : 'bg-slate-300'}`} />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{new Date(rec.startDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
                            <p className="font-bold text-slate-900">{rec.jobTitle}</p>
                            <p className="text-xs text-slate-500 italic mt-0.5">{rec.changeReason || 'Hiring Placement'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {profileTab === 'Personal' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-4">
                      <h4 className="font-black text-xs uppercase tracking-widest text-slate-900 flex items-center gap-2"><MapPin size={16}/> Residence</h4>
                      <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-1">
                        <p className="font-bold">{selectedEmployee.addressLine1 || 'No Address Logged'}</p>
                        <p className="font-bold text-slate-500">{selectedEmployee.postcode}</p>
                        <p className="text-[10px] font-black text-blue-500 uppercase mt-2">Verified Address</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-black text-xs uppercase tracking-widest text-slate-900 flex items-center gap-2"><HeartPulse size={16}/> Emergency Contact</h4>
                      <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
                        <div className="p-3 bg-red-50 text-red-500 rounded-2xl"><Phone size={20}/></div>
                        <div>
                          <p className="font-bold">{selectedEmployee.emergencyName || 'Missing Contact'}</p>
                          <p className="text-sm text-slate-500 font-medium">{selectedEmployee.emergencyPhone || 'Update Required'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {profileTab === 'Payroll' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4 shadow-xl">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Payment Account</h4>
                        <button onClick={() => setShowSensitive(!showSensitive)} className="text-[10px] font-bold bg-white/10 px-3 py-1 rounded-full hover:bg-white/20 transition-colors">{showSensitive ? 'Hide' : 'Decrypt'}</button>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-2xl"><CreditCard size={24}/></div>
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">NI Number</p>
                          <p className="font-mono text-lg font-black">{showSensitive ? (selectedEmployee.niNumber || 'NOT SET') : '•••• •• •• •'}</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/10 flex justify-between">
                        <div><p className="text-[10px] font-bold text-slate-400 uppercase">Sort Code</p><p className="font-mono font-bold">{showSensitive ? '20-45-12' : '••-••-••'}</p></div>
                        <div><p className="text-[10px] font-bold text-slate-400 uppercase">Account</p><p className="font-mono font-bold text-right">{showSensitive ? '88234109' : '••••••••'}</p></div>
                      </div>
                    </div>
                    <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100 flex items-center gap-4">
                      <div className="p-3 bg-white text-blue-600 rounded-2xl shadow-sm"><FileText size={20}/></div>
                      <div><p className="font-bold text-blue-900">P60 / Payslip History</p><p className="text-xs text-blue-600 font-bold uppercase">Ready for export</p></div>
                    </div>
                  </div>
                )}

                {profileTab === 'Compliance' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="p-6 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center gap-3 text-center">
                      <div className="p-4 bg-slate-100 rounded-full text-slate-400"><BadgeCheck size={32}/></div>
                      <div><p className="font-bold">Right to Work Evidence</p><p className="text-xs text-slate-500 max-w-[200px]">British Passport / Visa documentation required for UK compliance.</p></div>
                      <button className="mt-2 text-xs font-black text-blue-600 hover:underline tracking-widest uppercase">Upload Document</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 border-t bg-slate-50 grid grid-cols-2 gap-4">
                <button onClick={() => handleDelete(selectedEmployee.id)} className="py-4 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors active:scale-95"><Trash2 size={18}/> Terminate</button>
                <button className="py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95">Edit Personnel</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
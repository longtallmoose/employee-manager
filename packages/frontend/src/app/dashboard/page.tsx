'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Calendar, Clock, ShieldCheck, 
  X, ChevronRight, Search, Plus, Trash2, Save, 
  Building2, PoundSterling, History, Lock, MapPin, Fingerprint
} from 'lucide-react';

interface EmploymentRecord {
  id: string;
  jobTitle: string;
  department: string;
  payAmount: number;
  startDate: string;
  endDate: string | null;
  changeReason: string | null;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  niNumber: string | null;
  addressLine1: string | null;
  postcode: string | null;
  records: EmploymentRecord[];
}

export default function Dashboard() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Employees');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);
  
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ 
    firstName: '', lastName: '', jobTitle: '', department: 'OPERATIONS', 
    payAmount: 0, niNumber: '', addressLine1: '', postcode: '' 
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
            <input type="text" placeholder="Search staff..." className="bg-transparent border-none outline-none text-sm w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold uppercase">Admin</div>
        </header>

        <div className="p-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold">{activeTab}</h2>
              <p className="text-slate-500 text-sm mt-1">UK Compliance & Workforce OS</p>
            </div>
            <button onClick={() => setIsAddingNew(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg flex items-center gap-2 transition-all">
              <Plus size={18} /> Add New Staff
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 text-xs uppercase tracking-wider">
                <tr><th className="px-6 py-4">Employee</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Department</th><th className="px-6 py-4 text-right pr-10">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.filter(e => `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())).map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => { setSelectedEmployee(emp); setIsPanelOpen(true); setShowSensitive(false); }}>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">{emp.firstName[0]}</div>
                      <span className="font-bold">{emp.firstName} {emp.lastName}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{emp.records[0]?.jobTitle}</td>
                    <td className="px-6 py-4 font-bold text-[10px] text-slate-400 uppercase tracking-tighter">{emp.records[0]?.department}</td>
                    <td className="px-6 py-4 text-right text-slate-400 group-hover:text-blue-600 pr-10"><ChevronRight size={20} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ADD NEW SLIDE-OVER */}
        {isAddingNew && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddingNew(false)} />
            <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-lg font-bold">New Starter Intake</h3>
                <button onClick={() => setIsAddingNew(false)} className="p-2 hover:bg-white rounded-full"><X size={20}/></button>
              </div>
              <div className="flex-1 p-8 space-y-5 overflow-y-auto">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2"><Users size={14}/> Identity</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <input className="p-3 bg-slate-50 border rounded-xl outline-none" placeholder="First Name" value={newEmployee.firstName} onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})} />
                    <input className="p-3 bg-slate-50 border rounded-xl outline-none" placeholder="Last Name" value={newEmployee.lastName} onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})} />
                  </div>
                  <input className="w-full p-3 bg-slate-50 border rounded-xl outline-none" placeholder="National Insurance (e.g. QQ123456A)" value={newEmployee.niNumber} onChange={(e) => setNewEmployee({...newEmployee, niNumber: e.target.value})} />
                </div>
                
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2"><MapPin size={14}/> Residential Address</h4>
                  <input className="w-full p-3 bg-slate-50 border rounded-xl outline-none" placeholder="Line 1" value={newEmployee.addressLine1} onChange={(e) => setNewEmployee({...newEmployee, addressLine1: e.target.value})} />
                  <input className="w-full p-3 bg-slate-50 border rounded-xl outline-none" placeholder="Postcode" value={newEmployee.postcode} onChange={(e) => setNewEmployee({...newEmployee, postcode: e.target.value})} />
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2"><Building2 size={14}/> Employment</h4>
                  <input className="w-full p-3 bg-slate-50 border rounded-xl outline-none" placeholder="Job Title" value={newEmployee.jobTitle} onChange={(e) => setNewEmployee({...newEmployee, jobTitle: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <select className="p-3 bg-slate-50 border rounded-xl outline-none" value={newEmployee.department} onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}>
                      <option value="OPERATIONS">Operations</option><option value="HR">HR</option><option value="FINANCE">Finance</option>
                    </select>
                    <input type="number" className="p-3 bg-slate-50 border rounded-xl outline-none" placeholder="Annual Pay (£)" value={newEmployee.payAmount} onChange={(e) => setNewEmployee({...newEmployee, payAmount: Number(e.target.value)})} />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t bg-slate-50">
                <button onClick={handleCreate} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700">Onboard Employee</button>
              </div>
            </div>
          </div>
        )}

        {/* PROFILE VIEW WITH SENSITIVE DATA MASKING */}
        {isPanelOpen && selectedEmployee && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsPanelOpen(false)} />
            <div className="absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl flex flex-col">
              <div className="p-6 border-b flex items-center justify-between bg-slate-50">
                <h3 className="text-lg font-bold">Employee Dossier</h3>
                <button onClick={() => setIsPanelOpen(false)} className="p-2 hover:bg-white rounded-full"><X size={20}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">{selectedEmployee.firstName[0]}</div>
                  <div>
                    <h4 className="text-2xl font-bold">{selectedEmployee.firstName} {selectedEmployee.lastName}</h4>
                    <p className="text-blue-600 font-bold text-xs uppercase tracking-widest">{selectedEmployee.records[0]?.jobTitle}</p>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Lock size={14}/> Sensitive Data (GDPR)</h4>
                     <button onClick={() => setShowSensitive(!showSensitive)} className="text-[10px] font-bold text-blue-600 hover:underline">{showSensitive ? 'Hide' : 'Show Private Data'}</button>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">NI Number</p>
                       <p className="font-mono font-bold">{showSensitive ? (selectedEmployee.niNumber || 'Not Set') : '•••• •• •• •'}</p>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Salary</p>
                       <p className="font-bold">£{showSensitive ? Number(selectedEmployee.records[0]?.payAmount).toLocaleString() : '••,•••'}</p>
                     </div>
                   </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><History size={14}/> Career Path</h4>
                  <div className="space-y-4 border-l-2 border-slate-100 ml-2 pl-6">
                    {selectedEmployee.records.map((rec, idx) => (
                      <div key={rec.id} className="relative pb-2">
                        <div className={`absolute -left-[31px] top-1 w-3 h-3 rounded-full border-2 border-white ${idx === 0 ? 'bg-blue-600' : 'bg-slate-300'}`} />
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(rec.startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</p>
                        <p className="font-bold text-sm text-slate-900">{rec.jobTitle} • {rec.department}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
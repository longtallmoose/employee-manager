'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Calendar, Clock, ShieldCheck, 
  X, ChevronRight, Search, Bell, Plus, Trash2, Save, UserPlus, 
  TrendingUp, Building2, PoundSterling, History
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
  
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ 
    firstName: '', 
    lastName: '', 
    jobTitle: '', 
    department: 'OPERATIONS', 
    payAmount: 0 
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
    if (!newEmployee.firstName || !newEmployee.lastName) return alert("Missing fields");
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
    setNewEmployee({ firstName: '', lastName: '', jobTitle: '', department: 'OPERATIONS', payAmount: 0 });
    fetchEmployees();
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
        changeReason: "Managerial Update"
      }),
    });
    setIsEditing(false);
    fetchEmployees();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanent Deletion?")) return;
    await fetch(`${API_BASE}/employees/${id}`, { method: 'DELETE' });
    setIsPanelOpen(false);
    fetchEmployees();
  };

  const filteredEmployees = employees.filter(emp => 
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col z-20`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg"><ShieldCheck className="text-white w-6 h-6" /></div>
          {isSidebarOpen && <span className="font-bold text-xl text-white tracking-tight">Vanguard HR</span>}
        </div>
        <nav className="flex-1 mt-6 px-3 space-y-1">
          {[{ name: 'Employees', icon: Users }, { name: 'Planner', icon: Calendar }, { name: 'Payroll', icon: Clock }].map((item) => (
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
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold">A</div>
        </header>

        <div className="p-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold">{activeTab}</h2>
              <p className="text-slate-500 text-sm mt-1">Real-time workforce management.</p>
            </div>
            <button onClick={() => setIsAddingNew(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg flex items-center gap-2">
              <Plus size={18} /> Add New
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 text-xs uppercase tracking-wider">
                <tr><th className="px-6 py-4">Employee</th><th className="px-6 py-4">Current Role</th><th className="px-6 py-4">Department</th><th className="px-6 py-4 text-right pr-10">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => { setSelectedEmployee(emp); setIsPanelOpen(true); setIsEditing(false); }}>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">{emp.firstName[0]}</div>
                      <span className="font-bold">{emp.firstName} {emp.lastName}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{emp.records[0]?.jobTitle}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{emp.records[0]?.department}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400 group-hover:text-blue-600 pr-10"><ChevronRight size={20} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isAddingNew && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddingNew(false)} />
            <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-lg font-bold">New Employment Record</h3>
                <button onClick={() => setIsAddingNew(false)} className="p-2 hover:bg-white rounded-full"><X size={20}/></button>
              </div>
              <div className="flex-1 p-8 space-y-5 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">First Name</label>
                    <input className="w-full p-3 bg-slate-50 border rounded-xl outline-none" value={newEmployee.firstName} onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Last Name</label>
                    <input className="w-full p-3 bg-slate-50 border rounded-xl outline-none" value={newEmployee.lastName} onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Job Title</label>
                  <input className="w-full p-3 bg-slate-50 border rounded-xl outline-none" value={newEmployee.jobTitle} onChange={(e) => setNewEmployee({...newEmployee, jobTitle: e.target.value})} placeholder="e.g. Senior HR Advisor" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Department</label>
                    <select className="w-full p-3 bg-slate-50 border rounded-xl outline-none font-medium" value={newEmployee.department} onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}>
                      <option value="OPERATIONS">Operations</option>
                      <option value="FINANCE">Finance</option>
                      <option value="HR">HR</option>
                      <option value="ENGINEERING">Engineering</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Annual Salary (£)</label>
                    <input type="number" className="w-full p-3 bg-slate-50 border rounded-xl outline-none" value={newEmployee.payAmount} onChange={(e) => setNewEmployee({...newEmployee, payAmount: Number(e.target.value)})} />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50">
                <button onClick={handleCreate} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">Establish Employment</button>
              </div>
            </div>
          </div>
        )}

        {isPanelOpen && selectedEmployee && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsPanelOpen(false)} />
            <div className="absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-lg font-bold">Comprehensive Profile</h3>
                <button onClick={() => setIsPanelOpen(false)} className="p-2 hover:bg-white rounded-full"><X size={20}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-xl">{selectedEmployee.firstName[0]}</div>
                  <div>
                    <h4 className="text-2xl font-bold">{selectedEmployee.firstName} {selectedEmployee.lastName}</h4>
                    <p className="text-blue-600 font-bold text-sm uppercase tracking-widest">{selectedEmployee.records[0]?.jobTitle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-1 text-slate-400"><Building2 size={14}/> <span className="text-[10px] font-bold uppercase tracking-widest">Department</span></div>
                    <p className="font-bold text-slate-900">{selectedEmployee.records[0]?.department}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-1 text-slate-400"><PoundSterling size={14}/> <span className="text-[10px] font-bold uppercase tracking-widest">Salary (GBP)</span></div>
                    <p className="font-bold text-slate-900">£{Number(selectedEmployee.records[0]?.payAmount).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4 text-slate-900"><History size={18}/> <span className="font-bold">Employment Timeline</span></div>
                  <div className="space-y-4 border-l-2 border-slate-100 ml-2 pl-6">
                    {selectedEmployee.records.map((rec, idx) => (
                      <div key={rec.id} className="relative">
                        <div className={`absolute -left-[31px] top-1 w-3 h-3 rounded-full border-2 border-white ${idx === 0 ? 'bg-blue-600' : 'bg-slate-300'}`} />
                        <p className="text-xs font-bold text-slate-400 uppercase">{new Date(rec.startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</p>
                        <p className="font-bold text-slate-900">{rec.jobTitle}</p>
                        <p className="text-xs text-slate-500 italic">{rec.changeReason || 'System Record'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 grid grid-cols-2 gap-4">
                <button onClick={() => handleDelete(selectedEmployee.id)} className="py-3 bg-red-50 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2"><Trash2 size={18}/> Delete</button>
                <button onClick={() => setIsEditing(true)} className="py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2"><TrendingUp size={18}/> Promote / Edit</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
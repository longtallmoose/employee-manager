'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Calendar, Clock, ShieldCheck, 
  X, ChevronRight, Search, Bell, Plus, Trash2, Save, UserPlus
} from 'lucide-react';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
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
  
  // Add New State
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ firstName: '', lastName: '', role: 'EMPLOYEE' });

  const API_BASE = "https://employee-api-3oyj.onrender.com/api/employees";

  const fetchEmployees = async () => {
    try {
      const res = await fetch(API_BASE);
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
    if (!newEmployee.firstName || !newEmployee.lastName) return alert("Please fill in all fields");
    await fetch(API_BASE.replace('/employees', '/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newEmployee, email: `${newEmployee.firstName.toLowerCase()}.${newEmployee.lastName.toLowerCase()}@vanguard-internal.com`, password: 'TemporaryPassword123!' }),
    });
    setIsAddingNew(false);
    setNewEmployee({ firstName: '', lastName: '', role: 'EMPLOYEE' });
    fetchEmployees();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirm deletion?")) return;
    await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    setIsPanelOpen(false);
    fetchEmployees();
  };

  const handleUpdate = async () => {
    if (!selectedEmployee) return;
    await fetch(`${API_BASE}/${selectedEmployee.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedEmployee),
    });
    setIsEditing(false);
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
                <tr><th className="px-6 py-4">Employee</th><th className="px-6 py-4">Role</th><th className="px-6 py-4 text-right pr-10">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => { setSelectedEmployee(emp); setIsPanelOpen(true); setIsEditing(false); }}>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">{emp.firstName[0]}</div>
                      <span className="font-bold text-slate-900">{emp.firstName} {emp.lastName}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm font-medium">{emp.role}</td>
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
                <h3 className="text-lg font-bold">Register New Staff</h3>
                <button onClick={() => setIsAddingNew(false)} className="p-2 hover:bg-white rounded-full"><X size={20}/></button>
              </div>
              <div className="flex-1 p-8 space-y-6">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4"><UserPlus size={32} /></div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-2 tracking-widest">First Name</label>
                  <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={newEmployee.firstName} onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})} placeholder="e.g. Sarah" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-2 tracking-widest">Last Name</label>
                  <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={newEmployee.lastName} onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})} placeholder="e.g. Jenkins" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-2 tracking-widest">Initial Role</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={newEmployee.role} onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="LINE_MANAGER">Line Manager</option>
                    <option value="HR_ADVISOR">HR Advisor</option>
                  </select>
                </div>
                <p className="text-[10px] text-slate-400 text-center italic mt-10">New staff will be assigned a temporary password and auto-generated internal email.</p>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50">
                <button onClick={handleCreate} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">Create Employment Record</button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT SLIDE-OVER (Restored) */}
        {isPanelOpen && selectedEmployee && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsPanelOpen(false)} />
            <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-lg font-bold">Employee Profile</h3>
                <button onClick={() => setIsPanelOpen(false)} className="p-2 hover:bg-white rounded-full"><X size={20}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                <div className="flex flex-col items-center mb-8">
                  <div className="w-24 h-24 rounded-3xl bg-blue-600 text-white flex items-center justify-center text-3xl font-bold mb-4">{selectedEmployee.firstName[0]}</div>
                  <h4 className="text-xl font-bold">{selectedEmployee.firstName} {selectedEmployee.lastName}</h4>
                </div>
                <div className="space-y-6">
                  <input disabled={!isEditing} className="w-full p-3 bg-slate-50 border rounded-xl" value={selectedEmployee.firstName} onChange={(e) => setSelectedEmployee({...selectedEmployee, firstName: e.target.value})} />
                  <input disabled={!isEditing} className="w-full p-3 bg-slate-50 border rounded-xl" value={selectedEmployee.lastName} onChange={(e) => setSelectedEmployee({...selectedEmployee, lastName: e.target.value})} />
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 grid grid-cols-2 gap-4">
                {isEditing ? (
                  <button onClick={handleUpdate} className="col-span-2 py-3 bg-blue-600 text-white rounded-xl font-bold">Save Changes</button>
                ) : (
                  <>
                    <button onClick={() => handleDelete(selectedEmployee.id)} className="py-3 bg-red-50 text-red-600 rounded-xl font-bold">Delete</button>
                    <button onClick={() => setIsEditing(true)} className="py-3 bg-slate-900 text-white rounded-xl font-bold">Edit</button>
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
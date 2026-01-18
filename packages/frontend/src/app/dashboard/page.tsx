'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Clock, ShieldCheck, X, ChevronRight, Search, Plus, 
  Trash2, Building2, PoundSterling, History, Lock, MapPin, 
  Phone, CreditCard, HeartPulse, FileText, BadgeCheck, Save, Edit3
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
    if (!confirm("Permanently terminate this employment record?")) return;
    await fetch(`${API_BASE}/employees/${id}`, { method: 'DELETE' });
    setIsPanelOpen(false);
    fetchEmployees();
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg"><ShieldCheck className="text-white w-6 h-6" /></div>
          <span className="font-bold text-xl text-white">Vanguard HR</span>
        </div>
        <nav className="flex-1 mt-6 px-3 space-y-1">
          {[{ name: 'Employees', icon: Users }, { name: 'Payroll', icon: Clock }].map((item) => (
            <button key={item.name} onClick={() => setActiveTab(item.name)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === item.name ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
              <item.icon size={22} />
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto">
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
              <h1 className="text-3xl font-black">{activeTab}</h1>
              <p className="text-slate-500 text-sm mt-1">Personnel Management</p>
            </div>
            <button onClick={() => setIsAddingNew(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-xl flex items-center gap-2">
              <Plus size={20} /> Onboard Staff
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <tr><th className="px-8 py-5">Personnel</th><th className="px-8 py-5">Assignment</th><th className="px-8 py-5 text-right pr-12">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.filter(e => `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())).map((emp) => (
                  <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => { setSelectedEmployee(emp); setIsPanelOpen(true); setIsEditing(false); }}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border text-blue-600 flex items-center justify-center font-black">{emp.firstName[0]}</div>
                        <span className="font-bold">{emp.firstName} {emp.lastName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold">{emp.records[0]?.jobTitle}</p>
                      <p className="text-[10px] font-black text-blue-500 uppercase">{emp.records[0]?.department}</p>
                    </td>
                    <td className="px-8 py-5 text-right pr-12 text-slate-300"><ChevronRight size={24} /></td>
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
            <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col">
              <div className="p-6 border-b flex justify-between bg-slate-50">
                <h3 className="font-bold">New Starter Intake</h3>
                <button onClick={() => setIsAddingNew(false)}><X size={20}/></button>
              </div>
              <div className="flex-1 p-8 space-y-4 overflow-y-auto">
                <input className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="First Name" value={newEmployee.firstName} onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})} />
                <input className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="Last Name" value={newEmployee.lastName} onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})} />
                <input className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="NI Number" value={newEmployee.niNumber} onChange={(e) => setNewEmployee({...newEmployee, niNumber: e.target.value})} />
                <input className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="Job Title" value={newEmployee.jobTitle} onChange={(e) => setNewEmployee({...newEmployee, jobTitle: e.target.value})} />
                <input className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="Salary" type="number" value={newEmployee.payAmount} onChange={(e) => setNewEmployee({...newEmployee, payAmount: Number(e.target.value)})} />
              </div>
              <div className="p-6 border-t"><button onClick={handleCreate} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold">Onboard Employee</button></div>
            </div>
          </div>
        )}

        {/* DOSSIER SLIDE-OVER */}
        {isPanelOpen && selectedEmployee && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsPanelOpen(false)} />
            <div className="absolute inset-y-0 right-0 max-w-xl w-full bg-white shadow-2xl flex flex-col">
              <div className="p-8 pb-4 flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-[2rem] bg-blue-600 text-white flex items-center justify-center text-3xl font-black">{selectedEmployee.firstName[0]}</div>
                    <div>
                      <h3 className="text-2xl font-black">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                      <p className="text-blue-600 font-bold text-xs uppercase tracking-widest">{selectedEmployee.records[0]?.jobTitle}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsPanelOpen(false)}><X size={24}/></button>
                </div>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                  {['Overview', 'Personal', 'Payroll'].map((t) => (
                    <button key={t} onClick={() => setProfileTab(t)} className={`flex-1 py-2 rounded-lg text-xs font-bold ${profileTab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>{t}</button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-6">
                {profileTab === 'Overview' && (
                  <div className="space-y-6">
                    <div className="p-5 bg-slate-50 rounded-3xl border space-y-4">
                      <div className="flex justify-between">
                        <p className="text-[10px] font-black text-slate-400 uppercase">First Name</p>
                        <input disabled={!isEditing} className="bg-transparent text-right font-bold outline-none" value={selectedEmployee.firstName} onChange={(e) => setSelectedEmployee({...selectedEmployee, firstName: e.target.value})} />
                      </div>
                      <div className="flex justify-between">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Last Name</p>
                        <input disabled={!isEditing} className="bg-transparent text-right font-bold outline-none" value={selectedEmployee.lastName} onChange={(e) => setSelectedEmployee({...selectedEmployee, lastName: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-black text-xs uppercase flex items-center gap-2"><History size={16}/> Service History</h4>
                      {selectedEmployee.records.map((rec) => (
                        <div key={rec.id} className="pl-6 border-l-2 border-slate-100 relative">
                          <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white" />
                          <p className="font-bold text-sm">{rec.jobTitle}</p>
                          <p className="text-xs text-slate-500">{new Date(rec.startDate).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {profileTab === 'Personal' && (
                  <div className="space-y-6">
                    <div className="p-5 bg-slate-50 rounded-3xl border space-y-4">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><MapPin size={12}/> Address Line 1</p>
                        <input disabled={!isEditing} className="w-full bg-white p-3 rounded-xl border outline-none font-bold" value={selectedEmployee.addressLine1 || ''} onChange={(e) => setSelectedEmployee({...selectedEmployee, addressLine1: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Postcode</p>
                        <input disabled={!isEditing} className="w-full bg-white p-3 rounded-xl border outline-none font-bold" value={selectedEmployee.postcode || ''} onChange={(e) => setSelectedEmployee({...selectedEmployee, postcode: e.target.value})} />
                      </div>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-3xl border space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><HeartPulse size={14}/> Emergency Contact</h4>
                      <input disabled={!isEditing} className="w-full bg-white p-3 rounded-xl border outline-none font-bold" placeholder="Contact Name" value={selectedEmployee.emergencyName || ''} onChange={(e) => setSelectedEmployee({...selectedEmployee, emergencyName: e.target.value})} />
                      <input disabled={!isEditing} className="w-full bg-white p-3 rounded-xl border outline-none font-bold" placeholder="Phone Number" value={selectedEmployee.emergencyPhone || ''} onChange={(e) => setNewEmployee({...newEmployee, emergencyPhone: e.target.value})} />
                    </div>
                  </div>
                )}

                {profileTab === 'Payroll' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4 shadow-xl">
                      <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <h4 className="text-[10px] font-black uppercase text-slate-400">UK Payroll Data</h4>
                        <button onClick={() => setShowSensitive(!showSensitive)} className="text-[10px] font-bold bg-white/10 px-3 py-1 rounded-full">{showSensitive ? 'Hide' : 'Decrypt'}</button>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase">NI Number</p>
                        <input 
                          disabled={!isEditing} 
                          className="bg-transparent text-xl font-mono font-black outline-none w-full" 
                          type={showSensitive || isEditing ? "text" : "password"}
                          value={selectedEmployee.niNumber || ''} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, niNumber: e.target.value})} 
                        />
                      </div>
                      <div className="pt-4 border-t border-white/10 flex justify-between">
                        <div><p className="text-[10px] font-bold text-slate-400">Salary</p><p className="font-bold">£{showSensitive || isEditing ? Number(selectedEmployee.records[0]?.payAmount).toLocaleString() : '••••••'}</p></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 border-t bg-slate-50 grid grid-cols-2 gap-4">
                {isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(false)} className="py-4 bg-white border rounded-2xl font-bold">Cancel</button>
                    <button onClick={handleUpdate} className="py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2"><Save size={18}/> Save Changes</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleDelete(selectedEmployee.id)} className="py-4 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"><Trash2 size={18}/> Terminate</button>
                    <button onClick={() => setIsEditing(true)} className="py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg"><Edit3 size={18}/> Edit Dossier</button>
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
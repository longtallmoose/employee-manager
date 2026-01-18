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
  const [isSaving, setIsSaving] = useState(false); // Added loading state
  
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
      // If panel is open, refresh selected employee data to show updates immediately
      if (selectedEmployee) {
        const updated = data.find((e:any) => e.id === selectedEmployee.id);
        if (updated) setSelectedEmployee(updated);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleCreate = async () => {
    if (!newEmployee.firstName || !newEmployee.lastName) return alert("Required fields missing");
    setIsSaving(true);
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
    setIsSaving(false);
  };

  const handleUpdate = async () => {
    if (!selectedEmployee) return;
    setIsSaving(true);
    
    // We get the LATEST record to act as the current job info
    // If we are editing, we are likely updating the fields bound to selectedEmployee.records[0]
    const currentRecord = selectedEmployee.records[0] || {};

    try {
      const res = await fetch(`${API_BASE}/employees/${selectedEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: selectedEmployee.firstName,
          lastName: selectedEmployee.lastName,
          niNumber: selectedEmployee.niNumber,
          addressLine1: selectedEmployee.addressLine1,
          postcode: selectedEmployee.postcode,
          emergencyName: selectedEmployee.emergencyName,
          emergencyPhone: selectedEmployee.emergencyPhone,
          // Job fields come from the record array which we bind to inputs
          jobTitle: currentRecord.jobTitle,
          department: currentRecord.department,
          payAmount: currentRecord.payAmount
        }),
      });
      
      if (res.ok) {
        setIsEditing(false);
        await fetchEmployees(); // Refresh to see new timeline entry
      } else {
        alert("Failed to save changes");
      }
    } catch (err) { console.error(err); }
    setIsSaving(false);
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
          <button onClick={() => setActiveTab('Employees')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'Employees' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800'}`}>
            <Users size={20} /> <span className="font-semibold text-sm">Employees</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto relative">
        <header className="bg-white h-16 border-b flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-full w-96 border">
            <Search className="text-slate-400 w-4 h-4" />
            <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black">A</div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-end mb-10">
            <div><h1 className="text-4xl font-black tracking-tight">{activeTab}</h1><p className="text-slate-500 font-medium">Workforce Directory</p></div>
            <button onClick={() => setIsAddingNew(true)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl flex items-center gap-3 transition-all active:scale-95"><UserPlus size={20} /> Onboard Staff</button>
          </div>

          <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]"><tr><th className="px-8 py-6">Personnel</th><th className="px-8 py-6">Assignment</th><th className="px-8 py-6 text-right pr-12">Action</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {employees.filter(e => `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())).map((emp) => (
                  <tr key={emp.id} className="hover:bg-blue-50/40 cursor-pointer" onClick={() => { setSelectedEmployee(emp); setIsPanelOpen(true); setIsEditing(false); }}>
                    <td className="px-8 py-6 flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-white border flex items-center justify-center font-black text-blue-600">{emp.firstName[0]}</div><span className="font-bold text-lg">{emp.firstName} {emp.lastName}</span></td>
                    <td className="px-8 py-6"><p className="font-bold">{emp.records[0]?.jobTitle}</p><p className="text-[10px] font-black text-blue-500 uppercase">{emp.records[0]?.department}</p></td>
                    <td className="px-8 py-6 text-right pr-12 text-slate-300"><ChevronRight size={28} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ONBOARD SCREEN */}
        {isAddingNew && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsAddingNew(false)}>
            <div className="max-w-xl w-full bg-white h-full flex flex-col p-8 space-y-6 overflow-y-auto animate-in slide-in-from-right duration-500 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center"><h3 className="text-2xl font-black">New Hire</h3><button onClick={() => setIsAddingNew(false)}><X size={28}/></button></div>
              <div className="space-y-4">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Personal</p>
                <div className="grid grid-cols-2 gap-4">
                  <input className="p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="First Name" value={newEmployee.firstName} onChange={e => setNewEmployee({...newEmployee, firstName: e.target.value})} />
                  <input className="p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="Last Name" value={newEmployee.lastName} onChange={e => setNewEmployee({...newEmployee, lastName: e.target.value})} />
                </div>
                <input className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="NI Number" value={newEmployee.niNumber} onChange={e => setNewEmployee({...newEmployee, niNumber: e.target.value})} />
                <input className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="Address" value={newEmployee.addressLine1} onChange={e => setNewEmployee({...newEmployee, addressLine1: e.target.value})} />
                <input className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="Postcode" value={newEmployee.postcode} onChange={e => setNewEmployee({...newEmployee, postcode: e.target.value})} />
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Next of Kin</p>
                <div className="grid grid-cols-2 gap-4">
                  <input className="p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="Contact Name" value={newEmployee.emergencyName} onChange={e => setNewEmployee({...newEmployee, emergencyName: e.target.value})} />
                  <input className="p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="Phone" value={newEmployee.emergencyPhone} onChange={e => setNewEmployee({...newEmployee, emergencyPhone: e.target.value})} />
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Job & Pay</p>
                <input className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="Job Title" value={newEmployee.jobTitle} onChange={e => setNewEmployee({...newEmployee, jobTitle: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <select className="p-4 bg-slate-50 border rounded-2xl font-bold" value={newEmployee.department} onChange={e => setNewEmployee({...newEmployee, department: e.target.value})}>
                    <option value="OPERATIONS">OPERATIONS</option><option value="HR">HR</option><option value="FINANCE">FINANCE</option>
                  </select>
                  <input type="number" className="p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="Salary (£)" value={newEmployee.payAmount} onChange={e => setNewEmployee({...newEmployee, payAmount: Number(e.target.value)})} />
                </div>
              </div>
              <button onClick={handleCreate} disabled={isSaving} className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest disabled:opacity-50">{isSaving ? 'Saving...' : 'Onboard Personnel'}</button>
            </div>
          </div>
        )}

        {/* PROFILE/EDIT PANEL */}
        {isPanelOpen && selectedEmployee && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsPanelOpen(false)}>
            <div className="max-w-xl w-full bg-white h-full flex flex-col p-8 space-y-8 animate-in slide-in-from-right duration-500 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-[2rem] bg-slate-900 text-white flex items-center justify-center text-3xl font-black">{selectedEmployee.firstName[0]}</div>
                  <div><h3 className="text-3xl font-black tracking-tight">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3><p className="text-blue-600 font-bold text-xs uppercase tracking-widest">{selectedEmployee.records[0]?.jobTitle}</p></div>
                </div>
                <button onClick={() => setIsPanelOpen(false)}><X size={28}/></button>
              </div>
              <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl">{['Overview', 'Personal', 'Payroll'].map(t => <button key={t} onClick={() => setProfileTab(t)} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest ${profileTab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>{t}</button>)}</div>

              <div className="flex-1 overflow-y-auto space-y-8">
                {profileTab === 'Overview' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-slate-50 rounded-3xl border space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Position</p>
                        <input disabled={!isEditing} className="bg-transparent font-black text-lg outline-none w-full" value={selectedEmployee.records[0]?.jobTitle} onChange={e => {
                          const r = [...selectedEmployee.records]; r[0].jobTitle = e.target.value; setSelectedEmployee({...selectedEmployee, records: r})
                        }} />
                      </div>
                      <div className="p-6 bg-slate-50 rounded-3xl border space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Department</p>
                        <select disabled={!isEditing} className="bg-transparent font-black text-lg outline-none w-full" value={selectedEmployee.records[0]?.department} onChange={e => {
                          const r = [...selectedEmployee.records]; r[0].department = e.target.value; setSelectedEmployee({...selectedEmployee, records: r})
                        }}>
                          <option value="OPERATIONS">OPERATIONS</option><option value="HR">HR</option><option value="FINANCE">FINANCE</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-black text-xs uppercase tracking-widest flex items-center gap-2"><History size={18}/> Service History</h4>
                      <div className="space-y-6 border-l-4 border-slate-100 ml-2 pl-8 relative">
                        {selectedEmployee.records.map((rec: any, idx: number) => (
                          <div key={rec.id} className="relative py-2">
                            <div className={`absolute -left-[40px] top-4 w-6 h-6 rounded-full border-4 border-white shadow-sm ${idx === 0 ? 'bg-blue-600' : 'bg-slate-300'}`} />
                            <p className="font-black text-slate-900 text-lg">{rec.jobTitle}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase">
                              {new Date(rec.startDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} • {rec.department}
                            </p>
                            {rec.endDate && <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Concluded {new Date(rec.endDate).toLocaleDateString('en-GB')}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {profileTab === 'Personal' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-[2.5rem] border space-y-4 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={14}/> Residence</p>
                      <input disabled={!isEditing} className="w-full bg-white p-4 rounded-2xl border outline-none font-bold" value={selectedEmployee.addressLine1 || ''} onChange={e => setSelectedEmployee({...selectedEmployee, addressLine1: e.target.value})} />
                      <input disabled={!isEditing} className="w-full bg-white p-4 rounded-2xl border outline-none font-bold" value={selectedEmployee.postcode || ''} onChange={e => setSelectedEmployee({...selectedEmployee, postcode: e.target.value})} />
                    </div>
                    <div className="p-6 bg-slate-50 rounded-[2.5rem] border space-y-4 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><HeartPulse size={14}/> Emergency Contact</p>
                      <input disabled={!isEditing} className="w-full bg-white p-4 rounded-2xl border outline-none font-bold" placeholder="Name" value={selectedEmployee.emergencyName || ''} onChange={e => setSelectedEmployee({...selectedEmployee, emergencyName: e.target.value})} />
                      <input disabled={!isEditing} className="w-full bg-white p-4 rounded-2xl border outline-none font-bold" placeholder="Phone" value={selectedEmployee.emergencyPhone || ''} onChange={e => setSelectedEmployee({...selectedEmployee, emergencyPhone: e.target.value})} />
                    </div>
                  </div>
                )}

                {profileTab === 'Payroll' && (
                  <div className="space-y-6">
                    <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-6 shadow-2xl relative">
                      <div className="flex justify-between items-center"><h4 className="text-[10px] font-black uppercase text-slate-400">UK Compliance</h4><button onClick={() => setShowSensitive(!showSensitive)} className="text-[10px] font-bold bg-white/20 px-4 py-2 rounded-full">{showSensitive ? 'HIDE' : 'SHOW'}</button></div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">National Insurance</p>
                        <input disabled={!isEditing} type={showSensitive || isEditing ? "text" : "password"} className="bg-transparent text-2xl font-mono font-black outline-none w-full" value={selectedEmployee.niNumber || ''} onChange={e => setSelectedEmployee({...selectedEmployee, niNumber: e.target.value})} />
                      </div>
                      <div className="pt-6 border-t border-white/10 flex justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Annual Salary</p>
                          <div className="flex items-center gap-1 text-xl font-black">
                            <span>£</span>
                            <input disabled={!isEditing} className="bg-transparent outline-none" value={selectedEmployee.records[0]?.payAmount} onChange={e => {
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
                  <><button onClick={() => setIsEditing(false)} className="py-4 bg-white border rounded-2xl font-black uppercase text-xs tracking-widest">Discard</button><button onClick={handleUpdate} disabled={isSaving} className="py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"><Save size={16}/> {isSaving ? 'Saving...' : 'Save Changes'}</button></>
                ) : (
                  <><button onClick={() => handleDelete(selectedEmployee.id)} className="py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-100"><Trash2 size={16}/> Terminate</button><button onClick={() => setIsEditing(true)} className="py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2"><Edit3 size={16}/> Edit Dossier</button></>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
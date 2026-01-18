'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Clock, ShieldCheck, X, ChevronRight, Search, Plus, 
  Trash2, Building2, PoundSterling, History, Lock, MapPin, 
  Phone, CreditCard, HeartPulse, Save, Edit3, UserPlus, 
  Briefcase, Scale, AlertTriangle, Gavel
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Employees');
  
  // Data
  const [employees, setEmployees] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI States
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isCasePanelOpen, setIsCasePanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);
  const [profileTab, setProfileTab] = useState('Overview');
  
  // Modals & Loading
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isAddingCase, setIsAddingCase] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Forms
  const [newEmployee, setNewEmployee] = useState({ 
    firstName: '', lastName: '', jobTitle: '', department: 'OPERATIONS', 
    payAmount: 0, niNumber: '', addressLine1: '', postcode: '',
    emergencyName: '', emergencyPhone: ''
  });

  const [newCaseData, setNewCaseData] = useState({
    subjectId: '', type: 'DISCIPLINARY', riskLevel: 'MEDIUM', 
    summary: '', detailedDesc: ''
  });

  const [newTimelineEvent, setNewTimelineEvent] = useState('');
  const API_BASE = "https://employee-api-3oyj.onrender.com/api";

  const fetchData = async () => {
    try {
      const [empRes, caseRes] = await Promise.all([
        fetch(`${API_BASE}/employees`),
        fetch(`${API_BASE}/cases`)
      ]);
      const empData = await empRes.json();
      const caseData = await caseRes.json();
      setEmployees(empData);
      setCases(caseData);

      if (selectedEmployee) {
        const updated = empData.find((e:any) => e.id === selectedEmployee.id);
        if (updated) setSelectedEmployee(updated);
      }
      if (selectedCase) {
        const updatedCase = caseData.find((c:any) => c.id === selectedCase.id);
        if (updatedCase) setSelectedCase(updatedCase);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- ACTIONS ---
  const handleCreateEmployee = async () => {
    if (!newEmployee.firstName) return alert("Missing fields");
    setIsSaving(true);
    await fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newEmployee) });
    setIsAddingNew(false);
    fetchData();
    setIsSaving(false);
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;
    setIsSaving(true);
    const currentRecord = selectedEmployee.records[0] || {};
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
    fetchData();
    setIsSaving(false);
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm("Terminate record?")) return;
    await fetch(`${API_BASE}/employees/${id}`, { method: 'DELETE' });
    setIsPanelOpen(false);
    fetchData();
  };

  const updateRecordField = (field: string, value: any) => {
    if (!selectedEmployee?.records) return;
    const updatedRecords = selectedEmployee.records.map((rec: any, index: number) => index === 0 ? { ...rec, [field]: value } : rec);
    setSelectedEmployee({ ...selectedEmployee, records: updatedRecords });
  };

  const handleCreateCase = async () => {
    if (!newCaseData.subjectId || !newCaseData.summary) return alert("Required fields missing");
    setIsSaving(true);
    await fetch(`${API_BASE}/cases`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newCaseData) });
    setIsAddingCase(false);
    fetchData();
    setIsSaving(false);
  };

  const handleAddTimelineEvent = async () => {
    if (!newTimelineEvent) return;
    await fetch(`${API_BASE}/cases/${selectedCase.id}/timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Note', description: newTimelineEvent, stage: selectedCase.status })
    });
    setNewTimelineEvent('');
    fetchData();
  };

  const getSortedRecords = (records: any[]) => [...(records || [])].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col z-20 shadow-2xl">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg"><ShieldCheck className="text-white w-6 h-6" /></div>
          <span className="font-bold text-xl text-white tracking-tight">StaffPilot</span>
        </div>
        <nav className="flex-1 mt-6 px-3 space-y-2">
          <button onClick={() => setActiveTab('Employees')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'Employees' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800'}`}>
            <Users size={20} /> <span className="font-semibold text-sm">Employees</span>
          </button>
          <button onClick={() => setActiveTab('Cases')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'Cases' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-slate-800'}`}>
            <Briefcase size={20} /> <span className="font-semibold text-sm">Case Management</span>
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
            <div>
              <h1 className="text-4xl font-black tracking-tight">{activeTab}</h1>
              <p className="text-slate-500 font-medium mt-1">{activeTab === 'Employees' ? 'Workforce Directory' : 'Risk & Compliance'}</p>
            </div>
            {activeTab === 'Employees' ? (
              <button onClick={() => setIsAddingNew(true)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl flex items-center gap-3 active:scale-95 transition-all"><UserPlus size={20} /> Onboard Staff</button>
            ) : (
              <button onClick={() => setIsAddingCase(true)} className="bg-red-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl flex items-center gap-3 active:scale-95 transition-all"><Scale size={20} /> Open Case</button>
            )}
          </div>

          {activeTab === 'Employees' && (
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
          )}

          {activeTab === 'Cases' && (
            <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]"><tr><th className="px-8 py-6">Ref</th><th className="px-8 py-6">Subject</th><th className="px-8 py-6">Type</th><th className="px-8 py-6">Status</th><th className="px-8 py-6 text-right pr-12">View</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {cases.map((c) => (
                    <tr key={c.id} className="hover:bg-red-50/40 cursor-pointer" onClick={() => { setSelectedCase(c); setIsCasePanelOpen(true); }}>
                      <td className="px-8 py-6"><p className="font-bold font-mono text-sm">{c.reference}</p><p className="text-[10px] text-slate-400 uppercase">{new Date(c.createdAt).toLocaleDateString()}</p></td>
                      <td className="px-8 py-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">{c.involvedParties[0]?.employee?.firstName?.[0] || '?'}</div>
                        <span className="font-bold">{c.involvedParties[0]?.employee?.firstName} {c.involvedParties[0]?.employee?.lastName}</span>
                      </td>
                      <td className="px-8 py-6"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${c.type === 'DISCIPLINARY' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{c.type}</span></td>
                      <td className="px-8 py-6"><span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">{c.status}</span></td>
                      <td className="px-8 py-6 text-right pr-12 text-slate-300"><ChevronRight size={20} /></td>
                    </tr>
                  ))}
                  {cases.length === 0 && <tr className="text-center"><td colSpan={5} className="py-12 text-slate-400 font-medium">No active cases found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL: CREATE EMPLOYEE */}
        {isAddingNew && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsAddingNew(false)}>
            <div className="max-w-xl w-full bg-white h-full p-8 overflow-y-auto space-y-6 shadow-2xl animate-in slide-in-from-right duration-500" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center"><h3 className="text-2xl font-black">New Hire</h3><button onClick={() => setIsAddingNew(false)}><X size={28}/></button></div>
              <div className="space-y-4">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Personal</p>
                <div className="grid grid-cols-2 gap-4"><input className="p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="First Name" onChange={e => setNewEmployee({...newEmployee, firstName: e.target.value})} /><input className="p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="Last Name" onChange={e => setNewEmployee({...newEmployee, lastName: e.target.value})} /></div>
                <input className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="NI Number" onChange={e => setNewEmployee({...newEmployee, niNumber: e.target.value})} />
                <input className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="Address" onChange={e => setNewEmployee({...newEmployee, addressLine1: e.target.value})} />
                <input className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="Postcode" onChange={e => setNewEmployee({...newEmployee, postcode: e.target.value})} />
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Job & Pay</p>
                <input className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="Job Title" onChange={e => setNewEmployee({...newEmployee, jobTitle: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <select className="p-4 bg-slate-50 border rounded-2xl font-bold" onChange={e => setNewEmployee({...newEmployee, department: e.target.value})}><option value="OPERATIONS">OPERATIONS</option><option value="HR">HR</option><option value="FINANCE">FINANCE</option></select>
                  <input type="number" className="p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="Salary (£)" onChange={e => setNewEmployee({...newEmployee, payAmount: Number(e.target.value)})} />
                </div>
              </div>
              <button onClick={handleCreateEmployee} disabled={isSaving} className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest disabled:opacity-50">{isSaving ? 'Saving...' : 'Onboard'}</button>
            </div>
          </div>
        )}

        {/* MODAL: CREATE CASE */}
        {isAddingCase && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsAddingCase(false)}>
            <div className="max-w-xl w-full bg-white h-full p-8 overflow-y-auto space-y-6 shadow-2xl animate-in slide-in-from-right duration-500" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center"><h3 className="text-2xl font-black text-red-600">Open Case File</h3><button onClick={() => setIsAddingCase(false)}><X size={28}/></button></div>
              <p className="text-sm text-slate-500 font-medium">Initiating formal procedure. Auditable.</p>
              
              <div className="space-y-4">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Subject</label>
                <select className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" onChange={e => setNewCaseData({...newCaseData, subjectId: e.target.value})}>
                  <option value="">Select Employee...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Classification</label>
                <div className="grid grid-cols-2 gap-4">
                  <select className="p-4 bg-slate-50 border rounded-2xl font-bold" onChange={e => setNewCaseData({...newCaseData, type: e.target.value})}>
                    <option value="DISCIPLINARY">DISCIPLINARY</option><option value="GRIEVANCE">GRIEVANCE</option><option value="CAPABILITY_PERFORMANCE">PERFORMANCE</option>
                  </select>
                  <select className="p-4 bg-slate-50 border rounded-2xl font-bold" onChange={e => setNewCaseData({...newCaseData, riskLevel: e.target.value})}>
                    <option value="HIGH">HIGH RISK</option><option value="MEDIUM">MEDIUM</option><option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Allegation</label>
                <input className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="Summary" onChange={e => setNewCaseData({...newCaseData, summary: e.target.value})} />
                <textarea className="w-full p-4 bg-slate-50 border rounded-2xl font-bold h-32" placeholder="Description..." onChange={e => setNewCaseData({...newCaseData, detailedDesc: e.target.value})} />
              </div>

              <button onClick={handleCreateCase} disabled={isSaving} className="w-full py-5 bg-red-600 text-white rounded-3xl font-black uppercase tracking-widest disabled:opacity-50">{isSaving ? 'Processing...' : 'Create Case'}</button>
            </div>
          </div>
        )}

        {/* DOSSIER: EMPLOYEE */}
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
                      <div className="p-6 bg-slate-50 rounded-3xl border space-y-2"><p className="text-[10px] font-black text-slate-400 uppercase">Position</p><input disabled={!isEditing} className="bg-transparent font-black text-lg outline-none w-full" value={selectedEmployee.records[0]?.jobTitle} onChange={e => updateRecordField('jobTitle', e.target.value)} /></div>
                      <div className="p-6 bg-slate-50 rounded-3xl border space-y-2"><p className="text-[10px] font-black text-slate-400 uppercase">Department</p><select disabled={!isEditing} className="bg-transparent font-black text-lg outline-none w-full" value={selectedEmployee.records[0]?.department} onChange={e => updateRecordField('department', e.target.value)}><option value="OPERATIONS">OPERATIONS</option><option value="HR">HR</option><option value="FINANCE">FINANCE</option></select></div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-black text-xs uppercase tracking-widest flex items-center gap-2"><History size={18}/> Service History</h4>
                      <div className="space-y-6 border-l-4 border-slate-100 ml-2 pl-8 relative">
                        {getSortedRecords(selectedEmployee.records).map((rec: any, idx: number) => (
                          <div key={rec.id} className="relative py-2">
                            <div className={`absolute -left-[40px] top-4 w-6 h-6 rounded-full border-4 border-white shadow-sm ${idx === 0 ? 'bg-blue-600' : 'bg-slate-300'}`} />
                            <p className="font-black text-slate-900 text-lg">{rec.jobTitle}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase">{new Date(rec.startDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} • {rec.department}</p>
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
                  </div>
                )}
                {profileTab === 'Payroll' && (
                  <div className="space-y-6">
                    <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-6 shadow-2xl relative">
                      <div className="flex justify-between items-center"><h4 className="text-[10px] font-black uppercase text-slate-400">UK Compliance</h4><button onClick={() => setShowSensitive(!showSensitive)} className="text-[10px] font-bold bg-white/20 px-4 py-2 rounded-full">{showSensitive ? 'HIDE' : 'SHOW'}</button></div>
                      <div className="space-y-2"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NI Number</p><input disabled={!isEditing} type={showSensitive || isEditing ? "text" : "password"} className="bg-transparent text-2xl font-mono font-black outline-none w-full" value={selectedEmployee.niNumber || ''} onChange={e => setSelectedEmployee({...selectedEmployee, niNumber: e.target.value})} /></div>
                      <div className="pt-6 border-t border-white/10 flex justify-between"><div><p className="text-[10px] font-bold text-slate-400 uppercase">Annual Salary</p><div className="flex items-center gap-1 text-xl font-black"><span>£</span><input disabled={!isEditing} className="bg-transparent outline-none" value={selectedEmployee.records[0]?.payAmount} onChange={e => updateRecordField('payAmount', Number(e.target.value))} /></div></div></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-8 border-t bg-slate-50 grid grid-cols-2 gap-4">
                {isEditing ? (
                  <><button onClick={() => setIsEditing(false)} className="py-4 bg-white border rounded-2xl font-black uppercase text-xs tracking-widest">Discard</button><button onClick={handleUpdateEmployee} disabled={isSaving} className="py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"><Save size={16}/> {isSaving ? 'Saving...' : 'Save Changes'}</button></>
                ) : (
                  <><button onClick={() => handleDeleteEmployee(selectedEmployee.id)} className="py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-100"><Trash2 size={16}/> Terminate</button><button onClick={() => setIsEditing(true)} className="py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2"><Edit3 size={16}/> Edit Dossier</button></>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DOSSIER: CASE */}
        {isCasePanelOpen && selectedCase && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-md" onClick={() => setIsCasePanelOpen(false)}>
            <div className="max-w-xl w-full bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-500" onClick={e => e.stopPropagation()}>
              <div className="p-8 bg-slate-50 border-b flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight text-red-600">{selectedCase.type}</h2>
                    <p className="text-sm font-bold text-slate-500 mt-1">{selectedCase.reference} • {selectedCase.riskLevel}</p>
                  </div>
                  <button onClick={() => setIsCasePanelOpen(false)}><X size={28}/></button>
                </div>
                <div className="p-4 bg-white rounded-2xl border shadow-sm">
                  <p className="text-xs font-black uppercase text-slate-400 mb-1">Allegation</p>
                  <p className="font-bold text-lg leading-tight">{selectedCase.summary}</p>
                  <p className="text-sm text-slate-500 mt-2">{selectedCase.detailedDesc}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-white">
                <h4 className="font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-8"><Gavel size={18}/> Investigation Timeline</h4>
                <div className="space-y-8 border-l-4 border-slate-100 ml-2 pl-8 relative">
                  {selectedCase.timeline?.map((note: any, idx: number) => (
                    <div key={note.id} className="relative">
                      <div className={`absolute -left-[41px] top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${idx === 0 ? 'bg-red-600' : 'bg-slate-300'}`} />
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{note.stage} • {note.loggedByUserId} • {new Date(note.occurredAt).toLocaleDateString()}</p>
                        <p className="font-medium text-slate-900">{note.description}</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="relative pt-4">
                    <div className="absolute -left-[41px] top-5 w-6 h-6 rounded-full border-4 border-white bg-slate-900 shadow-sm" />
                    <textarea 
                      className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl font-medium focus:border-red-500 outline-none transition-all" 
                      placeholder="Add investigation note..." 
                      rows={3}
                      value={newTimelineEvent}
                      onChange={e => setNewTimelineEvent(e.target.value)}
                    />
                    <button onClick={handleAddTimelineEvent} className="mt-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-black transition-all">Add Entry</button>
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
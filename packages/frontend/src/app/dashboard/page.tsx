'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Clock, ShieldCheck, X, ChevronRight, Search, Plus, Trash2, Save, Edit3, MapPin, HeartPulse, History, Lock, UserPlus } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileTab, setProfileTab] = useState('Overview');
  const [showSensitive, setShowSensitive] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  const [newEmployee, setNewEmployee] = useState({ 
    firstName: '', lastName: '', jobTitle: '', department: 'OPERATIONS', payAmount: 0, 
    niNumber: '', addressLine1: '', postcode: '', emergencyName: '', emergencyPhone: '' 
  });

  const API_BASE = "https://employee-api-3oyj.onrender.com/api";

  const fetchEmployees = async () => {
    const res = await fetch(`${API_BASE}/employees`);
    const data = await res.json();
    setEmployees(data);
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleCreate = async () => {
    await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newEmployee, email: `${Date.now()}@vanguard.com`, password: 'Password123!' }),
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
    if (!confirm("Confirm termination?")) return;
    await fetch(`${API_BASE}/employees/${id}`, { method: 'DELETE' });
    setIsPanelOpen(false);
    fetchEmployees();
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col p-6 gap-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-6">
          <ShieldCheck className="text-blue-500 w-8 h-8" />
          <span className="font-bold text-xl text-white">Vanguard</span>
        </div>
        <button className="flex items-center gap-3 bg-blue-600 text-white p-3 rounded-xl font-bold"><Users size={20}/> Employees</button>
      </aside>

      <main className="flex-1 overflow-y-auto p-12">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black">Directory</h1>
          <button onClick={() => setIsAddingNew(true)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl flex items-center gap-2"><Plus/> Onboard</button>
        </div>

        <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <tr><th className="px-8 py-6">Personnel</th><th className="px-8 py-6">Role</th><th className="px-8 py-6 text-right pr-12">Action</th></tr>
            </thead>
            <tbody className="divide-y">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => { setSelectedEmployee(emp); setIsPanelOpen(true); setIsEditing(false); }}>
                  <td className="px-8 py-6 font-bold">{emp.firstName} {emp.lastName}</td>
                  <td className="px-8 py-6 text-sm">{emp.records[0]?.jobTitle}</td>
                  <td className="px-8 py-6 text-right pr-12 text-slate-300"><ChevronRight/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isAddingNew && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-sm">
            <div className="w-full max-w-xl h-full bg-white p-12 overflow-y-auto space-y-6">
              <div className="flex justify-between items-center"><h2 className="text-2xl font-black">New Hire</h2><button onClick={() => setIsAddingNew(false)}><X/></button></div>
              <input className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="First Name" onChange={e => setNewEmployee({...newEmployee, firstName: e.target.value})} />
              <input className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="Last Name" onChange={e => setNewEmployee({...newEmployee, lastName: e.target.value})} />
              <input className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="NI Number" onChange={e => setNewEmployee({...newEmployee, niNumber: e.target.value})} />
              <input className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="Address" onChange={e => setNewEmployee({...newEmployee, addressLine1: e.target.value})} />
              <input className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="Postcode" onChange={e => setNewEmployee({...newEmployee, postcode: e.target.value})} />
              <input className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="Next of Kin" onChange={e => setNewEmployee({...newEmployee, emergencyName: e.target.value})} />
              <input className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="Contact Phone" onChange={e => setNewEmployee({...newEmployee, emergencyPhone: e.target.value})} />
              <input className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="Job Title" onChange={e => setNewEmployee({...newEmployee, jobTitle: e.target.value})} />
              <input className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="Salary" type="number" onChange={e => setNewEmployee({...newEmployee, payAmount: Number(e.target.value)})} />
              <button onClick={handleCreate} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black">ONBOARD STAFF</button>
            </div>
          </div>
        )}

        {isPanelOpen && selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-sm">
            <div className="w-full max-w-xl h-full bg-white flex flex-col p-12">
              <div className="flex justify-between items-center mb-8"><h2 className="text-3xl font-black">{selectedEmployee.firstName} {selectedEmployee.lastName}</h2><button onClick={() => setIsPanelOpen(false)}><X/></button></div>
              <div className="flex gap-4 mb-8">
                {['Overview', 'Personal', 'Payroll'].map(t => <button key={t} onClick={() => setProfileTab(t)} className={`px-4 py-2 rounded-lg font-bold ${profileTab === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>{t}</button>)}
              </div>
              <div className="flex-1 overflow-y-auto space-y-6">
                {profileTab === 'Overview' && (
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase text-slate-400">Current Position</label>
                    <input disabled={!isEditing} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={selectedEmployee.records[0]?.jobTitle} onChange={e => {
                      const recs = [...selectedEmployee.records];
                      recs[0].jobTitle = e.target.value;
                      setSelectedEmployee({...selectedEmployee, records: recs});
                    }} />
                    <label className="text-xs font-black uppercase text-slate-400">Department</label>
                    <input disabled={!isEditing} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={selectedEmployee.records[0]?.department} onChange={e => {
                      const recs = [...selectedEmployee.records];
                      recs[0].department = e.target.value;
                      setSelectedEmployee({...selectedEmployee, records: recs});
                    }} />
                  </div>
                )}
                {profileTab === 'Personal' && (
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase text-slate-400">Address</label>
                    <input disabled={!isEditing} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={selectedEmployee.addressLine1 || ''} onChange={e => setSelectedEmployee({...selectedEmployee, addressLine1: e.target.value})} />
                    <label className="text-xs font-black uppercase text-slate-400">Emergency Contact</label>
                    <input disabled={!isEditing} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={selectedEmployee.emergencyName || ''} onChange={e => setSelectedEmployee({...selectedEmployee, emergencyName: e.target.value})} />
                  </div>
                )}
                {profileTab === 'Payroll' && (
                  <div className="space-y-4">
                    <button onClick={() => setShowSensitive(!showSensitive)} className="text-xs font-bold text-blue-600 underline">Toggle Sensitive View</button>
                    <label className="text-xs font-black uppercase text-slate-400 block">NI Number</label>
                    <input disabled={!isEditing} type={showSensitive || isEditing ? "text" : "password"} className="w-full p-4 bg-slate-50 border rounded-2xl font-mono font-bold" value={selectedEmployee.niNumber || ''} onChange={e => setSelectedEmployee({...selectedEmployee, niNumber: e.target.value})} />
                    <label className="text-xs font-black uppercase text-slate-400 block">Annual Pay</label>
                    <input disabled={!isEditing} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={selectedEmployee.records[0]?.payAmount} onChange={e => {
                      const recs = [...selectedEmployee.records];
                      recs[0].payAmount = Number(e.target.value);
                      setSelectedEmployee({...selectedEmployee, records: recs});
                    }} />
                  </div>
                )}
              </div>
              <div className="pt-8 border-t flex gap-4">
                {isEditing ? (
                  <button onClick={handleUpdate} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2"><Save/> SAVE CHANGES</button>
                ) : (
                  <>
                    <button onClick={() => handleDelete(selectedEmployee.id)} className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-black">TERMINATE</button>
                    <button onClick={() => setIsEditing(true)} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2"><Edit3/> EDIT</button>
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
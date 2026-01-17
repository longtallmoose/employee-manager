'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New State for Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', role: '' });

  const API_BASE = "https://employee-api-3oyj.onrender.com/api/employees";

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    fetch(API_BASE)
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data);
        setLoading(false);
      })
      .catch((err) => console.error('Failed to load:', err));
  }, [router]);

  const startEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setEditForm({ firstName: emp.firstName, lastName: emp.lastName, role: emp.role });
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setEmployees(employees.map(emp => emp.id === id ? { ...emp, ...editForm } : emp));
        setEditingId(null);
      }
    } catch (error) {
      alert("Update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this employee?')) return;
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (res.ok) setEmployees(employees.filter((emp) => emp.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Staff Directory</h1>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {editingId === emp.id ? (
                      <div className="flex gap-2">
                        <input className="border p-1 rounded w-full" value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} />
                        <input className="border p-1 rounded w-full" value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} />
                      </div>
                    ) : (
                      <div className="font-medium">{emp.firstName} {emp.lastName}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === emp.id ? (
                      <input className="border p-1 rounded w-full" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} />
                    ) : (
                      <span className="text-gray-600">{emp.role}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    {editingId === emp.id ? (
                      <>
                        <button onClick={() => handleUpdate(emp.id)} className="text-green-600 font-bold">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-gray-400">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(emp)} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => handleDelete(emp.id)} className="text-red-600 hover:underline">Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
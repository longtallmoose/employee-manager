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

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }

    // UPDATED LINK: Pointing to your Render Backend
    fetch('https://employee-api-3oyj.onrender.com/api/employees')
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data);
        setLoading(false);
      })
      .catch((err) => console.error('Failed to load:', err));
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      // UPDATED LINK: Pointing to your Render Backend
      const res = await fetch(`https://employee-api-3oyj.onrender.com/api/employees/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setEmployees(employees.filter((emp) => emp.id !== id));
      } else {
        alert('Failed to delete');
      }
    } catch (error) {
      console.error(error);
      alert('Error connecting to server');
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Employee Dashboard</h1>
            <button 
                onClick={handleLogout}
                className="bg-gray-200 px-4 py-2 rounded text-sm font-semibold hover:bg-gray-300"
            >
                Log Out
            </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {emp.firstName} {emp.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(emp.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="text-red-600 hover:text-red-900 font-bold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
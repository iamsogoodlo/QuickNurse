import React, { useState } from 'react';
import { TEST_USERS } from '../../mock/testUsers';
import { useAuth } from '../../hooks/useAuth';

interface TestUser {
  id: string;
  name: string;
  zone: string;
  status?: string;
}

const TestLoginPanel: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { login } = useAuth();

  const loginAs = (user: TestUser, type: 'patient' | 'doctor') => {
    // Minimal authentication simulation
    login({ token: 'mock-token', [type]: { id: user.id, name: user.name } } as any, type as any);
  };

  return (
    <div className="mt-6">
      <button
        className="text-sm text-teal-600 hover:text-teal-500"
        onClick={() => setOpen(!open)}
      >
        🧪 Test Mode
      </button>
      {open && (
        <div className="mt-4 p-4 border rounded-md bg-gray-50 space-y-2">
          <h3 className="font-semibold text-sm">Quick Login - Patients</h3>
          {TEST_USERS.patients.map((u) => (
            <button
              key={u.id}
              className="block text-left w-full text-sm text-teal-700 hover:underline"
              onClick={() => loginAs(u, 'patient')}
            >
              {u.name} ({u.zone})
            </button>
          ))}
          <h3 className="font-semibold text-sm mt-4">Quick Login - Doctors</h3>
          {TEST_USERS.doctors.map((u) => (
            <button
              key={u.id}
              className="block text-left w-full text-sm text-teal-700 hover:underline"
              onClick={() => loginAs(u, 'doctor')}
            >
              {u.name} ({u.zone}) - {u.status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestLoginPanel;

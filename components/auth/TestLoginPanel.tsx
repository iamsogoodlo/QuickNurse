import React, { useState } from 'react';
import { TEST_USERS } from '../../mock/testUsers';
import { useAuth } from '../../hooks/useAuth';
import { AuthResponseData, NurseStatus } from '../../types';


interface TestUser {
  id: string;
  name: string;
  zone: string;
  status?: string;
}

const TestLoginPanel: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { login } = useAuth();

  const loginAs = (user: TestUser, type: 'patient' | 'nurse') => {
    const [firstName, ...lastNameParts] = user.name.split(' ');
    const lastName = lastNameParts.join(' ') || 'User';

    const data: AuthResponseData = { token: 'mock-token' };

    if (type === 'patient') {
      data.patient = {
        patient_id: user.id,
        first_name: firstName,
        last_name: lastName,
        email: `${user.id}@example.com`,
        account_status: 'active',
      };
    } else {
      data.nurse = {
        nurse_id: user.id,
        first_name: firstName,
        last_name: lastName,
        email: `${user.id}@example.com`,
        account_status: 'active',
        verification_status: 'verified',
        is_online: true,
        current_status: (user.status as NurseStatus) || NurseStatus.AVAILABLE,
      };
    }

    login(data, type);
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
          <h3 className="font-semibold text-sm mt-4">Quick Login - Nurses</h3>
          {TEST_USERS.nurses.map((u) => (
            <button
              key={u.id}
              className="block text-left w-full text-sm text-teal-700 hover:underline"
              onClick={() => loginAs(u, 'nurse')}
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


import React from 'react';
import FindNursesPanel from '../components/dashboard/patient/FindNursesPanel';
import UserLocationMap from '../components/common/UserLocationMap';
import { useAuth } from '../hooks/useAuth';
import { PatientProfile } from '../types';

const PatientDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const patient = user as PatientProfile | null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Patient Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Welcome{patient ? `, ${patient.first_name}` : ''}</h2>
            <p className="text-sm text-gray-600">Need care? Use the form to find a nurse.</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Account Stats</h2>
            <p className="text-sm text-gray-600">Total Requests: {patient?.total_requests ?? 0}</p>
            <p className="text-sm text-gray-600">Completed Visits: {patient?.completed_visits ?? 0}</p>
            <p className="text-sm text-gray-600">Total Spent: ${patient?.total_spent?.toFixed(2) ?? '0.00'}</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Your Location</h2>
            <UserLocationMap
              latitude={patient?.address.coordinates?.[1]}
              longitude={patient?.address.coordinates?.[0]}
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <FindNursesPanel />
        </div>
      </div>
    </div>
  );
};

export default PatientDashboardPage;

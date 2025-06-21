import React, { useState } from 'react';
import NurseMap from '../components/dashboard/nurse/NurseMap';

interface MockRequest {
  id: string;
  patient: string;
  serviceType: string;
  earnings: number;
}

const mockRequests: MockRequest[] = [
  { id: '1', patient: 'John D.', serviceType: 'Wound Care', earnings: 50 },
  { id: '2', patient: 'Jane B.', serviceType: 'IV Therapy', earnings: 70 },
];

const NurseDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'map'>('requests');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Nurse Dashboard</h1>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('requests')}
            className={`${
              activeTab === 'requests'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Incoming Requests
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`${
              activeTab === 'map'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Map
          </button>
        </nav>
      </div>

      {activeTab === 'requests' && (
        <div className="space-y-4">
          {mockRequests.map((req) => (
            <div key={req.id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800">
                {req.serviceType}
              </h3>
              <p className="text-sm text-gray-500">Patient: {req.patient}</p>
              <p className="text-sm text-green-600">${req.earnings}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'map' && <NurseMap />}
    </div>
  );
};

export default NurseDashboardPage;


import React, { useState } from 'react';
import FindNursesPanel from '../components/dashboard/patient/FindNursesPanel';
// import MyRequestsPanel from '../components/dashboard/patient/MyRequestsPanel'; // Placeholder for future

const PatientDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'find' | 'requests'>('find');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Patient Dashboard</h1>
      
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('find')}
            className={`${
              activeTab === 'find'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Find a Nurse
          </button>
          {/* <button
            onClick={() => setActiveTab('requests')}
            className={`${
              activeTab === 'requests'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            My Service Requests
          </button> */}
          {/* Placeholder for My Requests Tab */}
           <button
            disabled
            className="border-transparent text-gray-400 cursor-not-allowed whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            My Service Requests (Coming Soon)
          </button>
        </nav>
      </div>

      <div>
        {activeTab === 'find' && <FindNursesPanel />}
        {/* {activeTab === 'requests' && <MyRequestsPanel />} */}
      </div>
    </div>
  );
};

export default PatientDashboardPage;

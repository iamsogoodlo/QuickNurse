import React, { useState, useEffect } from 'react';
import NurseMap from '../components/dashboard/nurse/NurseMap';
import ServiceRequestCardNurseView from '../components/dashboard/nurse/ServiceRequestCardNurseView';
import { ServiceRequestSummaryForNurse, PatientProfile, NurseProfile } from '../types';
import { useAuth } from '../hooks/useAuth';
import { getPendingRequestsForNurse, acceptServiceRequest } from '../services/serviceRequestService';

const NurseDashboardPage: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [nearbyRequests, setNearbyRequests] = useState<ServiceRequestSummaryForNurse[]>([]);
  const [activeRequest, setActiveRequest] = useState<ServiceRequestSummaryForNurse | null>(null);
  const { user, token, userType } = useAuth();

  useEffect(() => {
    if (userType !== 'nurse' || !user) return;
    const nurse = user as NurseProfile;
    getPendingRequestsForNurse(nurse.nurse_id, token).then(res => {
      if (res.success && res.data) {
        setNearbyRequests(res.data as unknown as ServiceRequestSummaryForNurse[]);
      }
    });
  }, [user, token, userType]);

  const toggleOnline = () => setIsOnline((prev) => !prev);

  const handleAccept = (id: string) => {
    if (userType !== 'nurse' || !user) return;
    const nurse = user as NurseProfile;
    acceptServiceRequest(id, nurse.nurse_id, token).then(res => {
      if (res.success && res.data) {
        setActiveRequest(res.data as unknown as ServiceRequestSummaryForNurse);
        setNearbyRequests(nearbyRequests.filter(r => r.request_id !== id));
      }
    });
  };

  const handleDecline = (id: string) => {
    setNearbyRequests(nearbyRequests.filter((r) => r.request_id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Nurse Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <p className="mb-4 text-lg font-medium text-gray-600">
              {isOnline ? "You're online" : "You're offline"}
            </p>
            <button
              onClick={toggleOnline}
              className={`w-28 h-28 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                isOnline
                  ? 'online-button border-green-500 text-white'
                  : 'bg-gray-100 border-gray-300 text-gray-500'
              }`}
            >
              {isOnline ? 'ONLINE' : 'GO ONLINE'}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Today's Earnings</h2>
            <p className="text-2xl font-bold text-green-600">$0</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Performance</h2>
            <p className="text-sm text-gray-600">Rating: 4.8</p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {activeRequest && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-2">Current Request</h2>
              <p className="text-gray-600 mb-2">{activeRequest.service_type}</p>
              <button
                onClick={() => setActiveRequest(null)}
                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Complete
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Live Map</h2>
            <NurseMap />
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Nearby Requests</h2>
            <div className="space-y-4">
              {nearbyRequests.length === 0 && (
                <p className="text-sm text-gray-500">No requests nearby</p>
              )}
              {nearbyRequests.map((req) => (
                <ServiceRequestCardNurseView
                  key={req.request_id}
                  request={req}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseDashboardPage;

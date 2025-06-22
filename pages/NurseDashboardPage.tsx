import React, { useState, useEffect } from 'react';
import NurseMap from '../components/dashboard/nurse/NurseMap';
import ServiceRequestCardNurseView from '../components/dashboard/nurse/ServiceRequestCardNurseView';
import { ServiceRequestSummaryForNurse, ServiceRequest } from '../types';
import { useAuth } from '../hooks/useAuth';
import { SOCKET_BASE_URL } from '../constants';
import { io } from 'socket.io-client';

const mockNearbyRequests: ServiceRequestSummaryForNurse[] = [];

const NurseDashboardPage: React.FC = () => {
  const { user, token } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [nearbyRequests, setNearbyRequests] = useState(mockNearbyRequests);
  const [activeRequest, setActiveRequest] = useState<ServiceRequestSummaryForNurse | null>(null);

  useEffect(() => {
    if (!user || !(user as any).nurse_id) return;
    const socket = io(SOCKET_BASE_URL, { auth: { token } });
    socket.emit('join', { role: 'nurse', id: (user as any).nurse_id });
    socket.on('new_request', (req: ServiceRequest) => {
      const summary: ServiceRequestSummaryForNurse = {
        request_id: req.request_id,
        patient_display_name: 'Patient',
        service_type: req.service_type,
        patient_city_state: req.patient_address?.city ? `${req.patient_address.city}, ${req.patient_address.state}` : '',
        estimated_earnings: req.nurse_earnings || 0,
        requested_at: req.requested_at,
        status: 'pending',
      };
      setNearbyRequests(prev => [...prev, summary]);
    });
    return () => {
      socket.disconnect();
    };
  }, [user, token]);

  const toggleOnline = () => setIsOnline((prev) => !prev);

  const handleAccept = (id: string) => {
    const req = nearbyRequests.find((r) => r.request_id === id);
    if (req) {
      setActiveRequest(req);
      setNearbyRequests(nearbyRequests.filter((r) => r.request_id !== id));
    }
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

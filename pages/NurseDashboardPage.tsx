import React, { useState, useEffect } from 'react';
import ServiceRequestCardNurseView from '../components/dashboard/nurse/ServiceRequestCardNurseView';
import { ServiceRequestSummaryForNurse, OrderReceived, NurseProfile } from '../types';
import { getPendingOrders, acceptOrder } from '../services/orderService';
import { useAuth } from '../hooks/useAuth';
import UserLocationMap from '../components/common/UserLocationMap';
import PatientNurseMap from '../components/common/PatientNurseMap';

const mapOrderToSummary = (order: OrderReceived): ServiceRequestSummaryForNurse => ({
  request_id: order.orderId,
  patient_display_name: `Patient ${order.patientId.slice(-4)}`,
  service_type: order.serviceDetails.serviceType,
  approx_distance_miles: undefined,
  patient_city_state: `${order.location.address.city}, ${order.location.address.state}`,
  estimated_earnings: order.pricing?.estimatedTotal ?? 0,
  requested_at: order.requestedAt,
  status: order.status as 'pending' | 'accepted' | 'declined',
});

const NurseDashboardPage: React.FC = () => {
  const { token, user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [nearbyRequests, setNearbyRequests] = useState<ServiceRequestSummaryForNurse[]>([]);
  const [activeRequest, setActiveRequest] = useState<ServiceRequestSummaryForNurse | null>(null);
  const [activeOrder, setActiveOrder] = useState<OrderReceived | null>(null);
  const [nurseLocation, setNurseLocation] = useState<{ lat: number; lng: number } | null>(null);

  const toggleOnline = () => setIsOnline((prev) => !prev);

  useEffect(() => {
    async function load() {
      const res = await getPendingOrders();
      if (res.success && res.data) {
        setNearbyRequests(res.data.map(mapOrderToSummary));
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (activeOrder && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((p) => {
        setNurseLocation({ lat: p.coords.latitude, lng: p.coords.longitude });
      });
    }
  }, [activeOrder]);

  const handleAccept = async (id: string) => {
    if (!token || !user) return;
    const res = await acceptOrder(id, (user as NurseProfile).nurse_id, token);
    if (res.success && res.data) {
      setActiveRequest(mapOrderToSummary(res.data));
      setActiveOrder(res.data);
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
          {activeRequest && activeOrder && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-2">Current Request</h2>
              <p className="text-gray-600 mb-4">{activeRequest.service_type}</p>
              <PatientNurseMap
                patient={{
                  lat: activeOrder.location.coordinates[1],
                  lng: activeOrder.location.coordinates[0],
                }}
                nurse={
                  nurseLocation ?? {
                    lat: activeOrder.location.coordinates[1] + 0.0001,
                    lng: activeOrder.location.coordinates[0] + 0.0001,
                  }
                }
              />
              <button
                onClick={() => {
                  setActiveRequest(null);
                  setActiveOrder(null);
                }}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Close Order
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Live Map</h2>
            <UserLocationMap />
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

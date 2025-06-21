
import React from 'react';
import { ServiceRequestSummaryForNurse } from '../../../types';
import Button from '../../common/Button';
import { ClockIcon, MapPinIcon, CurrencyDollarIcon, UserIcon } from '@heroicons/react/24/outline';

interface ServiceRequestCardProps {
  request: ServiceRequestSummaryForNurse;
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
}

const ServiceRequestCardNurseView: React.FC<ServiceRequestCardProps> = ({ request, onAccept, onDecline }) => {
  const timeSinceRequest = (dateString: string) => {
    const now = new Date();
    const requestedTime = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - requestedTime.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours}h ago`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-teal-700">{request.service_type}</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex items-center">
            <ClockIcon className="w-3 h-3 mr-1" /> {timeSinceRequest(request.requested_at)}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span>Patient: {request.patient_display_name}</span>
          </div>
          <div className="flex items-center">
            <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span>Location: {request.patient_city_state} {request.approx_distance_miles ? `(~${request.approx_distance_miles} mi)`: ''}</span>
          </div>
          <div className="flex items-center">
            <CurrencyDollarIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium text-green-600">Est. Earnings: ${request.estimated_earnings.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0 pt-2 border-t border-gray-100">
          <Button 
            onClick={() => onDecline(request.request_id)} 
            variant="secondary" 
            className="w-full sm:w-auto flex-1 !py-1.5 !text-sm !font-medium !bg-gray-100 hover:!bg-gray-200 !text-gray-700"
          >
            Decline
          </Button>
          <Button 
            onClick={() => onAccept(request.request_id)} 
            variant="success"
            className="w-full sm:w-auto flex-1 !py-1.5 !text-sm !font-medium"
          >
            Accept Request
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceRequestCardNurseView;

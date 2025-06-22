
import React from 'react';
import { NearbyNurse } from '../../../types';
import Button from '../../common/Button';

interface NurseCardProps {
  nurse: NearbyNurse;
  onRequest?: (nurse: NearbyNurse) => void;
}

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}`}>
    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.39-3.423 3.33.98 4.726 4.286-2.256 4.286 2.256.98-4.726-3.423-3.33-4.753-.39L10.868 2.884zM10 12.336l-2.91 1.53.556-3.234-2.35-2.291 3.246-.277L10 5.465l1.458 2.97.08.164 3.246.277-2.35 2.29.556 3.234L10 12.336z" clipRule="evenodd" />
  </svg>
);


const NurseCard: React.FC<NurseCardProps> = ({ nurse, onRequest }) => {
  const handleRequestService = () => {
    if (onRequest) {
      onRequest(nurse);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<StarIcon key={i} filled={i <= rating} />);
    }
    return <div className="flex items-center">{stars}</div>;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <img 
            src={`https://picsum.photos/seed/${nurse.nurse_id}/80/80`} 
            alt={`${nurse.first_name} ${nurse.last_name}`}
            className="w-20 h-20 rounded-full mr-4 border-2 border-teal-500"
          />
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{nurse.first_name} {nurse.last_name}</h3>
            <p className="text-sm text-teal-600">{nurse.specialties.slice(0,2).map(s => s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ')}</p>
          </div>
        </div>

        <div className="mb-4 space-y-1 text-sm text-gray-600">
          <div className="flex items-center">
             {renderStars(nurse.average_rating || 0)}
            <span className="ml-2 text-gray-500">({nurse.average_rating > 0 ? nurse.average_rating.toFixed(1) : 'No ratings yet'})</span>
          </div>
          <p>Years of Experience: <span className="font-medium text-gray-700">{nurse.years_experience}</span></p>
          <p>Base Hourly Rate: <span className="font-medium text-gray-700">${nurse.hourly_rate.toFixed(2)}</span></p>
          <p>Distance: <span className="font-medium text-gray-700">{nurse.distance?.toFixed(1) ?? 'N/A'} miles</span></p>
        </div>

        <div className="bg-teal-50 p-3 rounded-md mb-4">
            <p className="text-lg font-bold text-teal-700 text-center">Estimated Price: ${nurse.pricing.totalPrice.toFixed(2)}</p>
            <p className="text-xs text-gray-500 text-center">Includes base, distance, and potential surge.</p>
        </div>
        
        <Button onClick={handleRequestService} variant="primary" fullWidth>
          Request Service
        </Button>
      </div>
    </div>
  );
};

export default NurseCard;

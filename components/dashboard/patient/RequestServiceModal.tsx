import React, { useState } from 'react';
import Button from '../../common/Button';
import Input from '../../common/Input';
import PatientNurseMap from '../../common/PatientNurseMap';
import { useAuth } from '../../../hooks/useAuth';
import { createOrder } from '../../../services/orderService';
import { ApiError, PatientProfile, NearbyNurse } from '../../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultServiceType: string;
  nurse?: NearbyNurse | null;
}

const RequestServiceModal: React.FC<Props> = ({ isOpen, onClose, defaultServiceType, nurse }) => {
  const { user, token, userType } = useAuth();
  const patient = userType === 'patient' && user ? (user as PatientProfile) : null;
  const patientCoords = patient?.address.coordinates;
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userType !== 'patient' || !user || !token) return;
    const patient = user as PatientProfile;
    setIsSubmitting(true);
    const payload = {
      orderId: `order_${Date.now()}`,
      patientId: patient.patient_id,
      serviceDetails: { serviceType: defaultServiceType, description },
      location: {
        type: 'Point' as const,
        coordinates: patient.address.coordinates || [0, 0],
        address: {
          street: patient.address.street,
          city: patient.address.city,
          state: patient.address.state,
          zipCode: patient.address.zip_code,
        },
        locationType: 'home',
      },
    };
    const res = await createOrder(payload, token);
    setIsSubmitting(false);
    if (res.success && res.data) {
      setMessage('Order placed!');
      setOrderPlaced(true);
    } else {
      setMessage((res.error as ApiError)?.message || 'Failed to create order');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Request Service</h3>
        {message && (
          <div className="mb-3 text-sm text-center text-teal-700 bg-teal-50 p-2 rounded">
            {message}
          </div>
        )}
        {orderPlaced && nurse && patientCoords && (
          <div className="mb-4">
            <PatientNurseMap
              patient={{ lat: patientCoords[1], lng: patientCoords[0] }}
              nurse={{ lat: patientCoords[1] + 0.0001, lng: patientCoords[0] + 0.0001 }}
            />
            <div className="flex justify-end pt-4">
              <Button type="button" variant="primary" onClick={onClose}>Close</Button>
            </div>
          </div>
        )}
        {!orderPlaced && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="service-type"
              label="Service Type"
              value={defaultServiceType}
              readOnly
            />
            <Input
              id="description"
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details"
            />
            <div className="flex justify-end space-x-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>Submit</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RequestServiceModal;

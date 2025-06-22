import React from 'react';

interface PatientNurseMapProps {
  patient: {
    lat: number;
    lng: number;
  };
  nurse: {
    lat: number;
    lng: number;
  };
}

const PatientNurseMap: React.FC<PatientNurseMapProps> = ({ patient, nurse }) => {
  return (
    <div className="h-64 bg-gray-100 rounded-lg">
      <p className="p-4 text-gray-600">
        {`Patient location: ${patient.lat}, ${patient.lng}`}
        <br />
        {`Nurse location: ${nurse.lat}, ${nurse.lng}`}
      </p>
    </div>
  );
};

export default PatientNurseMap;
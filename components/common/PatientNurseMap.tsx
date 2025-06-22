import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface LatLng {
  lat: number;
  lng: number;
}

interface Props {
  patient: LatLng;
  nurse: LatLng;
}

const PatientNurseMap: React.FC<Props> = ({ patient, nurse }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const center = patient;

  if (!apiKey) {
    return <div className="text-sm text-gray-500">Map unavailable</div>;
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={{ height: '250px', width: '100%' }}
        center={center}
        zoom={14}
      >
        <Marker position={patient} label="Patient" />
        <Marker position={nurse} label="Nurse" />
      </GoogleMap>
    </LoadScript>
  );
};

export default PatientNurseMap;

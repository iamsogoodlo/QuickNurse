import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface GoogleLatLng {
  lat: number;
  lng: number;
}

interface Props {
  latitude?: number;
  longitude?: number;
}

const UserLocationMap: React.FC<Props> = ({ latitude, longitude }) => {
  const [position, setPosition] = useState<GoogleLatLng | null>(null);

  useEffect(() => {
    if (latitude !== undefined && longitude !== undefined) {
      setPosition({ lat: latitude, lng: longitude });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((p) => {
        setPosition({ lat: p.coords.latitude, lng: p.coords.longitude });
      });
    }
  }, [latitude, longitude]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const center: GoogleLatLng = position || { lat: 37.7749, lng: -122.4194 };

  if (!apiKey) {
    return <div className="text-sm text-gray-500">Map unavailable</div>;
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap mapContainerStyle={{ height: '250px', width: '100%' }} center={center} zoom={13}>
        {position && <Marker position={position} />}
      </GoogleMap>
    </LoadScript>
  );
};

export default UserLocationMap;

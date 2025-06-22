import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon path in Leaflet when bundled
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const UpdatePosition: React.FC<{ position: L.LatLngExpression }> = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
  }, [position, map]);
  return <Marker position={position} />;
};

interface Props {
  latitude?: number;
  longitude?: number;
}

const UserLocationMap: React.FC<Props> = ({ latitude, longitude }) => {
  const [position, setPosition] = useState<L.LatLngExpression>({ lat: latitude ?? 37.7749, lng: longitude ?? -122.4194 });

  useEffect(() => {
    if (latitude !== undefined && longitude !== undefined) {
      setPosition({ lat: latitude, lng: longitude });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(p => {
        setPosition({ lat: p.coords.latitude, lng: p.coords.longitude });
      });
    }
  }, [latitude, longitude]);

  return (
    <MapContainer center={position} zoom={13} style={{ height: '250px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      <UpdatePosition position={position} />
    </MapContainer>
  );
};

export default UserLocationMap;

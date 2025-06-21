import React, { useEffect, useRef } from 'react';

const GOOGLE_MAPS_URL = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY`;

const NurseMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map>();
  const nurseMarker = useRef<google.maps.Marker>();

  useEffect(() => {
    const loadScript = () => {
      if (document.getElementById('google-maps-script')) {
        initMap();
        return;
      }
      const script = document.createElement('script');
      script.src = GOOGLE_MAPS_URL;
      script.async = true;
      script.id = 'google-maps-script';
      script.onload = initMap;
      document.body.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current) return;
      navigator.geolocation.getCurrentPosition(
        pos => {
          const center = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          mapInstance.current = new google.maps.Map(mapRef.current!, {
            center,
            zoom: 14,
          });
          nurseMarker.current = new google.maps.Marker({ map: mapInstance.current!, position: center });
        },
        () => {
          const defaultCenter = { lat: 37.7749, lng: -122.4194 };
          mapInstance.current = new google.maps.Map(mapRef.current!, { center: defaultCenter, zoom: 12 });
          nurseMarker.current = new google.maps.Marker({ map: mapInstance.current!, position: defaultCenter });
        }
      );
    };

    loadScript();
  }, []);

  return <div ref={mapRef} className="w-full h-64 bg-gray-200 rounded-lg" />;
};

export default NurseMap;

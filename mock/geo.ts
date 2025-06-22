import { MockDoctor } from './mockData';

export const calculateDistance = (
  coord1: [number, number],
  coord2: [number, number]
): number => {
  const R = 3959; // miles
  const dLat = ((coord2[0] - coord1[0]) * Math.PI) / 180;
  const dLon = ((coord2[1] - coord1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1[0] * Math.PI) / 180) *
      Math.cos((coord2[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const findNearbyDoctors = (
  doctors: MockDoctor[],
  patientCoords: [number, number],
  maxDistance = 10
) => {
  return doctors
    .filter((doctor) => doctor.isAvailable)
    .map((doctor) => ({
      ...doctor,
      distance: calculateDistance(patientCoords, doctor.coordinates),
    }))
    .filter((doctor) => doctor.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
};

type Coordinates = { latitude: number; longitude: number };

const EARTH_RADIUS_M = 6_371_000;
const toRad = (degree: number) => (degree * Math.PI) / 180;

// 두 좌표 사이 거리(m). 하버사인 공식
export function distanceMeters(a: Coordinates, b: Coordinates) {
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

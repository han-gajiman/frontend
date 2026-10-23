import MapView, { Marker } from 'react-native-maps';

import type { Spot } from '../types';

// 경북 전체가 보이는 초기 화면
const GYEONGBUK_REGION = { latitude: 36.3, longitude: 128.7, latitudeDelta: 1.8, longitudeDelta: 1.8 };

type SpotMapProps = {
  spots: Spot[];
  selectedId: number | null;
  onSelect: (spot: Spot) => void;
};

// SPOT-02 명소 지도 (iOS·Android). 웹은 SpotMap.web.tsx
// TODO(배포): 스토어 배포 빌드에는 Google Maps API 키를 app.json 플러그인에 설정해야 함 (Expo Go는 불필요)
export function SpotMap({ spots, selectedId, onSelect }: SpotMapProps) {
  return (
    <MapView style={{ flex: 1 }} initialRegion={GYEONGBUK_REGION}>
      {spots.map((spot) => (
        <Marker
          key={spot.id}
          coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
          title={spot.name}
          pinColor={spot.id === selectedId ? '#111827' : '#ef4444'}
          onPress={() => onSelect(spot)}
        />
      ))}
    </MapView>
  );
}

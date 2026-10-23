import { Pressable, Text, View } from 'react-native';

import type { Spot } from '../types';

type SpotMapProps = {
  spots: Spot[];
  selectedId: number | null;
  onSelect: (spot: Spot) => void;
};

// react-native-maps는 웹을 지원하지 않아 웹에서는 목록으로 대신 보여줍니다.
export function SpotMap({ spots, selectedId, onSelect }: SpotMapProps) {
  return (
    <View className="flex-1 gap-2 bg-sky-50 p-4">
      <Text className="text-center text-sm text-gray-400">지도는 앱에서 볼 수 있어요</Text>
      {spots.map((spot) => (
        <Pressable
          key={spot.id}
          onPress={() => onSelect(spot)}
          className={`rounded-xl p-3 ${spot.id === selectedId ? 'bg-gray-900' : 'bg-white'}`}>
          <Text className={spot.id === selectedId ? 'text-white' : 'text-gray-900'}>
            📍 {spot.name} ({spot.latitude.toFixed(3)}, {spot.longitude.toFixed(3)})
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

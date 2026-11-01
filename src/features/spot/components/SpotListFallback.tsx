import { Pressable, Text, View } from 'react-native';

import type { Spot } from '../types';

export type SpotMapProps = {
  spots: Spot[];
  selectedId: number | null;
  onSelect: (spot: Spot) => void;
};

// 지도를 띄울 수 없을 때(카카오 JavaScript 키가 없거나 지도 불러오기 실패) 대신 보여주는 목록
export function SpotListFallback({ spots, selectedId, onSelect, notice }: SpotMapProps & { notice: string }) {
  return (
    <View className="flex-1 gap-2 bg-sky-50 p-4">
      <Text className="text-center text-sm text-gray-400">{notice}</Text>
      {spots.map((spot) => (
        <Pressable
          key={spot.id}
          onPress={() => onSelect(spot)}
          className={`rounded-xl p-3 ${spot.id === selectedId ? 'bg-gray-900' : 'bg-white'}`}>
          <Text className={spot.id === selectedId ? 'text-white' : 'text-gray-900'}>📍 {spot.name}</Text>
        </Pressable>
      ))}
    </View>
  );
}

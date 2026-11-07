import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { type ReactNode, useCallback } from 'react';
import { BackHandler, Pressable, Text, View } from 'react-native';

import type { Spot } from '../types';
import { SpotMap } from './SpotMap';

type SpotExplorerProps = {
  spots: Spot[];
  selected: Spot | null;
  onSelect: (spot: Spot | null) => void;
  // 고른 명소 아래에 놓을 버튼 (소원 등록: 이 명소로 정하기, 명소 탭: 방문 인증)
  renderAction: (spot: Spot) => ReactNode;
  onOpenDetail?: (spot: Spot) => void; // 있으면 명소 이름 위에 "눌러서 자세히 보기"
};

// 명소 둘러보기 (SPOT-01 명소 고르기, SPOT-02 명소 탭 공용). 지도에서 명소를 누르면 확대되고 설명이 나옵니다.
// 좌우 화살표로 다른 명소로 넘어가고(끝에서는 처음으로), 뒤로는 화면이 onSelect(null)로 처리합니다.
export function SpotExplorer({ spots, selected, onSelect, renderAction, onOpenDetail }: SpotExplorerProps) {
  const index = selected ? spots.findIndex((spot) => spot.id === selected.id) : -1;
  const move = (step: number) => onSelect(spots[(index + step + spots.length) % spots.length]);
  const hasVisited = spots.some((spot) => spot.visited);

  // 안드로이드 뒤로 버튼: 확대 중이면 전체 지도로 (이 화면이 보일 때만)
  useFocusEffect(
    useCallback(() => {
      if (!selected) return;
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        onSelect(null);
        return true;
      });
      return () => subscription.remove();
    }, [selected, onSelect]),
  );

  return (
    <View className="flex-1">
      <SpotMap spots={spots} selectedId={selected?.id ?? null} onSelect={onSelect} />

      {selected ? (
        <View className="gap-3 px-6 pb-4 pt-4">
          <View className="flex-row items-center gap-3">
            <ArrowButton icon="chevron-back" label="이전 명소" onPress={() => move(-1)} />
            <Pressable
              onPress={onOpenDetail && (() => onOpenDetail(selected))}
              disabled={!onOpenDetail}
              accessibilityRole={onOpenDetail ? 'button' : undefined}
              className="flex-1 items-center gap-0.5">
              <Text className="text-xs text-gray-500">
                {selected.region} · {index + 1} / {spots.length}
              </Text>
              {onOpenDetail && <Text className="text-sm font-semibold text-violet-700">눌러서 자세히 보기</Text>}
              <Text className="text-center text-lg font-bold text-gray-900">
                {selected.visited && '★ '}
                {selected.name}
              </Text>
            </Pressable>
            <ArrowButton icon="chevron-forward" label="다음 명소" onPress={() => move(1)} />
          </View>
          {/* 설명 길이가 달라도 지도 크기가 크게 흔들리지 않게 두 줄 자리를 둡니다. */}
          <Text className="min-h-12 text-center text-gray-600">{selected.description}</Text>
          {renderAction(selected)}
        </View>
      ) : (
        <View className="items-center gap-1 px-6 py-5">
          <Text className="text-gray-500">명소를 눌러 보세요</Text>
          {hasVisited && <Text className="text-xs text-gray-400">★ 다녀온 곳</Text>}
        </View>
      )}
    </View>
  );
}

function ArrowButton({
  icon,
  label,
  onPress,
}: {
  icon: 'chevron-back' | 'chevron-forward';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-11 w-11 items-center justify-center rounded-full bg-gray-100">
      <Ionicons name={icon} size={22} color="#374151" />
    </Pressable>
  );
}

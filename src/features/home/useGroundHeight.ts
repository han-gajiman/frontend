import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GROUND_HEIGHT } from '@/features/stone/components/TowerBackground';

// 배경의 땅이 탑 바닥부터 화면 끝까지 이어지도록 높이를 계산합니다.
export function useGroundHeight() {
  const insets = useSafeAreaInsets();
  const [screenHeight, setScreenHeight] = useState(0);
  const [towerBottom, setTowerBottom] = useState(0);

  const groundHeight = towerBottom > 0 ? Math.max(GROUND_HEIGHT, screenHeight - towerBottom + GROUND_HEIGHT) : GROUND_HEIGHT;

  return {
    groundHeight,
    onScreenLayout: (e: LayoutChangeEvent) => setScreenHeight(e.nativeEvent.layout.height),
    onTowerLayout: (e: LayoutChangeEvent) => {
      const { y, height } = e.nativeEvent.layout;
      setTowerBottom(insets.top + y + height);
    },
  };
}

import { type ComponentRef, useRef } from 'react';
import type { View } from 'react-native';

type Rect = { x: number; y: number; width: number; height: number };

// 오늘의 돌을 놓을 자리 = 탑 영역. 드래그를 시작할 때마다 화면 좌표를 다시 잽니다.
export function useTowerDropZone() {
  const towerRef = useRef<ComponentRef<typeof View>>(null);
  const towerRect = useRef<Rect | null>(null);

  const measureTower = () =>
    towerRef.current?.measureInWindow((x, y, width, height) => {
      towerRect.current = { x, y, width, height };
    });

  const isOverTower = (pageX: number, pageY: number) => {
    const r = towerRect.current;
    return !!r && pageX >= r.x && pageX <= r.x + r.width && pageY >= r.y && pageY <= r.y + r.height;
  };

  return { towerRef, measureTower, isOverTower };
}

import * as Location from 'expo-location';

import { DEMO_ENABLED } from '@/features/demo/api';

import { distanceMeters } from './distance';
import type { Spot } from './types';

const LOCATION_TIMEOUT_MS = 15_000;
// 웹 구현의 기본값은 처음 받은 위치를 계속 재사용합니다(maximumAge: Infinity). 명소에 도착해서 다시 눌러도 실패하지 않게 항상 새로 받습니다.
const FRESH_POSITION = { accuracy: Location.Accuracy.Balanced, maximumAge: 0 };

export type VisitCheck =
  | { status: 'inRange' }
  | { status: 'outOfRange'; distanceM: number }
  | { status: 'denied' } // 위치 권한 거부
  | { status: 'unavailable' }; // 위치를 받지 못함

// SPOT-03 기기 안에서 명소 반경 안인지 확인합니다. 위치 권한은 이때만 요청합니다.
// 위치는 이 함수 안에서만 쓰고 저장하거나 서버로 보내지 않습니다. 그래서 결과에도 좌표를 담지 않습니다.
export async function verifyVisit(spot: Spot): Promise<VisitCheck> {
  // DEMO-02 시연장은 명소 반경 밖이라, 시연 빌드(EXPO_PUBLIC_DEMO=true)에서는 위치를 묻지 않고 통과시킵니다.
  if (DEMO_ENABLED) return { status: 'inRange' };

  try {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) return { status: 'denied' };

    const position = await Promise.race([
      Location.getCurrentPositionAsync(FRESH_POSITION),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), LOCATION_TIMEOUT_MS)),
    ]);
    const distanceM = distanceMeters(position.coords, spot);
    return distanceM <= spot.radiusM ? { status: 'inRange' } : { status: 'outOfRange', distanceM: Math.round(distanceM) };
  } catch {
    return { status: 'unavailable' };
  }
}

import * as Location from 'expo-location';
import { Platform } from 'react-native';

import { DEMO_ENABLED } from '@/features/demo/api';

import { distanceMeters } from './distance';
import type { Spot } from './types';

// 위치 확인을 통째로 건너뛰는 빌드 설정 (EXPO_PUBLIC_SKIP_LOCATION=true). 11/10부터 실서비스 웹은 끔.
// 실서비스 시연은 시연 계정에만 보이는 "시연용 명소 인증" 버튼(skipLocation)으로 합니다.
const SKIP_LOCATION = process.env.EXPO_PUBLIC_SKIP_LOCATION === 'true';

const LOCATION_TIMEOUT_MS = 15_000;
// 웹 구현의 기본값은 처음 받은 위치를 계속 재사용합니다(maximumAge: Infinity). 명소에 도착해서 다시 눌러도 실패하지 않게 항상 새로 받습니다.
const FRESH_POSITION = { accuracy: Location.Accuracy.Balanced, maximumAge: 0 };

export type VisitCheck =
  | { status: 'inRange' }
  | { status: 'outOfRange'; distanceM: number }
  | { status: 'denied' } // 위치 권한 거부
  | { status: 'unavailable'; reason?: 'off' | 'timeout' }; // 위치를 받지 못함 (off: 기기·브라우저 위치 서비스가 꺼짐)

// SPOT-03 기기 안에서 명소 반경 안인지 확인합니다. 위치 권한은 이때만 요청합니다.
// 위치는 이 함수 안에서만 쓰고 저장하거나 서버로 보내지 않습니다. 그래서 결과에도 좌표를 담지 않습니다.
export async function verifyVisit(spot: Spot, skipLocation = false): Promise<VisitCheck> {
  // DEMO-02 시연장은 명소 반경 밖이라, 시연 빌드(EXPO_PUBLIC_DEMO=true)에서는 위치를 묻지 않고 통과시킵니다.
  // DEMO-02 실서비스의 시연 계정은 "시연용 명소 인증" 버튼으로만 건너뜁니다 (skipLocation)
  if (DEMO_ENABLED || SKIP_LOCATION || skipLocation) return { status: 'inRange' };

  if (Platform.OS === 'web') return verifyOnWeb(spot);

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

// 웹: 브라우저 위치를 한 번만 받습니다. (expo-location 웹은 권한을 물을 때 한 번, 위치를 받을 때 또 한 번 위치를 잡아서
// 노트북처럼 위치가 늦게 잡히는 기기에서 시간 초과가 잦고, 실패 이유도 구분하지 않습니다)
function verifyOnWeb(spot: Spot): Promise<VisitCheck> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve({ status: 'unavailable', reason: 'off' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const distanceM = distanceMeters(coords, spot);
        resolve(distanceM <= spot.radiusM ? { status: 'inRange' } : { status: 'outOfRange', distanceM: Math.round(distanceM) });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) resolve({ status: 'denied' });
        else resolve({ status: 'unavailable', reason: error.code === error.TIMEOUT ? 'timeout' : 'off' });
      },
      // 1분 안에 잡은 위치는 다시 씀 (명소에 도착해서 다시 눌러도 1분이 지나면 새로 잡음). 와이파이 기반 위치로 충분
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: LOCATION_TIMEOUT_MS },
    );
  });
}

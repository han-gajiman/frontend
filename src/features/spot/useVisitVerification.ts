import { useState } from 'react';

import { useSubmit } from '@/shared/hooks/useSubmit';

import { createVisit } from './api';
import type { Spot } from './types';
import { verifyVisit } from './verifyVisit';

const formatDistance = (m: number) => (m < 1000 ? `${m}m` : `${(m / 1000).toFixed(1)}km`);

// SPOT-03 방문 인증 (처음 인증, 다시 인증 공용). 위치는 기기 안에서만 확인하고(verifyVisit) 서버에는 결과만 보냅니다.
// 성공하면 onVisited, 실패하면 notice(위치 안내) 또는 error(서버)로 알려줍니다.
export function useVisitVerification(spot: Spot, onVisited: () => void) {
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState<string>();
  const submit = useSubmit(createVisit);

  const verify = async () => {
    setNotice(undefined);
    setChecking(true);
    const check = await verifyVisit(spot);
    setChecking(false);

    if (check.status === 'denied') {
      setNotice('위치 권한이 필요해요. 기기 설정에서 허용한 뒤 다시 시도해 주세요.');
    } else if (check.status === 'unavailable') {
      setNotice('현재 위치를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } else if (check.status === 'outOfRange') {
      setNotice(`명소까지 약 ${formatDistance(check.distanceM)} 남았어요. 명소 가까이에서 다시 시도해 주세요.`);
    } else {
      const result = await submit.run(spot.id);
      if (result.ok) onVisited();
    }
  };

  return { verify, busy: checking || submit.submitting, notice, error: submit.error };
}

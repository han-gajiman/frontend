import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { buildKakaoMapHtml, KAKAO_JS_KEY, type KakaoMapMessage } from './kakaoMapHtml';
import { SpotListFallback, type SpotMapProps } from './SpotListFallback';

type MapWindow = Window & { selectSpot?: (id: number | null) => void };

// SPOT-02 명소 지도 (웹): 폰과 같은 카카오 지도 HTML을 iframe에 띄웁니다.
// srcDoc iframe은 이 페이지와 같은 주소로 취급되어, 카카오 콘솔에 등록한 웹 도메인으로 인정됩니다.
export function SpotMap({ spots, selectedId, onSelect }: SpotMapProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const html = useMemo(() => buildKakaoMapHtml(spots), [spots]);

  // 최신 spots·onSelect를 메시지 핸들러에서 쓰기 위해 ref로 둡니다. (리스너를 매번 다시 붙이지 않게)
  const latest = useRef({ spots, onSelect });
  useEffect(() => {
    latest.current = { spots, onSelect };
  });

  useEffect(() => {
    const handle = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow || event.data?.source !== 'kakao-map') return;
      const message = event.data.message as KakaoMapMessage;
      if (message.type === 'select') {
        const spot = latest.current.spots.find((s) => s.id === message.id);
        if (spot) latest.current.onSelect(spot);
      } else {
        setStatus(message.type);
      }
    };
    window.addEventListener('message', handle);
    return () => window.removeEventListener('message', handle);
  }, []);

  useEffect(() => {
    if (status !== 'ready') return;
    (frameRef.current?.contentWindow as MapWindow | null)?.selectSpot?.(selectedId);
  }, [status, selectedId]);

  if (!KAKAO_JS_KEY || status === 'error') {
    const notice = KAKAO_JS_KEY ? '지도를 불러오지 못해서 목록으로 보여드려요' : '카카오 지도 키가 없어 목록으로 보여드려요';
    return <SpotListFallback spots={spots} selectedId={selectedId} onSelect={onSelect} notice={notice} />;
  }

  return (
    <View className="flex-1">
      <iframe ref={frameRef} srcDoc={html} title="경북 명소 지도" style={{ flex: 1, width: '100%', height: '100%', border: 0 }} />
      {status === 'loading' && (
        <View className="absolute inset-0 items-center justify-center bg-white">
          <ActivityIndicator />
        </View>
      )}
    </View>
  );
}

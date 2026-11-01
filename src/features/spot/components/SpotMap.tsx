import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { buildKakaoMapHtml, KAKAO_JS_KEY, KAKAO_MAP_BASE_URL, type KakaoMapMessage } from './kakaoMapHtml';
import { SpotListFallback, type SpotMapProps } from './SpotListFallback';

// SPOT-02 명소 지도 (iOS·Android): 카카오 지도를 WebView에 띄웁니다. 웹은 SpotMap.web.tsx
export function SpotMap({ spots, selectedId, onSelect }: SpotMapProps) {
  // WebView의 기본 타입 인자(undefined)는 props를 never로 만들어서 object를 명시합니다.
  const webViewRef = useRef<WebView<object>>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  // 선택이 바뀔 때마다 지도를 다시 그리지 않도록, HTML은 명소 목록이 바뀔 때만 새로 만듭니다.
  const html = useMemo(() => buildKakaoMapHtml(spots), [spots]);

  useEffect(() => {
    if (status !== 'ready') return;
    webViewRef.current?.injectJavaScript(`window.selectSpot(${selectedId ?? 'null'}); true;`);
  }, [status, selectedId]);

  if (!KAKAO_JS_KEY || status === 'error') {
    const notice = KAKAO_JS_KEY ? '지도를 불러오지 못해서 목록으로 보여드려요' : '카카오 지도 키가 없어 목록으로 보여드려요';
    return <SpotListFallback spots={spots} selectedId={selectedId} onSelect={onSelect} notice={notice} />;
  }

  const handleMessage = (data: string) => {
    const message = JSON.parse(data) as KakaoMapMessage;
    if (message.type === 'select') {
      const spot = spots.find((s) => s.id === message.id);
      if (spot) onSelect(spot);
    } else {
      setStatus(message.type);
    }
  };

  return (
    <View className="flex-1">
      <WebView<object>
        ref={webViewRef}
        source={{ html, baseUrl: KAKAO_MAP_BASE_URL }}
        originWhitelist={['*']}
        onMessage={(event: WebViewMessageEvent) => handleMessage(event.nativeEvent.data)}
        onError={() => setStatus('error')}
        style={{ flex: 1 }}
      />
      {status === 'loading' && (
        <View className="absolute inset-0 items-center justify-center bg-white">
          <ActivityIndicator />
        </View>
      )}
    </View>
  );
}

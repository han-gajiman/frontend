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
  // 지도를 다시 불러오지 않도록, 화면에 돌아와 명소를 다시 받아도 내용이 같으면 같은 HTML을 씁니다.
  const spotsKey = JSON.stringify(spots);
  const html = useMemo(() => buildKakaoMapHtml(JSON.parse(spotsKey)), [spotsKey]);
  // 방문 인증으로 내용이 바뀌면 지도가 새로 뜨므로, 준비되면 선택을 다시 적용합니다.
  const [loadedHtml, setLoadedHtml] = useState(html);
  if (html !== loadedHtml) {
    setLoadedHtml(html);
    setStatus('loading');
  }

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

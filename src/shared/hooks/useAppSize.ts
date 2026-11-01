import { Platform, useWindowDimensions } from 'react-native';

// 웹에서는 앱을 가운데 폰 너비 영역에만 그립니다(_layout). 넓은 브라우저 창에서도 폰 화면처럼 보이게 하려는 것.
export const WEB_APP_MAX_WIDTH = 430;

// 앱이 실제로 그려지는 영역의 크기. 화면 전체 크기 대신 이걸 쓰세요. (폰에서는 창 크기와 같음)
export function useAppSize() {
  const { width, height } = useWindowDimensions();
  if (Platform.OS !== 'web') return { width, height };
  return { width: Math.min(width, WEB_APP_MAX_WIDTH), height };
}

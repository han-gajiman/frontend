import { Pressable, Text } from 'react-native';

import { DEMO_ENABLED } from '@/features/demo/api';
import { getMe } from '@/features/user/api';
import { useApi } from '@/shared/hooks/useApi';

// DEMO-02 실서비스에서 시연 계정(서버가 시간 이동을 허락한 두 계정)만 위치 확인 없이 방문 인증합니다.
// 데모 웹(EXPO_PUBLIC_DEMO=true)은 원래 버튼이 위치를 묻지 않으므로 보이지 않습니다.
export function useCanDemoVisit() {
  const me = useApi(getMe);
  return !DEMO_ENABLED && me.data?.canTimeTravel === true;
}

export function DemoVisitButton({
  onPress,
  disabled = false,
  color = '#6b7280',
}: {
  onPress: () => void;
  disabled?: boolean;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      className={`items-center py-1 ${disabled ? 'opacity-40' : ''}`}>
      <Text style={{ color, fontSize: 12, textDecorationLine: 'underline' }}>시연용 명소 인증</Text>
    </Pressable>
  );
}

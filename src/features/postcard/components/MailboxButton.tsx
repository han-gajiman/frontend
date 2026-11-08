import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { getMe } from '@/features/user/api';
import { useApi } from '@/shared/hooks/useApi';

const RED = '#d8483b';

// 메인 화면의 우체통. 안 읽은 엽서가 있으면 깃발이 올라갑니다. (그림이 나오면 이 부품만 이미지로 바꾸면 됩니다)
export function MailboxButton({ style }: { style: object }) {
  const { data } = useApi(getMe);
  const unread = data?.hasUnreadLetter ?? false;
  const flag = useSharedValue(0);
  useEffect(() => {
    flag.set(withTiming(unread ? 1 : 0, { duration: 500, easing: Easing.out(Easing.back(2)) }));
  }, [unread, flag]);
  const flagStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${-90 + flag.get() * 90}deg` }] }));

  return (
    <Pressable
      onPress={() => router.push('/mailbox')}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={unread ? '우체통, 새 엽서 있음' : '우체통'}
      style={[{ position: 'absolute', alignItems: 'center' }, style]}>
      <View style={{ width: 34, height: 40 }}>
        {/* 깃발: 내려가 있다가 새 엽서가 오면 세워집니다 */}
        <Animated.View
          style={[
            { position: 'absolute', right: -7, top: 6, width: 4, height: 18, transformOrigin: 'bottom', zIndex: 1 },
            flagStyle,
          ]}>
          <View style={{ width: 4, height: 18, borderRadius: 2, backgroundColor: '#5b4a3a' }} />
          <View style={{ position: 'absolute', top: 0, left: 4, width: 10, height: 7, backgroundColor: '#ffd23f', borderRadius: 1 }} />
        </Animated.View>
        <View
          style={{
            flex: 1,
            borderTopLeftRadius: 17,
            borderTopRightRadius: 17,
            borderRadius: 4,
            backgroundColor: RED,
            alignItems: 'center',
            boxShadow: '0 2px 6px rgba(40,20,40,0.35)',
          }}>
          <View style={{ marginTop: 14, width: 18, height: 3, borderRadius: 2, backgroundColor: 'rgba(60,15,15,0.65)' }} />
          <View style={{ marginTop: 6, width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: 'rgba(255,240,230,0.85)' }} />
        </View>
      </View>
      <View style={{ width: 6, height: 14, backgroundColor: '#5b4a3a' }} />
    </Pressable>
  );
}

import { router } from 'expo-router';
import { useBottomTabBarHeight } from 'expo-router/js-tabs';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TITLE_FONT } from '@/features/intro/components/DesignCanvas';
import { MailboxButton } from '@/features/postcard/components/MailboxButton';
import { StoneShape } from '@/features/stone/components/StoneShape';
import { GROUND_HEIGHT, TowerBackground } from '@/features/stone/components/TowerBackground';

import { HomeHeader } from './HomeHeader';

const FIELD_GROUND = GROUND_HEIGHT * 3; // 빈 홈은 땅을 넓게 깔아 허허벌판 느낌

// HOME-01 빈 홈: 허허벌판에 조약돌 하나. 누르면 새 소원 적기로
export function EmptyHome() {
  const tabBarHeight = useBottomTabBarHeight();
  const start = () => router.push('/wish/new');

  return (
    <View className="flex-1">
      <TowerBackground spotId={null} visited={false} groundHeight={FIELD_GROUND} bottomScrim softened />
      <SafeAreaView className="flex-1" edges={['top']}>
        <HomeHeader />
      </SafeAreaView>

      {/* 조약돌은 땅 위에 놓이고, 문구는 그 위에 */}
      <View className="absolute inset-x-0 items-center gap-6" style={{ bottom: FIELD_GROUND - 8 }}>
        <Text style={{ fontFamily: TITLE_FONT }} className="text-center text-xl leading-8 text-white">
          여기에 첫 돌을{'\n'}놓아볼까요?
        </Text>
        <Pressable onPress={start} accessibilityRole="button" accessibilityLabel="첫 돌 놓기, 새 소원 시작하기" hitSlop={16}>
          <StoneShape index={0} scale={0.6} isToday />
        </Pressable>
      </View>

      <MailboxButton style={{ right: 28, bottom: FIELD_GROUND - 8 }} />

      <View className="absolute inset-x-0 items-center" style={{ bottom: tabBarHeight + 24 }}>
        <Pressable onPress={start} className="rounded-full bg-gray-900 px-6 py-3">
          <Text className="font-semibold text-white">새 소원 시작하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TowerBackground } from '@/features/stone/components/TowerBackground';
import { ErrorState } from '@/shared/components/ScreenState';
import type { ApiState } from '@/shared/hooks/useApi';

import { roundTitle } from '../towerLabels';
import type { RoundSummary, WishSummary } from '../types';
import { CollectionTile } from './CollectionTile';

const COLUMNS = 4;
const FIELD_PADDING_X = 12;
const MAX_FIELD_WIDTH = 480; // 웹 넓은 화면에서도 폰처럼 4열 크기로
const TEXT_SHADOW = { textShadowColor: 'rgba(40,30,110,0.45)', textShadowRadius: 4 };

// TOWER-03 필드: 소원 묶음 하나의 돌탑이 전부 놓여 있고, 화살표로 다른 묶음으로 넘어갑니다.
export function RoundField({
  round,
  state,
  onPrevious,
  onNext,
  onOpenTower,
  onOpenReview,
}: {
  round: RoundSummary;
  state: ApiState<WishSummary[]>;
  onPrevious?: () => void; // 없으면 첫 묶음
  onNext?: () => void; // 없으면 마지막 묶음
  onOpenTower: (wish: WishSummary) => void;
  onOpenReview: () => void;
}) {
  const insets = useSafeAreaInsets();
  const wishes = state.data;
  const [fieldWidth, setFieldWidth] = useState(0);
  // 한 화면에 다 안 들어오면 스크롤합니다.
  const tileWidth = (Math.min(fieldWidth, MAX_FIELD_WIDTH) - FIELD_PADDING_X * 2) / COLUMNS;

  return (
    <View className="flex-1">
      <TowerBackground spotId={null} visited={false} groundHeight={0} />

      <View className="flex-row items-center justify-between px-4 pb-2" style={{ paddingTop: insets.top + 16 }}>
        <RoundArrow icon="chevron-back" label="이전 소원" onPress={onPrevious} />
        <View className="items-center">
          <Text accessibilityRole="header" className="text-xl font-bold text-white" style={TEXT_SHADOW}>
            {roundTitle(round.round)}
          </Text>
          {round.towerCount > 0 && (
            <Text className="text-sm text-white" style={TEXT_SHADOW}>
              돌탑 {round.towerCount}개
            </Text>
          )}
        </View>
        <RoundArrow icon="chevron-forward" label="다음 소원" onPress={onNext} />
      </View>

      <View className="flex-1" onLayout={(e) => setFieldWidth(e.nativeEvent.layout.width)}>
        {wishes === undefined && state.error ? (
          <ErrorState code={state.error.code} message={state.error.message} onRetry={state.reload} />
        ) : wishes === undefined ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="white" />
          </View>
        ) : wishes.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-2 px-8">
            <Text className="text-lg font-bold text-white" style={TEXT_SHADOW}>
              아직 완성한 돌탑이 없어요
            </Text>
            <Text className="text-center text-white" style={TEXT_SHADOW}>
              30일 돌탑을 완성하면 여기에 모여요.
            </Text>
          </View>
        ) : fieldWidth === 0 ? null : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'flex-end',
              alignSelf: 'center',
              width: Math.min(fieldWidth, MAX_FIELD_WIDTH),
              paddingHorizontal: FIELD_PADDING_X,
              paddingTop: 8,
            }}>
            <View className="flex-row flex-wrap">
              {wishes.map((wish) => (
                <CollectionTile
                  key={wish.wishId}
                  wish={wish}
                  width={tileWidth}
                  onPress={() => onOpenTower(wish)}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      <View className="px-6 pb-4 pt-2">
        <ReviewEntry round={round} onOpen={onOpenReview} />
      </View>
    </View>
  );
}

function ReviewEntry({ round, onOpen }: { round: RoundSummary; onOpen: () => void }) {
  if (round.review === null && !round.canWriteReview) {
    return (
      <Text className="text-center text-sm font-medium text-gray-700">
        {round.reviewAt ? `${round.reviewAt.replaceAll('-', '.')}가 되면` : '1년이 지나면'} 1년동안의 회고를 작성할 수 있어요.{'\n'}마지막까지 열심히 쌓아봐요!
      </Text>
    );
  }
  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      className={`h-12 items-center justify-center rounded-2xl ${round.review === null ? 'bg-gray-900' : 'bg-white'}`}>
      <Text className={`font-semibold ${round.review === null ? 'text-white' : 'text-gray-900'}`}>
        {round.review === null ? '1년 회고 쓰기' : '1년 회고 보기'}
      </Text>
    </Pressable>
  );
}

function RoundArrow({
  icon,
  label,
  onPress,
}: {
  icon: 'chevron-back' | 'chevron-forward';
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !onPress }}
      className={`h-11 w-11 items-center justify-center rounded-full bg-white/30 ${onPress ? '' : 'opacity-30'}`}>
      <Ionicons name={icon} size={22} color="white" />
    </Pressable>
  );
}

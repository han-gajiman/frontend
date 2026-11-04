import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheerBadge } from '@/features/friend/components/CheerBadge';
import { FriendTowersPeek } from '@/features/friend/components/FriendTowersPeek';
import { StoneTower } from '@/features/stone/components/StoneTower';
import { GROUND_HEIGHT, TowerBackground } from '@/features/stone/components/TowerBackground';
import { MyTowerSheet } from '@/features/wish/components/MyTowerSheet';
import type { CurrentWish } from '@/features/wish/types';

import { useGroundHeight } from '../useGroundHeight';
import { useTowerDropZone } from '../useTowerDropZone';
import { HomeHeader } from './HomeHeader';
import { TowerActions } from './TowerActions';
import { TowerProgress } from './TowerProgress';

// HOME-01 홈 = 돌탑 화면 (STONE-01 오늘의 돌, STONE-02 돌탑, DEMO-01 시간 이동). 조각을 조합하고 데이터만 내려줍니다.
// 오늘 쌓았는지·30일이 지났는지·저녁 하늘은 모두 서버 응답(stonedToday, status) 기준입니다. 클라이언트 시계 사용 금지.
export function TowerHome({ wish, reload }: { wish: CurrentWish; reload: () => void }) {
  const completed = wish.status === 'COMPLETED';
  const evening = wish.stonedToday && !completed;

  const [sheetOpen, setSheetOpen] = useState(false); // 내 돌탑 시트: 돌탑, 공개 아이콘, 응원 배지를 누르면 열림
  const openSheet = () => setSheetOpen(true);

  const { groundHeight, onScreenLayout, onTowerLayout } = useGroundHeight();
  const { towerRef, measureTower, isOverTower } = useTowerDropZone();

  return (
    <View className="flex-1" onLayout={onScreenLayout}>
      <TowerBackground
        spotId={wish.spot.id}
        imageUrl={wish.spot.backgroundImageUrl}
        visited={wish.spot.visited}
        evening={evening}
        groundHeight={groundHeight}
      />

      {/* 아래쪽은 떠 있는 탭 바가 안전 영역까지 차지하므로 위쪽만 */}
      <SafeAreaView className="flex-1" edges={['top']}>
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <HomeHeader light={evening} />
          <TowerProgress wish={wish} evening={evening} onOpenSheet={openSheet} />

          <View
            ref={towerRef}
            className="flex-1"
            onLayout={(e) => {
              onTowerLayout(e);
              measureTower();
            }}>
            <StoneTower
              count={wish.stoneCount}
              stonedToday={wish.stonedToday}
              completed={completed}
              inscription={wish.content}
              onPress={openSheet}
            />
            <FriendTowersPeek bottom={GROUND_HEIGHT - 14} />
            <CheerBadge
              wishId={wish.wishId}
              onPress={openSheet}
              style={{ position: 'absolute', left: '50%', marginLeft: 92, bottom: GROUND_HEIGHT + 24 }}
            />
          </View>

          <TowerActions wish={wish} reload={reload} isOverTower={isOverTower} onDragStart={measureTower} />
        </KeyboardAvoidingView>
      </SafeAreaView>

      <MyTowerSheet wish={wish} visible={sheetOpen} onClose={() => setSheetOpen(false)} onChanged={reload} />
    </View>
  );
}

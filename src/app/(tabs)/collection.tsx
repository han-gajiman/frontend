import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { BackHandler } from 'react-native';

import { getRounds, getWishes } from '@/features/wish/api';
import { RoundField } from '@/features/wish/components/RoundField';
import { TowerPager } from '@/features/wish/components/TowerPager';
import { YearReviewDialog } from '@/features/wish/components/YearReviewDialog';
import { roundTitle } from '@/features/wish/towerLabels';
import type { RoundSummary } from '@/features/wish/types';
import { Screen } from '@/shared/components/Screen';
import { AsyncContent } from '@/shared/components/ScreenState';
import { useApi } from '@/shared/hooks/useApi';

// TOWER-03 돌탑 모아보기: 소원 묶음(첫 시작일부터 1년, 코드에서는 round)별 필드 → 큰 카드 → 30일 회고
// ?round=N으로 열면 그 묶음을 보여줍니다 (1년 회고 알림에서 이동).
export default function CollectionScreen() {
  const { round: roundParam } = useLocalSearchParams<{ round?: string }>();
  const rounds = useApi(getRounds);
  const [selected, setSelected] = useState<number | null>(null); // null = 현재 묶음

  // 탭은 계속 떠 있으므로, 같은 알림을 다시 열 수 있게 받은 번호는 지웁니다.
  useFocusEffect(
    useCallback(() => {
      if (roundParam) {
        setSelected(Number(roundParam));
        router.setParams({ round: undefined });
      }
    }, [roundParam]),
  );

  return (
    <AsyncContent state={rounds}>
      {(list) => {
        const index = list.findIndex((r) => r.round === selected);
        const currentIndex = index >= 0 ? index : list.length - 1;
        const previous = list[currentIndex - 1];
        const next = list[currentIndex + 1];
        return (
          <RoundView
            key={list[currentIndex].round} // 묶음을 옮기면 필드부터 새로 그립니다.
            round={list[currentIndex]}
            onPrevious={previous && (() => setSelected(previous.round))}
            onNext={next && (() => setSelected(next.round))}
            onReviewWritten={rounds.reload}
          />
        );
      }}
    </AsyncContent>
  );
}

function RoundView({
  round,
  onPrevious,
  onNext,
  onReviewWritten,
}: {
  round: RoundSummary;
  onPrevious?: () => void;
  onNext?: () => void;
  onReviewWritten: () => void;
}) {
  const fetchTowers = useCallback(() => getWishes(round.round), [round.round]);
  const towers = useApi(fetchTowers);
  const [openWishId, setOpenWishId] = useState<number | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const cardOpen = openWishId !== null;

  // 카드에서 안드로이드 뒤로 가기 → 필드. 탭을 다시 눌러도 필드부터 보여줍니다.
  useFocusEffect(
    useCallback(() => {
      setOpenWishId(null);
    }, []),
  );
  useFocusEffect(
    useCallback(() => {
      if (!cardOpen) return;
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        setOpenWishId(null);
        return true;
      });
      return () => subscription.remove();
    }, [cardOpen]),
  );

  const initialIndex = towers.data?.findIndex((wish) => wish.wishId === openWishId) ?? -1;
  if (towers.data && initialIndex >= 0) {
    return (
      <Screen title={roundTitle(round.round)} showBack onBack={() => setOpenWishId(null)} scroll={false}>
        <TowerPager wishes={towers.data} initialIndex={initialIndex} />
      </Screen>
    );
  }

  return (
    <>
      <RoundField
        round={round}
        state={towers}
        onPrevious={onPrevious}
        onNext={onNext}
        onOpenTower={(wish) => setOpenWishId(wish.wishId)}
        onOpenReview={() => setReviewOpen(true)}
      />
      {reviewOpen && (
        <YearReviewDialog
          round={round}
          onClose={() => setReviewOpen(false)}
          onWritten={() => {
            setReviewOpen(false);
            onReviewWritten();
          }}
        />
      )}
    </>
  );
}

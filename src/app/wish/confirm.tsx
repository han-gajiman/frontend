import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { NewPostcardDialog } from '@/features/postcard/components/NewPostcardDialog';
import type { Postcard } from '@/features/postcard/types';
import { createVisit, getSpots } from '@/features/spot/api';
import { visitCheckNotice } from '@/features/spot/useVisitVerification';
import { verifyVisit } from '@/features/spot/verifyVisit';
import { createWish } from '@/features/wish/api';
import { VisibilityPicker } from '@/features/wish/components/VisibilityPicker';
import { useWishDraftStore } from '@/features/wish/draftStore';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { Screen } from '@/shared/components/Screen';
import { useApi } from '@/shared/hooks/useApi';
import { useSubmit } from '@/shared/hooks/useSubmit';

const fetchSpots = () => getSpots();

// WISH-03 다짐 확인 & 등록 (3/3). 등록 후에는 수정·취소할 수 없습니다.
// 명소 인증하고 시작하기 / 다음에 인증하기 (같은 명소는 돌탑마다 한 번 인증, 인증하면 엽서)
export default function ConfirmWishScreen() {
  const draft = useWishDraftStore();
  const [pledged, setPledged] = useState(false);
  const [done, setDone] = useState(false);
  const { run, submitting, error } = useSubmit(createWish);
  const spots = useApi(fetchSpots);
  const visit = useSubmit(createVisit);
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState<string>();
  const [gift, setGift] = useState<Postcard | null>(null);
  const [startedWithoutVisit, setStartedWithoutVisit] = useState(false); // 등록은 됐지만 인증 요청이 실패

  // 앞 단계를 거치지 않고 들어온 경우 (예: 웹 새로고침). 등록 직후 draft를 비울 때는 제외
  if (!done && (!draft.content || draft.spotId === null)) return <Redirect href="/wish/new" />;

  const goHome = () => router.dismissTo('/'); // 등록 흐름 화면을 모두 닫고 홈(= 돌탑)으로

  const register = async () => {
    const result = await run({
      content: draft.content,
      actionGoal: draft.actionGoal,
      spotId: draft.spotId!,
      visibility: draft.visibility,
    });
    if (!result.ok) return false;
    setDone(true);
    draft.reset();
    return true;
  };

  // 다음에 인증하기: 돌탑만 시작
  const handleStart = async () => {
    if (await register()) goHome();
  };

  // 명소 인증하고 시작하기: 기기 안에서 위치를 먼저 확인하고, 반경 안이면 돌탑을 시작한 뒤 방문 인증까지 (새 엽서)
  // 반경 밖이면 안내만 하고, "다음에 인증하기"로 시작할 수 있습니다.
  const handleStartWithVisit = async () => {
    const spot = spots.data?.find((s) => s.id === draft.spotId);
    if (!spot) return;
    setNotice(undefined);
    setChecking(true);
    const check = await verifyVisit(spot);
    setChecking(false);
    const checkNotice = visitCheckNotice(check);
    if (checkNotice) {
      setNotice(checkNotice);
      return;
    }
    if (!(await register())) return;
    const result = await visit.run(spot.id);
    if (!result.ok) {
      setStartedWithoutVisit(true);
      return;
    }
    if (result.data.postcard) setGift(result.data.postcard);
    else goHome();
  };

  const busy = submitting || checking || visit.submitting;

  return (
    <Screen
      title="다짐 확인"
      showBack
      footer={
        startedWithoutVisit ? (
          <>
            <Text className="text-center text-sm text-gray-600">돌탑은 시작했어요. 방문 인증은 명소 탭에서 다시 해 주세요.</Text>
            <ErrorText error={visit.error} />
            <Button label="홈으로" onPress={goHome} />
          </>
        ) : (
          <>
            {notice && <Text className="text-center text-sm text-gray-600">{notice}</Text>}
            <ErrorText error={error} />
            <Button label="명소 인증하고 시작하기" onPress={handleStartWithVisit} disabled={!pledged || !spots.data || done} loading={busy} />
            <Button label="다음에 인증하기" variant="secondary" onPress={handleStart} disabled={!pledged || busy || done} />
          </>
        )
      }>
      <View className="gap-6">
        <Text className="text-gray-500">3 / 3</Text>

        <View className="gap-4 rounded-2xl bg-gray-100 p-5">
          <Row label="소원" value={draft.content} />
          <Row label="매일 할 일" value={draft.actionGoal} />
          <Row label="명소" value={draft.spotName ?? ''} />
          <Row label="기간" value="오늘부터 30일" />
        </View>

        <View className="gap-2">
          <Text className="font-semibold text-gray-900">공개 범위</Text>
          <VisibilityPicker value={draft.visibility} onChange={draft.setVisibility} />
          <Text className="text-sm text-gray-400">공개 범위는 나중에 홈에서 바꿀 수 있어요.</Text>
        </View>

        <Text className="text-center text-gray-500">등록한 소원은 30일 동안 바꾸거나 취소할 수 없어요.</Text>

        <Pressable onPress={() => setPledged(!pledged)} className="flex-row items-center justify-center gap-3 py-2">
          <View
            className={`h-6 w-6 items-center justify-center rounded-md ${pledged ? 'bg-gray-900' : 'border border-gray-300'}`}>
            {pledged && <Text className="text-xs font-bold text-white">✓</Text>}
          </View>
          <Text className="font-semibold text-gray-900">30일 동안 매일 돌 하나씩 쌓을게요</Text>
        </Pressable>
      </View>
      {gift && (
        <NewPostcardDialog
          postcard={gift}
          onClose={() => {
            setGift(null);
            goHome();
          }}
        />
      )}
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-1">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-base font-semibold text-gray-900">{value}</Text>
    </View>
  );
}

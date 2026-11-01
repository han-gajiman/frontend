import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  type ScrollViewInstance,
  View,
} from "react-native";

import { FinalPage } from "@/features/intro/components/FinalPage";
import { StonePage } from "@/features/intro/components/StonePage";
import { FINAL_PAGE, STONE_PAGES } from "@/features/intro/pages";
import { useIntroStore } from "@/features/intro/store";
import { useAppSize } from "@/shared/hooks/useAppSize";

const TOTAL = STONE_PAGES.length + 1;

// 로그인 전 인트로 3장. 좌우로 넘기거나 → 버튼으로 다음 장, 건너뛰기·"내 소원 시작하기"를 누르면 로그인 화면으로 갑니다.
// (_layout의 guard가 이동시킴. 로그아웃·탈퇴하면 다시 인트로부터)
export default function IntroScreen() {
  const { width, height } = useAppSize();
  const pass = useIntroStore((s) => s.pass);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [page, setPage] = useState(0);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== page && next >= 0 && next < TOTAL) setPage(next);
  };

  const goNext = () => {
    // 이미 넘어가는 중이어도 목표 장은 하나라서 여러 번 눌러도 한 장씩만 이동합니다.
    scrollRef.current?.scrollTo({
      x: Math.min(page + 1, TOTAL - 1) * width,
      animated: true,
    });
  };

  return (
    <View className="flex-1 bg-[#fcf5f9]">
      <StatusBar style="dark" />
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      >
        {STONE_PAGES.map((data, i) => (
          <StonePage
            key={i}
            data={data}
            active={page === i}
            width={width}
            height={height}
            index={i}
            total={TOTAL}
            onNext={goNext}
            onSkip={pass}
          />
        ))}
        <FinalPage
          data={FINAL_PAGE}
          active={page === TOTAL - 1}
          width={width}
          height={height}
          onStart={pass}
        />
      </ScrollView>
    </View>
  );
}

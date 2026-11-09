import { Pressable, Text, View } from 'react-native';

import { ErrorText } from '@/shared/components/ErrorText';
import { useSubmit } from '@/shared/hooks/useSubmit';

import { resetTimeTravel, timeTravel } from '../api';

// DEMO-01 시간 가속. 홈 맨 아래에 작게 둡니다.
// 데모 웹(EXPO_PUBLIC_DEMO=true)은 항상, 실서비스는 서버가 허락한 시연 계정(canTimeTravel)일 때만 보입니다.
// withReset: 실서비스 시연 계정은 "원래 날짜로" 버튼도 보여줌
export function DemoTimeTravel({ onDone, withReset = false }: { onDone: () => void; withReset?: boolean }) {
  const { run, submitting, error } = useSubmit(timeTravel);
  const reset = useSubmit(resetTimeTravel);
  const busy = submitting || reset.submitting;

  const travel = async (days: number) => {
    const result = await run(days);
    if (result.ok) onDone();
  };
  const back = async () => {
    if ((await reset.run()).ok) onDone();
  };

  return (
    <View className="gap-1">
      <ErrorText error={error ?? reset.error} />
      <View className="flex-row items-center justify-center gap-2">
        <Text className="text-xs text-white/80">시연용 시간 이동</Text>
        {[1, 30].map((days) => (
          <Pressable
            key={days}
            onPress={() => travel(days)}
            disabled={busy}
            className={`rounded-full bg-white/80 px-3 py-1 ${busy ? 'opacity-40' : ''}`}>
            <Text className="text-xs font-semibold text-gray-900">+{days}일</Text>
          </Pressable>
        ))}
        {withReset && (
          <Pressable
            onPress={back}
            disabled={busy}
            className={`rounded-full bg-white/50 px-3 py-1 ${busy ? 'opacity-40' : ''}`}>
            <Text className="text-xs font-semibold text-gray-900">원래 날짜로</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

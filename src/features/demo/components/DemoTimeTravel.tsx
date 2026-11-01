import { Pressable, Text, View } from 'react-native';

import { ErrorText } from '@/shared/components/ErrorText';
import { useSubmit } from '@/shared/hooks/useSubmit';

import { timeTravel } from '../api';

// DEMO-01 시간 가속 (EXPO_PUBLIC_DEMO=true일 때만 표시). 홈 맨 아래에 작게 둡니다.
export function DemoTimeTravel({ onDone }: { onDone: () => void }) {
  const { run, submitting, error } = useSubmit(timeTravel);

  const travel = async (days: number) => {
    const result = await run(days);
    if (result.ok) onDone();
  };

  return (
    <View className="gap-1">
      <ErrorText error={error} />
      <View className="flex-row items-center justify-center gap-2">
        <Text className="text-xs text-gray-500">시연용 시간 이동</Text>
        {[1, 30].map((days) => (
          <Pressable
            key={days}
            onPress={() => travel(days)}
            disabled={submitting}
            className={`rounded-full bg-white/80 px-3 py-1 ${submitting ? 'opacity-40' : ''}`}>
            <Text className="text-xs font-semibold text-gray-900">+{days}일</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

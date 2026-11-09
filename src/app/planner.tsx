import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { getPlanCalendar } from '@/features/plan/api';
import { DayPanel } from '@/features/plan/components/DayPanel';
import { MonthCalendar } from '@/features/plan/components/MonthCalendar';
import { addMonths, monthLabel } from '@/features/plan/dates';
import { AsyncContent } from '@/shared/components/ScreenState';
import { Screen } from '@/shared/components/Screen';
import { useApi } from '@/shared/hooks/useApi';

// PLAN-01 소원 캘린더: 진행 중·지난 돌탑과 앞으로 할 소원 메모를 기간 줄로 보고, 날짜마다 할 일을 적어 둡니다.
// 홈 오른쪽 위 캘린더 아이콘에서 들어옵니다.
export default function PlannerScreen() {
  const [month, setMonth] = useState<string>(); // 처음에는 서버 기준 이번 달
  const [selected, setSelected] = useState<string>();
  const fetchCalendar = useCallback(() => getPlanCalendar(month), [month]);
  const state = useApi(fetchCalendar);
  const shownMonth = month ?? state.data?.month;

  return (
    <Screen title="소원 캘린더" showBack>
      <AsyncContent state={state}>
        {(calendar) => {
          const day = selected ?? calendar.today;
          return (
            <View className="gap-4 pb-6">
              <View className="flex-row items-center justify-between">
                <MonthArrow icon="chevron-back" label="이전 달" onPress={() => shownMonth && setMonth(addMonths(shownMonth, -1))} />
                <Text accessibilityRole="header" className="text-lg font-bold text-gray-900">
                  {monthLabel(calendar.month)}
                </Text>
                <MonthArrow icon="chevron-forward" label="다음 달" onPress={() => shownMonth && setMonth(addMonths(shownMonth, 1))} />
              </View>
              <MonthCalendar calendar={calendar} selected={day} onSelect={setSelected} />
              <Legend />
              {day.startsWith(calendar.month) ? (
                <DayPanel calendar={calendar} date={day} onChanged={state.reload} />
              ) : (
                <Text className="text-center text-sm text-gray-400">날짜를 누르면 할 일을 적을 수 있어요.</Text>
              )}
            </View>
          );
        }}
      </AsyncContent>
    </Screen>
  );
}

function MonthArrow({ icon, label, onPress }: { icon: 'chevron-back' | 'chevron-forward'; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityRole="button" accessibilityLabel={label} className="h-9 w-9 items-center justify-center rounded-full bg-gray-100">
      <Ionicons name={icon} size={18} color="#111827" />
    </Pressable>
  );
}

function Legend() {
  return (
    <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1">
      <LegendItem style={{ backgroundColor: '#4b4ba8' }} label="진행 중 돌탑" />
      <LegendItem style={{ backgroundColor: '#e4e0f5' }} label="지난 돌탑" />
      <LegendItem style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: '#9a93d6' }} label="소원 메모" />
      <View className="flex-row items-center gap-1.5">
        <View className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        <Text className="text-xs text-gray-500">할 일</Text>
      </View>
    </View>
  );
}

function LegendItem({ style, label }: { style: object; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View style={[{ width: 16, height: 8, borderRadius: 4 }, style]} />
      <Text className="text-xs text-gray-500">{label}</Text>
    </View>
  );
}

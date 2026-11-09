import { Pressable, Text, View } from 'react-native';

import { diffDays, monthWeeks, WEEKDAYS } from '../dates';
import type { PlanCalendar } from '../types';

// PLAN-01 한 달 달력. 소원 기간을 주마다 가로 줄로 이어 그리고, 할 일이 있는 날에는 점을 찍습니다.
// 진행 중 돌탑 = 진한 남색, 지난 돌탑 = 연한 보라, 소원 메모(앞으로 할 소원) = 점선

type Bar = { key: string; start: string; end: string; label: string; kind: 'active' | 'past' | 'plan' };

const BAR_HEIGHT = 14;
const BAR_GAP = 2;
const MAX_LANES = 2; // 한 주에 줄은 두 개까지 (돌탑은 하나씩 이어지고 메모가 겹칠 때 정도)

const BAR_STYLE = {
  active: { backgroundColor: '#4b4ba8', borderColor: '#4b4ba8', color: '#ffffff' },
  past: { backgroundColor: '#e4e0f5', borderColor: '#e4e0f5', color: '#5b5490' },
  plan: { backgroundColor: '#ffffff', borderColor: '#9a93d6', color: '#5b5490' },
} as const;

export function MonthCalendar({
  calendar,
  selected,
  onSelect,
}: {
  calendar: PlanCalendar;
  selected: string;
  onSelect: (date: string) => void;
}) {
  const bars: Bar[] = [
    ...calendar.wishes.map((w) => ({
      key: `w${w.wishId}`,
      start: w.startDate,
      end: w.endDate,
      label: w.content,
      kind: w.status === 'ACTIVE' ? ('active' as const) : ('past' as const),
    })),
    ...calendar.wishPlans.map((p) => ({ key: `p${p.planId}`, start: p.startDate, end: p.endDate, label: p.content, kind: 'plan' as const })),
  ].sort((a, b) => a.start.localeCompare(b.start));
  const todoDates = new Set(calendar.todos.map((t) => t.date));
  const weeks = monthWeeks(calendar.month);
  // 줄 높이는 그 달에서 가장 많이 겹치는 주에 맞춤 (주마다 높이가 다르면 달력이 들쭉날쭉해서)
  const laneCount = Math.max(1, ...weeks.map((week) => assignLanes(week, bars).length));

  return (
    <View>
      <View className="flex-row">
        {WEEKDAYS.map((w, i) => (
          <Text key={w} className={`flex-1 pb-1 text-center text-xs ${i === 0 ? 'text-rose-400' : 'text-gray-400'}`}>
            {w}
          </Text>
        ))}
      </View>
      {weeks.map((week) => (
        <Week
          key={week[0]}
          laneCount={laneCount}
          week={week}
          month={calendar.month}
          today={calendar.today}
          selected={selected}
          bars={bars}
          todoDates={todoDates}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
}

type Lane = { bar: Bar; from: number; to: number }[];

// 이 주에 걸친 줄을 겹치지 않게 칸(lane)으로 나눔. from·to는 이 주 안의 요일 칸(0~6)
function assignLanes(week: string[], bars: Bar[]): Lane[] {
  const weekStart = week[0];
  const weekEnd = week[6];
  const lanes: Lane[] = [];
  for (const bar of bars) {
    if (bar.end < weekStart || bar.start > weekEnd) continue;
    const from = Math.max(0, diffDays(weekStart, bar.start));
    const to = Math.min(6, diffDays(weekStart, bar.end));
    const lane = lanes.find((l) => l.every((seg) => seg.to < from || seg.from > to));
    if (lane) lane.push({ bar, from, to });
    else if (lanes.length < MAX_LANES) lanes.push([{ bar, from, to }]);
  }
  return lanes;
}

function Week({
  laneCount,
  week,
  month,
  today,
  selected,
  bars,
  todoDates,
  onSelect,
}: {
  laneCount: number;
  week: string[];
  month: string;
  today: string;
  selected: string;
  bars: Bar[];
  todoDates: Set<string>;
  onSelect: (date: string) => void;
}) {
  const weekStart = week[0];
  const weekEnd = week[6];
  const lanes = assignLanes(week, bars);

  return (
    <View className="border-t border-gray-100 pb-1">
      <View className="flex-row">
        {week.map((date) => {
          const inMonth = date.startsWith(month);
          const isToday = date === today;
          const isSelected = date === selected;
          return (
            <Pressable
              key={date}
              onPress={() => onSelect(date)}
              accessibilityRole="button"
              accessibilityLabel={`${Number(date.slice(5, 7))}월 ${Number(date.slice(8))}일${todoDates.has(date) ? ', 할 일 있음' : ''}`}
              accessibilityState={{ selected: isSelected }}
              className="flex-1 items-center pt-1.5">
              <View
                className={`h-7 w-7 items-center justify-center rounded-full ${
                  isSelected ? 'bg-gray-900' : isToday ? 'border border-gray-900' : ''
                }`}>
                <Text
                  className={`text-sm ${isSelected ? 'font-bold text-white' : inMonth ? 'text-gray-900' : 'text-gray-300'}`}>
                  {Number(date.slice(8))}
                </Text>
              </View>
              <View className={`mt-0.5 h-1 w-1 rounded-full ${todoDates.has(date) ? 'bg-amber-400' : 'bg-transparent'}`} />
            </Pressable>
          );
        })}
      </View>
      <View style={{ height: laneCount * (BAR_HEIGHT + BAR_GAP) }} pointerEvents="none">
        {lanes.map((lane, laneIndex) =>
          lane.map(({ bar, from, to }) => {
            const style = BAR_STYLE[bar.kind];
            const startsHere = bar.start >= weekStart;
            const endsHere = bar.end <= weekEnd;
            return (
              <View
                key={`${bar.key}-${weekStart}`}
                style={{
                  position: 'absolute',
                  top: laneIndex * (BAR_HEIGHT + BAR_GAP),
                  left: `${(from / 7) * 100}%`,
                  width: `${((to - from + 1) / 7) * 100}%`,
                  height: BAR_HEIGHT,
                  paddingLeft: startsHere ? 2 : 0,
                  paddingRight: endsHere ? 2 : 0,
                }}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    paddingHorizontal: 4,
                    backgroundColor: style.backgroundColor,
                    borderColor: style.borderColor,
                    borderWidth: 1,
                    borderStyle: bar.kind === 'plan' ? 'dashed' : 'solid',
                    borderTopLeftRadius: startsHere ? 7 : 0,
                    borderBottomLeftRadius: startsHere ? 7 : 0,
                    borderTopRightRadius: endsHere ? 7 : 0,
                    borderBottomRightRadius: endsHere ? 7 : 0,
                  }}>
                  {/* 줄이 시작하는 주(또는 달의 첫 주)에만 소원 문구 */}
                  {(startsHere || weekStart <= `${month}-01`) && (
                    <Text numberOfLines={1} style={{ fontSize: 9.5, fontWeight: '600', color: style.color }}>
                      {bar.label}
                    </Text>
                  )}
                </View>
              </View>
            );
          }),
        )}
      </View>
    </View>
  );
}

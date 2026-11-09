import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { ErrorText } from "@/shared/components/ErrorText";
import { useSubmit } from "@/shared/hooks/useSubmit";

import {
  addTodo,
  addWishPlan,
  deleteTodo,
  deleteWishPlan,
  setTodoDone,
  suggestTodo,
} from "../api";
import { addDays, dayLabel, diffDays } from "../dates";
import {
  TODO_MAX_LENGTH,
  TOWER_DAYS,
  TODO_SUGGESTION_LIMIT,
  type PlanCalendar,
  TODOS_PER_DAY,
  type TodoSuggestion,
  WISH_PLAN_MAX_LENGTH,
} from "../types";

// PLAN-02·03 고른 날짜의 할 일 (적기·체크·지우기, AI 추천)과 이 날 시작하는 소원 메모. 지난 날은 읽기만 합니다.
export function DayPanel({
  calendar,
  date,
  onChanged,
}: {
  calendar: PlanCalendar;
  date: string;
  onChanged: () => void;
}) {
  const isPast = date < calendar.today;
  const todos = calendar.todos.filter((t) => t.date === date);
  const tower = calendar.wishes.find(
    (w) => w.startDate <= date && date <= w.endDate,
  );
  const activeTower = tower?.status === "ACTIVE" ? tower : undefined;
  const plansHere = calendar.wishPlans.filter((p) => p.startDate === date);
  // 30일 동안 소원은 하나: 진행 중 돌탑 기간과 다른 메모의 30일 안에는 새 소원 메모를 적을 수 없음
  const planEnd = addDays(date, TOWER_DAYS - 1);
  const memoBlocked = activeTower
    ? "진행 중인 돌탑 기간이라 새 소원을 메모할 수 없어요. 돌탑이 끝난 다음 날부터 적을 수 있어요."
    : calendar.wishPlans.some(
          (p) => p.startDate <= planEnd && p.endDate >= date,
        )
      ? "다른 소원 메모의 30일과 겹쳐서 적을 수 없어요."
      : null;

  return (
    <View className="gap-5 rounded-2xl bg-gray-50 p-4">
      <View className="gap-0.5">
        <Text className="text-lg font-bold text-gray-900">
          {dayLabel(date)}
        </Text>
        {tower && (
          <Text className="text-sm text-gray-500" numberOfLines={1}>
            {tower.content} · {diffDays(tower.startDate, date) + 1}일째
          </Text>
        )}
      </View>

      <TodoSection
        key={date} // 날짜를 바꾸면 입력·추천을 비움
        date={date}
        todos={todos}
        readOnly={isPast}
        canSuggest={!isPast && !!activeTower}
        onChanged={onChanged}
      />

      {!isPast && (
        <WishPlanSection
          key={`plan-${date}`}
          date={date}
          plans={plansHere}
          blocked={memoBlocked}
          onChanged={onChanged}
        />
      )}
    </View>
  );
}

function TodoSection({
  date,
  todos,
  readOnly,
  canSuggest,
  onChanged,
}: {
  date: string;
  todos: PlanCalendar["todos"];
  readOnly: boolean;
  canSuggest: boolean;
  onChanged: () => void;
}) {
  const [text, setText] = useState("");
  const [suggestion, setSuggestion] = useState<TodoSuggestion | null>(null);
  const add = useSubmit(addTodo);
  const toggle = useSubmit(setTodoDone);
  const remove = useSubmit(deleteTodo);
  const suggest = useSubmit(suggestTodo);
  const full = todos.length >= TODOS_PER_DAY;

  const handleAdd = async (content: string) => {
    const result = await add.run(date, content.trim());
    if (!result.ok) return;
    setText("");
    setSuggestion(null);
    onChanged();
  };

  const handleSuggest = async () => {
    const result = await suggest.run(date);
    if (result.ok) setSuggestion(result.data);
  };

  return (
    <View className="gap-2">
      <Text className="font-semibold text-gray-900">할 일</Text>
      {todos.length === 0 && (
        <Text className="text-sm text-gray-400">
          {readOnly
            ? "적어 둔 할 일이 없었어요."
            : "아직 적어 둔 할 일이 없어요."}
        </Text>
      )}
      {todos.map((todo) => (
        <View key={todo.todoId} className="flex-row items-center gap-2">
          <Pressable
            onPress={async () => {
              if ((await toggle.run(todo.todoId, !todo.done)).ok) onChanged();
            }}
            disabled={readOnly}
            hitSlop={6}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: todo.done, disabled: readOnly }}
            accessibilityLabel={todo.content}
          >
            <Ionicons
              name={todo.done ? "checkbox" : "square-outline"}
              size={22}
              color={todo.done ? "#4b4ba8" : "#9ca3af"}
            />
          </Pressable>
          <Text
            className={`flex-1 ${todo.done ? "text-gray-400 line-through" : "text-gray-900"}`}
          >
            {todo.content}
          </Text>
          {!readOnly && (
            <Pressable
              onPress={async () => {
                if ((await remove.run(todo.todoId)).ok) onChanged();
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`${todo.content} 지우기`}
            >
              <Ionicons name="close" size={18} color="#9ca3af" />
            </Pressable>
          )}
        </View>
      ))}

      {!readOnly && !full && (
        <View className="flex-row items-center gap-2">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="이 날 할 일을 적어 보세요"
            placeholderTextColor="#9ca3af"
            maxLength={TODO_MAX_LENGTH}
            onSubmitEditing={() => text.trim() && handleAdd(text)}
            accessibilityLabel="할 일 적기"
            className="h-11 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-base text-gray-900"
          />
          <SmallButton
            label="추가"
            onPress={() => handleAdd(text)}
            disabled={!text.trim() || add.submitting}
          />
        </View>
      )}
      {!readOnly && full && (
        <Text className="text-sm text-gray-400">
          하루에 {TODOS_PER_DAY}개까지 적을 수 있어요.
        </Text>
      )}

      {canSuggest && !full && (
        <View className="gap-2 pt-1">
          {suggestion ? (
            <View className="gap-2 rounded-xl bg-violet-50 p-3">
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="sparkles" size={14} color="#6d5bd0" />
                <Text className="text-xs font-semibold text-violet-700">
                  AI 추천
                </Text>
              </View>
              <Text className="text-base text-gray-900">
                {suggestion.content}
              </Text>
              <View className="flex-row gap-2">
                <SmallButton
                  label="추가"
                  onPress={() => handleAdd(suggestion.content)}
                  disabled={add.submitting}
                />
                <SmallButton
                  label={
                    suggestion.remaining > 0
                      ? `다시 추천 (${suggestion.remaining}/${TODO_SUGGESTION_LIMIT})`
                      : "오늘 추천을 다 썼어요"
                  }
                  variant="secondary"
                  onPress={handleSuggest}
                  disabled={suggestion.remaining === 0 || suggest.submitting}
                  loading={suggest.submitting}
                />
              </View>
            </View>
          ) : (
            <Pressable
              onPress={handleSuggest}
              disabled={suggest.submitting}
              accessibilityRole="button"
              className="h-11 flex-row items-center justify-center gap-1.5 rounded-xl border border-violet-200 bg-white"
            >
              {suggest.submitting ? (
                <ActivityIndicator size="small" color="#6d5bd0" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={15} color="#6d5bd0" />
                  <Text className="font-semibold text-violet-700">
                    AI에게 할 일 추천받기
                  </Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      )}
      <ErrorText
        error={add.error ?? toggle.error ?? remove.error ?? suggest.error}
      />
    </View>
  );
}

function WishPlanSection({
  date,
  plans,
  blocked,
  onChanged,
}: {
  date: string;
  plans: PlanCalendar["wishPlans"];
  blocked: string | null; // 적을 수 없는 이유 (그 날 시작하는 메모가 이미 있으면 그 메모와 겹쳐서 막힘)
  onChanged: () => void;
}) {
  const [text, setText] = useState("");
  const add = useSubmit(addWishPlan);
  const remove = useSubmit(deleteWishPlan);

  const handleAdd = async () => {
    if ((await add.run(text.trim(), date)).ok) {
      setText("");
      onChanged();
    }
  };

  return (
    <View className="gap-2">
      <Text className="font-semibold text-gray-900">
        이 날 시작할 소원 메모
      </Text>
      {plans.map((plan) => (
        <View
          key={plan.planId}
          className="flex-row items-center gap-2 rounded-xl border border-dashed border-violet-300 bg-white px-3 py-2.5"
        >
          <Text className="flex-1 text-gray-900">{plan.content}</Text>
          <Pressable
            onPress={async () => {
              if ((await remove.run(plan.planId)).ok) onChanged();
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`${plan.content} 메모 지우기`}
          >
            <Ionicons name="close" size={18} color="#9ca3af" />
          </Pressable>
        </View>
      ))}
      {blocked ? (
        plans.length === 0 && (
          <Text className="text-sm text-gray-400">{blocked}</Text>
        )
      ) : (
        <>
          <View className="flex-row items-center gap-2">
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="예: 하프 마라톤 완주하기"
              placeholderTextColor="#9ca3af"
              maxLength={WISH_PLAN_MAX_LENGTH}
              accessibilityLabel="이 날 시작할 소원 메모"
              className="h-11 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-base text-gray-900"
            />
            <SmallButton
              label="메모"
              onPress={handleAdd}
              disabled={!text.trim() || add.submitting}
            />
          </View>
          <Text className="text-xs text-gray-400">
            메모한 소원은 새 소원을 적을 때 불러올 수 있어요. 캘린더에는 30일
            점선으로 보여요.
          </Text>
        </>
      )}
      <ErrorText error={add.error ?? remove.error} />
    </View>
  );
}

function SmallButton({
  label,
  onPress,
  disabled,
  loading,
  variant = "primary",
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary";
}) {
  const primary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={`h-11 items-center justify-center rounded-xl px-4 ${primary ? "bg-gray-900" : "border border-gray-200 bg-white"} ${
        disabled ? "opacity-40" : ""
      }`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={primary ? "#fff" : "#111827"} />
      ) : (
        <Text
          className={`font-semibold ${primary ? "text-white" : "text-gray-900"}`}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

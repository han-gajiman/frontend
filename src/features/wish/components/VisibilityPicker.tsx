import { Pressable, Text, View } from 'react-native';

import type { Visibility } from '../types';

const OPTIONS: { value: Visibility; label: string; description: string }[] = [
  { value: 'FRIENDS', label: '친구에게 공개', description: '친구가 돌탑을 보고 응원·콕 찌르기를 할 수 있어요' },
  { value: 'PRIVATE', label: '나만 보기', description: '친구 목록에는 비공개로 보여요' },
];

type VisibilityPickerProps = {
  value: Visibility;
  onChange: (value: Visibility) => void;
  disabled?: boolean;
};

// WISH-04 공개 범위 선택 (소원 등록 다짐 확인, 돌탑 화면에서 변경)
export function VisibilityPicker({ value, onChange, disabled = false }: VisibilityPickerProps) {
  return (
    <View className="gap-2">
      {OPTIONS.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ checked: active, disabled }}
            className={`gap-1 rounded-2xl p-4 ${active ? 'border-2 border-gray-900 bg-white' : 'border-2 border-transparent bg-gray-100'} ${disabled ? 'opacity-50' : ''}`}>
            <Text className="font-semibold text-gray-900">{option.label}</Text>
            <Text className="text-sm text-gray-500">{option.description}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

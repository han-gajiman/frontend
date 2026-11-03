import { Text, TextInput, type TextInputProps, View } from 'react-native';

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  error?: string; // 입력값 검사 문구 (칸 아래 빨간 글씨)
} & Pick<TextInputProps, 'secureTextEntry' | 'keyboardType' | 'autoCapitalize' | 'autoComplete'>;

export function TextField({ label, value, onChangeText, placeholder, maxLength, multiline = false, error, ...input }: TextFieldProps) {
  return (
    <View className="gap-2">
      <View className="flex-row justify-between">
        <Text className="font-semibold text-gray-900">{label}</Text>
        {maxLength && (
          <Text className="text-gray-400">
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
      <TextInput
        {...input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        maxLength={maxLength}
        multiline={multiline}
        className={`rounded-xl bg-gray-100 px-4 text-base text-gray-900 ${multiline ? 'min-h-24 py-3' : 'h-12'}`}
        style={multiline ? { textAlignVertical: 'top' } : undefined}
      />
      {error && <Text className="text-sm text-red-500">{error}</Text>}
    </View>
  );
}

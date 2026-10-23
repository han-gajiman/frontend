import { ActivityIndicator, Pressable, Text } from 'react-native';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
};

export function Button({ label, onPress, variant = 'primary', disabled = false, loading = false }: ButtonProps) {
  const inactive = disabled || loading;
  const primary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      className={`h-14 items-center justify-center rounded-2xl ${primary ? 'bg-gray-900' : 'bg-gray-100'} ${inactive ? 'opacity-40' : ''}`}>
      {loading ? (
        <ActivityIndicator color={primary ? 'white' : 'black'} />
      ) : (
        <Text className={`text-base font-semibold ${primary ? 'text-white' : 'text-gray-900'}`}>{label}</Text>
      )}
    </Pressable>
  );
}

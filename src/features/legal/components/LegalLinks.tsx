import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

// 로그인 화면 아래, 내 정보에서 쓰는 "이용약관 · 개인정보 처리방침" 링크
export function LegalLinks({ className = '' }: { className?: string }) {
  return (
    <View className={`flex-row items-center justify-center ${className}`}>
      <LegalLink label="이용약관" href="/legal/terms" />
      <Text className="px-2 text-[12px] text-gray-300">·</Text>
      <LegalLink label="개인정보 처리방침" href="/legal/privacy" bold />
    </View>
  );
}

function LegalLink({ label, href, bold = false }: { label: string; href: '/legal/terms' | '/legal/privacy'; bold?: boolean }) {
  return (
    <Pressable onPress={() => router.push(href)} hitSlop={8} accessibilityRole="link">
      <Text className={`text-[12px] text-gray-500 ${bold ? 'font-semibold' : ''}`}>{label}</Text>
    </Pressable>
  );
}

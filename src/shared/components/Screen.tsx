import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenProps = {
  title?: string;
  showBack?: boolean;
  // 스크롤 영역 아래에 고정되는 영역 (주요 버튼)
  footer?: ReactNode;
  // false면 ScrollView 대신 그대로 렌더링 (AsyncContent처럼 화면 전체를 채우는 경우)
  scroll?: boolean;
  children: ReactNode;
};

// 모든 화면의 기본 틀: 안전 영역 + 간단한 헤더 + 하단 버튼 영역
export function Screen({ title, showBack = false, footer, scroll = true, children }: ScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      {(title || showBack) && (
        <View className="h-12 flex-row items-center px-4">
          {showBack && router.canGoBack() && (
            <Pressable onPress={() => router.back()} hitSlop={12} className="pr-3">
              <Text className="text-2xl text-gray-900">‹</Text>
            </Pressable>
          )}
          {title && <Text className="text-lg font-bold text-gray-900">{title}</Text>}
        </View>
      )}
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView contentContainerClassName="px-6 pb-6 pt-2" keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        ) : (
          <View className="flex-1">{children}</View>
        )}
        {footer && <View className="gap-2 px-6 pb-4 pt-2">{footer}</View>}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

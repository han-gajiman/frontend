import { Image, type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 로그인 화면(Figma "로그인 화면") 디자인을 회원가입·계정 찾기 화면에서 같이 쓰는 부품들

export const AUTH_ICONS = {
  user: { source: require('../../../../assets/login/icon_user.png'), size: { width: 17, height: 20 }, textLeft: 50 },
  lock: { source: require('../../../../assets/login/icon_lock.png'), size: { width: 19, height: 20 }, textLeft: 55 },
} satisfies Record<string, { source: ImageSource; size: { width: number; height: number }; textLeft: number }>;

// 로그인 화면으로 돌아가기 (웹 새로고침처럼 뒤로 갈 곳이 없으면 로그인으로 교체)
export function backToLogin() {
  if (router.canGoBack()) router.back();
  else router.replace('/login');
}

// 로그인 외 화면의 틀: 뒤로 가기 + 작은 로고와 제목 + 입력 영역
export function AuthScreen({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="h-12 justify-center px-4">
        <Pressable onPress={backToLogin} hitSlop={12} accessibilityRole="button" accessibilityLabel="뒤로">
          <Text className="text-3xl text-[#4c4568]">‹</Text>
        </Pressable>
      </View>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="flex-grow items-center px-[35px] pb-10" keyboardShouldPersistTaps="handled">
          <Image
            source={require('../../../../assets/login/logo.png')}
            style={{ width: 56, height: 56 }}
            contentFit="cover"
            accessibilityIgnoresInvertColors
          />
          <Text className="mt-[6px] text-[28px] text-[#10004e]" style={{ fontWeight: '900' }}>
            {title}
          </Text>
          <Text className="mt-1 text-center text-[15px] font-medium text-[#4c4568]">{subtitle}</Text>
          <View className="mt-[36px] w-full max-w-[323px]">{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// "LOGIN 로그인" 같은 영문+한글 작은 제목
export function AuthSectionLabel({ children }: { children: string }) {
  return <Text className="mb-2 ml-[9px] text-[12px] font-bold text-[#b7b9c2]">{children}</Text>;
}

// 연보라 둥근 입력칸 (왼쪽 아이콘). error가 있으면 칸 아래 빨간 글씨
export function AuthField({
  icon,
  error,
  ...input
}: {
  icon: keyof typeof AUTH_ICONS;
  error?: string;
} & Pick<
  TextInputProps,
  | 'value'
  | 'onChangeText'
  | 'placeholder'
  | 'autoComplete'
  | 'keyboardType'
  | 'secureTextEntry'
  | 'onSubmitEditing'
  | 'maxLength'
  | 'accessibilityLabel'
  | 'editable'
>) {
  const { source, size, textLeft } = AUTH_ICONS[icon];
  return (
    <View className="mb-[9px]">
      <View
        className={`h-[46px] justify-center rounded-[20px] border-[1.5px] bg-[#e4ddff] ${error ? 'border-[#f08a8a]' : 'border-[#dedede]'}`}>
        <Image source={source} style={{ position: 'absolute', left: 19, ...size }} />
        <TextInput
          {...input}
          placeholderTextColor="#737a84"
          autoCapitalize="none"
          autoCorrect={false}
          style={{ paddingLeft: textLeft - 1.5, paddingRight: 16, height: '100%', fontSize: 15, color: '#2c2a3f' }}
        />
      </View>
      {error && <Text className="ml-[12px] mt-1 text-[12px] text-[#e5484d]">{error}</Text>}
    </View>
  );
}

// 보라 그라데이션 큰 버튼
export function GradientButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: disabled || loading }}
      className={`mt-[14px] ${disabled ? 'opacity-50' : ''}`}>
      <LinearGradient
        colors={['#637df6', '#8378f4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 58, borderRadius: 27, alignItems: 'center', justifyContent: 'center' }}>
        {loading ? <ActivityIndicator color="white" /> : <Text className="text-[20px] font-semibold text-white">{label}</Text>}
      </LinearGradient>
    </Pressable>
  );
}

// 회색 굵은 글자 링크 (아이디 찾기 | 비밀번호 찾기 | 회원가입)
export function AuthLink({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={6} accessibilityRole="link">
      <Text className={`text-[14px] font-bold ${disabled ? 'text-[#d6d8de]' : 'text-[#b7b9c2]'}`}>{label}</Text>
    </Pressable>
  );
}

export function AuthLinkDivider() {
  return <Text className="text-[14px] font-bold text-[#b7b9c2]"> | </Text>;
}

// 안내 문구 (회색) / 에러 문구는 ErrorText
export function AuthNotice({ children }: { children: ReactNode }) {
  return <Text className="mt-4 text-center text-[13px] leading-5 text-[#737a84]">{children}</Text>;
}

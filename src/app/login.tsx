import { Image, type ImageSource } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AuthField,
  AuthLink,
  AuthLinkDivider,
  AuthSectionLabel,
  GradientButton,
} from '@/features/auth/components/AuthForm';
import { DEV_LOGIN_ENABLED, loginForDev, loginWithEmail, loginWithGoogle, loginWithKakao } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';
import { ErrorText } from '@/shared/components/ErrorText';
import { useSubmit } from '@/shared/hooks/useSubmit';

// AUTH-01 로그인 (Figma "로그인 화면"). 로그인되면 _layout의 guard가 온보딩/홈으로 이동시킵니다.
// 위쪽은 자체 로그인(이메일·비밀번호, 회원가입은 /signup), 아래 동그란 아이콘은 카카오·Google 로그인입니다.
// 아이디·비밀번호 찾기는 /find-account, 입력칸·버튼은 features/auth/components/AuthForm (회원가입·찾기 화면과 공용)

export default function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const kakao = useSubmit(loginWithKakao);
  const google = useSubmit(loginWithGoogle);
  const dev = useSubmit(loginForDev);
  const local = useSubmit(loginWithEmail);
  const submitting = kakao.submitting || google.submitting || dev.submitting || local.submitting;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState<string>();

  const handleKakao = async () => {
    setNotice(undefined);
    const result = await kakao.run();
    if (result.ok && result.data) signIn(result.data); // data가 null이면 사용자가 로그인 창을 닫음
  };

  const handleGoogle = async () => {
    setNotice(undefined);
    const result = await google.run();
    if (result.ok && result.data) signIn(result.data);
  };

  const handleDev = async () => {
    const result = await dev.run();
    if (result.ok) signIn(result.data);
  };

  const handleLocal = async () => {
    if (!email.trim() || !password) {
      setNotice('이메일과 비밀번호를 입력해 주세요.');
      return;
    }
    setNotice(undefined);
    const result = await local.run(email.trim(), password);
    if (result.ok) signIn(result.data);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerClassName="flex-grow items-center justify-center px-[35px] py-8"
          keyboardShouldPersistTaps="handled">
          <Image
            source={require('../../assets/login/logo.png')}
            style={{ width: 84, height: 84 }}
            contentFit="cover"
            accessibilityIgnoresInvertColors
          />
          <Text className="mt-[7px] text-[36px] text-[#10004e]" style={{ fontWeight: '900' }}>
            한가지만
          </Text>
          <Text className="mt-1 text-[15px] font-medium text-[#4c4568]">오늘도 한 칸, 소원에 가까이</Text>

          <View className="mt-[59px] w-full max-w-[323px]">
            <AuthSectionLabel>LOGIN 로그인</AuthSectionLabel>
            <AuthField
              icon="user"
              value={email}
              onChangeText={setEmail}
              placeholder="이메일을 입력해주세요"
              autoComplete="email"
              keyboardType="email-address"
            />
            <AuthField
              icon="lock"
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호"
              autoComplete="password"
              secureTextEntry
              onSubmitEditing={handleLocal}
            />

            <GradientButton
              label="로그인"
              accessibilityLabel="이메일로 로그인"
              onPress={handleLocal}
              loading={local.submitting}
              disabled={submitting && !local.submitting}
            />

            <View className="mt-[26px] flex-row justify-center">
              <AuthLink label="아이디 찾기" onPress={() => router.push('/find-account?tab=id')} />
              <AuthLinkDivider />
              <AuthLink label="비밀번호 찾기" onPress={() => router.push('/find-account?tab=password')} />
              <AuthLinkDivider />
              <AuthLink label="회원가입" onPress={() => router.push('/signup')} />
            </View>
          </View>

          {/* 구분선은 입력칸보다 넓게 화면 양옆 16px까지 (Figma) */}
          <View className="-mx-[19px] mt-[48px] flex-row items-center self-stretch">
            <View className="h-[1.5px] flex-1 bg-[#dde4ec]" />
            <Text className="px-[13px] text-[12px] font-bold text-[#dde4ec]">SNS 계정으로 로그인</Text>
            <View className="h-[1.5px] flex-1 bg-[#dde4ec]" />
          </View>

          <View className="mt-[26px] flex-row gap-[9px]">
            <SocialButton
              label="Google로 시작하기"
              circle={require('../../assets/login/circle_google.png')}
              logo={require('../../assets/login/google.png')}
              logoSize={{ width: 22, height: 22 }}
              onPress={handleGoogle}
              loading={google.submitting}
              disabled={submitting}
            />
            <SocialButton
              label="카카오로 시작하기"
              circle={require('../../assets/login/circle_kakao.png')}
              logo={require('../../assets/login/kakao_talk.png')}
              logoSize={{ width: 38, height: 30 }}
              onPress={handleKakao}
              loading={kakao.submitting}
              disabled={submitting}
            />
          </View>

          <View className="mt-4 min-h-5 gap-3">
            {notice && <Text className="text-center text-[13px] text-[#737a84]">{notice}</Text>}
            <ErrorText error={local.error ?? kakao.error ?? google.error ?? dev.error} />
            {DEV_LOGIN_ENABLED && (
              <Pressable onPress={handleDev} disabled={submitting} hitSlop={8} accessibilityRole="button">
                <Text className="text-center text-[13px] text-[#737a84] underline">
                  {dev.submitting ? '로그인 중…' : '개발용 로그인 (로컬 서버)'}
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SocialButton({
  label,
  circle,
  logo,
  logoSize,
  onPress,
  loading,
  disabled,
}: {
  label: string;
  circle: ImageSource;
  logo: ImageSource;
  logoSize: { width: number; height: number };
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`h-[43px] w-[43px] items-center justify-center ${disabled && !loading ? 'opacity-40' : ''}`}>
      <Image source={circle} style={{ position: 'absolute', width: 43, height: 43 }} />
      {loading ? <ActivityIndicator color="#737a84" /> : <Image source={logo} style={logoSize} />}
    </Pressable>
  );
}

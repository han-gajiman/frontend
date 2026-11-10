import { Image, type ImageSource } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
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
import {
  DEV_LOGIN_ENABLED,
  finishWebSocialLogin,
  loginForDev,
  loginWithEmail,
  loginWithGoogle,
  loginWithKakao,
} from '@/features/auth/api';
import { clearWebSocialRedirect, takeWebSocialRedirect } from '@/features/auth/socialWeb';
import { DEMO_ENABLED } from '@/features/demo/api';
import { USE_MOCK } from '@/api/mock';
import { MOCK_DEMO_ACCOUNT } from '@/api/mockServer';
import { useAuthStore } from '@/features/auth/store';
import { LegalLinks } from '@/features/legal/components/LegalLinks';
import { ErrorText } from '@/shared/components/ErrorText';
import { useSubmit } from '@/shared/hooks/useSubmit';

// AUTH-01 로그인 (Figma "로그인 화면"). 로그인되면 _layout의 guard가 온보딩/홈으로 이동시킵니다.
// 위쪽은 자체 로그인(이메일·비밀번호, 회원가입은 /signup), 아래 동그란 아이콘은 카카오·Google 로그인입니다.
// 아이디·비밀번호 찾기는 /find-account, 입력칸·버튼은 features/auth/components/AuthForm (회원가입·찾기 화면과 공용)

const CANCELLED = '로그인을 취소했어요.';
const DEMO_PREFILL = USE_MOCK && DEMO_ENABLED ? MOCK_DEMO_ACCOUNT : null;

export default function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const kakao = useSubmit(loginWithKakao);
  const google = useSubmit(loginWithGoogle);
  const dev = useSubmit(loginForDev);
  const local = useSubmit(loginWithEmail);
  const webSocial = useSubmit(finishWebSocialLogin);
  const submitting = kakao.submitting || google.submitting || dev.submitting || local.submitting || webSocial.submitting;
  // 데모 웹(목 서버 + 시연 모드)은 데모 계정을 미리 채워서 로그인 버튼만 누르면 들어가게 합니다.
  const [email, setEmail] = useState(DEMO_PREFILL?.email ?? '');
  const [password, setPassword] = useState(DEMO_PREFILL?.password ?? '');
  const [webRedirect] = useState(takeWebSocialRedirect);
  const webRedirectStarted = useRef(false);
  const [notice, setNotice] = useState<string | undefined>(() =>
    webRedirect && 'error' in webRedirect
      ? webRedirect.error
      : webRedirect && 'cancelled' in webRedirect
        ? CANCELLED
        : undefined,
  );

  // 웹: 카카오·Google 로그인 화면에서 돌아왔으면 이어서 로그인 (처음 한 번)
  useEffect(() => {
    if (!webRedirect) return;
    clearWebSocialRedirect(); // 다시 로그인 화면에 와도 같은 결과를 또 쓰지 않게
    if (!('provider' in webRedirect) || webRedirectStarted.current) return;
    webRedirectStarted.current = true; // 카카오 인가 코드는 한 번만 쓸 수 있어서 (개발 모드의 effect 두 번 실행 대비)
    webSocial.run(webRedirect).then((result) => {
      if (result.ok) signIn(result.data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 처음 한 번만
  }, []);

  const handleKakao = async () => {
    setNotice(undefined);
    const result = await kakao.run();
    if (result.ok && result.data) signIn(result.data);
    else if (result.ok) setNotice(CANCELLED); // 로그인 창을 닫았거나 뒤로 가기로 돌아옴
  };

  const handleGoogle = async () => {
    setNotice(undefined);
    const result = await google.run();
    if (result.ok && result.data) signIn(result.data);
    else if (result.ok) setNotice(CANCELLED);
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
            <ErrorText error={local.error ?? kakao.error ?? google.error ?? webSocial.error ?? dev.error} />
            {DEV_LOGIN_ENABLED && (
              <Pressable onPress={handleDev} disabled={submitting} hitSlop={8} accessibilityRole="button">
                <Text className="text-center text-[13px] text-[#737a84] underline">
                  {dev.submitting ? '로그인 중…' : '개발용 로그인 (로컬 서버)'}
                </Text>
              </Pressable>
            )}
          </View>

          <LegalLinks className="mt-8" />
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

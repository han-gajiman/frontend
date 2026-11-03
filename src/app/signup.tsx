import { useState } from 'react';
import { Text, View } from 'react-native';

import { signupWithEmail } from '@/features/auth/api';
import {
  AuthField,
  AuthLink,
  AuthScreen,
  backToLogin,
  AuthSectionLabel,
  GradientButton,
} from '@/features/auth/components/AuthForm';
import { useAuthStore } from '@/features/auth/store';
import { EMAIL_PATTERN, PASSWORD_MIN_LENGTH } from '@/features/auth/types';
import { ErrorText } from '@/shared/components/ErrorText';
import { useSubmit } from '@/shared/hooks/useSubmit';

// AUTH-01 자체 회원가입 (이메일·비밀번호·닉네임). 디자인은 로그인 화면과 같은 부품(AuthForm)을 씁니다.
// 가입하면 바로 로그인되고, _layout의 guard가 온보딩(약관 동의)으로 보냅니다.
export default function SignupScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [nickname, setNickname] = useState('');
  const { run, submitting, error } = useSubmit(signupWithEmail);

  // 입력한 뒤에만 검사 문구를 보여줍니다.
  const emailError = email && !EMAIL_PATTERN.test(email.trim()) ? '이메일 형식이 아니에요.' : undefined;
  const passwordError =
    password && password.length < PASSWORD_MIN_LENGTH ? `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이에요.` : undefined;
  const checkError = passwordCheck && passwordCheck !== password ? '비밀번호가 서로 달라요.' : undefined;
  const canSubmit =
    !!email && !!password && !!passwordCheck && nickname.trim().length > 0 && !emailError && !passwordError && !checkError;

  const handleSubmit = async () => {
    const result = await run({ email: email.trim(), password, nickname: nickname.trim() });
    if (result.ok) signIn(result.data);
  };

  return (
    <AuthScreen title="회원가입" subtitle="소원 하나, 오늘부터 쌓아볼까요?">
      <AuthSectionLabel>SIGN UP 회원가입</AuthSectionLabel>
      <AuthField
        icon="user"
        value={email}
        onChangeText={setEmail}
        placeholder="이메일 (아이디로 써요)"
        autoComplete="email"
        keyboardType="email-address"
        error={emailError}
      />
      <AuthField
        icon="lock"
        value={password}
        onChangeText={setPassword}
        placeholder={`비밀번호 (${PASSWORD_MIN_LENGTH}자 이상)`}
        autoComplete="new-password"
        secureTextEntry
        error={passwordError}
      />
      <AuthField
        icon="lock"
        value={passwordCheck}
        onChangeText={setPasswordCheck}
        placeholder="비밀번호 확인"
        autoComplete="new-password"
        secureTextEntry
        error={checkError}
      />
      <AuthField
        icon="user"
        value={nickname}
        onChangeText={setNickname}
        placeholder="닉네임"
        maxLength={30}
        onSubmitEditing={canSubmit ? handleSubmit : undefined}
      />

      <GradientButton label="가입하기" onPress={handleSubmit} loading={submitting} disabled={!canSubmit} />
      <View className="mt-3">
        <ErrorText error={error} />
      </View>

      <View className="mt-[22px] flex-row items-center justify-center gap-2">
        <Text className="text-[14px] text-[#b7b9c2]">이미 계정이 있나요?</Text>
        <AuthLink label="로그인" onPress={backToLogin} />
      </View>
    </AuthScreen>
  );
}

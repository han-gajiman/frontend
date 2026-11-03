import { useState } from 'react';
import { View } from 'react-native';

import { signupWithEmail } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';
import { PASSWORD_MIN_LENGTH } from '@/features/auth/types';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { Screen } from '@/shared/components/Screen';
import { TextField } from '@/shared/components/TextField';
import { useSubmit } from '@/shared/hooks/useSubmit';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// AUTH-01 자체 회원가입 (이메일·비밀번호·닉네임). 가입하면 바로 로그인되고, _layout의 guard가 온보딩(약관 동의)으로 보냅니다.
// TODO(디자인): 회원가입 시안이 나오면 로그인 화면처럼 맞추기
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
    <Screen
      title="회원가입"
      showBack
      footer={
        <>
          <ErrorText error={error} />
          <Button label="가입하기" onPress={handleSubmit} disabled={!canSubmit} loading={submitting} />
        </>
      }>
      <View className="gap-5">
        <TextField
          label="이메일"
          value={email}
          onChangeText={setEmail}
          placeholder="stone@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={emailError}
        />
        <TextField
          label="비밀번호"
          value={password}
          onChangeText={setPassword}
          placeholder={`${PASSWORD_MIN_LENGTH}자 이상`}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          error={passwordError}
        />
        <TextField
          label="비밀번호 확인"
          value={passwordCheck}
          onChangeText={setPasswordCheck}
          placeholder="한 번 더 입력"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          error={checkError}
        />
        <TextField label="닉네임" value={nickname} onChangeText={setNickname} placeholder="닉네임" maxLength={30} />
      </View>
    </Screen>
  );
}

import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { USE_MOCK } from '@/api/mock';
import { MOCK_RESET_CODE } from '@/api/mockServer';
import { findEmails, resetPassword, sendResetCode } from '@/features/auth/api';
import {
  AuthField,
  AuthLink,
  AuthNotice,
  AuthScreen,
  backToLogin,
  AuthSectionLabel,
  GradientButton,
} from '@/features/auth/components/AuthForm';
import { EMAIL_PATTERN, PASSWORD_MIN_LENGTH, RESET_CODE_LENGTH, RESET_CODE_RESEND_SECONDS } from '@/features/auth/types';
import { ErrorText } from '@/shared/components/ErrorText';
import { useSubmit } from '@/shared/hooks/useSubmit';

type Tab = 'id' | 'password';

// AUTH-01 계정 찾기 (자체 로그인): 아이디(이메일) 찾기 / 비밀번호 찾기. 로그인 화면의 링크로 들어옵니다. (?tab=id | password)
export default function FindAccountScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>(params.tab === 'password' ? 'password' : 'id');

  return (
    <AuthScreen title="계정 찾기" subtitle="가입한 이메일이 아이디예요">
      <View className="mb-6 flex-row rounded-[20px] bg-[#f1eeff] p-1">
        <TabButton label="아이디 찾기" active={tab === 'id'} onPress={() => setTab('id')} />
        <TabButton label="비밀번호 찾기" active={tab === 'password'} onPress={() => setTab('password')} />
      </View>
      {tab === 'id' ? <FindId onGoPassword={() => setTab('password')} /> : <FindPassword />}
    </AuthScreen>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      className={`h-10 flex-1 items-center justify-center rounded-[16px] ${active ? 'bg-white' : ''}`}>
      <Text className={`text-[15px] font-bold ${active ? 'text-[#5b62e8]' : 'text-[#b7b9c2]'}`}>{label}</Text>
    </Pressable>
  );
}

// 아이디 찾기: 닉네임 → 그 닉네임으로 가입한 이메일(가린 것)
function FindId({ onGoPassword }: { onGoPassword: () => void }) {
  const [nickname, setNickname] = useState('');
  const [emails, setEmails] = useState<string[] | null>(null);
  const { run, submitting, error } = useSubmit(findEmails);

  const handleFind = async () => {
    const result = await run(nickname.trim());
    if (result.ok) setEmails(result.data.emails);
  };

  return (
    <View>
      <AuthSectionLabel>FIND ID 아이디 찾기</AuthSectionLabel>
      <AuthField
        icon="user"
        value={nickname}
        onChangeText={(text) => {
          setNickname(text);
          setEmails(null);
        }}
        placeholder="가입할 때 쓴 닉네임"
        maxLength={30}
        onSubmitEditing={nickname.trim() ? handleFind : undefined}
      />
      <GradientButton label="아이디 찾기" onPress={handleFind} loading={submitting} disabled={!nickname.trim()} />
      <View className="mt-3">
        <ErrorText error={error} />
      </View>

      {emails && (
        <View className="mt-6 gap-2">
          {emails.length === 0 ? (
            <AuthNotice>그 닉네임으로 이메일 가입한 계정이 없어요.{'\n'}카카오·Google로 가입했다면 그 버튼으로 로그인해 주세요.</AuthNotice>
          ) : (
            <>
              <Text className="ml-[9px] text-[13px] text-[#737a84]">이 닉네임으로 가입한 이메일</Text>
              {emails.map((email) => (
                <View key={email} className="rounded-[16px] bg-[#f1eeff] px-5 py-4">
                  <Text className="text-[16px] font-semibold text-[#2c2a3f]">{email}</Text>
                </View>
              ))}
              <View className="mt-4 flex-row justify-center gap-4">
                <AuthLink label="로그인하러 가기" onPress={backToLogin} />
                <AuthLink label="비밀번호 찾기" onPress={onGoPassword} />
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

// 비밀번호 찾기: 이메일 → 인증코드 메일 → 코드 + 새 비밀번호 → 완료
function FindPassword() {
  const [step, setStep] = useState<'email' | 'code' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [resendLeft, setResendLeft] = useState(0); // 다시 받기까지 남은 초 (화면 표시용)
  const send = useSubmit(sendResetCode);
  const reset = useSubmit(resetPassword);

  useEffect(() => {
    if (resendLeft <= 0) return;
    const timer = setTimeout(() => setResendLeft(resendLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendLeft]);

  const emailError = email && !EMAIL_PATTERN.test(email.trim()) ? '이메일 형식이 아니에요.' : undefined;
  const codeError = code && !new RegExp(`^\\d{${RESET_CODE_LENGTH}}$`).test(code) ? '숫자 6자리예요.' : undefined;
  const passwordError =
    password && password.length < PASSWORD_MIN_LENGTH ? `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이에요.` : undefined;
  const checkError = passwordCheck && passwordCheck !== password ? '비밀번호가 서로 달라요.' : undefined;
  const canReset = !!code && !!password && !!passwordCheck && !codeError && !passwordError && !checkError;

  const handleSend = async () => {
    const result = await send.run(email.trim());
    if (!result.ok) return;
    setStep('code');
    setResendLeft(RESET_CODE_RESEND_SECONDS);
  };

  const handleReset = async () => {
    const result = await reset.run(email.trim(), code, password);
    if (result.ok) setStep('done');
  };

  if (step === 'done') {
    return (
      <View>
        <AuthNotice>비밀번호를 바꿨어요.{'\n'}새 비밀번호로 로그인해 주세요.</AuthNotice>
        <GradientButton label="로그인하러 가기" onPress={backToLogin} />
      </View>
    );
  }

  if (step === 'email') {
    return (
      <View>
        <AuthSectionLabel>FIND PASSWORD 비밀번호 찾기</AuthSectionLabel>
        <AuthField
          icon="user"
          value={email}
          onChangeText={setEmail}
          placeholder="가입한 이메일"
          autoComplete="email"
          keyboardType="email-address"
          error={emailError}
        />
        <GradientButton
          label="인증코드 받기"
          onPress={handleSend}
          loading={send.submitting}
          disabled={!email || !!emailError}
        />
        <View className="mt-3">
          <ErrorText error={send.error} />
        </View>
      </View>
    );
  }

  return (
    <View>
      <AuthSectionLabel>FIND PASSWORD 새 비밀번호</AuthSectionLabel>
      <Text className="mb-4 ml-[9px] text-[13px] leading-5 text-[#737a84]">
        {email.trim()}으로 인증코드를 보냈어요. 10분 안에 입력해 주세요.{'\n'}
        메일이 안 오면 스팸함을 확인하거나 이메일 주소를 다시 확인해 주세요.
        {USE_MOCK && `\n(목 모드 인증코드: ${MOCK_RESET_CODE})`}
      </Text>
      <AuthField
        icon="lock"
        value={code}
        onChangeText={setCode}
        placeholder="인증코드 6자리"
        keyboardType="number-pad"
        maxLength={RESET_CODE_LENGTH}
        autoComplete="one-time-code"
        error={codeError}
      />
      <AuthField
        icon="lock"
        value={password}
        onChangeText={setPassword}
        placeholder={`새 비밀번호 (${PASSWORD_MIN_LENGTH}자 이상)`}
        autoComplete="new-password"
        secureTextEntry
        error={passwordError}
      />
      <AuthField
        icon="lock"
        value={passwordCheck}
        onChangeText={setPasswordCheck}
        placeholder="새 비밀번호 확인"
        autoComplete="new-password"
        secureTextEntry
        error={checkError}
      />
      <GradientButton label="비밀번호 바꾸기" onPress={handleReset} loading={reset.submitting} disabled={!canReset} />
      <View className="mt-3">
        <ErrorText error={reset.error ?? send.error} />
      </View>

      <View className="mt-[22px] flex-row justify-center gap-4">
        <AuthLink
          label={resendLeft > 0 ? `인증코드 다시 받기 (${resendLeft}초)` : '인증코드 다시 받기'}
          onPress={handleSend}
          disabled={resendLeft > 0 || send.submitting}
        />
        <AuthLink label="이메일 바꾸기" onPress={() => setStep('email')} />
      </View>
    </View>
  );
}

import { useLocalSearchParams } from 'expo-router';

import { PRIVACY, TERMS } from '@/features/legal/content';
import { LegalBody } from '@/features/legal/components/LegalBody';
import { Screen } from '@/shared/components/Screen';

// AUTH-02 약관 전문: /legal/terms, /legal/privacy (로그인 전·후 모두 열림)
export default function LegalScreen() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const content = doc === 'privacy' ? PRIVACY : TERMS;
  return (
    <Screen title={content.title} showBack>
      <LegalBody doc={content} />
    </Screen>
  );
}

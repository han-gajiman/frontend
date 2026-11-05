import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/shared/components/Button';
import { Dialog } from '@/shared/components/Dialog';
import { ErrorText } from '@/shared/components/ErrorText';
import { TextField } from '@/shared/components/TextField';
import { useSubmit } from '@/shared/hooks/useSubmit';

import { writeYearReview } from '../api';
import { roundTitle } from '../towerLabels';
import type { RoundSummary } from '../types';

const QUESTION = '나는 어떤 사람이 되었나요?';
const MAX_LENGTH = 200;

// TOWER-04 1년 회고: 이미 썼으면 보기, 아니면 쓰기. 한 번 쓰면 고칠 수 없습니다.
export function YearReviewDialog({
  round,
  onClose,
  onWritten,
}: {
  round: RoundSummary;
  onClose: () => void;
  onWritten: () => void;
}) {
  const [content, setContent] = useState('');
  const write = useCallback(() => writeYearReview(round.round, content.trim()), [round.round, content]);
  const { run, submitting, error } = useSubmit(write);

  const submit = async () => {
    const result = await run();
    if (result.ok) onWritten();
  };

  return (
    <Dialog onClose={onClose}>
      <View className="gap-1">
        <Text className="text-sm text-gray-500">{roundTitle(round.round)} · 1년 회고</Text>
        <Text className="text-lg font-bold text-gray-900">{QUESTION}</Text>
      </View>
      {round.review !== null ? (
        <>
          <ScrollView style={{ flexShrink: 1 }}>
            <Text className="text-lg leading-7 text-gray-900">{round.review}</Text>
          </ScrollView>
          <Button label="닫기" variant="secondary" onPress={onClose} />
        </>
      ) : (
        <>
          <TextField
            label="1년 회고"
            value={content}
            onChangeText={setContent}
            maxLength={MAX_LENGTH}
            multiline
            placeholder="한 해 동안 쌓은 돌탑을 돌아보며 적어 보세요."
          />
          <Text className="text-sm text-gray-500">한 번 남기면 고칠 수 없어요.</Text>
          <ErrorText error={error} />
          <Button label="남기기" onPress={submit} disabled={content.trim().length === 0} loading={submitting} />
        </>
      )}
    </Dialog>
  );
}

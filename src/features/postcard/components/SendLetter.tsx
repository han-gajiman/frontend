import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { getFriends } from '@/features/friend/api';
import { TITLE_FONT } from '@/features/intro/components/DesignCanvas';
import { getMe } from '@/features/user/api';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { AsyncContent, EmptyState } from '@/shared/components/ScreenState';
import { useApi } from '@/shared/hooks/useApi';
import { useAppSize } from '@/shared/hooks/useAppSize';
import { useSubmit } from '@/shared/hooks/useSubmit';

import { getPostcards, sendLetter } from '../api';
import { POSTCARD_IMAGES } from '../images';
import { LETTER_MAX_LENGTH, type Postcard } from '../types';
import { messageFontSize, PostcardCard } from './PostcardCard';
import { backLayout } from '../backLayouts';

const loadSendData = () => Promise.all([getPostcards(), getFriends(), getMe()]);
const ME = 'me';

// 엽서 보내기: 가진 엽서를 고르고 → 뒷면 편지지에 글을 쓰고 → 친구 또는 나에게. 보낸 글은 고칠 수 없습니다.
export function SendLetter({ initial, onSent }: { initial: Postcard | null; onSent: (toMe: boolean) => void }) {
  const state = useApi(loadSendData);
  const [picked, setPicked] = useState<Postcard | null>(initial);
  const [receiver, setReceiver] = useState<number | typeof ME>(ME);
  const [message, setMessage] = useState('');
  const { run, submitting, error } = useSubmit(sendLetter);
  const cardWidth = Math.min(useAppSize().width - 48, 360);

  return (
    <AsyncContent
      state={state}
      isEmpty={([postcards]) => postcards.length === 0}
      empty={<EmptyState title="보낼 엽서가 없어요" description="명소를 방문해 인증하면 엽서를 받아요. 엽서는 가진 사람만 보낼 수 있어요." />}>
      {([postcards, friends, me]) =>
        !picked ? (
          <ScrollView contentContainerClassName="gap-3 px-6 pb-8 pt-2">
            <Text className="text-gray-700">보낼 엽서를 골라 주세요.</Text>
            <View className="flex-row flex-wrap gap-3">
              {postcards.map((postcard) => (
                <Pressable
                  key={`${postcard.spotId}-${postcard.style}`}
                  onPress={() => setPicked(postcard)}
                  accessibilityRole="button"
                  accessibilityLabel={`${postcard.spotName} 엽서 고르기`}
                  style={{ width: '30%' }}>
                  <Image source={POSTCARD_IMAGES[postcard.spotId]?.[postcard.style]?.front} style={{ width: '100%', aspectRatio: 2 / 3, borderRadius: 4 }} />
                  <Text className="mt-1 text-xs text-gray-600" numberOfLines={1}>
                    {postcard.spotName}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        ) : (
          <ScrollView contentContainerClassName="gap-4 px-6 pb-8 pt-2" keyboardShouldPersistTaps="handled">
            <View className="items-center">
              <PostcardCard
                spotId={picked.spotId}
                style={picked.style}
                width={cardWidth}
                startOnBack
                flippable={false}
                letter={{
                  to: receiver === ME ? me.nickname : (friends.content.find((f) => f.friendId === receiver)?.nickname ?? ''),
                  from: me.nickname,
                  message: (
                    <TextInput
                      value={message}
                      onChangeText={setMessage}
                      maxLength={LETTER_MAX_LENGTH}
                      multiline
                      placeholder="여기에 글을 적어 주세요"
                      placeholderTextColor="#a39cba"
                      accessibilityLabel="엽서에 쓸 글"
                      style={{
                        flex: 1,
                        padding: 0,
                        fontFamily: TITLE_FONT,
                        fontSize: messageFontSize(cardWidth, backLayout(picked.spotId, picked.style).message, message.length),
                        lineHeight: messageFontSize(cardWidth, backLayout(picked.spotId, picked.style).message, message.length) * 1.5,
                        color: '#2c2660',
                        textAlignVertical: 'top',
                        backgroundColor: 'rgba(255,255,255,0.35)',
                        borderRadius: 4,
                      }}
                    />
                  ),
                }}
              />
              <Text className="mt-1 text-xs text-gray-400">
                {message.length}/{LETTER_MAX_LENGTH}
              </Text>
            </View>

            <View className="gap-2">
              <Text className="font-semibold text-gray-900">받는 사람</Text>
              <View className="flex-row flex-wrap gap-2">
                <Chip label="나에게" selected={receiver === ME} onPress={() => setReceiver(ME)} />
                {friends.content.map((friend) => (
                  <Chip
                    key={friend.friendId}
                    label={friend.nickname}
                    selected={receiver === friend.friendId}
                    onPress={() => setReceiver(friend.friendId)}
                  />
                ))}
              </View>
            </View>

            <Text className="text-center text-sm text-gray-500">보낸 글은 고칠 수 없어요.</Text>
            <ErrorText error={error} />
            <Button
              label={receiver === ME ? '나에게 보내기' : '친구에게 보내기'}
              disabled={message.trim().length === 0}
              loading={submitting}
              onPress={async () => {
                const result = await run({
                  spotId: picked.spotId,
                  style: picked.style,
                  receiverId: receiver === ME ? undefined : receiver,
                  message: message.trim(),
                });
                if (!result.ok) return;
                setMessage('');
                setPicked(null);
                onSent(receiver === ME);
              }}
            />
            <Button label="다른 엽서 고르기" variant="secondary" onPress={() => setPicked(null)} />
          </ScrollView>
        )
      }
    </AsyncContent>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`rounded-full px-4 py-2 ${selected ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <Text className={selected ? 'font-semibold text-white' : 'text-gray-700'}>{label}</Text>
    </Pressable>
  );
}

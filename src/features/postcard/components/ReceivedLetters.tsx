import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { AsyncContent, EmptyState } from '@/shared/components/ScreenState';
import { useApi } from '@/shared/hooks/useApi';

import { getReceivedLetters, markLetterRead } from '../api';
import { POSTCARD_IMAGES } from '../images';
import type { Letter } from '../types';
import { PostcardViewer } from './PostcardViewer';

// 받은 엽서 (친구와 나에게서). 안 읽은 엽서는 점으로 표시하고, 열면 읽음 처리합니다.
export function ReceivedLetters() {
  const state = useApi(getReceivedLetters);
  const [open, setOpen] = useState<Letter | null>(null);

  const openLetter = (letter: Letter) => {
    setOpen(letter);
    if (!letter.read) markLetterRead(letter.letterId).then(state.reload, () => undefined);
  };

  return (
    <>
    <AsyncContent
      state={state}
      isEmpty={(page) => page.content.length === 0}
      empty={<EmptyState title="아직 받은 엽서가 없어요" description="엽서를 보내면 이곳에 도착해요. 나에게도 보낼 수 있어요." />}>
      {(page) => (
        <ScrollView contentContainerClassName="flex-row flex-wrap gap-4 px-6 pb-8 pt-2">
          {page.content.map((letter) => (
            <Pressable
              key={letter.letterId}
              onPress={() => openLetter(letter)}
              accessibilityRole="button"
              accessibilityLabel={`${letter.fromNickname}에게서 온 엽서${letter.read ? '' : ', 안 읽음'}`}
              style={{ width: '46%' }}
              className="gap-1">
              <View>
                <Image source={POSTCARD_IMAGES[letter.spotId]?.[letter.style]?.front} style={{ width: '100%', aspectRatio: 2 / 3, borderRadius: 6 }} />
                {!letter.read && <View className="absolute right-2 top-2 h-3 w-3 rounded-full bg-red-500" />}
              </View>
              <Text className="font-semibold text-gray-900" numberOfLines={1}>
                {letter.fromMe ? '나에게서' : `${letter.fromNickname}에게서`}
              </Text>
              <Text className="text-xs text-gray-500">{letter.sentAt.slice(0, 10).replaceAll('-', '.')}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </AsyncContent>
      {open && (
        <PostcardViewer
          spotId={open.spotId}
          spotName={open.spotName}
          style={open.style}
          letter={{ to: open.toNickname, from: open.fromNickname, message: open.message }}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}

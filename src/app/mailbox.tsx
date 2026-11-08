import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { PostcardCollection } from '@/features/postcard/components/PostcardCollection';
import { ReceivedLetters } from '@/features/postcard/components/ReceivedLetters';
import { SendLetter } from '@/features/postcard/components/SendLetter';
import type { Postcard } from '@/features/postcard/types';
import { Screen } from '@/shared/components/Screen';

type Tab = 'received' | 'collection' | 'send';
const TABS: { key: Tab; label: string }[] = [
  { key: 'received', label: '받은 엽서' },
  { key: 'collection', label: '내 엽서함' },
  { key: 'send', label: '엽서 보내기' },
];

// SPOT-04 우체통 (메인의 우체통을 누르면): 받은 엽서 · 내 엽서함 · 엽서 보내기. ?tab=collection 으로 바로 열 수 있습니다.
export default function MailboxScreen() {
  const { tab } = useLocalSearchParams<{ tab?: Tab }>();
  const [current, setCurrent] = useState<Tab>(tab && TABS.some((t) => t.key === tab) ? tab : 'received');
  const [sending, setSending] = useState<Postcard | null>(null);
  const [notice, setNotice] = useState<string>();

  return (
    <Screen title="우체통" showBack onBack={() => (router.canGoBack() ? router.back() : router.dismissTo('/'))} scroll={false}>
      <View className="mx-6 mb-3 flex-row rounded-xl bg-gray-100 p-1" accessibilityRole="tablist">
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => {
              setNotice(undefined);
              setCurrent(t.key);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: current === t.key }}
            className={`flex-1 items-center rounded-lg py-2 ${current === t.key ? 'bg-white' : ''}`}>
            <Text className={current === t.key ? 'font-semibold text-gray-900' : 'text-gray-500'}>{t.label}</Text>
          </Pressable>
        ))}
      </View>
      {notice && <Text className="mb-2 text-center text-sm text-gray-600">{notice}</Text>}
      <View className="flex-1">
        {current === 'received' && <ReceivedLetters />}
        {current === 'collection' && (
          <PostcardCollection
            onSend={(postcard) => {
              setSending(postcard);
              setCurrent('send');
            }}
          />
        )}
        {current === 'send' && (
          <SendLetter
            key={sending ? `${sending.spotId}-${sending.style}` : 'pick'}
            initial={sending}
            onSent={(toMe) => {
              setSending(null);
              if (toMe) {
                setCurrent('received');
                setNotice('나에게 엽서를 보냈어요.');
              } else {
                setNotice('친구에게 엽서를 보냈어요.');
              }
            }}
          />
        )}
      </View>
    </Screen>
  );
}

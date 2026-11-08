import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { getSpots } from '@/features/spot/api';
import { AsyncContent } from '@/shared/components/ScreenState';
import { useApi } from '@/shared/hooks/useApi';

import { getPostcards } from '../api';
import { POSTCARD_IMAGES } from '../images';
import { type Postcard, STYLES_PER_SPOT, TOTAL_POSTCARDS } from '../types';
import { PostcardViewer } from './PostcardViewer';

const loadCollection = () => Promise.all([getPostcards(), getSpots()]);

// 내 엽서함: 명소마다 4종 칸, 모은 엽서는 그림, 안 모은 칸은 흐린 자리. 명소별 n/4, 전체 n/40
export function PostcardCollection({ onSend }: { onSend: (postcard: Postcard) => void }) {
  const state = useApi(loadCollection);
  const [open, setOpen] = useState<Postcard | null>(null);

  return (
    <>
      <AsyncContent state={state}>
        {([postcards, spots]) => (
          <ScrollView contentContainerClassName="gap-5 px-6 pb-8 pt-2">
            <Text className="text-gray-700">
              모은 엽서 <Text className="font-bold text-gray-900">{postcards.length}</Text> / {TOTAL_POSTCARDS}
            </Text>
            {spots.map((spot) => {
              const owned = postcards.filter((p) => p.spotId === spot.id);
              return (
                <View key={spot.id} className="gap-2">
                  <View className="flex-row items-baseline justify-between">
                    <Text className="font-semibold text-gray-900">{spot.name}</Text>
                    <Text className="text-sm text-gray-500">
                      {owned.length}/{STYLES_PER_SPOT}
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    {[1, 2, 3, 4].map((style) => {
                      const postcard = owned.find((p) => p.style === style);
                      return postcard ? (
                        <Pressable
                          key={style}
                          onPress={() => setOpen(postcard)}
                          accessibilityRole="button"
                          accessibilityLabel={`${spot.name} 엽서 ${style}`}
                          className="flex-1">
                          <Image source={POSTCARD_IMAGES[spot.id]?.[style]?.front} style={{ width: '100%', aspectRatio: 2 / 3, borderRadius: 4 }} />
                        </Pressable>
                      ) : (
                        <View
                          key={style}
                          accessibilityLabel={`${spot.name} 엽서 ${style}, 아직 없음`}
                          className="flex-1 items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50"
                          style={{ aspectRatio: 2 / 3 }}>
                          <Text className="text-lg text-gray-300">?</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
            <Text className="text-center text-sm text-gray-500">명소를 방문해 인증할 때마다 아직 없는 엽서를 한 장씩 받아요.</Text>
          </ScrollView>
        )}
      </AsyncContent>
      {open && (
        <PostcardViewer
          spotId={open.spotId}
          spotName={open.spotName}
          style={open.style}
          onClose={() => setOpen(null)}
          onSend={() => {
            setOpen(null);
            onSend(open);
          }}
        />
      )}
    </>
  );
}

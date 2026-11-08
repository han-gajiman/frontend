import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { spotIllustration } from '@/features/spot/spotIllustrations';
import { MiniTower, miniTowerHeight, STAR_SIZE } from '@/features/stone/components/MiniTower';

import { crownOf } from '../towerLabels';
import type { WishSummary } from '../types';

const FRAME_ASPECT = 0.6; // 액자 가로:세로 (아치형 세로 카드)
const FRAME_PADDING_BOTTOM = 10;
const FRAME_PADDING_TOP = 14; // 아치 안쪽 여백
const TEXT_SHADOW = { textShadowColor: 'rgba(40,30,110,0.45)', textShadowRadius: 4 };

const monthOf = (date: string) => `${Number(date.slice(5, 7))}월`;

// 30개를 다 쌓은 돌탑이 액자 안에 꼭 맞는 크기. 모든 칸이 같은 크기라 돌탑끼리 높이를 비교할 수 있습니다.
function towerScale(frameHeight: number) {
  const room = frameHeight - FRAME_PADDING_TOP - FRAME_PADDING_BOTTOM - STAR_SIZE;
  return room / miniTowerHeight(30, 1);
}

// 모아보기 필드의 돌탑 한 칸: 명소 풍경 액자 안에 돌탑, 아래에 몇 월·명소 이름.
// 방문한 명소는 선명한 풍경, 아직 안 간 곳은 흐린 풍경이라 돌탑만 봐도 어디를 다녀왔는지 보입니다.
export function CollectionTile({
  wish,
  width,
  onPress,
}: {
  wish: WishSummary;
  width: number; // 한 칸 너비 (4열)
  onPress: () => void;
}) {
  const image = spotIllustration(wish.spotId);
  const frameWidth = width - 8;
  const frameHeight = frameWidth / FRAME_ASPECT;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${wish.content}, 돌 ${wish.stoneCount}개, ${wish.spotName} ${wish.visited ? '방문' : '미방문'}`}
      style={{ width, alignItems: 'center', marginBottom: 14 }}>
      <View
        style={{
          width: frameWidth,
          height: frameHeight,
          borderTopLeftRadius: frameWidth / 2,
          borderTopRightRadius: frameWidth / 2,
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          overflow: 'hidden',
          borderWidth: 2,
          borderColor: wish.visited ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)',
          backgroundColor: 'rgba(255,255,255,0.18)',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: FRAME_PADDING_BOTTOM,
        }}>
        {image && (
          <Image
            source={image}
            // 크기를 %로 주면 액자 아래 여백만큼 비어서, 네 변에 붙여 액자를 꽉 채웁니다.
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: wish.visited ? 1 : 0.35 }}
            contentFit="cover"
            contentPosition="bottom"
            blurRadius={wish.visited ? 0 : 8}
          />
        )}
        <MiniTower count={wish.stoneCount} scale={towerScale(frameHeight)} crown={crownOf(wish)} />
      </View>
      <View style={{ width: '100%', alignItems: 'center', marginTop: 5 }}>
        <Text style={{ fontSize: 10, color: 'white', ...TEXT_SHADOW }}>{monthOf(wish.startDate)}</Text>
        <Text
          numberOfLines={1}
          style={{ width: '100%', textAlign: 'center', fontSize: 11, color: 'white', fontWeight: '600', ...TEXT_SHADOW }}>
          {wish.spotName}
        </Text>
      </View>
    </Pressable>
  );
}

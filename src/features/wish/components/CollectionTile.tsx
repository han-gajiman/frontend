import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { spotIllustration } from '@/features/spot/spotIllustrations';
import { MiniTower, miniTowerHeight, STAR_SIZE } from '@/features/stone/components/MiniTower';

import { crownOf } from '../towerLabels';
import type { WishSummary } from '../types';

const MAX_SCALE = 0.25; // 공간이 넉넉해도 이보다 크게 그리지 않음
const MIN_SCALE = 0.08;
const TILE_TOP = 12;
const BADGE_SIZE = 40;
const LABEL_HEIGHT = 28;
// 돌탑 말고 한 칸이 차지하는 높이 (별, 명소 사진, 이름표)
const OVERHEAD = TILE_TOP + STAR_SIZE + 4 + BADGE_SIZE + LABEL_HEIGHT;
const TEXT_SHADOW = { textShadowColor: 'rgba(40,30,110,0.45)', textShadowRadius: 4 };

const monthOf = (date: string) => `${Number(date.slice(5, 7))}월`;

// 30개를 다 쌓은 돌탑이 height 안에 들어가는 크기. 돌탑끼리 높이를 비교할 수 있게 모든 칸이 같은 크기를 씁니다.
function scaleFor(height: number) {
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, height / miniTowerHeight(30, 1)));
}

// 모아보기 필드의 돌탑 한 칸: 돌탑 + 받침 자리의 동그란 명소 사진 + 몇 월·명소 이름.
// 돌탑만 봐도 어느 명소의 소원이었는지, 방문했는지(선명한 사진 / 흐린 사진 + 자물쇠) 알 수 있게 합니다.
export function CollectionTile({
  wish,
  rowHeight,
  onPress,
}: {
  wish: WishSummary;
  rowHeight: number; // 한 줄 높이. 줄 수에 맞춰 돌탑 크기를 줄여 스크롤 없이 다 보이게 합니다.
  onPress: () => void;
}) {
  const image = spotIllustration(wish.spotId);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${wish.content}, 돌 ${wish.stoneCount}개, ${wish.spotName} ${wish.visited ? '방문' : '미방문'}`}
      style={{
        width: '25%',
        height: rowHeight,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingTop: TILE_TOP,
        paddingHorizontal: 3,
      }}>
      <MiniTower count={wish.stoneCount} scale={scaleFor(rowHeight - OVERHEAD)} crown={crownOf(wish)} />
      <View
        style={{
          width: BADGE_SIZE,
          height: BADGE_SIZE,
          marginTop: 4,
          borderRadius: BADGE_SIZE / 2,
          overflow: 'hidden',
          borderWidth: 2,
          borderColor: wish.visited ? 'white' : 'rgba(255,255,255,0.5)',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.3)',
        }}>
        {image && (
          <Image
            source={image}
            style={{ position: 'absolute', width: '100%', height: '100%', opacity: wish.visited ? 1 : 0.45 }}
            contentFit="cover"
            blurRadius={wish.visited ? 0 : 6}
          />
        )}
        {!wish.visited && <Ionicons name="lock-closed" size={13} color="white" />}
      </View>
      <View style={{ width: '100%', alignItems: 'center', marginTop: 3 }}>
        <Text style={{ fontSize: 9, color: 'white', ...TEXT_SHADOW }}>{monthOf(wish.startDate)}</Text>
        <Text
          numberOfLines={1}
          style={{ width: '100%', textAlign: 'center', fontSize: 10, color: 'white', fontWeight: '600', ...TEXT_SHADOW }}>
          {wish.spotName}
        </Text>
      </View>
    </Pressable>
  );
}

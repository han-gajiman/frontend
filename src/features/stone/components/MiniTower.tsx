import { Image } from 'expo-image';
import { View } from 'react-native';

import { StoneShape } from './StoneShape';

const MAX_STONES = 30;
const OVERLAP = 1;
const STAR_SIZE = 20;

// 작은 돌탑 (친구 돌탑 맛보기, 모아보기 필드). crown: 꼭대기 별
export function MiniTower({ count, scale, crown }: { count: number; scale: number; crown?: 'gold' | 'white' }) {
  return (
    <View style={{ flexDirection: 'column-reverse', alignItems: 'center' }}>
      {Array.from({ length: Math.min(count, MAX_STONES) }, (_, i) => (
        <View key={i} style={{ marginBottom: i === 0 ? 0 : -OVERLAP }}>
          <StoneShape index={i} scale={scale} isToday={false} />
        </View>
      ))}
      {crown && (
        <Image
          source={require('../../../../assets/intro/screen_02_star.png')}
          style={{ width: STAR_SIZE, height: STAR_SIZE, marginBottom: 1 }}
          tintColor={crown === 'white' ? '#ffffff' : undefined}
        />
      )}
    </View>
  );
}

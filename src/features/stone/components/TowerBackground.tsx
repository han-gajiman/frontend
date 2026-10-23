import { Image, View } from 'react-native';

// 돌탑 배경: 명소를 방문 인증했으면 명소 풍경, 아니면 허허벌판
// TODO(디자인): 허허벌판 그림이 나오면 아래 임시 하늘/땅을 이미지로 교체
export function TowerBackground({ imageUrl }: { imageUrl: string | null }) {
  if (imageUrl) {
    return <Image source={{ uri: imageUrl }} resizeMode="cover" className="absolute inset-0" />;
  }

  return (
    <View className="absolute inset-0">
      <View className="flex-1 bg-sky-50" />
      <View className="h-16 bg-stone-200" />
    </View>
  );
}

// 배경 아래쪽 땅 높이. 돌탑은 이 위에 세워집니다.
export const GROUND_HEIGHT = 64;

import { Image } from 'expo-image';
import { Asset, requestPermissionsAsync } from 'expo-media-library';
import { type ComponentRef, useRef, useState } from 'react';
import { PixelRatio, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { Button } from '@/shared/components/Button';

// 원본 엽서는 웹 정적 파일로만 올려 둡니다. (앱에 넣으면 용량이 커져서)
const ORIGIN = 'https://han-gajiman.expo.app/postcards';
const FACE = { width: 1024, height: 1536 }; // 피그마 엽서 원본 크기 (대부분 1024×1536)
const GAP = 60;
const PAPER = '#f4efe6';
const OUTPUT = { width: FACE.width * 2 + GAP * 3, height: FACE.height + GAP * 2 };

// 안드로이드: 화면 밖에 원본 크기 앞뒷면을 나란히 그린 뒤 한 장의 PNG로 찍어 사진첩에 저장합니다. 쓴 글은 넣지 않습니다.
export function SavePostcardButton({ spotId, style }: { spotId: number; style: number; spotName: string }) {
  const [rendering, setRendering] = useState(false);
  const [message, setMessage] = useState<string>();
  const loaded = useRef(0);
  const sheet = useRef<ComponentRef<typeof View>>(null);
  const done = useRef<(() => void) | null>(null);
  const scale = 1 / PixelRatio.get(); // 원본 픽셀을 화면 단위로

  const onImageLoad = () => {
    loaded.current += 1;
    if (loaded.current === 2) done.current?.();
  };

  const save = async () => {
    setMessage(undefined);
    const permission = await requestPermissionsAsync(true);
    if (!permission.granted) {
      setMessage('사진 저장 권한이 필요해요. 기기 설정에서 허용해 주세요.');
      return;
    }
    loaded.current = 0;
    const ready = new Promise<void>((resolve) => {
      done.current = resolve;
    });
    setRendering(true);
    try {
      await ready;
      const uri = await captureRef(sheet, { format: 'png', width: OUTPUT.width, height: OUTPUT.height });
      await Asset.create(uri);
      setMessage('사진첩에 저장했어요.');
    } catch {
      setMessage('엽서를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setRendering(false);
    }
  };

  return (
    <View className="gap-1">
      <Button label="이미지로 저장" variant="secondary" onPress={save} loading={rendering} />
      {message && <Text className="text-center text-sm text-gray-500">{message}</Text>}
      {rendering && (
        <View
          ref={sheet}
          collapsable={false}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: -100_000,
            width: OUTPUT.width * scale,
            height: OUTPUT.height * scale,
            flexDirection: 'row',
            gap: GAP * scale,
            padding: GAP * scale,
            backgroundColor: PAPER,
          }}>
          {(['front', 'back'] as const).map((side) => (
            <Image
              key={side}
              source={{ uri: `${ORIGIN}/${spotId}-${style}-${side}.jpg` }}
              style={{ width: FACE.width * scale, height: FACE.height * scale }}
              onLoad={onImageLoad}
            />
          ))}
        </View>
      )}
    </View>
  );
}

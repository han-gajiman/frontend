import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/shared/components/Button';

const FACE = { width: 1024, height: 1536 }; // 피그마 엽서 원본 크기 (대부분 1024×1536)
const GAP = 60; // 앞면과 뒷면 사이·바깥 여백 (원본 픽셀)
const PAPER = '#f4efe6';

const load = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

// 웹: 원본 앞면·뒷면(public/postcards)을 나란히 한 장의 PNG로 합쳐 브라우저로 내려받습니다. 쓴 글은 넣지 않습니다.
export function SavePostcardButton({ spotId, style, spotName }: { spotId: number; style: number; spotName: string }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>();

  const save = async () => {
    setSaving(true);
    setMessage(undefined);
    try {
      const [front, back] = await Promise.all([
        load(`/postcards/${spotId}-${style}-front.jpg`),
        load(`/postcards/${spotId}-${style}-back.jpg`),
      ]);
      const canvas = document.createElement('canvas');
      canvas.width = FACE.width * 2 + GAP * 3;
      canvas.height = FACE.height + GAP * 2;
      const context = canvas.getContext('2d')!;
      context.fillStyle = PAPER;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(front, GAP, GAP, FACE.width, FACE.height);
      context.drawImage(back, GAP * 2 + FACE.width, GAP, FACE.width, FACE.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('png');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `한가지만-엽서-${spotName}-${style}.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setMessage('엽서를 내려받았어요.');
    } catch {
      setMessage('엽서를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="gap-1">
      <Button label="이미지로 저장" variant="secondary" onPress={save} loading={saving} />
      {message && <Text className="text-center text-sm text-gray-500">{message}</Text>}
    </View>
  );
}

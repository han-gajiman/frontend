import { Text, View } from 'react-native';

import type { LegalBlock, LegalDoc, LegalItem } from '../content';

// 약관·처리방침 전문. 표는 폰 너비에서 칸이 좁아지지 않게 줄마다 카드(머리글: 내용)로 그립니다.
export function LegalBody({ doc }: { doc: LegalDoc }) {
  return (
    <View className="gap-3 pb-4">
      <Text className="text-[13px] text-gray-500">{doc.meta}</Text>
      {doc.blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </View>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if ('h' in block) return <Text className="mt-3 text-[15px] font-bold text-gray-900">{block.h}</Text>;
  if ('p' in block) return <Text className="text-[14px] leading-[22px] text-gray-700">{block.p}</Text>;
  if ('ol' in block) return <List items={block.ol} ordered />;
  if ('ul' in block) return <List items={block.ul} />;
  return <LegalTable rows={block.table} />;
}

function List({ items, ordered = false }: { items: LegalItem[]; ordered?: boolean }) {
  return (
    <View className="gap-1.5">
      {items.map((item, i) => {
        const text = typeof item === 'string' ? item : item.text;
        return (
          <View key={i}>
            <Bullet mark={ordered ? `${i + 1}.` : '•'} text={text} />
            {typeof item !== 'string' && (
              <View className="ml-5 mt-1 gap-1">
                {item.sub.map((sub, j) => (
                  <Bullet key={j} mark="-" text={sub} />
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

function Bullet({ mark, text }: { mark: string; text: string }) {
  return (
    <View className="flex-row">
      <Text className="w-5 text-[14px] leading-[22px] text-gray-500">{mark}</Text>
      <Text className="flex-1 text-[14px] leading-[22px] text-gray-700">{text}</Text>
    </View>
  );
}

export function LegalTable({ rows }: { rows: string[][] }) {
  const [header, ...body] = rows;
  return (
    <View className="gap-2">
      {body.map((row, i) => (
        <View key={i} className="gap-1 rounded-xl bg-gray-50 px-3 py-2.5">
          <Text className="text-[14px] font-semibold leading-[21px] text-gray-900">{row[0]}</Text>
          {row.slice(1).map((cell, j) => (
            <Text key={j} className="text-[13px] leading-[20px] text-gray-700">
              <Text className="text-gray-500">{header[j + 1]}: </Text>
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

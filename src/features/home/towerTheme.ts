// 홈 글자·아이콘 색. 오늘 돌을 쌓아 저녁 하늘이 되면 밝은 색을 씁니다. (저녁 여부는 서버의 stonedToday 기준)
export function towerTheme(evening: boolean) {
  return {
    primary: evening ? 'text-white' : 'text-gray-900',
    secondary: evening ? 'text-white/80' : 'text-gray-600',
    muted: evening ? 'text-white/70' : 'text-gray-500',
    icon: evening ? '#ffffff' : '#4b5563',
    tabActive: evening ? '#ffffff' : '#5b62e8',
    tabInactive: evening ? 'rgba(255,255,255,0.7)' : '#374151',
  };
}

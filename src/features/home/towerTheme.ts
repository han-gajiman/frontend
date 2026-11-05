// 홈 글자·아이콘 색. 어두운 그림 위(onArtwork)에서는 밝게, 흰 화면(로딩·에러, 다른 탭)에서는 어둡게 씁니다.
export function towerTheme(onArtwork: boolean) {
  return {
    primary: onArtwork ? 'text-white' : 'text-gray-900',
    secondary: onArtwork ? 'text-white/80' : 'text-gray-600',
    muted: onArtwork ? 'text-white/70' : 'text-gray-500',
    icon: onArtwork ? '#ffffff' : '#4b5563',
    tabActive: onArtwork ? '#ffffff' : '#5b62e8',
    tabInactive: onArtwork ? 'rgba(255,255,255,0.7)' : '#374151',
  };
}

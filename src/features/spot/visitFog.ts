// 방문 인증 전 화면의 색 안개 (피그마 "02–10 방문 인증 전" 각 명소의 "배경 / 색 안개 · 불투명도 90%").
// 위에서 아래로 0% · 45% · 90% 지점의 색, 그 뒤는 마지막 색. background는 블러 그림 뒤 바탕색입니다.
export type VisitFog = { background: string; colors: [string, string, string] };

const FOGS: Record<number, VisitFog> = {
  1: { background: '#cdc0e0', colors: ['rgb(204,193,233)', 'rgb(205,192,224)', 'rgb(248,223,228)'] },
  2: { background: '#d0cadd', colors: ['rgb(202,215,217)', 'rgb(208,202,221)', 'rgb(243,225,228)'] },
  3: { background: '#cfcbe6', colors: ['rgb(197,211,237)', 'rgb(207,203,230)', 'rgb(246,223,223)'] },
  4: { background: '#d0c7e1', colors: ['rgb(198,205,230)', 'rgb(208,199,225)', 'rgb(244,226,228)'] },
  5: { background: '#d5c9dc', colors: ['rgb(203,201,222)', 'rgb(213,201,220)', 'rgb(241,227,224)'] },
  6: { background: '#d9c8df', colors: ['rgb(203,203,229)', 'rgb(217,200,223)', 'rgb(246,222,225)'] },
  7: { background: '#dec6dc', colors: ['rgb(209,194,224)', 'rgb(222,198,220)', 'rgb(245,221,224)'] },
  8: { background: '#d1cce1', colors: ['rgb(199,213,233)', 'rgb(209,204,225)', 'rgb(244,225,226)'] },
  9: { background: '#cbd0e6', colors: ['rgb(196,212,233)', 'rgb(203,208,230)', 'rgb(238,223,230)'] },
  10: { background: '#d1cddf', colors: ['rgb(207,215,208)', 'rgb(209,205,223)', 'rgb(241,225,226)'] },
};

export const visitFog = (spotId: number): VisitFog => FOGS[spotId] ?? FOGS[1];

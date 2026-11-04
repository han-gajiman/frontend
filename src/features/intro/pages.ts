import type { ImageSource } from 'expo-image';

// 첫 실행 인트로 3장 (Figma "ui 디자인" 페이지, 노션 "디자인 개발 요구사항")
//   1장 "한 가지만 · 온보딩 01", 2장 "한 가지만 · 온보딩 02", 3장 "온보딩 막장"
// 좌표는 각 Figma 프레임 기준입니다. 화면 크기에 맞춰 프레임 전체를 확대·축소해서 그립니다(DesignCanvas).
// 블러가 들어간 SVG(별 빛 번짐, 타이틀 확산광)는 Android에서 필터가 안 그려져서 3x PNG로 변환해 씁니다(assets/intro/svg 원본).

export type Frame = { width: number; height: number };
export type Box = { x: number; y: number; w: number; h: number };
// fit: Figma에서 비율대로 들어간 이미지는 contain(기본), 상자에 맞춰 늘린 이미지는 fill
export type Layer = Box & { source: ImageSource; fit?: 'contain' | 'fill' };

// 한 줄 안에서 색·크기·굵기가 바뀌는 부분 (가운데 정렬, top은 줄의 위쪽)
export type TitleSpan = { text: string; color: string; size?: number; bold?: boolean };
export type TitleLine = { top: number; size: number; spans: TitleSpan[]; glow?: number };
export type DescriptionLine = { top: number; size: number; text: string; color: string };

// 1·2장: 배경 그림 위에 돌이 쌓이는 장
export type StonePageData = {
  frame: Frame;
  art: Layer;
  titleGlow?: Layer;
  title: TitleLine[];
  description: DescriptionLine[];
  starGlow: Layer;
  star: Layer;
  stones: Layer[]; // 아래 돌부터 순서대로 (애니메이션도 이 순서로 쌓임)
  placedStones?: number; // 처음부터 놓여 있는 아래 돌 개수 (나머지만 쌓이는 애니메이션)
  // 돌 등장 방식: rise = 아래에서 살짝 올라옴(1장), drop = 위에서 내려와 안착(2장)
  stoneMotion: 'rise' | 'drop';
  stoneDuration: number;
  stoneInterval: number;
};

// 3장: 경북 지도와 명소, 돌탑, 시작 버튼
export type SpotData = { image: Layer; label: string; labelCenterX: number; labelTop: number };

export type FinalPageData = {
  frame: Frame;
  gradient: { colors: [string, string, ...string[]]; locations: [number, number, ...number[]] };
  decoration: Layer; // 하늘 유성·산·바다 벡터
  map: Layer;
  spots: SpotData[];
  ground: Layer; // 하단 받침 바위·구름·꽃
  // 네 단 돌탑. Figma에는 한 장짜리라, 아래 세 개(처음부터 놓여 있음)와 맨 위 하나(위에서 얹힘)로 나눴습니다.
  // (assets/intro/original/tools/clean_stones.py)
  towerBase: Layer;
  towerTop: Layer;
  // 돌탑 위 소원 별. Figma 막장에는 없어서 2장 별·빛 번짐을 가져와 돌탑 꼭대기 위에 둡니다.
  starGlow: Layer;
  star: Layer;
  title: TitleLine[];
  description: DescriptionLine[];
};

const STONE_FRAME: Frame = { width: 393, height: 852 };
const TITLE_DARK = '#15173b';
const DESCRIPTION = '#5e5c77';

export const STONE_PAGES: StonePageData[] = [
  {
    frame: STONE_FRAME,
    art: { source: require('../../../assets/intro/screen_01_artwork.jpg'), x: 0, y: 0, w: 412, h: 874 },
    titleGlow: { source: require('../../../assets/intro/title_glow.png'), x: 6, y: 107, w: 395, h: 216 },
    title: [
      { top: 170, size: 31, glow: 8, spans: [{ text: '소원은', color: TITLE_DARK }] },
      {
        top: 208,
        size: 33,
        glow: 10,
        spans: [
          { text: '딱 ', color: '#4d62ed' },
          { text: '한 가지', color: '#4d62ed', bold: true },
          { text: '.', color: '#4d62ed' },
        ],
      },
    ],
    description: [
      { top: 285, size: 15, text: '이번 달, 당신이 이루고 싶은', color: DESCRIPTION },
      { top: 307, size: 15, text: '그 소원을 찾아보세요.', color: DESCRIPTION },
    ],
    starGlow: { source: require('../../../assets/intro/screen_01_star_glow.png'), x: 158.8, y: 455.8, w: 97, h: 97 },
    star: { source: require('../../../assets/intro/screen_01_star.png'), x: 180.93, y: 477, w: 53, h: 51 },
    stones: [
      { source: require('../../../assets/intro/screen_01_stone_01.png'), x: 128, y: 567, w: 179.06, h: 112.8 },
    ],
    stoneMotion: 'rise',
    stoneDuration: 800,
    stoneInterval: 0,
  },
  {
    frame: STONE_FRAME,
    art: { source: require('../../../assets/intro/screen_02_artwork.jpg'), x: -13, y: 1.8, w: 423, h: 876.5, fit: 'fill' },
    title: [
      { top: 166, size: 26, spans: [{ text: '하루의 작은 실천이', color: '#16173c' }] },
      {
        top: 209,
        size: 27,
        spans: [
          { text: '소원을 이루는', color: '#5364ec' },
          { text: ' 돌이 돼요.', color: TITLE_DARK },
        ],
      },
    ],
    description: [
      { top: 277, size: 15, text: '매일의 기록이 모여', color: DESCRIPTION },
      { top: 302, size: 15, text: '나만의 소원탑이 완성돼요.', color: DESCRIPTION },
    ],
    starGlow: { source: require('../../../assets/intro/screen_02_star_glow.png'), x: 155.7, y: 357.7, w: 95, h: 95 },
    star: { source: require('../../../assets/intro/screen_02_star.png'), x: 177.41, y: 378.5, w: 52, h: 50 },
    stones: [
      { source: require('../../../assets/intro/screen_02_stone_03.png'), x: 62.53, y: 587.86, w: 264.43, h: 103.63 },
      { source: require('../../../assets/intro/screen_02_stone_02.png'), x: 99, y: 511, w: 192.07, h: 95.38 },
      { source: require('../../../assets/intro/screen_02_stone_01.png'), x: 130, y: 454, w: 142.04, h: 94.46 },
    ],
    placedStones: 1,
    stoneMotion: 'drop',
    stoneDuration: 500,
    stoneInterval: 700,
  },
];

const FINAL_TITLE = '#24325c';
const FINAL_DESCRIPTION = '#293a68';

export const FINAL_PAGE: FinalPageData = {
  frame: { width: 428, height: 875 },
  gradient: {
    colors: ['#96b6f4', '#e6d5ee', '#ffe2d1', '#d6c9e6', '#d0c5ed'],
    locations: [0, 0.29, 0.57, 0.82, 1],
  },
  decoration: { source: require('../../../assets/intro/final_background_deco.png'), x: 0, y: 0, w: 428, h: 875 },
  map: { source: require('../../../assets/intro/final_map.png'), x: -24, y: 200, w: 481, h: 426 },
  spots: [
    {
      image: { source: require('../../../assets/intro/final_spot_bulguksa.png'), x: 25, y: 226, w: 160, h: 120 },
      label: '불국사',
      labelCenterX: 105,
      labelTop: 337,
    },
    {
      image: { source: require('../../../assets/intro/final_spot_cheomseongdae.png'), x: 245, y: 219, w: 96, h: 128 },
      label: '첨성대',
      labelCenterX: 294,
      labelTop: 337,
    },
    {
      image: { source: require('../../../assets/intro/final_spot_woljeonggyo.png'), x: 51, y: 343, w: 172, h: 129 },
      label: '월정교',
      labelCenterX: 142,
      labelTop: 451,
    },
    {
      image: { source: require('../../../assets/intro/final_spot_homigot.png'), x: 294, y: 322, w: 88, h: 117 },
      label: '호미곶',
      labelCenterX: 337,
      labelTop: 429,
    },
    {
      image: { source: require('../../../assets/intro/final_spot_mungyeong.png'), x: 14, y: 456, w: 157, h: 118 },
      label: '문경새재',
      labelCenterX: 118,
      labelTop: 574,
    },
    {
      image: { source: require('../../../assets/intro/final_spot_hahoe.png'), x: 287, y: 475, w: 138, h: 104 },
      label: '하회마을',
      labelCenterX: 360,
      labelTop: 574,
    },
  ],
  ground: { source: require('../../../assets/intro/final_ground.png'), x: -13, y: 493, w: 454, h: 340 },
  // 원래 돌탑 자리(126, 500, 180 × 240)에서 각 조각이 있던 위치
  towerBase: { source: require('../../../assets/intro/final_tower_base.png'), x: 146.73, y: 577.18, w: 143.73, h: 147.27 },
  towerTop: { source: require('../../../assets/intro/final_tower_top.png'), x: 180.55, y: 532.45, w: 75, h: 50.18 },
  // 별 중심 (217, 515): 돌탑 맨 위 돌(약 y 548) 바로 위. 이미지 안의 블러 여백만큼 좌상단을 당겨서 배치
  starGlow: { source: require('../../../assets/intro/screen_02_star_glow.png'), x: 169.7, y: 467.7, w: 95, h: 95 },
  star: { source: require('../../../assets/intro/screen_02_star.png'), x: 191.4, y: 488.5, w: 52, h: 50 },
  title: [
    { top: 57, size: 31, spans: [{ text: '경북에서,', color: FINAL_TITLE }] },
    {
      top: 97,
      size: 34,
      spans: [
        { text: '한 가지', color: '#5265e6', size: 36 },
        { text: ' 소원을', color: FINAL_TITLE },
      ],
    },
    { top: 143, size: 31, spans: [{ text: '쌓아보세요', color: FINAL_TITLE }] },
  ],
  description: [
    { top: 198, size: 14.5, text: '경북의 특별한 곳에서', color: FINAL_DESCRIPTION },
    { top: 216, size: 13.3, text: '당신의 소원이 더 가까워질 거예요.', color: FINAL_DESCRIPTION },
  ],
};

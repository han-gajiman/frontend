// SPOT-05 명소 이야기 출처 (공공기관 자료, 2026-11-08 확인). 이야기 카드 아래에 링크로 보여줍니다.
export type SpotSource = { title: string; url: string };

export const SPOT_SOURCES: Record<number, SpotSource[]> = {
  1: [
    {
      title: '한국관광공사 대한민국 구석구석 - 팔공산국립공원(갓바위지구)',
      url: 'https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=5245ccd3-c109-49d4-8bb3-c7a7793a85a3',
    },
  ],
  2: [
    {
      title: '한국관광공사 대한민국 구석구석 - 옛길 찾아 떠나는 아주 특별한 여행 1 (문경 편)',
      url: 'https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=03786c81-cbc2-4515-8378-c4cb0772fac3',
    },
    {
      title: '한국관광공사 대한민국 구석구석 - 옛길 따라 떠나는 소풍, 문경새재',
      url: 'https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=fc4b689c-9afa-40d8-9626-d4c64ebf3e36',
    },
  ],
  3: [
    {
      title: '포항시 퐝퐝여행 - 호미곶 해맞이광장',
      url: 'https://www.pohang.go.kr/phtour/wmap/tourInformation/view.do?menu_idx=104&tour_info_idx=191',
    },
  ],
  4: [
    {
      title: '한국관광공사 대한민국 구석구석(무장애여행) - 동화사',
      url: 'https://access.visitkorea.or.kr/ms/detail.do?cotId=912ef040-e18a-4897-8bf4-20685bdd6bb8',
    },
  ],
  5: [
    {
      title: '한국관광공사 대한민국 구석구석 - 다시 쓰는 수학여행기, 경주 불국사와 석굴암',
      url: 'https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=1d4146e7-8d1a-47f0-9db7-80c11c6852bb',
    },
    {
      title: '한국관광공사 대한민국 구석구석 - 경주 석굴암',
      url: 'https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=92bc2ee6-ac19-4a93-aa46-e54300fb4920',
    },
  ],
  6: [
    {
      title: '한국관광공사 대한민국 구석구석 - 부석사',
      url: 'https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=cb420683-215e-4a5c-89ec-b626e5df6612',
    },
    {
      title: '한국학중앙연구원 디지털영주문화대전 - 의상과 선묘의 구원의 사랑',
      url: 'https://yeongju.grandculture.net/yeongju/toc/GC07401203',
    },
  ],
  7: [
    {
      title: '한국관광공사 대한민국 구석구석 - 경주 남산',
      url: 'https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=48ade7db-4fed-4a74-bf62-4eeacc8f3cb3',
    },
  ],
  8: [
    {
      title: '한국관광공사 대한민국 구석구석 - 영덕해맞이공원',
      url: 'https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=839eeaf7-3f42-483b-934e-dfcef83849f3',
    },
  ],
  9: [
    {
      title: '한국관광공사 대한민국 구석구석 - 경주 문무대왕릉',
      url: 'https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=6092adec-92b2-4eb1-a875-fb5513d9a305',
    },
  ],
  10: [
    {
      title: '한국관광공사 대한민국 구석구석 - 신비한 물돌이 속 600년 정취가 숨 쉬는 하회마을',
      url: 'https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=bf0e8890-37c8-4896-bfd2-369f3a52b35d',
    },
    {
      title: '한국관광공사 대한민국 구석구석 - 여름방학 가족 여행지 추천. 안동 여행 당일치기 코스',
      url: 'https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=d48e1de5-aa6f-4a67-9b3a-b04919582ba1',
    },
  ],
};

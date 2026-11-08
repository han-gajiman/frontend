import type { ImageSource } from 'expo-image';

// 엽서 그림 (피그마 "명소 · 엽서 4종 앞뒤"를 600×900 JPEG로 내보냄, assets/postcards/{명소}-{스타일}-{면}.jpg)
// 다운로드용 원본 크기(1182×1772)는 웹 정적 파일 public/postcards에 같은 이름으로 있습니다.
export const POSTCARD_IMAGES: Record<number, Record<number, { front: ImageSource; back: ImageSource }>> = {
  1: {
    1: {
      front: require('../../../assets/postcards/1-1-front.jpg'),
      back: require('../../../assets/postcards/1-1-back.jpg'),
    },
    2: {
      front: require('../../../assets/postcards/1-2-front.jpg'),
      back: require('../../../assets/postcards/1-2-back.jpg'),
    },
    3: {
      front: require('../../../assets/postcards/1-3-front.jpg'),
      back: require('../../../assets/postcards/1-3-back.jpg'),
    },
    4: {
      front: require('../../../assets/postcards/1-4-front.jpg'),
      back: require('../../../assets/postcards/1-4-back.jpg'),
    },
  },
  2: {
    1: {
      front: require('../../../assets/postcards/2-1-front.jpg'),
      back: require('../../../assets/postcards/2-1-back.jpg'),
    },
    2: {
      front: require('../../../assets/postcards/2-2-front.jpg'),
      back: require('../../../assets/postcards/2-2-back.jpg'),
    },
    3: {
      front: require('../../../assets/postcards/2-3-front.jpg'),
      back: require('../../../assets/postcards/2-3-back.jpg'),
    },
    4: {
      front: require('../../../assets/postcards/2-4-front.jpg'),
      back: require('../../../assets/postcards/2-4-back.jpg'),
    },
  },
  3: {
    1: {
      front: require('../../../assets/postcards/3-1-front.jpg'),
      back: require('../../../assets/postcards/3-1-back.jpg'),
    },
    2: {
      front: require('../../../assets/postcards/3-2-front.jpg'),
      back: require('../../../assets/postcards/3-2-back.jpg'),
    },
    3: {
      front: require('../../../assets/postcards/3-3-front.jpg'),
      back: require('../../../assets/postcards/3-3-back.jpg'),
    },
    4: {
      front: require('../../../assets/postcards/3-4-front.jpg'),
      back: require('../../../assets/postcards/3-4-back.jpg'),
    },
  },
  4: {
    1: {
      front: require('../../../assets/postcards/4-1-front.jpg'),
      back: require('../../../assets/postcards/4-1-back.jpg'),
    },
    2: {
      front: require('../../../assets/postcards/4-2-front.jpg'),
      back: require('../../../assets/postcards/4-2-back.jpg'),
    },
    3: {
      front: require('../../../assets/postcards/4-3-front.jpg'),
      back: require('../../../assets/postcards/4-3-back.jpg'),
    },
    4: {
      front: require('../../../assets/postcards/4-4-front.jpg'),
      back: require('../../../assets/postcards/4-4-back.jpg'),
    },
  },
  5: {
    1: {
      front: require('../../../assets/postcards/5-1-front.jpg'),
      back: require('../../../assets/postcards/5-1-back.jpg'),
    },
    2: {
      front: require('../../../assets/postcards/5-2-front.jpg'),
      back: require('../../../assets/postcards/5-2-back.jpg'),
    },
    3: {
      front: require('../../../assets/postcards/5-3-front.jpg'),
      back: require('../../../assets/postcards/5-3-back.jpg'),
    },
    4: {
      front: require('../../../assets/postcards/5-4-front.jpg'),
      back: require('../../../assets/postcards/5-4-back.jpg'),
    },
  },
  6: {
    1: {
      front: require('../../../assets/postcards/6-1-front.jpg'),
      back: require('../../../assets/postcards/6-1-back.jpg'),
    },
    2: {
      front: require('../../../assets/postcards/6-2-front.jpg'),
      back: require('../../../assets/postcards/6-2-back.jpg'),
    },
    3: {
      front: require('../../../assets/postcards/6-3-front.jpg'),
      back: require('../../../assets/postcards/6-3-back.jpg'),
    },
    4: {
      front: require('../../../assets/postcards/6-4-front.jpg'),
      back: require('../../../assets/postcards/6-4-back.jpg'),
    },
  },
  7: {
    1: {
      front: require('../../../assets/postcards/7-1-front.jpg'),
      back: require('../../../assets/postcards/7-1-back.jpg'),
    },
    2: {
      front: require('../../../assets/postcards/7-2-front.jpg'),
      back: require('../../../assets/postcards/7-2-back.jpg'),
    },
    3: {
      front: require('../../../assets/postcards/7-3-front.jpg'),
      back: require('../../../assets/postcards/7-3-back.jpg'),
    },
    4: {
      front: require('../../../assets/postcards/7-4-front.jpg'),
      back: require('../../../assets/postcards/7-4-back.jpg'),
    },
  },
  8: {
    1: {
      front: require('../../../assets/postcards/8-1-front.jpg'),
      back: require('../../../assets/postcards/8-1-back.jpg'),
    },
    2: {
      front: require('../../../assets/postcards/8-2-front.jpg'),
      back: require('../../../assets/postcards/8-2-back.jpg'),
    },
    3: {
      front: require('../../../assets/postcards/8-3-front.jpg'),
      back: require('../../../assets/postcards/8-3-back.jpg'),
    },
    4: {
      front: require('../../../assets/postcards/8-4-front.jpg'),
      back: require('../../../assets/postcards/8-4-back.jpg'),
    },
  },
  9: {
    1: {
      front: require('../../../assets/postcards/9-1-front.jpg'),
      back: require('../../../assets/postcards/9-1-back.jpg'),
    },
    2: {
      front: require('../../../assets/postcards/9-2-front.jpg'),
      back: require('../../../assets/postcards/9-2-back.jpg'),
    },
    3: {
      front: require('../../../assets/postcards/9-3-front.jpg'),
      back: require('../../../assets/postcards/9-3-back.jpg'),
    },
    4: {
      front: require('../../../assets/postcards/9-4-front.jpg'),
      back: require('../../../assets/postcards/9-4-back.jpg'),
    },
  },
  10: {
    1: {
      front: require('../../../assets/postcards/10-1-front.jpg'),
      back: require('../../../assets/postcards/10-1-back.jpg'),
    },
    2: {
      front: require('../../../assets/postcards/10-2-front.jpg'),
      back: require('../../../assets/postcards/10-2-back.jpg'),
    },
    3: {
      front: require('../../../assets/postcards/10-3-front.jpg'),
      back: require('../../../assets/postcards/10-3-back.jpg'),
    },
    4: {
      front: require('../../../assets/postcards/10-4-front.jpg'),
      back: require('../../../assets/postcards/10-4-back.jpg'),
    },
  },
};

import type { Spot } from '../types';

// 카카오 지도 JavaScript 키 (카카오 개발자 콘솔 → 앱 키 → JavaScript 키). 공개 키라 앱에 포함돼도 괜찮습니다.
// 콘솔의 플랫폼 → Web에 지도를 띄우는 주소(localhost:8081, 배포 주소)를 등록해야 지도가 뜹니다.
export const KAKAO_JS_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_KEY ?? '';

// 폰의 WebView는 주소가 없어서 카카오가 등록 도메인으로 인정하지 않으므로, 이 주소에서 연 것처럼 띄웁니다. (콘솔에 등록된 주소)
export const KAKAO_MAP_BASE_URL = 'https://han-gajiman.expo.app';

// 지도 → 앱으로 보내는 메시지
export type KakaoMapMessage = { type: 'ready' } | { type: 'error' } | { type: 'select'; id: number };

// 경북 전체가 보이는 초기 화면
const CENTER = { lat: 36.35, lng: 128.75 };
const LEVEL = 11;
// 명소를 고르면 확대되는 고도. 사용자가 직접 확대할 때도 여기까지만 됩니다. (숫자가 작을수록 가까움, 5 = 축척 약 250m)
const FOCUS_LEVEL = 5;
const MIDWAY_LEVEL = 8; // 확대 중간 단계

// 지도 페이지 HTML. 폰(WebView)과 웹(iframe)이 같은 HTML을 씁니다.
// 앱 → 지도: window.selectSpot(id) 호출 (id = 그 명소로 확대, null = 전체 지도로) / 지도 → 앱: ReactNativeWebView.postMessage 또는 parent.postMessage
export function buildKakaoMapHtml(spots: Spot[]) {
  const data = JSON.stringify(
    spots.map(({ id, name, latitude, longitude, visited }) => ({ id, name, latitude, longitude, visited })),
  );

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>
  html, body, #map { margin: 0; width: 100%; height: 100%; }
  .pin { transform: translateY(-50%); display: flex; flex-direction: column; align-items: center; cursor: pointer; }
  .pin .dot { width: 14px; height: 14px; border-radius: 7px; background: #4a4d92; border: 3px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,.3); }
  .pin .label { margin-bottom: 4px; padding: 3px 8px; border-radius: 10px; background: #fff; color: #343354; font: 600 12px sans-serif; white-space: nowrap; box-shadow: 0 1px 4px rgba(0,0,0,.2); }
  .pin.selected .dot { width: 18px; height: 18px; border-radius: 9px; background: #f2b84b; }
  .pin.selected .label { background: #343354; color: #fff; }
  /* 방문 인증한 명소는 점 대신 별 */
  .pin.visited .dot, .pin.visited.selected .dot { width: auto; height: auto; border: 0; border-radius: 0; background: none; box-shadow: none; color: #f2b84b; font-size: 24px; line-height: 24px; text-shadow: 0 0 3px #fff, 0 1px 3px rgba(0,0,0,.45); }
  .pin.visited.selected .dot { font-size: 30px; line-height: 30px; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var spots = ${data};
  function send(message) {
    var text = JSON.stringify(message);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(text);
    else if (window.parent !== window) window.parent.postMessage({ source: 'kakao-map', message: message }, '*');
  }
  // 도메인 미등록 등으로 지도가 안 뜨면 조용히 멈추므로, 일정 시간 안에 준비되지 않으면 실패로 알립니다.
  var ready = false;
  setTimeout(function () { if (!ready) send({ type: 'error' }); }, 10000);
  var map = null;
  var overview = null; // 전체 지도의 고도·중심
  var current = null; // 지금 확대된 명소 id
  var pins = {};
  var overlays = {};
  var timers = []; // 진행 중인 이동. 새 선택이 오면 취소하고 마지막 선택으로 갑니다.
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function positionOf(id) {
    var spot = spots.find(function (s) { return s.id === id; });
    return spot ? new kakao.maps.LatLng(spot.latitude, spot.longitude) : null;
  }
  function zoom(level, ms) { map.setLevel(level, { animate: { duration: ms } }); }
  // 가까운 곳으로 부드럽게 이동한 뒤 확대합니다.
  function flyIn(position, wait) {
    later(function () { map.panTo(position); }, wait);
    // 한 번에 크게 확대하면 지도가 잠깐 뭉개져서 두 단계로 나눕니다.
    later(function () { zoom(${MIDWAY_LEVEL}, 300); }, wait + 350);
    later(function () { zoom(${FOCUS_LEVEL}, 300); }, wait + 700);
    later(function () { map.relayout(); map.setCenter(position); }, wait + 1050);
  }
  // 선택한 명소는 강조하고, 가까운 명소와 이름표가 겹쳐도 맨 위로 올라오게 합니다.
  window.selectSpot = function (id) {
    if (id === current || !map) return;
    var wasFocused = current !== null;
    current = id;
    timers.forEach(clearTimeout);
    timers = [];
    Object.keys(pins).forEach(function (key) {
      var selected = Number(key) === id;
      pins[key].classList.toggle('selected', selected);
      overlays[key].setZIndex(selected ? 2 : 1);
    });
    var position = id === null ? null : positionOf(id);
    if (!position) {
      // 전체 지도로
      zoom(overview.level, 400);
      later(function () { map.panTo(overview.center); }, 400);
      later(function () { map.relayout(); map.setCenter(overview.center); }, 800);
    } else if (wasFocused) {
      // 다른 명소로: 축소 → 이동 → 확대
      zoom(overview.level, 400);
      flyIn(position, 400);
    } else {
      flyIn(position, 0);
    }
  };
  function start() {
    if (!window.kakao || !kakao.maps) return send({ type: 'error' });
    kakao.maps.load(function () {
      map = new kakao.maps.Map(document.getElementById('map'), {
        center: new kakao.maps.LatLng(${CENTER.lat}, ${CENTER.lng}),
        level: ${LEVEL},
      });
      var bounds = new kakao.maps.LatLngBounds();
      spots.forEach(function (spot) {
        var pin = document.createElement('div');
        pin.className = spot.visited ? 'pin visited' : 'pin';
        pin.innerHTML = '<div class="label"></div><div class="dot"></div>';
        pin.firstChild.textContent = spot.name;
        if (spot.visited) pin.lastChild.textContent = '★';
        pin.addEventListener('click', function () {
          window.selectSpot(spot.id);
          send({ type: 'select', id: spot.id });
        });
        pins[spot.id] = pin;
        overlays[spot.id] = new kakao.maps.CustomOverlay({
          map: map,
          position: new kakao.maps.LatLng(spot.latitude, spot.longitude),
          content: pin,
          yAnchor: 1,
          zIndex: 1,
        });
        bounds.extend(new kakao.maps.LatLng(spot.latitude, spot.longitude));
      });
      // 처음 열 때 모든 명소가 한 화면에 들어오게 맞춥니다. (명소가 하나면 경북 전체 화면 유지)
      if (spots.length > 1) map.setBounds(bounds, 60, 40, 40, 40);
      overview = { level: map.getLevel(), center: map.getCenter() };
      map.setMinLevel(${FOCUS_LEVEL});
      // 아래 패널 크기에 따라 지도 크기가 바뀝니다.
      window.addEventListener('resize', function () { map.relayout(); });
      ready = true;
      send({ type: 'ready' });
    });
  }
</script>
<script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false" onload="start()" onerror="send({ type: 'error' })"></script>
</body>
</html>`;
}

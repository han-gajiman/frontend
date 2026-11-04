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
// 명소를 고르면 확대되는 고도 (숫자가 작을수록 가까움, 6 = 축척 500m). 직접 확대는 제한하지 않습니다.
const FOCUS_LEVEL = 6;

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
  html, body { overflow: hidden; }
  /* 타일이 서서히 나타나면 확대 중 고도가 바뀔 때마다 빈 배경이 비칩니다. */
  #map img { transition: none !important; }
  .pin { transform: translateY(10px) scale(var(--pin-scale, 1)); transform-origin: center calc(100% - 10px); display: flex; flex-direction: column; align-items: center; cursor: pointer; }
  /* 점 가운데가 명소 좌표에 오도록 (오버레이 아래쪽이 좌표, 점 반지름만큼 내림) */
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
  // 부드러운 확대·축소. 카카오 지도의 setLevel 애니메이션은 2배마다 멈추거나(단계별) 한 번에 튀어서(큰 폭) 쓰지 않습니다.
  // 프레임마다 소수 고도를 계산해, 그보다 한 단계 먼 고도의 지도를 띄우고 나머지만큼 CSS로 키웁니다. (고도가 1 줄면 정확히 2배)
  var zoomFrame = null;
  function stopZoom() {
    if (zoomFrame !== null) cancelAnimationFrame(zoomFrame);
    zoomFrame = null;
    var el = document.getElementById('map');
    el.style.transform = '';
    el.style.removeProperty('--pin-scale');
  }
  function smoothZoom(to, ms, anchor, done) {
    stopZoom();
    var from = map.getLevel();
    var el = document.getElementById('map');
    var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (from === to || reduced) {
      map.setLevel(to);
      if (done) done();
      return;
    }
    var startedAt = null;
    function frame(now) {
      if (startedAt === null) startedAt = now;
      var p = Math.min((now - startedAt) / ms, 1);
      var eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      var level = from + (to - from) * eased;
      var shown = Math.ceil(level - 1e-6);
      var scale = Math.pow(2, shown - level);
      if (map.getLevel() !== shown) {
        map.setLevel(shown);
        map.setCenter(anchor); // getCenter()는 먼 고도에서 반올림된 값이라, 실제 좌표로 다시 맞춰야 끝에서 튀지 않습니다.
      }
      el.style.transform = 'scale(' + scale + ')';
      el.style.setProperty('--pin-scale', String(1 / scale)); // 핀·이름표는 크기 유지
      if (p < 1) {
        zoomFrame = requestAnimationFrame(frame);
      } else {
        stopZoom();
        if (done) done();
      }
    }
    zoomFrame = requestAnimationFrame(frame);
  }
  // 가까운 곳으로 부드럽게 이동한 뒤 확대합니다.
  function flyIn(position) {
    map.panTo(position);
    later(function () {
      // 핀을 정확히 가운데에 두어야 확대 내내 그 자리에 머뭅니다.
      map.relayout();
      map.setCenter(position);
      smoothZoom(${FOCUS_LEVEL}, 800, position, function () { map.relayout(); map.setCenter(position); });
    }, 300);
  }
  // 선택한 명소는 강조하고, 가까운 명소와 이름표가 겹쳐도 맨 위로 올라오게 합니다.
  window.selectSpot = function (id) {
    if (id === current || !map) return;
    var wasFocused = current !== null;
    var focused = wasFocused ? positionOf(current) : map.getCenter(); // 축소할 때 기준점
    current = id;
    timers.forEach(clearTimeout);
    timers = [];
    stopZoom();
    Object.keys(pins).forEach(function (key) {
      var selected = Number(key) === id;
      pins[key].classList.toggle('selected', selected);
      overlays[key].setZIndex(selected ? 2 : 1);
    });
    var position = id === null ? null : positionOf(id);
    if (!position) {
      // 전체 지도로
      smoothZoom(overview.level, 600, focused, function () {
        map.relayout();
        map.panTo(overview.center);
        later(function () { map.setCenter(overview.center); }, 300);
      });
    } else if (wasFocused) {
      // 다른 명소로: 축소 → 이동 → 확대
      smoothZoom(overview.level, 500, focused, function () { flyIn(position); });
    } else {
      flyIn(position);
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

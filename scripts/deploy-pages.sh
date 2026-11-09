#!/usr/bin/env bash
# 실서비스 웹 배포: 실서버(API)에 연결해서 빌드한 뒤 https://han-gajiman.github.io 저장소에 올립니다.
# (목데이터 데모 웹은 따로 eas deploy로 https://han-gajiman.expo.app 에 올립니다)
# 사용: frontend 폴더에서 ./scripts/deploy-pages.sh   (반영까지 1~10분)
set -euo pipefail

API_URL="${API_URL:-https://hangajiman.duckdns.org/api/v1}"
# 테스트 기간에는 방문 인증 위치 확인을 건너뜀. 정식 운영 때는 SKIP_LOCATION=false ./scripts/deploy-pages.sh
SKIP_LOCATION="${SKIP_LOCATION:-true}"
REPO="https://github.com/han-gajiman/han-gajiman.github.io.git"
OUT=dist-pages
WORK="$(mktemp -d)"

rm -rf "$OUT"
# 시간 이동 버튼은 끕니다 (서버 시계가 모든 회원에게 함께 바뀜)
EXPO_PUBLIC_USE_MOCK=false EXPO_PUBLIC_API_URL="$API_URL" EXPO_PUBLIC_DEMO=false EXPO_PUBLIC_DEV_LOGIN=false \
  EXPO_PUBLIC_SKIP_LOCATION="$SKIP_LOCATION" \
  npx expo export -p web --output-dir "$OUT"

# 한 페이지 앱이라 /invite/코드 같은 주소로 바로 들어와도 앱이 뜨게 404.html = index.html
cp "$OUT/index.html" "$OUT/404.html"
# GitHub Pages는 _로 시작하는 폴더(_expo)를 무시하므로 끕니다
touch "$OUT/.nojekyll"

git clone -q --depth 1 "$REPO" "$WORK"
rsync -a --delete --exclude .git "$OUT/" "$WORK/"
cd "$WORK"
git add -A
if git diff --cached --quiet; then
  echo "바뀐 내용이 없어요."
else
  git commit -qm "chore: 실서비스 웹 배포 ($(date '+%Y-%m-%d %H:%M'))"
  git push -q origin HEAD:main
  echo "배포했어요: https://han-gajiman.github.io"
fi
rm -rf "$WORK"

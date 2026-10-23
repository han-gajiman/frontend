/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // 기본값 'media'면 웹에서 "Cannot manually set color scheme" 에러가 남 (nativewind#1489)
  // 앱은 라이트 모드 전용(app.json userInterfaceStyle: light)이라 영향 없음
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
};

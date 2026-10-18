import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar style="light" />

      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />

      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>MOBILE FIRST</Text>
        </View>

        <Text style={styles.title}>한가지만의 모바일 경험을 시작합니다.</Text>
        <Text style={styles.subtitle}>
          Expo Router 기반의 첫 화면입니다. 바로 서비스 소개, 로그인, 기능 진입점으로 확장할 수 있게
          설계했습니다.
        </Text>

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>58</Text>
            <Text style={styles.metricLabel}>Expo SDK</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>TS</Text>
            <Text style={styles.metricLabel}>TypeScript</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>RN</Text>
            <Text style={styles.metricLabel}>React Native</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>지금 시작하기</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>앱 둘러보기</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.previewCard}>
        <Text style={styles.sectionTitle}>오늘부터 만들 수 있는 화면</Text>

        <View style={styles.featureRow}>
          <View style={styles.dot} />
          <View style={styles.featureTextBlock}>
            <Text style={styles.featureTitle}>온보딩</Text>
            <Text style={styles.featureDescription}>첫 방문 사용자를 위한 소개와 회원가입 진입점</Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.dot} />
          <View style={styles.featureTextBlock}>
            <Text style={styles.featureTitle}>메인 대시보드</Text>
            <Text style={styles.featureDescription}>핵심 콘텐츠와 빠른 액션을 보여주는 중심 화면</Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.dot} />
          <View style={styles.featureTextBlock}>
            <Text style={styles.featureTitle}>탭 네비게이션</Text>
            <Text style={styles.featureDescription}>홈, 검색, 즐겨찾기 같은 주요 진입점을 분리</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#07111f',
    padding: 20,
    paddingTop: 56,
    paddingBottom: 36,
    position: 'relative',
  },
  backgroundGlowTop: {
    position: 'absolute',
    top: -70,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(90, 166, 255, 0.18)',
  },
  backgroundGlowBottom: {
    position: 'absolute',
    bottom: 60,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: 'rgba(81, 215, 182, 0.12)',
  },
  hero: {
    gap: 18,
    marginBottom: 16,
    padding: 24,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 35, 61, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(139, 193, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(139, 193, 255, 0.2)',
  },
  badgeText: {
    color: '#8bc1ff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    color: '#f7fbff',
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(247,251,255,0.8)',
    fontSize: 16,
    lineHeight: 24,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
  },
  metricValue: {
    color: '#f7fbff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  metricLabel: {
    color: 'rgba(247,251,255,0.68)',
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: '#8bc1ff',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 999,
  },
  primaryButtonText: {
    color: '#07111f',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  secondaryButtonText: {
    color: '#f7fbff',
    fontSize: 15,
    fontWeight: '700',
  },
  previewCard: {
    gap: 16,
    padding: 20,
    borderRadius: 28,
    backgroundColor: 'rgba(13, 26, 45, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sectionTitle: {
    color: '#f7fbff',
    fontSize: 18,
    fontWeight: '800',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    marginTop: 4,
    backgroundColor: '#8bc1ff',
  },
  featureTextBlock: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    color: '#f7fbff',
    fontSize: 15,
    fontWeight: '700',
  },
  featureDescription: {
    color: 'rgba(247,251,255,0.72)',
    fontSize: 13,
    lineHeight: 20,
  },
});
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// 로그인 상태를 기기에 저장합니다. 폰은 SecureStore(키체인/키스토어), 웹은 localStorage(개발 확인용)
const KEY = 'hangajiman.session';

export type StoredSession = {
  accessToken: string;
  refreshToken: string;
  onboarded: boolean;
};

async function read(): Promise<string | null> {
  if (Platform.OS === 'web') return globalThis.localStorage?.getItem(KEY) ?? null;
  return SecureStore.getItemAsync(KEY);
}

async function write(value: string): Promise<void> {
  if (Platform.OS === 'web') return globalThis.localStorage?.setItem(KEY, value);
  return SecureStore.setItemAsync(KEY, value);
}

async function remove(): Promise<void> {
  if (Platform.OS === 'web') return globalThis.localStorage?.removeItem(KEY);
  return SecureStore.deleteItemAsync(KEY);
}

// 저장된 값이 없거나 읽을 수 없으면 null (다시 로그인)
export async function loadSession(): Promise<StoredSession | null> {
  try {
    const raw = await read();
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

// 저장에 실패해도 앱은 계속 동작합니다(다음 실행 때 다시 로그인).
export async function saveSession(session: StoredSession): Promise<void> {
  await write(JSON.stringify(session)).catch(() => undefined);
}

export async function clearSession(): Promise<void> {
  await remove().catch(() => undefined);
}

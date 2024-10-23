import Constants from 'expo-constants';

const { expoConfig } = Constants;

export const APP_VERSION = expoConfig?.version ?? '0.0.0';

export const API_BASE_URL = getApiBaseUrl();

function getApiBaseUrl(): string {
  const apiHostFromEnv = process.env.EXPO_PUBLIC_API_HOST;
  if (apiHostFromEnv) {
    return apiHostFromEnv;
  }
  if (__DEV__) {
    // In dev, hostUri is available from mobile (but not web)
    const host = expoConfig?.hostUri ?? 'localhost';
    const hostname = host.split(':')[0] ?? '';
    return `http://${hostname}:8000`;
  }
  const host: unknown = expoConfig?.extra?.productionApiHost;
  if (typeof host !== 'string') {
    throw new Error('Missing "productionApiHost" in app.json');
  }
  return host;
}

import AsyncStorage from '@react-native-async-storage/async-storage';

const INSTALLATION_ID_KEY = 'INSTALLATION_ID';

export async function getInstallationId() {
  const installationId = await AsyncStorage.getItem(INSTALLATION_ID_KEY);
  if (installationId) {
    return installationId;
  }
  const newInstallationId = createRandomId();
  await AsyncStorage.setItem(INSTALLATION_ID_KEY, newInstallationId);
  return newInstallationId;
}

function createRandomId() {
  // Create 8-digit timestamp in base-36 string
  const timestamp = Date.now().toString(36).slice(-8);
  // Create random base-36 string with a maximum of 8 digits
  const randomPart = Math.floor(Math.random() * 36 ** 8)
    .toString(36)
    .padStart(8, '0');
  return timestamp + randomPart;
}

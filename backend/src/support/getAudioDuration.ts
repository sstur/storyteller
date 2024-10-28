import { loadMusicMetadata } from 'music-metadata';

export async function getAudioDuration(audioData: Buffer, mimeType: string) {
  const { parseBuffer } = await loadMusicMetadata();
  const audioInfo = await parseBuffer(audioData, mimeType, { duration: true });
  return Math.floor((audioInfo.format.duration ?? 0) * 1000);
}

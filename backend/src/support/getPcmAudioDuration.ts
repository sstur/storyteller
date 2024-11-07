export function getPcmAudioDuration(
  audioData: Buffer,
  sampleRate = 24000,
  bytesPerSample = 2,
  numChannels = 1,
) {
  const totalBytes = audioData.length;
  const numberOfSamplesPerChannel = totalBytes / (bytesPerSample * numChannels);
  const durationInMs = Math.floor(
    (numberOfSamplesPerChannel / sampleRate) * 1000,
  );
  return durationInMs;
}

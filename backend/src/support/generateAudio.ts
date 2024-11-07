import { openai } from '~/support/openai';

import { getPcmAudioDuration } from './getPcmAudioDuration';

// https://platform.openai.com/docs/api-reference/chat/create#chat-create-audio
const supportedFormats = {
  wav: '.wav', // 24000 hz, mono, s16le
  mp3: '.mp3', // This will be a variable bitrate mp3
  flac: '.flac',
  opus: '.opus',
  pcm16: '.pcm', // 24000 hz, mono, s16le
};

type Format = keyof typeof supportedFormats;

type Options = {
  format: Format;
};

const prompt = `
Read the following kids story in a fun, fast-paced and cheerful way.
`.trim();

export async function generateAudio(content: string, options: Options) {
  const { format } = options;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-audio-preview',
    // @ts-ignore
    modalities: ['text', 'audio'],
    audio: {
      voice: 'alloy',
      format,
    },
    messages: [
      {
        role: 'user',
        content: prompt + '\n\n' + content,
      },
    ],
  });

  const audioData = Buffer.from(
    completion.choices[0]?.message.audio?.data ?? '',
    'base64',
  );

  const fileExtension = supportedFormats[format];

  const duration = format === 'pcm16' ? getPcmAudioDuration(audioData) : 0;

  return [audioData, { fileExtension, duration }] as const;
}

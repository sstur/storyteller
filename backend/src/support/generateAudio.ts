import { PassThrough, Readable } from 'stream';

import { ffmpeg } from '~/support/ffmpeg';
import { getPcmAudioDuration } from '~/support/getPcmAudioDuration';
import { openai } from '~/support/openai';

const supportedFormats = {
  mp3: { fileExtension: '.mp3', mimeType: 'audio/mp3' },
  wav: { fileExtension: '.wav', mimeType: 'audio/wav' },
};

type Format = keyof typeof supportedFormats;

type Options = {
  outputFormat: Format;
};

const prompt = `
Read the following kids story in a fun, fast-paced and cheerful way.
`.trim();

export async function generateAudio(content: string, options: Options) {
  const { outputFormat } = options;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-audio-preview',
    modalities: ['text', 'audio'],
    audio: {
      voice: 'alloy',
      format: 'pcm16',
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
  const duration = getPcmAudioDuration(audioData);

  const [outputStream] = await convertAudio(audioData, { outputFormat });

  const { fileExtension, mimeType } = supportedFormats[outputFormat];
  return [outputStream, { duration, fileExtension, mimeType }] as const;
}

function convertAudio(
  input: Readable | Buffer,
  options: { outputFormat: Format },
) {
  const { outputFormat } = options;
  const readableStream = Buffer.isBuffer(input)
    ? Readable.from([input])
    : input;

  return new Promise<[Readable]>((resolve, reject) => {
    const outputStream = new PassThrough();
    ffmpeg()
      .input(readableStream)
      .inputOptions(['-f', 's16le', '-ar', '24000', '-ac', '1'])
      .outputOptions(outputFormat === 'mp3' ? ['-ab', '96k'] : [])
      .outputFormat(outputFormat)
      .on('start', (_commandLine) => {
        resolve([outputStream]);
      })
      .on('error', (error) => {
        reject(error);
        outputStream.destroy();
      })
      .output(outputStream)
      .run();
  });
}

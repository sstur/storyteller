/* eslint-disable @typescript-eslint/ban-ts-comment */
import '~/support/dotenv';

import { writeFile } from 'fs/promises';
import { resolve } from 'path';

import { openai } from '~/support/openai';

// https://platform.openai.com/docs/api-reference/chat/create#chat-create-audio
const supportedFormats = {
  wav: '.wav', // 24000 hz, mono, s16le
  mp3: '.mp3', // This will be a variable bitrate mp3
  flac: '.flac',
  opus: '.opus',
  pcm16: '.pcm', // 24000 hz, mono, s16le
};

type Format = keyof typeof supportedFormats;

const format: Format = 'wav';

const expectedExtension = supportedFormats[format];

const prompt = `
Read the following kids story in a fun, fast-paced and cheerful way.
`.trim();

/* eslint-disable no-console */
async function main() {
  const args = process.argv.slice(2);
  const outputFile = args[args.indexOf('-o') + 1];
  if (!outputFile) {
    throw new Error(
      'No output file provided. Use -o to specify an output file.',
    );
  }
  if (!outputFile.endsWith(expectedExtension)) {
    throw new Error(`Output file must end with ${expectedExtension}`);
  }
  const content = await readStdin();
  if (!content) {
    throw new Error('No input provided. Pipe input to stdin.');
  }
  console.log('Generating audio...');
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-audio-preview',
    // @ts-ignore
    modalities: ['text', 'audio'],
    audio: { voice: 'alloy', format },
    messages: [
      {
        role: 'user',
        content: prompt + '\n\n' + content,
      },
    ],
  });

  const audioData = Buffer.from(
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    completion.choices[0]?.message.audio.data,
    'base64',
  );
  console.log(`Generated audio of byte length ${audioData.length}`);
  const resolvedOutputFile = resolve(process.cwd(), outputFile);
  await writeFile(resolvedOutputFile, audioData);
  console.log(`Audio saved to "${resolvedOutputFile}"`);
}

async function readStdin() {
  if (process.stdin.isTTY) {
    return '';
  }
  const chunks: Array<string> = [];
  for await (const chunk of process.stdin) {
    chunks.push(String(chunk));
  }
  return chunks.join('').trim();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

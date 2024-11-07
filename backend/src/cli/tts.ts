import '~/support/dotenv';

import { writeFile } from 'fs/promises';
import { resolve } from 'path';

import { generateAudio } from '~/support/generateAudio';

/* eslint-disable no-console */
async function main() {
  const args = process.argv.slice(2);
  const outputFile = args[args.indexOf('-o') + 1];
  if (!outputFile) {
    throw new Error(
      'No output file provided. Use -o to specify an output file.',
    );
  }
  const content = await readStdin();
  if (!content) {
    throw new Error('No input provided. Pipe input to stdin.');
  }
  console.log('Generating audio...');

  const [readableStream, { duration, fileExtension }] = await generateAudio(
    content,
    { outputFormat: 'mp3' },
  );
  console.log(`Generated audio of duration ${duration}ms`);
  const resolvedOutputFile = resolve(
    process.cwd(),
    outputFile.endsWith(fileExtension)
      ? outputFile
      : outputFile + fileExtension,
  );
  await writeFile(resolvedOutputFile, readableStream);
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

import pathToFfmpeg from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';

if (!pathToFfmpeg) {
  throw new Error('Unable to determine path to ffmpeg');
}
ffmpeg.setFfmpegPath(pathToFfmpeg);

export { ffmpeg };

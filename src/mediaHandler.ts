// Handles downloading and saving media for Tumblr2Moose
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { TumblrPhoto, MediaPhoto } from './types';
import { getMediaExtension, zeroPad, safeFilename } from './utils';

export async function downloadPhoto(photo: TumblrPhoto, index: number, outDir: string): Promise<MediaPhoto> {
  const url = photo.original_size.url;
  const ext = getMediaExtension(url);
  const filename = `photo_${zeroPad(index, 2)}${ext}`;
  const filePath = path.join(outDir, filename);
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  await fs.writeFile(filePath, response.data);
  return {
    filename,
    width: photo.original_size.width,
    height: photo.original_size.height,
  };
}

export async function downloadAllPhotos(photos: TumblrPhoto[], outDir: string): Promise<MediaPhoto[]> {
  const results: MediaPhoto[] = [];
  for (let i = 0; i < photos.length; i++) {
    const media = await downloadPhoto(photos[i], i + 1, outDir);
    results.push(media);
  }
  return results;
}

export async function downloadVideo(videoUrl: string, outDir: string): Promise<string> {
  const ext = getMediaExtension(videoUrl) || '.mp4';
  const filename = `video${ext}`;
  const filePath = path.join(outDir, filename);
  const response = await axios.get(videoUrl, { responseType: 'arraybuffer' });
  await fs.writeFile(filePath, response.data);
  return filename;
}

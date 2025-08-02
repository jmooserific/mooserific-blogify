// Writes post folders and post.json for Tumblr2Moose
import fs from 'fs/promises';
import path from 'path';
import { PostJson, TumblrPost, TumblrPhoto } from './types';
import { extractPostData } from './parser';
import { formatDateFolder } from './utils';
import { downloadVideo } from './mediaHandler';
import axios from 'axios';
import sizeOf from 'image-size';

export async function writePost(post: TumblrPost, outDir: string): Promise<void> {
  const { date, author, caption, photos, videos } = extractPostData(post);
  const folderName = formatDateFolder(date);
  const postDir = path.join(outDir, folderName);
  await fs.mkdir(postDir, { recursive: true });

  // Download images from photo URLs, rename, get dimensions
  let photoMetas: { filename: string; width: number; height: number }[] = [];
  for (let i = 0; i < photos.length; i++) {
    const photoUrl = photos[i].url;
    const ext = path.extname(photoUrl).split('?')[0] || '.jpg';
    const filename = `photo_${String(i + 1).padStart(2, '0')}${ext}`;
    const filePath = path.join(postDir, filename);
    try {
      const response = await axios.get(photoUrl, { responseType: 'arraybuffer' });
      await fs.writeFile(filePath, response.data);
      // Get image dimensions
      const dimensions = sizeOf(Buffer.from(response.data));
      photoMetas.push({ filename, width: dimensions.width || 0, height: dimensions.height || 0 });
    } catch (err) {
      console.error(`Failed to download photo: ${photoUrl}`, err);
    }
  }

  // Download videos
  let videoFiles: string[] = [];
  for (const videoUrl of videos) {
    const videoFile = await downloadVideo(videoUrl, postDir);
    videoFiles.push(videoFile);
  }

  // Write post.json
  const postJson: PostJson = {
    date,
    author,
    caption,
    photos: photoMetas,
    videos: videoFiles,
  };
  await fs.writeFile(path.join(postDir, 'post.json'), JSON.stringify(postJson, null, 2));
}

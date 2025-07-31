// Writes post folders and post.json for Tumblr2Moose
import fs from 'fs/promises';
import path from 'path';
import { PostJson, TumblrPost, TumblrPhoto } from './types';
import { extractPostData } from './parser';
import { formatDateFolder } from './utils';
import { downloadAllPhotos, downloadVideo } from './mediaHandler';

export async function writePost(post: TumblrPost, outDir: string): Promise<void> {
  const { date, author, caption, photos, videos } = extractPostData(post);
  const folderName = formatDateFolder(date);
  const postDir = path.join(outDir, folderName);
  await fs.mkdir(postDir, { recursive: true });

  // Download photos
  const photoMetas = await downloadAllPhotos(photos, postDir);

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

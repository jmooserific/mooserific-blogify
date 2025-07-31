// Tumblr API parser for Tumblr2Moose
import axios from 'axios';
import TurndownService from 'turndown';
import { TumblrPost, Config } from './types';

export async function fetchTumblrPosts(config: Config, offset = 0): Promise<TumblrPost[]> {
  const { apiKey, blogName, batchSize = 20 } = config;
  const url = `https://api.tumblr.com/v2/blog/${blogName}/posts?api_key=${apiKey}&offset=${offset}&limit=${batchSize}`;
  try {
    const res = await axios.get(url);
    if (res.data && res.data.response && res.data.response.posts) {
      return res.data.response.posts as TumblrPost[];
    }
    return [];
  } catch (err) {
    console.error('Error fetching Tumblr posts:', err);
    return [];
  }
}

export function extractPostData(post: TumblrPost) {
  // Extracts date, author, caption, photos, videos
  // Convert Tumblr date string to local ISO format (YYYY-MM-DDTHH:MM:SS)
  let dateStr = post.date;
  let dateObj = new Date(dateStr.replace(' GMT', 'Z'));
  // Format as local time ISO string without milliseconds
  const pad = (n: number) => String(n).padStart(2, '0');
  const localDate = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000);
  const formattedDate = `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())}T${pad(localDate.getHours())}:${pad(localDate.getMinutes())}:${pad(localDate.getSeconds())}`;

  const author = post.post_author || "Imported";

  // Extract text from <p> tags in post.content and convert to Markdown
  let caption = '';
  if (post.body) {
    const turndownService = new TurndownService();
    // Get all <p>...</p> blocks
    const pTags = post.body.match(/<p>(.*?)<\/p>/gis);
    if (pTags) {
      // Convert each <p> block to Markdown
      caption = pTags.map((p: string) => turndownService.turndown(p)).join('\n\n');
    }
  } else {
    caption = post.caption || '';
  }
  const photos = post.photos || [];
  const videos = post.video_url ? [post.video_url] : [];
  return { date: formattedDate, author, caption, photos, videos };
}

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

function createTurndownService(): TurndownService {
  const turndownService = new TurndownService();
  
  // Add custom rule to preserve paragraph spacing
  turndownService.addRule('paragraphSpacing', {
    filter: 'p',
    replacement: function (content) {
      return '\n\n' + content + '\n\n';
    }
  });
  
  return turndownService;
}

function removeImagesFromContent(content: string): string {
  // Remove <img> tags and their surrounding <figure> or <p> tags
  return content
    .replace(/<figure[^>]*>[\s\S]*?<img[^>]*>[\s\S]*?<\/figure>/gi, '')
    .replace(/<p[^>]*>[\s\S]*?<img[^>]*>[\s\S]*?<\/p>/gi, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/\n{3,}/g, '\n\n') // Clean up excessive line breaks
    .trim();
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

  // Handle both old photo format and new text format
  let caption = '';
  let photos: { url: string }[] = [];
  let videos: string[] = [];

  if (post.type === 'photo' && post.photos) {
    // Old format: photo type posts with photos array
    let contentToProcess = post.caption || '';
    
    // Remove images from caption since they'll be in the photos array
    contentToProcess = removeImagesFromContent(contentToProcess);
    
    if (contentToProcess) {
      const turndownService = createTurndownService();
      caption = turndownService.turndown(contentToProcess).trim();
    }
    
    // Add title if present
    if (post.title && post.title.trim()) {
      const titleMarkdown = `**${post.title.trim()}**`;
      caption = caption ? `${titleMarkdown}\n\n${caption}` : titleMarkdown;
    }
    
    // Extract photos from the photos array, using original_size
    photos = post.photos.map(photo => ({
      url: photo.original_size.url
    }));
  } else if (post.type === 'video') {
    // Old format: video type posts with video_url
    let contentToProcess = post.caption || '';
    
    if (contentToProcess) {
      const turndownService = createTurndownService();
      caption = turndownService.turndown(contentToProcess).trim();
    }
    
    // Add title if present
    if (post.title && post.title.trim()) {
      const titleMarkdown = `**${post.title.trim()}**`;
      caption = caption ? `${titleMarkdown}\n\n${caption}` : titleMarkdown;
    }
    
    // Extract video URL
    if (post.video_url) {
      videos = [post.video_url];
    }
  } else {
    // New format: text type posts with content in body
    let contentToProcess = '';
    
    if (post.body) {
      // Remove images from body content before processing caption
      contentToProcess = removeImagesFromContent(post.body);
      
      const turndownService = createTurndownService();
      if (contentToProcess.trim()) {
        caption = turndownService.turndown(contentToProcess).trim();
      }
    }
    
    // Fallback to caption field if body processing didn't yield content
    if (!caption && post.caption) {
      const turndownService = createTurndownService();
      caption = turndownService.turndown(post.caption).trim();
    }
    
    // Add title if present
    if (post.title && post.title.trim()) {
      const titleMarkdown = `**${post.title.trim()}**`;
      caption = caption ? `${titleMarkdown}\n\n${caption}` : titleMarkdown;
    }

    // Extract photo URLs from <img> tags in post.body
    if (post.body) {
      // Match all <img ...> tags
      const imgTags = post.body.match(/<img [^>]*src=["']([^"'>]+)["'][^>]*>/gi);
      if (imgTags) {
        photos = imgTags.map((imgTag: string) => {
          // Extract src attribute
          const match = imgTag.match(/src=["']([^"'>]+)["']/i);
          let url = match ? match[1] : '';
          // If srcset exists, pick the highest resolution
          const srcsetMatch = imgTag.match(/srcset=["']([^"'>]+)["']/i);
          if (srcsetMatch) {
            // srcset is a comma-separated list: url size, url size, ...
            const srcset = srcsetMatch[1].split(',').map(s => s.trim());
            // Pick the last entry (highest resolution)
            const last = srcset[srcset.length - 1];
            const urlMatch = last.match(/([^ ]+)/);
            if (urlMatch) url = urlMatch[1];
          }
          return { url };
        });
      }
    }

    // Extract video URLs from <video> tags in post.body, picking highest resolution
    if (post.body) {
      // Match all <video ...> tags
      const videoTags = post.body.match(/<video [^>]*>[\s\S]*?<\/video>/gi);
      if (videoTags) {
        videos = videoTags.map((videoTag: string) => {
          // Find all <source ...> tags inside the video tag
          const sourceTags = videoTag.match(/<source [^>]*src=["']([^"'>]+)["'][^>]*>/gi);
          let url = '';
          if (sourceTags && sourceTags.length > 0) {
            // If multiple sources, pick the one with the highest resolution (look for type or resolution in tag)
            // We'll prefer the last one, assuming it's highest resolution (like with images)
            const lastSource = sourceTags[sourceTags.length - 1];
            const srcMatch = lastSource.match(/src=["']([^"'>]+)["']/i);
            if (srcMatch) url = srcMatch[1];
          } else {
            // Fallback: look for src attribute on <video> itself
            const srcMatch = videoTag.match(/src=["']([^"'>]+)["']/i);
            if (srcMatch) url = srcMatch[1];
          }
          return url;
        }).filter(Boolean);
        // Flatten in case of multiple <video> tags
        videos = videos.flat();
      }
    }
    // Fallback: if no <video> tags, check for video_url field
    if ((!videos || videos.length === 0) && post.video_url) {
      videos = [post.video_url];
    }
  }
  
  return { date: formattedDate, author, caption, photos, videos };
}
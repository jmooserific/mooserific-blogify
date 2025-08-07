// Type definitions for Tumblr2Moose
export interface MediaPhoto {
  filename: string;
  width: number;
  height: number;
}

export interface PostJson {
  date: string;
  content?: string;
  author: string;
  caption: string;
  photos: MediaPhoto[];
  videos: string[];
}

export interface TumblrPhoto {
  original_size: { url: string; width: number; height: number };
  alt_sizes: { url: string; width: number; height: number }[];
  caption?: string;
}

export interface TumblrVideo {
  video_url: string;
}

export interface TumblrPost {
  id: number;
  date: string;
  blog_name: string;
  post_author: string;
  body?: string; // HTML content of the post (newer format)
  caption?: string; // Direct caption (older format)
  title?: string; // Optional title (older format)
  photos?: TumblrPhoto[]; // Photo array (older format)
  video?: TumblrVideo;
  video_url?: string;
  type: string; // "text", "photo", "video", etc.
}

export interface Config {
  apiKey: string;
  blogName: string;
  outputDir: string;
  batchSize?: number;
  limit?: number;
  postId?: string;
}

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
}

export interface TumblrVideo {
  video_url: string;
}

export interface TumblrPost {
  id: number;
  date: string;
  blog_name: string;
  post_author: string;
  body?: string; // HTML content of the post
  caption?: string;
  photos?: TumblrPhoto[];
  video?: TumblrVideo;
  video_url?: string;
  type: string;
}

export interface Config {
  apiKey: string;
  blogName: string;
  outputDir: string;
  batchSize?: number;
  limit?: number;
}

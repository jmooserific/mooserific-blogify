// CLI entry for Tumblr2Moose
import fs from 'fs/promises';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { fetchTumblrPosts } from './parser';
import { writePost } from './postWriter';
import { Config } from './types';

async function main() {
  const argv = yargs(hideBin(process.argv))
    .option('apiKey', { type: 'string', demandOption: true, describe: 'Tumblr API key' })
    .option('blogName', { type: 'string', demandOption: true, describe: 'Tumblr blog name' })
    .option('out', { type: 'string', demandOption: true, describe: 'Output directory' })
    .option('batchSize', { type: 'number', default: 20, describe: 'Batch size for Tumblr API requests' })
    .option('limit', { type: 'number', describe: 'Maximum number of posts to export' })
    .option('postId', { type: 'string', describe: 'Retrieve and export a single Tumblr post by its ID' })
    .help()
    .argv;

  const config: Config = {
    apiKey: argv.apiKey,
    blogName: argv.blogName,
    outputDir: argv.out,
    batchSize: argv.batchSize,
    limit: argv.limit,
    postId: argv.postId
  };

  await fs.mkdir(config.outputDir, { recursive: true });

  // If postId is specified, fetch and export only that post
  if (config.postId) {
    const axios = require('axios');
    const url = `https://api.tumblr.com/v2/blog/${config.blogName}/posts?api_key=${config.apiKey}&id=${config.postId}`;
    try {
      const res = await axios.get(url);
      const posts = res.data?.response?.posts || [];
      if (posts.length === 0) {
        console.error(`No post found with ID ${config.postId}`);
        process.exit(1);
      }
      await writePost(posts[0], config.outputDir);
      console.log(`Exported post ${config.postId}`);
    } catch (err) {
      console.error(`Failed to fetch or export post ${config.postId}:`, err);
      process.exit(1);
    }
    return;
  }

  let offset = 0;
  let totalProcessed = 0;
  let seenIds = new Set<number>();
  let batch: any[] = [];

  do {
    batch = await fetchTumblrPosts(config, offset);
    if (!batch.length) break;
    for (const post of batch) {
      if (seenIds.has(post.id)) continue;
      seenIds.add(post.id);
      if (config.limit && totalProcessed >= config.limit) break;
      try {
        await writePost(post, config.outputDir);
        totalProcessed++;
        console.log(`Exported post ${post.id}`);
      } catch (err) {
        console.error(`Failed to export post ${post.id}:`, err);
      }
    }
    offset += batch.length;
    if (config.limit && totalProcessed >= config.limit) break;
  } while (batch.length === config.batchSize);

  console.log(`Export complete. ${totalProcessed} posts processed.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

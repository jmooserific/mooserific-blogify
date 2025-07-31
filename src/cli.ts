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
    .help()
    .argv;

  const config: Config = {
    apiKey: argv.apiKey,
    blogName: argv.blogName,
    outputDir: argv.out,
    batchSize: argv.batchSize,
    limit: argv.limit,
  };

  await fs.mkdir(config.outputDir, { recursive: true });

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

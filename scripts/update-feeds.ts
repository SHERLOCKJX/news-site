import { updateFeeds } from '../lib/rss';
import 'dotenv/config';
import { prisma } from '../lib/db';

// Mock Next.js cache/revalidate functions if they are used in lib/rss (they are not currently)
// But wait, lib/rss imports prisma from lib/db which uses PrismaClient.

async function main() {
  console.log('Starting manual feed update...');
  await updateFeeds();
  console.log('Done.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

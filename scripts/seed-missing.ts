import { prisma } from '../lib/db';

const worldArticles = [
  {
    title: "Global Summit Reaches Historic Agreement on Climate Action",
    snippet: "Leaders from 195 nations have signed a binding agreement to reduce carbon emissions by 50% by 2030, marking a significant turning point in global climate policy.",
    content: "<p>In a landmark decision...</p>",
    link: "https://example.com/world/1",
    author: "Sarah Jenkins",
    publishedAt: new Date(),
    source: "Global News Wire",
    imageUrl: "https://picsum.photos/seed/world1/800/600",
    category: "world"
  },
  {
    title: "European Markets Rally Amidst Economic Recovery Signs",
    snippet: "Major European indices hit record highs today as new economic data suggests inflation is cooling faster than anticipated across the Eurozone.",
    content: "<p>The STOXX 600 index rose...</p>",
    link: "https://example.com/world/2",
    author: "Marcus Weber",
    publishedAt: new Date(Date.now() - 3600000 * 5),
    source: "Euro Finance",
    imageUrl: "https://picsum.photos/seed/world2/800/600",
    category: "world"
  },
  {
    title: "New Archaeological Discovery in Egypt Stuns Historians",
    snippet: "A previously unknown tomb complex has been unearthed near Luxor, containing perfectly preserved artifacts dating back to the Middle Kingdom.",
    content: "<p>Archaeologists led by...</p>",
    link: "https://example.com/world/3",
    author: "Dr. Elena Rossi",
    publishedAt: new Date(Date.now() - 3600000 * 12),
    source: "History Today",
    imageUrl: "https://picsum.photos/seed/world3/800/600",
    category: "world"
  }
];

const opinionArticles = [
  {
    title: "Why Remote Work is Here to Stay, Like It or Not",
    snippet: "The debate over returning to the office misses the point. The fundamental structure of work has changed, and companies need to adapt or die.",
    content: "<p>Opinion content...</p>",
    link: "https://example.com/opinion/1",
    author: "James Freeman",
    publishedAt: new Date(),
    source: "The Daily View",
    imageUrl: "https://picsum.photos/seed/opinion1/800/600",
    category: "opinion"
  },
  {
    title: "The Case for Universal Basic Income in the AI Era",
    snippet: "As artificial intelligence automates more cognitive tasks, we must rethink our social safety nets to prevent mass displacement.",
    content: "<p>Argument goes here...</p>",
    link: "https://example.com/opinion/2",
    author: "Samantha Lee",
    publishedAt: new Date(Date.now() - 3600000 * 24),
    source: "Future Forward",
    imageUrl: "https://picsum.photos/seed/opinion2/800/600",
    category: "opinion"
  }
];

async function main() {
  console.log('Seeding manual data for missing categories...');

  // Create or find a dummy feed for manual entries
  let manualFeed = await prisma.feed.findUnique({ where: { url: 'manual-entry' } });
  if (!manualFeed) {
    manualFeed = await prisma.feed.create({
      data: {
        name: 'Manual Entry',
        url: 'manual-entry',
        active: true,
        category: 'general'
      }
    });
  }

  // Insert World Articles
  for (const article of worldArticles) {
    // Need to ensure feed exists for the specific category or reuse generic
    // For simplicity, we create specific feeds or just update the category on the article relation logic
    // But our schema puts category on Feed, not Article directly? 
    // Wait, let's check schema.
    
    // Schema check:
    // Feed has category. Article belongs to Feed.
    // So to have 'world' articles, we need a 'world' feed.
    
    const feedUrl = `manual-${article.category}`;
    let catFeed = await prisma.feed.findUnique({ where: { url: feedUrl } });
    if (!catFeed) {
        catFeed = await prisma.feed.create({
            data: {
                name: `${article.category.charAt(0).toUpperCase() + article.category.slice(1)} Wire`,
                url: feedUrl,
                category: article.category
            }
        });
    }

    await prisma.article.upsert({
      where: { link: article.link },
      update: {
        imageUrl: article.imageUrl,
        feedId: catFeed.id
      },
      create: {
        title: article.title,
        snippet: article.snippet,
        content: article.content,
        link: article.link,
        author: article.author,
        publishedAt: article.publishedAt,
        source: article.source,
        imageUrl: article.imageUrl,
        feedId: catFeed.id,
        isManual: true
      }
    });
  }
  
  // Insert Opinion Articles
  for (const article of opinionArticles) {
    const feedUrl = `manual-${article.category}`;
    let catFeed = await prisma.feed.findUnique({ where: { url: feedUrl } });
    if (!catFeed) {
        catFeed = await prisma.feed.create({
            data: {
                name: `${article.category.charAt(0).toUpperCase() + article.category.slice(1)} Columns`,
                url: feedUrl,
                category: article.category
            }
        });
    }

    await prisma.article.upsert({
      where: { link: article.link },
      update: {
        imageUrl: article.imageUrl,
        feedId: catFeed.id
      },
      create: {
        title: article.title,
        snippet: article.snippet,
        content: article.content,
        link: article.link,
        author: article.author,
        publishedAt: article.publishedAt,
        source: article.source,
        imageUrl: article.imageUrl,
        feedId: catFeed.id,
        isManual: true
      }
    });
  }

  console.log('Done seeding.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

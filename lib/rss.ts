import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { prisma } from './db';
import { analyzeContent } from './ai';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: true }],
    ],
  },
});

async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      next: { revalidate: 3600 } // Next.js specific cache control, though we are in a script context usually
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Try standard OG tag
    let image = $('meta[property="og:image"]').attr('content');
    
    // Try twitter card
    if (!image) {
      image = $('meta[name="twitter:image"]').attr('content');
    }
    
    // Try link rel=image_src
    if (!image) {
      image = $('link[rel="image_src"]').attr('href');
    }

    // Resolve relative URLs
    if (image && !image.startsWith('http')) {
        try {
            image = new URL(image, url).toString();
        } catch (e) {
            return null;
        }
    }
    
    return image || null;
  } catch (error) {
    // console.error(`Failed to fetch OG image for ${url}:`, error);
    return null;
  }
}

function extractImage(item: any): string | null {
  // 1. Try enclosure
  if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith('image')) {
    return item.enclosure.url;
  }

  // 2. Try media:content
  if (item.mediaContent) {
    // Some RSS feeds put the object directly, others in an array
    const mediaList = Array.isArray(item.mediaContent) ? item.mediaContent : [item.mediaContent];
    // Find first with url
    for (const media of mediaList) {
       // rss-parser might return it as object with $ property for attributes, or direct property
       if (media?.$?.url) return media.$.url;
       if (media?.url) return media.url;
    }
  }
  
  // 3. Try media:thumbnail
  if (item.mediaThumbnail) {
    const thumbList = Array.isArray(item.mediaThumbnail) ? item.mediaThumbnail : [item.mediaThumbnail];
    for (const thumb of thumbList) {
       if (thumb?.$?.url) return thumb.$.url;
       if (thumb?.url) return thumb.url;
    }
  }

  // 4. Try regex on content
  const content = item.content || item.contentSnippet || '';
  // Simple regex to find src in img tag
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) {
    return imgMatch[1];
  }

  return null;
}

export async function updateFeeds() {
  const feeds = await prisma.feed.findMany({
    where: { active: true }
  });

  console.log(`Updating ${feeds.length} feeds...`);

  for (const feed of feeds) {
    try {
      const parsed = await parser.parseURL(feed.url);
      console.log(`Fetched ${parsed.items.length} items from ${feed.name}`);

      for (const item of parsed.items) {
        if (!item.link || !item.title) continue;

        const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();

        // Check if article exists
        const exists = await prisma.article.findUnique({
          where: { link: item.link }
        });

        // Try to get image from RSS first
        let imageUrl = extractImage(item);
        
        // If no image found in RSS, try to fetch from OG tags (only for new articles or if we are updating)
        // Note: Fetching every page might be slow, so be careful. 
        // We do it if imageUrl is null.
        if (!imageUrl) {
            // Add a small random delay to avoid hammering servers
            await new Promise(r => setTimeout(r, Math.random() * 500 + 100));
            imageUrl = await fetchOgImage(item.link);
        }

        // Use AI to analyze content if needed
        // We can do this if article is new, or if we want to enrich it
        // To save API costs, let's do it for new articles or ones without keywords
        let aiData = null;
        if (process.env.DEEPSEEK_API_KEY && (!exists || !exists.keyword) && (item.content || item.contentSnippet)) {
           // Basic rate limiting/cost control: maybe skip if we are processing too many?
           // For now, let's just do it.
           const text = item.contentSnippet || item.content || '';
           if (text.length > 50) {
              aiData = await analyzeContent(item.title, text);
           }
        }

        if (!exists) {
          await prisma.article.create({
            data: {
              title: item.title,
              link: item.link,
              content: item.content || item.contentSnippet || '',
              snippet: aiData?.summary || (item.contentSnippet ? item.contentSnippet.substring(0, 300) : ''),
              publishedAt: publishedAt,
              author: item.creator || item.author,
              feedId: feed.id,
              source: feed.name,
              imageUrl: imageUrl,
              keyword: aiData?.keyword,
            }
          });
        } else {
           const updateData: any = {};
           if (!exists.imageUrl && imageUrl) updateData.imageUrl = imageUrl;
           if (!exists.keyword && aiData?.keyword) updateData.keyword = aiData.keyword;
           if ((!exists.snippet || exists.snippet.length < 50) && aiData?.summary) updateData.snippet = aiData.summary;

           if (Object.keys(updateData).length > 0) {
              await prisma.article.update({
                  where: { id: exists.id },
                  data: updateData
              });
              console.log(`Updated enriched data for: ${item.title}`);
           }
        }
      }
    } catch (error) {
      console.error(`Error updating feed ${feed.name}:`, error);
    }
  }
}

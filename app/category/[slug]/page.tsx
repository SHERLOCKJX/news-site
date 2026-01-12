import { prisma } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import NewsImage from '@/components/NewsImage';

export const revalidate = 60;

// Generate static params for known categories
export async function generateStaticParams() {
  return [
    { slug: 'world' },
    { slug: 'business' },
    { slug: 'tech' },
    { slug: 'opinion' },
  ];
}

async function getCategoryArticles(slug: string) {
  // Map 'opinion' to a potential category or just filter differently if needed.
  // Currently our seed maps: world, tech, business. 
  // If slug is opinion, we might look for category 'opinion' or just show empty for now.
  
  return await prisma.article.findMany({
    where: {
      feed: {
        category: slug.toLowerCase()
      }
    },
    orderBy: { publishedAt: 'desc' },
    take: 20,
    include: { feed: true }
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const articles = await getCategoryArticles(slug);
  
  const title = slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <div className="py-8">
      <h1 className="text-4xl font-serif font-bold border-b border-black pb-4 mb-8">
        {title} News
      </h1>

      {articles.length === 0 ? (
        <div className="text-center py-20 bg-gray-50">
          <p className="font-sans text-gray-500">No articles found in this section yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <div key={article.id} className="group">
               <div className="mb-4 relative w-full aspect-video overflow-hidden bg-gray-100">
                 <NewsImage 
                   src={article.imageUrl} 
                   alt={article.title}
                   category={article.feed?.category}
                   keyword={article.keyword}
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                 />
               </div>
               
               <div className="flex items-baseline gap-2 mb-2">
                 <span className="text-xs font-sans font-bold text-gray-500 uppercase">{article.source}</span>
                 <span className="text-xs font-sans text-gray-400">{formatDistanceToNow(article.publishedAt)} ago</span>
               </div>
               
               <Link href={`/article/${article.id}`} className="block">
                 <h2 className="font-serif font-bold text-xl leading-tight mb-2 group-hover:text-blue-800 transition-colors">
                   {article.title}
                 </h2>
               </Link>
               
               <p className="font-serif text-sm text-gray-600 line-clamp-3">
                 {(article.snippet || '').replace(/<[^>]*>/g, '')}
               </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

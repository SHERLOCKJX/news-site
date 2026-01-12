import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';
import NewsImage from '@/components/NewsImageComponent';

export const revalidate = 3600; // Revalidate every hour
export const dynamic = 'force-dynamic';

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let article = null;
  
  try {
    article = await prisma.article.findUnique({
      where: { id },
      include: { feed: true }
    });
  } catch (error) {
    console.error('Failed to fetch article:', error);
  }

  if (!article) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto py-8">
      <header className="mb-8 text-center">
        <div className="mb-4">
           <span className="font-sans font-bold text-xs uppercase tracking-widest text-red-700 border border-red-700 px-2 py-1">
             {article.source}
           </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-4 text-gray-900">
          {article.title}
        </h1>
        <div className="flex justify-center items-center gap-4 text-sm font-sans text-gray-500 uppercase tracking-wide">
          <span className="font-bold text-black">By {article.author || 'Staff'}</span>
          <span>•</span>
          <time>{format(article.publishedAt, 'MMMM d, yyyy h:mm a')}</time>
        </div>
      </header>

      {article.imageUrl && (
        <div className="mb-10 w-full overflow-hidden">
          <NewsImage 
            src={article.imageUrl} 
            alt={article.title}
            category={article.feed?.category}
            keyword={article.keyword}
            className="w-full h-auto object-cover max-h-[500px]"
          />
        </div>
      )}

      <div className="prose prose-lg prose-serif mx-auto text-gray-800 leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-[-5px]">
        {/* If manual, we display as is. If RSS, we might want to link to original if content is truncated */}
        <div dangerouslySetInnerHTML={{ __html: article.content || '' }} />
      </div>

      <div className="mt-12 pt-8 border-t border-black text-center">
         {!article.isManual && (
           <div className="mb-8">
             <p className="font-sans text-sm text-gray-500 mb-2">This article was syndicated from {article.source}.</p>
             <a 
               href={article.link} 
               target="_blank" 
               rel="noopener noreferrer"
               className="inline-block bg-gray-100 hover:bg-gray-200 text-black font-sans text-xs font-bold uppercase px-4 py-2 transition"
             >
               Read Full Article on Source
             </a>
           </div>
         )}
         <Link href="/" className="font-sans font-bold text-sm uppercase hover:underline">
           ← Back to Home
         </Link>
      </div>
    </article>
  );
}

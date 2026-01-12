import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create User table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    `;
    
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
    `;

    // Create Feed table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Feed" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "category" TEXT NOT NULL DEFAULT 'general',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Feed_pkey" PRIMARY KEY ("id")
      );
    `;

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Feed_url_key" ON "Feed"("url");
    `;

    // Create Article table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Article" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "content" TEXT,
        "snippet" TEXT,
        "link" TEXT NOT NULL,
        "author" TEXT,
        "publishedAt" TIMESTAMP(3) NOT NULL,
        "source" TEXT,
        "imageUrl" TEXT,
        "keyword" TEXT,
        "feedId" TEXT,
        "isManual" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
      );
    `;

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Article_link_key" ON "Article"("link");
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Article_publishedAt_idx" ON "Article"("publishedAt");
    `;

    // Add foreign key
    // Note: SQLite doesn't strictly enforce FKs in the same way, but Postgres does.
    // We use a separate command to be safe, though executeRaw might fail if it already exists.
    try {
        await prisma.$executeRaw`
          ALTER TABLE "Article" ADD CONSTRAINT "Article_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "Feed"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        `;
    } catch (e) {
        // Ignore if FK already exists or other minor issues
        console.log('FK creation might have failed (already exists):', e);
    }

    return NextResponse.json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Failed to initialize DB:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

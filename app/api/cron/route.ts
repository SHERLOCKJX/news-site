import { NextResponse } from 'next/server';
import { updateFeeds } from '@/lib/rss';

export const dynamic = 'force-dynamic'; // static by default, unless reading the request

export async function GET() {
  try {
    await updateFeeds();
    return NextResponse.json({ success: true, message: 'Feeds updated successfully' });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to update feeds' }, { status: 500 });
  }
}

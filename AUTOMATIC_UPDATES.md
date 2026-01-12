# Automatic News Updates

Your news site is set up to fetch the latest news from RSS feeds automatically.

## How it works

There is an API endpoint at `http://localhost:3000/api/cron` that triggers the update process. When this URL is visited, the server fetches the latest articles from all active feeds.

## Setting up Automatic Daily Updates (Windows)

To ensure your website updates automatically every day, you can use the built-in Windows Task Scheduler. We have provided a PowerShell script to set this up for you.

1. Open PowerShell as Administrator.
2. Run the following command in this directory:
   ```powershell
   ./scripts/setup-schedule.ps1
   ```

This will create a task named "NewsSiteUpdate" that runs daily at 8:00 AM.

## Manual Update

You can also trigger an update manually at any time:
1. Go to the Admin Dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)
2. Click the "Update All Feeds Now" button.

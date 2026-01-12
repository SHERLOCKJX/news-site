This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Render

This repo includes a [render.yaml](file:///c:/Users/yushu/Desktop/%E8%87%AA%E5%BB%BA%20%E6%96%B0%E9%97%BB%20%E7%BD%91%E7%AB%99/news-site/render.yaml) Blueprint.

Steps:

1. Create a new Render service from this GitHub repo.
2. Render will provision a PostgreSQL database and inject `DATABASE_URL`.
3. Optional: Add `DEEPSEEK_API_KEY` in Render Environment Variables to enable AI summaries/keywords.

The service runs:
- Build: `npm ci && npx prisma generate && npm run build`
- Start: `npx prisma db push && npx next start -p $PORT`

## Local Environment

Copy `.env.example` to `.env` and set values:

```bash
cp .env.example .env
```

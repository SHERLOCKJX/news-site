#!/bin/bash
echo "VERCEL_ENV: $VERCEL_ENV"
echo "Running Custom Build Script..."

echo "1. Generating Prisma Client..."
npx prisma generate

echo "2. Pushing DB Schema..."
npx prisma db push

echo "3. Building Next.js App..."
npx next build

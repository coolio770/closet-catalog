# Vercel Deployment Setup Guide

## Quick Fix for Build Failures

If your build is failing on Vercel, follow these steps:

### Step 1: Set DATABASE_URL Environment Variable

Even if you don't have a database set up yet, you need to provide a DATABASE_URL for the build to succeed.

**Option A: Use a placeholder (build will succeed, but app won't work until you set up a real database)**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `DATABASE_URL` = `postgresql://placeholder:placeholder@placeholder:5432/placeholder`
3. This allows the build to complete

**Option B: Set up a real database (recommended)**
1. In Vercel Dashboard → Storage → Create Database
2. Choose "Postgres"
3. Copy the connection string
4. Add it as `DATABASE_URL` environment variable
5. After deployment, run: `npx prisma migrate deploy` (or use Vercel's CLI)

### Step 2: Required Environment Variables

Make sure these are set in Vercel:

```
DATABASE_URL=your_postgres_connection_string
OPENAI_API_KEY=your_openai_key
```

### Step 3: After First Successful Build

Once the build succeeds, you need to:

1. **Set up your database** (if using placeholder):
   - Create a PostgreSQL database (Vercel Postgres, Supabase, or Railway)
   - Update `DATABASE_URL` in Vercel
   - Run migrations: `npx prisma migrate deploy`

2. **Push the schema to your database**:
   ```bash
   npx prisma db push
   ```
   Or use Vercel's CLI:
   ```bash
   vercel env pull
   npx prisma db push
   ```

## Local Development Setup

For local development, you can still use SQLite:

1. Copy `prisma/schema.sqlite.prisma` to `prisma/schema.prisma` (temporarily)
2. Or create a `.env.local` file with:
   ```
   DATABASE_URL="file:./dev.db"
   ```
   And update `schema.prisma` datasource to:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

## Common Build Errors

### Error: "Environment variable DATABASE_URL is not set"
**Fix**: Add DATABASE_URL to Vercel environment variables (even a placeholder works for build)

### Error: "Prisma Client not generated"
**Fix**: Already fixed in package.json - `postinstall` and `build` scripts now include `prisma generate`

### Error: "Cannot connect to database"
**Fix**: This is expected if using placeholder. Set up a real database after build succeeds.

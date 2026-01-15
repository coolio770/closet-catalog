# Deployment Guide

## 🚀 Free Hosting Options (Recommended)

### Option 1: Vercel (BEST for Next.js) ⭐ RECOMMENDED
**Free tier includes:**
- Unlimited deployments
- Automatic HTTPS
- Custom domains
- Edge network (fast worldwide)
- Built-in CI/CD
- Free SSL certificates

**Steps:**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Sign up with GitHub
4. Click "New Project"
5. Import your repository
6. Add environment variables (OPENAI_API_KEY)
7. Deploy!

**Database:** You'll need to migrate from SQLite to a cloud database (see below)

---

### Option 2: Netlify
**Free tier includes:**
- 100GB bandwidth/month
- Custom domains
- Automatic HTTPS
- Build minutes included

**Steps:**
1. Push to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Connect GitHub repo
4. Build command: `npm run build`
5. Publish directory: `.next`
6. Add environment variables

---

### Option 3: Railway
**Free tier includes:**
- $5 credit/month (usually enough for small apps)
- Easy database setup
- Custom domains

**Steps:**
1. Push to GitHub
2. Go to [railway.app](https://railway.app)
3. New Project → Deploy from GitHub
4. Add PostgreSQL database (free tier available)
5. Add environment variables

---

## 📦 What You Need to Prepare

### 1. Database Migration (SQLite → Cloud)

Since SQLite won't work in production, you need a cloud database:

#### Option A: Vercel Postgres (Free tier)
- Built into Vercel
- Easy setup
- Free tier: 256MB storage

#### Option B: Supabase (Free tier)
- PostgreSQL database
- Free tier: 500MB storage
- Easy to set up
- [supabase.com](https://supabase.com)

#### Option C: PlanetScale (Free tier)
- MySQL database
- Free tier: 1 database, 1GB storage
- [planetscale.com](https://planetscale.com)

**Migration Steps:**
1. Update `prisma/schema.prisma` to use PostgreSQL/MySQL
2. Run migrations
3. Export data from SQLite
4. Import to new database

### 2. Environment Variables

You'll need to set these in your hosting platform:

```
OPENAI_API_KEY=your_key_here
DATABASE_URL=your_database_connection_string
```

### 3. Image Storage

Currently using local file system. For production, consider:

#### Option A: Vercel Blob Storage (Free tier)
- Built into Vercel
- Free tier: 1GB storage

#### Option B: Cloudinary (Free tier)
- Free tier: 25GB storage
- Easy image optimization
- [cloudinary.com](https://cloudinary.com)

#### Option C: AWS S3 (Pay as you go)
- Very cheap for small apps
- Reliable

---

## 🔧 Pre-Deployment Checklist

### 1. Update Prisma Schema for Production

Change `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // or "mysql" for PlanetScale
  url      = env("DATABASE_URL")
}
```

### 2. Update Image Upload

You'll need to modify `lib/upload.ts` to use cloud storage instead of local files.

### 3. Test Production Build

```bash
npm run build
npm run start
```

### 4. Update .env.example

Create `.env.example` with:
```
OPENAI_API_KEY=
DATABASE_URL=
```

---

## 🌐 Domain Setup

### If using Vercel:
1. In Vercel dashboard → Your Project → Settings → Domains
2. Add your domain
3. Follow DNS instructions
4. Vercel handles SSL automatically

### DNS Records Needed:
- **A Record** or **CNAME** pointing to your hosting provider
- Vercel will give you specific instructions

---

## 📝 Step-by-Step: Vercel Deployment (Recommended)

### Step 1: Prepare Your Code
```bash
# Make sure everything is committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Create GitHub Repository
1. Go to [github.com](https://github.com)
2. New repository
3. Push your code:
```bash
git remote add origin https://github.com/yourusername/closet-catalog.git
git push -u origin main
```

### Step 3: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your repository
5. Configure:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
6. Add Environment Variables:
   - `OPENAI_API_KEY`: Your OpenAI key
   - `DATABASE_URL`: Your database connection string (after setting up database)
7. Click "Deploy"

### Step 4: Set Up Database
1. In Vercel dashboard → Storage → Create Database
2. Choose Postgres
3. Copy the connection string
4. Update environment variable `DATABASE_URL`
5. Run migrations:
```bash
npx prisma migrate deploy
```

### Step 5: Add Custom Domain
1. In Vercel → Your Project → Settings → Domains
2. Add your domain
3. Follow DNS setup instructions
4. Wait for SSL (automatic, takes a few minutes)

---

## 💰 Cost Breakdown

### Free Option (Vercel + Supabase):
- **Hosting**: Free (Vercel)
- **Database**: Free (Supabase - 500MB)
- **Image Storage**: Free (Vercel Blob - 1GB) or Cloudinary (25GB free)
- **Domain**: ~$10-15/year (Namecheap, Google Domains)
- **Total**: ~$10-15/year (just domain)

### If You Need More:
- Vercel Pro: $20/month (if you exceed free tier)
- Supabase Pro: $25/month (if you exceed free tier)
- But free tier is usually enough for personal use!

---

## 🚨 Important Notes

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Set environment variables in hosting platform**
3. **Test locally first**: `npm run build && npm run start`
4. **Database migration**: SQLite won't work in production
5. **Image storage**: Local files won't persist on serverless platforms

---

## 🆘 Need Help?

Common issues:
- **Build fails**: Check build logs in Vercel dashboard
- **Database connection**: Verify DATABASE_URL is set correctly
- **Images not loading**: Need to migrate to cloud storage
- **API errors**: Check environment variables are set

---

## Quick Start (5 minutes)

1. Push code to GitHub
2. Sign up at vercel.com
3. Import repo
4. Add OPENAI_API_KEY
5. Deploy!

Then set up database and image storage separately.

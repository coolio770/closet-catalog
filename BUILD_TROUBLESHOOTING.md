# Build Troubleshooting Guide

## If Build Fails on Vercel

### Step 1: Check Vercel Build Logs

1. Go to your Vercel project dashboard
2. Click on the failed deployment
3. Open the "Build Logs" tab
4. Look for the specific error message

### Step 2: Common Issues and Fixes

#### Issue: "Environment variable DATABASE_URL is not set"

**Fix:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `DATABASE_URL` = `postgresql://placeholder:placeholder@placeholder:5432/placeholder`
3. Make sure to check all environments (Production, Preview, Development)
4. Redeploy

#### Issue: "Prisma Client not generated" or "Cannot find module '@prisma/client'"

**Fix:**
- Already handled in `package.json` with `postinstall` and `build` scripts
- Make sure `prisma` is in `dependencies` (not `devDependencies`) ✅ Already done

#### Issue: "TypeScript errors" or "ESLint errors"

**Fix:**
- Run `npm run lint` locally to check for errors
- All TypeScript errors should be fixed ✅
- If you see new errors, fix them and commit

#### Issue: "Module not found" or "Cannot resolve module"

**Fix:**
- Make sure all dependencies are in `package.json`
- Run `npm install` locally to verify
- Check that imports use correct paths (e.g., `@/lib/prisma`)

#### Issue: "Sharp installation failed"

**Fix:**
- `sharp` is a native module and should work on Vercel
- If it fails, Vercel will automatically install the correct binary
- Make sure `sharp` is in `dependencies` ✅ Already done

### Step 3: Verify Your Setup

Before deploying, verify locally:

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npm run db:generate

# 3. Try building
npm run build

# 4. If build succeeds locally, the issue is likely environment variables
```

### Step 4: Required Environment Variables in Vercel

Make sure these are set in Vercel (Settings → Environment Variables):

```
DATABASE_URL=postgresql://... (or placeholder for initial build)
OPENAI_API_KEY=sk-... (optional, but needed for AI features)
```

**Important:** Check all three environments:
- ✅ Production
- ✅ Preview  
- ✅ Development

### Step 5: After Build Succeeds

Once the build succeeds:

1. **Set up a real database:**
   - Vercel Postgres (in Vercel dashboard)
   - Supabase (free tier)
   - Railway (free tier)

2. **Update DATABASE_URL** with the real connection string

3. **Push your schema:**
   ```bash
   npx prisma db push
   ```

## Still Having Issues?

1. **Check the exact error** in Vercel build logs
2. **Share the error message** - it will help identify the specific issue
3. **Verify your code is committed** - make sure all changes are pushed to GitHub
4. **Check Node.js version** - Vercel should auto-detect, but you can set it in `package.json`:
   ```json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

## Quick Checklist

- [ ] All code committed and pushed to GitHub
- [ ] `DATABASE_URL` environment variable set in Vercel (even if placeholder)
- [ ] `OPENAI_API_KEY` set in Vercel (if using AI features)
- [ ] `npm run build` succeeds locally
- [ ] No TypeScript/ESLint errors (`npm run lint`)
- [ ] Prisma client generated (`npm run db:generate` works)

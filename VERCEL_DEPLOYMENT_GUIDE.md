# FinBoard Vercel Deployment Guide

## Pre-Deployment Checklist ✅

### 1. **Environment Variables**

Create these environment variables in Vercel:

- `NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY` = `VMFAF630EBQ1HFBK`

### 2. **Build Configuration**

Ensure your project has proper build settings:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

## Deployment Steps

### Method 1: Deploy via GitHub (Recommended)

#### Step 1: Push to GitHub

```bash
# If not already a git repository
git init
git add .
git commit -m "Initial commit - FinBoard ready for deployment"

# Create GitHub repository and push
git remote add origin https://github.com/Akcthecoder200/FinBoard.git
git branch -M main
git push -u origin main
```

#### Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign in with GitHub**
3. **Click "New Project"**
4. **Import your FinBoard repository**
5. **Configure project settings:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (keep default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

#### Step 3: Add Environment Variables

1. **In Vercel dashboard → Project Settings → Environment Variables**
2. **Add:**
   - **Name:** `NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY`
   - **Value:** `VMFAF630EBQ1HFBK`
   - **Environment:** Production, Preview, Development

#### Step 4: Deploy

1. **Click "Deploy"**
2. **Wait for build to complete** (usually 2-3 minutes)
3. **Visit your live URL!**

### Method 2: Deploy via Vercel CLI

#### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

#### Step 2: Login and Deploy

```bash
# Login to Vercel
vercel login

# Deploy from project directory
cd "D:\Vs Code projects\FinBoard"
vercel

# Follow prompts:
# ? Set up and deploy? Yes
# ? Which scope? Your account
# ? Link to existing project? No
# ? What's your project's name? finboard
# ? In which directory is your code located? ./
```

#### Step 3: Add Environment Variables

```bash
# Add environment variable
vercel env add NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY
# Enter value: VMFAF630EBQ1HFBK
# Select environments: Production, Preview, Development
```

#### Step 4: Redeploy with Environment Variables

```bash
vercel --prod
```

## Post-Deployment Configuration

### 1. **Custom Domain (Optional)**

- In Vercel dashboard → Domains
- Add your custom domain
- Configure DNS settings

### 2. **Analytics & Monitoring**

- Enable Vercel Analytics
- Set up error monitoring
- Configure performance insights

### 3. **Security Headers**

Add to `next.config.ts`:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

## Expected Build Output

```
✓ Creating an optimized production build
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page and component info
✓ Generating static pages (7/7)
✓ Collecting build traces
✓ Finalizing page optimization

Build completed successfully!
```

## Troubleshooting

### Common Issues & Solutions

#### 1. **Build Errors**

```bash
# Check for TypeScript errors
npm run build

# Fix any type issues
npm run lint
```

#### 2. **Environment Variable Issues**

- Ensure `NEXT_PUBLIC_` prefix for client-side variables
- Restart build after adding environment variables
- Check environment variable values in Vercel dashboard

#### 3. **API Route Issues**

- API routes work automatically on Vercel
- Check function logs in Vercel dashboard
- Ensure proper error handling

## Performance Optimization

### 1. **Image Optimization**

- Use Next.js `Image` component
- Optimize images in `/public` folder

### 2. **Bundle Analysis**

```bash
# Add to package.json
"analyze": "ANALYZE=true npm run build"

# Run analysis
npm run analyze
```

### 3. **Caching Strategy**

- Leverage Vercel's Edge Network
- Configure ISR for dynamic content
- Use SWR for client-side caching

## Final Checklist Before Deployment

- [ ] All TypeScript errors resolved
- [ ] Environment variables configured
- [ ] Build command works locally
- [ ] API endpoints tested
- [ ] Responsive design verified
- [ ] Error boundaries in place
- [ ] Loading states implemented
- [ ] Data persistence working

## Post-Deployment Testing

1. **Test all major features:**

   - Widget creation and management
   - Data persistence (localStorage)
   - Settings panel functionality
   - API data loading
   - Responsive design

2. **Performance testing:**

   - Page load speeds
   - API response times
   - Widget rendering performance

3. **Browser compatibility:**
   - Chrome, Firefox, Safari, Edge
   - Mobile devices

## Your Deployment URL Structure

- **Production:** `https://finboard-[random].vercel.app`
- **Preview:** `https://finboard-[branch]-[user].vercel.app`
- **Custom Domain:** `https://your-domain.com` (optional)

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel Support](https://vercel.com/support)

---

**Ready to deploy! Your FinBoard application is production-ready with all features working.** 🚀

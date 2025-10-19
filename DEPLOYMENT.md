# GeoBilling Deployment Guide for Render.com

## Pre-Deployment Checklist

### ✅ 1. Database Setup on Render

- [ ] Created PostgreSQL database on Render
- [ ] Database name: `geobilling` (or your chosen name)
- [ ] Copied the **External Database URL** (starts with `postgresql://`)
- [ ] Database is in the same region as your web service (recommended)

### ✅ 2. Google OAuth Configuration

You need to update your Google OAuth settings to include your production URL:

1. Go to https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Add these URIs:

**Authorized JavaScript origins:**
```
https://YOUR-APP-NAME.onrender.com
```

**Authorized redirect URIs:**
```
https://YOUR-APP-NAME.onrender.com/api/auth/callback/google
```

### ✅ 3. Environment Variables for Render

In your Render web service dashboard, go to **Environment** and add these variables:

```bash
# Database
DATABASE_URL=<your-external-database-url-from-render>

# NextAuth Configuration
NEXTAUTH_URL=https://YOUR-APP-NAME.onrender.com
NEXTAUTH_SECRET=6ySe/hY5VqZf24nKLsfr69q3jNHRYckxiP+BpEvZq/Y=

# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Email Service (Resend)
RESEND_API_KEY=<your-resend-api-key>
```

**Important Notes:**
- Replace `YOUR-APP-NAME` with your actual Render app name
- Replace `<your-external-database-url-from-render>` with the External Database URL from Render
- Replace `<your-resend-api-key>` with your Resend API key

### ✅ 4. Render Build Settings

**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
npm start
```

**Environment:**
- Node Version: 20.x (or latest LTS)

### ✅ 5. Database Migration

After setting up environment variables, you need to push your Prisma schema to the production database.

**Option A: From Render Shell**
1. After deployment, go to your web service dashboard
2. Click on "Shell" tab
3. Run:
```bash
npx prisma db push
```

**Option B: From Local Machine**
1. Temporarily set the production DATABASE_URL in your terminal:
```bash
export DATABASE_URL="<your-render-external-database-url>"
```
2. Run:
```bash
npx prisma db push
```
3. Unset the variable:
```bash
unset DATABASE_URL
```

### ✅ 6. Post-Deployment Verification

After deployment, verify:

1. **Database Connection**: Visit your app - it should load without database errors
2. **Google OAuth**: Try signing in with Google - it should redirect properly
3. **Environment Variables**: Check Render logs for any missing variable warnings
4. **Schema**: Create a test client/quote to ensure database schema is correct

## Common Issues & Solutions

### Issue: "relation does not exist" errors
**Solution:** Run `npx prisma db push` from the Render shell or locally with production DATABASE_URL

### Issue: Google OAuth redirect error
**Solution:** Make sure you added the production URL to Google Console's authorized redirect URIs

### Issue: NextAuth errors
**Solution:** Verify `NEXTAUTH_URL` matches your exact Render URL (including https://)

### Issue: Email sending fails
**Solution:** Verify your Resend API key and domain settings at resend.com

## Deployment Commands Summary

```bash
# 1. Commit all changes
git add .
git commit -m "Prepare for production deployment"
git push origin main

# 2. In Render dashboard:
# - Connect your GitHub repository
# - Set environment variables
# - Deploy

# 3. After deployment, push database schema:
# From Render Shell:
npx prisma db push

# Or from local with production URL:
export DATABASE_URL="<render-database-url>"
npx prisma db push
unset DATABASE_URL
```

## Your Current Configuration

**Note:** Your specific credentials should be stored securely in Render's environment variables, not in version control.

---

**Need Help?** Check the Render logs for detailed error messages:
- Dashboard → Your Web Service → Logs

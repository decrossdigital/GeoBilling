# 🔐 OAuth Troubleshooting Guide

This guide will help you fix OAuth authentication issues when deploying to production.

## 🚨 Common OAuth Errors

### **Error 401: invalid_client**
This error means Google cannot find your OAuth client or the configuration is incorrect.

## 🔧 Step-by-Step Fix

### **Step 1: Get Your Render App URL**

1. Go to your [Render Dashboard](https://dashboard.render.com)
2. Find your web service
3. Copy the URL (e.g., `https://geobilling-app.onrender.com`)

### **Step 2: Update Google OAuth Client**

1. **Go to [Google Cloud Console](https://console.cloud.google.com)**
2. **Select your project**
3. **Navigate to "APIs & Services" → "Credentials"**
4. **Find your OAuth 2.0 Client ID** (the one for this app)
5. **Click on it to edit**
6. **Add these Authorized redirect URIs:**

```
https://your-app-name.onrender.com/api/auth/callback/google
```

**Replace `your-app-name` with your actual Render app name.**

7. **Click "Save"**

### **Step 3: Verify Environment Variables in Render**

In your Render dashboard:

1. **Go to your web service**
2. **Click "Environment" tab**
3. **Verify these variables are set:**

```
NEXTAUTH_URL=https://your-app-name.onrender.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-nextauth-secret
```

### **Step 4: Get Your Google OAuth Credentials**

If you don't have your Google OAuth credentials:

1. **Go to [Google Cloud Console](https://console.cloud.google.com)**
2. **Create a new project or select existing**
3. **Enable Google+ API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"
4. **Create OAuth 2.0 credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs (see Step 2)
   - Copy the Client ID and Client Secret

### **Step 5: Test the Configuration**

1. **Restart your Render service** (this will pick up new environment variables)
2. **Try signing in again**
3. **Check the logs** in Render dashboard for any errors

## 🔍 Debugging Steps

### **Check Environment Variables**

Run this script locally to verify your environment variables:

```bash
node scripts/verify-oauth.js
```

### **Check Render Logs**

1. Go to your Render dashboard
2. Click on your web service
3. Go to "Logs" tab
4. Look for any OAuth-related errors

### **Common Issues and Solutions**

#### **Issue: "OAuth client was not found"**
- **Solution**: Make sure your `GOOGLE_CLIENT_ID` is correct
- **Check**: Copy the Client ID exactly from Google Cloud Console

#### **Issue: "Invalid redirect URI"**
- **Solution**: Add the correct redirect URI to Google OAuth client
- **Format**: `https://your-app-name.onrender.com/api/auth/callback/google`

#### **Issue: "Client secret is invalid"**
- **Solution**: Make sure your `GOOGLE_CLIENT_SECRET` is correct
- **Check**: Copy the Client Secret exactly from Google Cloud Console

#### **Issue: "NEXTAUTH_URL mismatch"**
- **Solution**: Set `NEXTAUTH_URL` to your exact Render app URL
- **Format**: `https://your-app-name.onrender.com`

## 🛠️ Advanced Configuration

### **Multiple Environments**

If you have development and production environments:

**Development:**
```
NEXTAUTH_URL=http://localhost:3000
```

**Production:**
```
NEXTAUTH_URL=https://your-app-name.onrender.com
```

### **Google OAuth Client Setup**

**Authorized JavaScript origins:**
```
http://localhost:3000
https://your-app-name.onrender.com
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
https://your-app-name.onrender.com/api/auth/callback/google
```

## 📞 Getting Help

### **Useful Resources**
- [NextAuth.js Google Provider Documentation](https://next-auth.js.org/configuration/providers/google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Render Documentation](https://docs.render.com)

### **Debug Mode**

To enable debug mode, add this to your environment variables:
```
NODE_ENV=development
```

This will show more detailed error messages in the logs.

## ✅ Checklist

- [ ] Google OAuth client has correct redirect URI
- [ ] Environment variables are set in Render
- [ ] `NEXTAUTH_URL` matches your Render app URL
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- [ ] Google+ API is enabled in your Google Cloud project
- [ ] Render service has been restarted after environment variable changes

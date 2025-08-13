#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function setupGoogleAuth() {
  console.log('🔐 Google OAuth Setup for GeoBilling')
  console.log('=====================================')
  console.log('')
  console.log('📋 Prerequisites:')
  console.log('1. Go to https://console.cloud.google.com/')
  console.log('2. Create a new project or select existing one')
  console.log('3. Enable Google+ API')
  console.log('4. Create OAuth 2.0 credentials')
  console.log('5. Add authorized redirect URIs:')
  console.log('   - http://localhost:3000/api/auth/callback/google')
  console.log('   - http://localhost:3001/api/auth/callback/google')
  console.log('')
  
  const clientId = await question('Enter your Google Client ID: ')
  const clientSecret = await question('Enter your Google Client Secret: ')
  
  if (!clientId || !clientSecret) {
    console.log('❌ Client ID and Client Secret are required!')
    rl.close()
    return
  }
  
  const envPath = path.join(process.cwd(), '.env')
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found. Please run the database setup first.')
    rl.close()
    return
  }
  
  let envContent = fs.readFileSync(envPath, 'utf8')
  
  // Update Google OAuth credentials
  envContent = envContent.replace(
    /GOOGLE_CLIENT_ID="[^"]*"/,
    `GOOGLE_CLIENT_ID="${clientId}"`
  )
  envContent = envContent.replace(
    /GOOGLE_CLIENT_SECRET="[^"]*"/,
    `GOOGLE_CLIENT_SECRET="${clientSecret}"`
  )
  
  // Update NextAuth URL
  envContent = envContent.replace(
    /NEXTAUTH_URL="[^"]*"/,
    'NEXTAUTH_URL="http://localhost:3000"'
  )
  
  // Generate a secure NextAuth secret if not already set
  if (envContent.includes('NEXTAUTH_SECRET="your-nextauth-secret-key-here"')) {
    const crypto = require('crypto')
    const secret = crypto.randomBytes(32).toString('hex')
    envContent = envContent.replace(
      /NEXTAUTH_SECRET="[^"]*"/,
      `NEXTAUTH_SECRET="${secret}"`
    )
  }
  
  fs.writeFileSync(envPath, envContent)
  
  console.log('')
  console.log('✅ Google OAuth credentials updated successfully!')
  console.log('')
  console.log('📋 Next steps:')
  console.log('1. Restart your development server: npm run dev')
  console.log('2. Visit: http://localhost:3000')
  console.log('3. You should be redirected to the sign-in page')
  console.log('4. Click "Continue with Google" to test authentication')
  console.log('')
  console.log('🔧 If you encounter issues:')
  console.log('- Check that your redirect URIs are correct in Google Console')
  console.log('- Ensure the Google+ API is enabled')
  console.log('- Verify your credentials are correct')
  console.log('')
  
  rl.close()
}

setupGoogleAuth().catch(console.error)

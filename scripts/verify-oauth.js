#!/usr/bin/env node

/**
 * Google OAuth Configuration Verification Script
 * Run this to check if your OAuth setup is correct
 */

console.log('🔍 Google OAuth Configuration Checker');
console.log('=====================================\n');

// Check if we're in a production environment
const isProduction = process.env.NODE_ENV === 'production';
console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);

// Check required environment variables
const requiredVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET'
];

console.log('\n📋 Environment Variables Check:');
console.log('--------------------------------');

let allVarsPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive values
    const displayValue = varName.includes('SECRET') || varName.includes('KEY') 
      ? `${value.substring(0, 8)}...` 
      : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    allVarsPresent = false;
  }
});

console.log('\n🔗 OAuth Redirect URI Check:');
console.log('----------------------------');

const nextAuthUrl = process.env.NEXTAUTH_URL;
if (nextAuthUrl) {
  const redirectUri = `${nextAuthUrl}/api/auth/callback/google`;
  console.log(`Expected redirect URI: ${redirectUri}`);
  console.log('\n📝 Make sure this URI is added to your Google OAuth client:');
  console.log('1. Go to https://console.cloud.google.com');
  console.log('2. Navigate to APIs & Services > Credentials');
  console.log('3. Edit your OAuth 2.0 Client ID');
  console.log('4. Add the redirect URI above to "Authorized redirect URIs"');
} else {
  console.log('❌ NEXTAUTH_URL not set - cannot determine redirect URI');
}

console.log('\n🎯 Next Steps:');
console.log('---------------');
if (allVarsPresent) {
  console.log('✅ All environment variables are set');
  console.log('🔧 Make sure your Google OAuth client has the correct redirect URI');
  console.log('🔄 Restart your application after making changes');
} else {
  console.log('❌ Some environment variables are missing');
  console.log('🔧 Set the missing variables in your environment');
}

console.log('\n📖 For more help, see: https://next-auth.js.org/configuration/providers/google');

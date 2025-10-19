#!/usr/bin/env node

/**
 * Render Configuration Verification Script
 * Run this to check if all required environment variables are set
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('\n🔍 GeoBilling Render Configuration Verification\n');
  console.log('This script will help you verify your Render.com deployment settings.\n');

  const config = {};

  // Check required environment variables
  console.log('📋 Checking Environment Variables...\n');

  // Get Render app URL
  config.NEXTAUTH_URL = await ask('1. What is your Render app URL? (e.g., https://geobilling.onrender.com): ');
  
  // Validate URL format
  if (!config.NEXTAUTH_URL.startsWith('https://')) {
    console.log('⚠️  Warning: URL should start with https://');
    config.NEXTAUTH_URL = 'https://' + config.NEXTAUTH_URL.replace(/^http:\/\//, '');
  }
  
  // Remove trailing slash
  config.NEXTAUTH_URL = config.NEXTAUTH_URL.replace(/\/$/, '');

  // Get database URL
  config.DATABASE_URL = await ask('\n2. What is your Render External Database URL? (starts with postgresql://): ');
  
  if (!config.DATABASE_URL.startsWith('postgresql://')) {
    console.log('❌ Error: Database URL should start with postgresql://');
  }

  // Get NEXTAUTH_SECRET
  console.log('\n3. NEXTAUTH_SECRET should be: 6ySe/hY5VqZf24nKLsfr69q3jNHRYckxiP+BpEvZq/Y=');
  const secretConfirm = await ask('   Have you set this in Render? (yes/no): ');
  config.hasSecret = secretConfirm.toLowerCase() === 'yes';

  // Get Google OAuth
  const googleIdConfirm = await ask('\n4. Have you set GOOGLE_CLIENT_ID in Render? (yes/no): ');
  config.hasGoogleId = googleIdConfirm.toLowerCase() === 'yes';

  const googleSecretConfirm = await ask('\n5. Have you set GOOGLE_CLIENT_SECRET in Render? (yes/no): ');
  config.hasGoogleSecret = googleSecretConfirm.toLowerCase() === 'yes';

  // Get Resend API key
  config.RESEND_API_KEY = await ask('\n6. What is your Resend API key? (or type "skip" to skip): ');
  config.hasResend = config.RESEND_API_KEY !== 'skip' && config.RESEND_API_KEY.length > 0;

  // Check Google OAuth redirect URIs
  console.log('\n7. Google OAuth Redirect URIs Configuration:');
  console.log(`   You need to add these URLs to your Google OAuth app:`);
  console.log(`   - Authorized JavaScript origins: ${config.NEXTAUTH_URL}`);
  console.log(`   - Authorized redirect URIs: ${config.NEXTAUTH_URL}/api/auth/callback/google`);
  const googleOAuthConfirm = await ask('   Have you added these to Google Console? (yes/no): ');
  config.hasGoogleOAuth = googleOAuthConfirm.toLowerCase() === 'yes';

  // Summary
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 CONFIGURATION SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const checks = [
    { name: 'Render App URL', status: config.NEXTAUTH_URL ? '✅' : '❌', value: config.NEXTAUTH_URL },
    { name: 'Database URL', status: config.DATABASE_URL.startsWith('postgresql://') ? '✅' : '❌', value: config.DATABASE_URL ? '***hidden***' : 'Not set' },
    { name: 'NEXTAUTH_SECRET', status: config.hasSecret ? '✅' : '❌', value: config.hasSecret ? 'Set' : 'Not set' },
    { name: 'GOOGLE_CLIENT_ID', status: config.hasGoogleId ? '✅' : '❌', value: config.hasGoogleId ? 'Set' : 'Not set' },
    { name: 'GOOGLE_CLIENT_SECRET', status: config.hasGoogleSecret ? '✅' : '❌', value: config.hasGoogleSecret ? 'Set' : 'Not set' },
    { name: 'RESEND_API_KEY', status: config.hasResend ? '✅' : '⚠️ ', value: config.hasResend ? 'Set' : 'Not set (optional)' },
    { name: 'Google OAuth Redirect URIs', status: config.hasGoogleOAuth ? '✅' : '❌', value: config.hasGoogleOAuth ? 'Configured' : 'Not configured' },
  ];

  checks.forEach(check => {
    console.log(`${check.status} ${check.name.padEnd(30)} ${check.value}`);
  });

  // Environment variables for Render
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 ENVIRONMENT VARIABLES FOR RENDER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Copy these to your Render web service Environment settings:\n');
  
  console.log(`DATABASE_URL=${config.DATABASE_URL}`);
  console.log(`NEXTAUTH_URL=${config.NEXTAUTH_URL}`);
  console.log(`NEXTAUTH_SECRET=6ySe/hY5VqZf24nKLsfr69q3jNHRYckxiP+BpEvZq/Y=`);
  console.log(`GOOGLE_CLIENT_ID=<your-google-client-id>`);
  console.log(`GOOGLE_CLIENT_SECRET=<your-google-client-secret>`);
  if (config.hasResend) {
    console.log(`RESEND_API_KEY=${config.RESEND_API_KEY}`);
  }

  // Next steps
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 NEXT STEPS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const allGood = checks.filter(c => c.status === '❌').length === 0;
  
  if (allGood) {
    console.log('✅ All required configuration looks good!\n');
    console.log('1. Make sure all environment variables are set in Render');
    console.log('2. Deploy your app to Render');
    console.log('3. After deployment, run this command from Render Shell:');
    console.log('   npx prisma db push\n');
    console.log('4. Test your deployment at:', config.NEXTAUTH_URL);
  } else {
    console.log('❌ Some configuration items need attention. Please fix the items marked with ❌ above.\n');
    console.log('See DEPLOYMENT.md for detailed instructions.');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  rl.close();
}

main().catch(console.error);


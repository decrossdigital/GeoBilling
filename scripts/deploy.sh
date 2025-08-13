#!/bin/bash

# GeoBilling Deployment Script for Render.com
# This script helps prepare and deploy the application

echo "🚀 GeoBilling Deployment Script"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Git repository not found. Please initialize git first."
    exit 1
fi

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please create it first."
    exit 1
fi

echo "✅ Pre-deployment checks passed"

# Build the application locally to catch any build errors
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors before deploying."
    exit 1
fi

echo "✅ Build successful"

# Check if all required environment variables are documented
echo "📋 Checking environment variables..."
if [ ! -f "env.example" ]; then
    echo "⚠️  Warning: env.example not found"
else
    echo "✅ Environment variables documented"
fi

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Prisma generation failed."
    exit 1
fi

echo "✅ Prisma client generated"

# Check for any linting errors
echo "🔍 Running linting checks..."
npm run lint

if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Linting issues found. Consider fixing them before deployment."
else
    echo "✅ Linting passed"
fi

echo ""
echo "🎉 Pre-deployment checks completed!"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for deployment'"
echo "   git push origin main"
echo ""
echo "2. Deploy to Render.com:"
echo "   - Go to https://render.com"
echo "   - Click 'New +' → 'Blueprint'"
echo "   - Connect your GitHub repository"
echo "   - Render will automatically deploy using render.yaml"
echo ""
echo "3. Configure environment variables in Render dashboard"
echo "4. Test your deployed application"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"

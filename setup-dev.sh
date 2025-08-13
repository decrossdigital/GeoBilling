#!/bin/bash

# 🚀 GeoBilling Development Setup Script
# This script will set up the development environment for GeoBilling

set -e

echo "🎵 Welcome to GeoBilling Development Setup!"
echo "=========================================="

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed."
    echo "Please install PostgreSQL first:"
    echo "  macOS: brew install postgresql@15"
    echo "  Ubuntu: sudo apt install postgresql postgresql-contrib"
    echo "  Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

echo "✅ PostgreSQL is installed"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    if [ -f env.example ]; then
        cp env.example .env
        echo "✅ .env file created"
    else
        echo "❌ env.example not found. Please create .env file manually."
        exit 1
    fi
else
    echo "✅ .env file already exists"
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL" .env; then
    echo "❌ DATABASE_URL not found in .env file"
    echo "Please add your database URL to .env file:"
    echo "DATABASE_URL=\"postgresql://geobilling:password@localhost:5432/geobilling_dev\""
    exit 1
fi

echo "✅ DATABASE_URL is configured"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Push schema to database
echo "🗄️ Pushing schema to database..."
npm run db:push

# Seed database
echo "🌱 Seeding database with initial data..."
npm run db:seed

echo ""
echo "🎉 Setup completed successfully!"
echo "=========================================="
echo ""
echo "📋 Next steps:"
echo "1. Start the development server: npm run dev"
echo "2. Visit: http://localhost:3000"
echo "3. Sign up with Google OAuth"
echo "4. Configure your settings in the Settings page"
echo ""
echo "🔧 Useful commands:"
echo "  npm run dev          - Start development server"
echo "  npm run db:studio    - Open database GUI"
echo "  npm run db:migrate   - Create and run migrations"
echo "  npm run db:seed      - Re-seed database"
echo ""
echo "📚 Documentation:"
echo "  - Database setup: DATABASE_SETUP.md"
echo "  - Prisma docs: https://www.prisma.io/docs"
echo "  - Render docs: https://render.com/docs"
echo ""
echo "🎵 Happy coding with GeoBilling!"

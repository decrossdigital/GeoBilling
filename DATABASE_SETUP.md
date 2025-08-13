# 🗄️ Database Setup Guide

This guide will help you set up the database for GeoBilling in both development and production environments.

## 🚀 Quick Start (Development)

### Option 1: Local PostgreSQL (Recommended)

1. **Install PostgreSQL**
   ```bash
   # macOS (using Homebrew)
   brew install postgresql@15
   brew services start postgresql@15
   
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database**
   ```bash
   # Create user and database
   createdb geobilling_dev
   
   # Or using psql
   psql postgres
   CREATE USER geobilling WITH PASSWORD 'password';
   CREATE DATABASE geobilling_dev OWNER geobilling;
   GRANT ALL PRIVILEGES ON DATABASE geobilling_dev TO geobilling;
   \q
   ```

3. **Set Environment Variables**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your database URL
   DATABASE_URL="postgresql://geobilling:password@localhost:5432/geobilling_dev"
   ```

4. **Setup Database**
   ```bash
   # Install dependencies
   npm install
   
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed with initial data
   npm run db:seed
   ```

### Option 2: Docker PostgreSQL

1. **Run PostgreSQL Container**
   ```bash
   docker run --name geobilling-postgres \
     -e POSTGRES_DB=geobilling_dev \
     -e POSTGRES_USER=geobilling \
     -e POSTGRES_PASSWORD=password \
     -p 5432:5432 \
     -d postgres:15
   ```

2. **Setup Database**
   ```bash
   # Set environment variables
   DATABASE_URL="postgresql://geobilling:password@localhost:5432/geobilling_dev"
   
   # Setup database
   npm run db:setup
   ```

### Option 3: Supabase (Free Tier)

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up and create a new project

2. **Get Database URL**
   - Go to Settings > Database
   - Copy the connection string
   - Format: `postgresql://postgres:[password]@[host]:5432/postgres`

3. **Setup Database**
   ```bash
   # Set environment variables
   DATABASE_URL="your-supabase-connection-string"
   
   # Setup database
   npm run db:setup
   ```

## 🌐 Production Setup (Render.com)

### 1. Create PostgreSQL Database on Render

1. **Sign up for Render**
   - Go to [render.com](https://render.com)
   - Create an account

2. **Create PostgreSQL Service**
   - Click "New +" > "PostgreSQL"
   - Choose a name: `geobilling-db`
   - Select region closest to you
   - Choose plan (Free tier available)
   - Click "Create Database"

3. **Get Connection Details**
   - Go to your PostgreSQL service
   - Copy the "External Database URL"
   - Format: `postgresql://username:password@host:5432/database`

### 2. Deploy Application

1. **Connect GitHub Repository**
   - In Render, click "New +" > "Web Service"
   - Connect your GitHub repository
   - Choose the repository

2. **Configure Environment Variables**
   ```bash
   # Required variables
   DATABASE_URL=your-render-postgresql-url
   NEXTAUTH_URL=https://your-app-name.onrender.com
   NEXTAUTH_SECRET=your-super-secret-key
   NODE_ENV=production
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # Stripe (Production keys)
   STRIPE_PUBLISHABLE_KEY=pk_live_your-key
   STRIPE_SECRET_KEY=sk_live_your-key
   STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
   
   # PayPal (Production keys)
   PAYPAL_CLIENT_ID=your-paypal-client-id
   PAYPAL_CLIENT_SECRET=your-paypal-client-secret
   PAYPAL_MODE=live
   
   # Resend
   RESEND_API_KEY=your-resend-api-key
   FROM_EMAIL=noreply@yourdomain.com
   ```

3. **Build Settings**
   ```bash
   Build Command: npm run build
   Start Command: npm start
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy your app

## 🔧 Database Commands

### Development Commands
```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Create and run migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio

# Seed database with initial data
npm run db:seed

# Complete database setup
npm run db:setup
```

### Production Commands
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npx prisma migrate deploy

# Seed production database (if needed)
npm run db:seed
```

## 🔐 Security Best Practices

### Development
- Use strong passwords for local databases
- Never commit `.env` files to version control
- Use different credentials for each environment

### Production
- Use environment variables for all secrets
- Enable SSL connections
- Regularly rotate database passwords
- Use connection pooling
- Enable database backups

## 📊 Database Schema Overview

The database includes the following main tables:

- **users** - User accounts and authentication
- **clients** - Client information
- **contractors** - Contractor/freelancer information
- **service_templates** - Predefined services
- **quotes** - Quote documents
- **quote_items** - Individual items in quotes
- **invoices** - Invoice documents
- **invoice_items** - Individual items in invoices
- **payments** - Payment records
- **settings** - Application settings
- **email_logs** - Email delivery tracking

## 🚨 Troubleshooting

### Common Issues

1. **Connection Refused**
   ```bash
   # Check if PostgreSQL is running
   brew services list | grep postgresql
   
   # Start PostgreSQL
   brew services start postgresql@15
   ```

2. **Authentication Failed**
   ```bash
   # Check database URL format
   DATABASE_URL="postgresql://username:password@host:5432/database"
   
   # Test connection
   psql "postgresql://username:password@host:5432/database"
   ```

3. **Schema Push Failed**
   ```bash
   # Reset database (WARNING: This will delete all data)
   npx prisma db push --force-reset
   
   # Or use migrations
   npx prisma migrate reset
   ```

4. **Render Deployment Issues**
   - Check build logs in Render dashboard
   - Verify environment variables are set
   - Ensure DATABASE_URL is correct
   - Check if PostgreSQL service is running

## 📞 Support

If you encounter issues:

1. Check the [Prisma documentation](https://www.prisma.io/docs)
2. Review [Render documentation](https://render.com/docs)
3. Check the application logs in Render dashboard
4. Verify all environment variables are set correctly

## 🎯 Next Steps

After database setup:

1. **Configure Authentication**
   - Set up Google OAuth in Google Cloud Console
   - Update environment variables

2. **Configure Payment Processing**
   - Set up Stripe account
   - Set up PayPal account
   - Update payment keys

3. **Configure Email**
   - Set up Resend.com account
   - Verify domain for sending emails

4. **Test the Application**
   - Create test clients
   - Generate test quotes and invoices
   - Test payment processing

5. **Go Live**
   - Switch to production payment keys
   - Update domain settings
   - Monitor application performance

# GeoBilling - Uniquitous Music

A professional billing and invoicing system designed specifically for music production services. Built with Next.js, TypeScript, and modern web technologies.

## Features

### Core Functionality
- **Quote-to-Invoice Workflow**: Create professional quotes and convert them to invoices
- **Client Management**: Comprehensive client database with contact information
- **Service Templates**: Pre-configured services for mixing, mastering, and editing
- **Payment Processing**: Integrated Stripe and PayPal payment systems
- **Contractor Management**: Track contractor costs and generate immediate invoices
- **Project Management**: Full project lifecycle from quote to completion

### Technical Features
- **Dark Mode**: Beautiful dark/light theme toggle
- **Mobile Responsive**: Optimized for all devices
- **Real-time Updates**: Live payment and status tracking
- **Email Notifications**: Automated email system with Resend
- **Professional Templates**: Customizable invoice and quote templates

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **Payments**: Stripe (primary) + PayPal (secondary)
- **Email**: Resend
- **UI Components**: Radix UI + Custom components
- **Forms**: React Hook Form + Zod validation

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Google OAuth credentials
- Stripe account
- PayPal account (optional)
- Resend account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd geobilling
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your credentials:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/geobilling"

   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret-key-here"

   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # Stripe
   STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
   STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
   STRIPE_WEBHOOK_SECRET="whsec_your-stripe-webhook-secret"

   # PayPal
   PAYPAL_CLIENT_ID="your-paypal-client-id"
   PAYPAL_CLIENT_SECRET="your-paypal-client-secret"
   PAYPAL_MODE="sandbox"

   # Resend
   RESEND_API_KEY="your-resend-api-key"

   # Company Information
   COMPANY_NAME="Uniquitous Music"
   COMPANY_EMAIL="george@uniquitousmusic.com"
   COMPANY_PHONE="(609) 316-8080"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The application uses a comprehensive database schema with the following main entities:

- **Users**: Authentication and user management
- **Clients**: Client information and contact details
- **ServiceTemplates**: Pre-configured services (mixing, mastering, etc.)
- **Quotes**: Professional quotes with line items
- **Invoices**: Generated invoices from quotes
- **Payments**: Payment tracking and processing
- **Projects**: Project lifecycle management
- **Contractors**: Contractor information and work tracking

## Key Workflows

### Quote Creation
1. Select or create a client
2. Choose service templates (mixing, mastering, editing)
3. Add custom items and adjust quantities
4. Set payment terms (50% upfront, 50% on completion)
5. Generate professional quote
6. Send to client for approval

### Contractor Payment
1. Add contractor to project
2. Track hours/sessions worked
3. Generate immediate invoice for contractor costs
4. Collect payment from client
5. Pay contractor immediately

### Project Management
1. Create project from approved quote
2. Track project status (pending, in progress, review, completed)
3. Manage contractor payments
4. Generate final invoice
5. Complete payment collection

## API Routes

The application includes the following API routes:

- `/api/auth/*` - NextAuth.js authentication
- `/api/clients/*` - Client management
- `/api/quotes/*` - Quote creation and management
- `/api/invoices/*` - Invoice generation and management
- `/api/payments/*` - Payment processing
- `/api/contractors/*` - Contractor management
- `/api/projects/*` - Project management

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email george@uniquitousmusic.com or create an issue in the repository.

## Company Information

**Uniquitous Music**
- Email: george@uniquitousmusic.com
- Phone: (609) 316-8080
- Services: Music Production, Mixing, Mastering, Editing
# Build command updated to skip migrations temporarily

# Payment Integration Plan for GeoBilling

## Overview
This document outlines the comprehensive plan for implementing payment processing capabilities in the GeoBilling application, including Stripe and PayPal integration, quote deposit payments, and public payment pages.

## Phase 1: Core Payment Infrastructure

### 1.1 Stripe Integration
**Setup Requirements:**
- Stripe account creation and API key configuration
- Install Stripe SDK: `npm install @stripe/stripe-js stripe`
- Environment variables setup:
  ```
  STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```

**Implementation Steps:**
1. **Payment Intent API Endpoint** (`/api/payments/create-intent`)
   - Create payment intents for invoices
   - Handle different payment amounts (full, partial, deposits)
   - Support multiple currencies

2. **Payment Confirmation API** (`/api/payments/confirm`)
   - Process successful payments
   - Update invoice status to 'paid'
   - Record payment details in database

3. **Webhook Handler** (`/api/webhooks/stripe`)
   - Handle payment success/failure events
   - Update invoice status in real-time
   - Send confirmation emails

### 1.2 PayPal Integration
**Setup Requirements:**
- PayPal Business account setup
- Install PayPal SDK: `npm install @paypal/react-paypal-js`
- Environment variables:
  ```
  PAYPAL_CLIENT_ID=...
  PAYPAL_CLIENT_SECRET=...
  PAYPAL_MODE=sandbox|live
  ```

**Implementation Steps:**
1. **PayPal Order API** (`/api/payments/paypal/create-order`)
   - Create PayPal orders for invoices
   - Handle different payment scenarios

2. **PayPal Capture API** (`/api/payments/paypal/capture`)
   - Capture payments after approval
   - Update invoice status

3. **PayPal Webhook Handler** (`/api/webhooks/paypal`)
   - Handle payment notifications
   - Update invoice status automatically

### 1.3 Database Schema Updates
**New Models Required:**

```prisma
model Payment {
  id              String   @id @default(cuid())
  invoiceId       String
  invoice         Invoice  @relation(fields: [invoiceId], references: [id])
  amount          Decimal  @db.Decimal(10, 2)
  currency        String   @default("USD")
  paymentMethod   String   // "stripe", "paypal", "manual"
  paymentStatus   String   // "pending", "completed", "failed", "refunded"
  transactionId   String?  // External payment processor ID
  paymentDate     DateTime @default(now())
  metadata        Json?    // Additional payment data
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model PaymentLink {
  id              String   @id @default(cuid())
  invoiceId       String
  invoice         Invoice  @relation(fields: [invoiceId], references: [id])
  token           String   @unique // Secure random token
  expiresAt       DateTime
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
}
```

**Invoice Model Updates:**
```prisma
model Invoice {
  // ... existing fields ...
  paymentStatus   String   @default("unpaid") // "unpaid", "partial", "paid"
  paymentMethod   String?
  paymentReference String?
  payments        Payment[]
  paymentLinks    PaymentLink[]
}
```

## Phase 2: Public Payment Pages

### 2.1 Public Payment Page (`/pay/[token]`)
**Features:**
- Unauthenticated access for clients
- Display invoice details and payment options
- Stripe and PayPal payment buttons
- Payment status updates in real-time
- Mobile-responsive design

**Security Considerations:**
- Token-based access with expiration
- Rate limiting for payment attempts
- Secure payment processing
- HTTPS enforcement

### 2.2 Payment Link Generation
**Implementation:**
- Generate secure, unique tokens for each invoice
- Configurable expiration dates (default: 30 days)
- Email integration for sending payment links
- Link tracking and analytics

**API Endpoints:**
- `POST /api/invoices/[id]/payment-link` - Generate payment link
- `GET /api/payments/[token]/verify` - Verify payment link validity

## Phase 3: Quote Deposit Payments

### 3.1 Quote Payment Integration
**Features:**
- Add payment buttons to quote detail page
- Support for 50% deposit payments
- Link deposit payments to generated invoices
- Update quote status after deposit payment

**Implementation:**
1. **Quote Payment API** (`/api/quotes/[id]/payment`)
   - Create payment intents for quote deposits
   - Handle partial payments
   - Update quote status

2. **Deposit Tracking**
   - Record deposit payments in database
   - Link deposits to generated invoices
   - Calculate remaining balance

### 3.2 Quote-to-Invoice Conversion Enhancement
**Current Flow Enhancement:**
- When converting quote to invoice, include deposit information
- Calculate remaining balance after deposit
- Show deposit history in invoice detail

## Phase 4: Advanced Payment Features

### 4.1 Payment Management
**Features:**
- Partial payment support
- Payment reminders and notifications
- Payment fee handling
- Multiple payment method support
- Payment history tracking

### 4.2 Payment Reminders
**Implementation:**
- Automated email reminders for overdue invoices
- Configurable reminder schedules
- Payment link inclusion in reminders
- Reminder tracking and analytics

### 4.3 Payment Analytics
**Features:**
- Payment success rates by method
- Average time to payment
- Payment method preferences
- Revenue tracking and reporting

## Phase 5: Security and Compliance

### 5.1 Security Measures
- PCI DSS compliance considerations
- Secure payment data handling
- Fraud detection and prevention
- Audit logging for all payment activities

### 5.2 Data Protection
- Encryption of sensitive payment data
- Secure storage of payment tokens
- GDPR compliance for payment data
- Data retention policies

## Implementation Timeline

### Week 1-2: Core Infrastructure
- Set up Stripe and PayPal accounts
- Implement basic payment APIs
- Database schema updates
- Basic payment processing

### Week 3-4: Public Payment Pages
- Create public payment page
- Payment link generation
- Email integration
- Security implementation

### Week 5-6: Quote Deposits
- Quote payment integration
- Deposit tracking
- Enhanced quote-to-invoice conversion

### Week 7-8: Advanced Features
- Payment reminders
- Analytics and reporting
- Security hardening
- Testing and optimization

## Configuration Options

### Payment Settings
```typescript
interface PaymentConfig {
  // Stripe Configuration
  stripe: {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
  };
  
  // PayPal Configuration
  paypal: {
    clientId: string;
    clientSecret: string;
    mode: 'sandbox' | 'live';
  };
  
  // Payment Link Settings
  paymentLinks: {
    defaultExpiryDays: number;
    maxAttempts: number;
  };
  
  // Reminder Settings
  reminders: {
    enabled: boolean;
    schedule: {
      firstReminder: number; // days after due date
      secondReminder: number;
      finalReminder: number;
    };
  };
}
```

## Testing Strategy

### Unit Tests
- Payment API endpoints
- Payment link generation
- Database operations
- Security validations

### Integration Tests
- Stripe payment flow
- PayPal payment flow
- Webhook handling
- Email notifications

### End-to-End Tests
- Complete payment workflows
- Quote-to-invoice conversion
- Public payment page functionality
- Mobile responsiveness

## Monitoring and Analytics

### Key Metrics
- Payment success rates
- Average payment time
- Payment method usage
- Revenue tracking
- Error rates and types

### Monitoring Tools
- Payment processor dashboards
- Application performance monitoring
- Error tracking and alerting
- User behavior analytics

## Future Enhancements

### Additional Payment Methods
- Apple Pay integration
- Google Pay integration
- Bank transfers (ACH)
- International payment methods

### Advanced Features
- Recurring payments
- Payment plans
- Automatic payment retries
- Advanced fraud detection
- Multi-currency support

### Business Intelligence
- Advanced payment analytics
- Predictive payment modeling
- Customer payment behavior analysis
- Revenue forecasting

## Notes
- All payment processing should be PCI DSS compliant
- Implement proper error handling and logging
- Consider implementing a payment gateway abstraction layer
- Plan for scalability and high availability
- Regular security audits and updates

# Email Templates Analysis

## Currently Used Email Templates

### 1. **Reusable Template Functions** (in `src/lib/email.ts`)

#### a. `sendQuoteEmail`
- **Purpose**: Basic quote notification email
- **Location**: `src/lib/email.ts:33-95`
- **Used in**: `src/app/api/email/send-quote/route.ts`
- **Status**: ✅ Template function (but may be outdated/unused)

#### b. `sendInvoiceEmail`
- **Purpose**: Standard invoice email with payment history
- **Location**: `src/lib/email.ts:97-233`
- **Used in**: 
  - `src/app/api/invoices/send-email/route.ts` (for resend/standard sends)
  - `src/app/api/email/send-invoice/route.ts`
- **Features**: 
  - Payment history display
  - Balance due calculation
  - Terms & Conditions section
  - Payment button
- **Status**: ✅ Active and well-structured

#### c. `sendPaymentConfirmationEmail`
- **Purpose**: Payment confirmation after invoice payment
- **Location**: `src/lib/email.ts:235-298`
- **Used in**: Currently **NOT USED** anywhere
- **Status**: ⚠️ Defined but unused

#### d. `sendContractorFeeEmail`
- **Purpose**: Individual contractor fee payment request
- **Location**: `src/lib/email.ts:300-368`
- **Used in**: Currently **NOT USED** anywhere
- **Status**: ⚠️ Defined but unused (we use inline templates instead)

#### e. `sendBulkContractorFeeEmail`
- **Purpose**: Bulk contractor fee payment request
- **Location**: `src/lib/email.ts:370-452`
- **Used in**: Currently **NOT USED** anywhere
- **Status**: ⚠️ Defined but unused (we use inline templates instead)

### 2. **Inline HTML Templates** (embedded in API routes)

#### a. **Client Generic Email** (`src/app/api/clients/send-email/route.ts`)
- **Purpose**: Generic client communication
- **Location**: `src/app/api/clients/send-email/route.ts:40-66`
- **Features**: Custom subject and message
- **Status**: ✅ Working but could be a template function

#### b. **Quote Approval - Client Confirmation** (`src/app/api/quotes/[id]/approve/route.ts`)
- **Purpose**: Confirmation email after quote approval
- **Location**: `src/app/api/quotes/[id]/approve/route.ts:316-329`
- **Features**: Payment details, thank you message
- **Status**: ⚠️ Inline HTML - should be template function

#### c. **Quote Approval - Admin Notification** (`src/app/api/quotes/[id]/approve/route.ts`)
- **Purpose**: Admin notification when quote is approved
- **Location**: `src/app/api/quotes/[id]/approve/route.ts:343-355`
- **Features**: Quote details, payment info, links to quote/invoice
- **Status**: ⚠️ Inline HTML - should be template function

#### d. **Quote Feedback - Client Confirmation** (`src/app/api/quotes/[id]/feedback/route.ts`)
- **Purpose**: Confirmation when client submits feedback
- **Location**: `src/app/api/quotes/[id]/feedback/route.ts:78-86`
- **Features**: Thank you message
- **Status**: ⚠️ Inline HTML - should be template function

#### e. **Quote Feedback - Admin Notification** (`src/app/api/quotes/[id]/feedback/route.ts`)
- **Purpose**: Admin notification with feedback details
- **Location**: `src/app/api/quotes/[id]/feedback/route.ts:97-117`
- **Features**: Feedback reasons, comments, quote link
- **Status**: ⚠️ Inline HTML - should be template function

#### f. **Contractor Fee Payment - Client Confirmation (Bulk)** (`src/app/api/invoices/[id]/contractors/bulk-pay/route.ts`)
- **Purpose**: Confirmation after bulk contractor fee payment
- **Location**: `src/app/api/invoices/[id]/contractors/bulk-pay/route.ts:160-198`
- **Features**: Payment details, contractor list, transaction ID
- **Status**: ⚠️ Inline HTML - template exists but unused

#### g. **Contractor Fee Payment - Admin Notification (Bulk)** (`src/app/api/invoices/[id]/contractors/bulk-pay/route.ts`)
- **Purpose**: Admin notification for bulk contractor payment
- **Location**: `src/app/api/invoices/[id]/contractors/bulk-pay/route.ts:208-237`
- **Features**: Payment details, contractor list
- **Status**: ⚠️ Inline HTML - should be template function

#### h. **Contractor Fee Payment - Client Confirmation (Individual)** (`src/app/api/invoices/[id]/contractors/[contractorId]/pay/route.ts`)
- **Purpose**: Confirmation after individual contractor fee payment
- **Location**: `src/app/api/invoices/[id]/contractors/[contractorId]/pay/route.ts:151-189`
- **Features**: Payment details, single contractor
- **Status**: ⚠️ Inline HTML - template exists but unused

#### i. **Contractor Fee Payment - Admin Notification (Individual)** (`src/app/api/invoices/[id]/contractors/[contractorId]/pay/route.ts`)
- **Purpose**: Admin notification for individual contractor payment
- **Location**: `src/app/api/invoices/[id]/contractors/[contractorId]/pay/route.ts:199-228`
- **Features**: Payment details, single contractor
- **Status**: ⚠️ Inline HTML - should be template function

#### j. **Quote Send Email** (via template processor)
- **Purpose**: Custom quote email with template variables
- **Location**: `src/app/api/quotes/send-email/route.ts:60-71`
- **Features**: Uses `processQuoteTemplate` with merge fields
- **Status**: ✅ Uses template processor (but basic HTML conversion)

---

## Opportunities to Use Email Templates

### 1. **Quote Approval Emails** → Create templates
- **Current**: Inline HTML in `src/app/api/quotes/[id]/approve/route.ts`
- **Recommendation**: Create `sendQuoteApprovalConfirmationEmail` and `sendQuoteApprovalAdminNotification` functions

### 2. **Quote Feedback Emails** → Create templates
- **Current**: Inline HTML in `src/app/api/quotes/[id]/feedback/route.ts`
- **Recommendation**: Create `sendQuoteFeedbackConfirmationEmail` and `sendQuoteFeedbackAdminNotification` functions

### 3. **Contractor Fee Payment Confirmations** → Use existing templates
- **Current**: Inline HTML in bulk-pay and individual pay routes
- **Recommendation**: 
  - Use `sendPaymentConfirmationEmail` (already exists but unused)
  - Create `sendContractorFeePaymentConfirmationEmail` for contractor-specific confirmations
  - Create `sendContractorFeePaymentAdminNotification` for admin notifications

### 4. **Contractor Fee Payment Requests** → Use existing templates
- **Current**: Inline templates in billing routes
- **Recommendation**: 
  - Use `sendContractorFeeEmail` (already exists)
  - Use `sendBulkContractorFeeEmail` (already exists)

### 5. **Client Generic Email** → Create template
- **Current**: Inline HTML in `src/app/api/clients/send-email/route.ts`
- **Recommendation**: Create `sendClientEmail` template function

### 6. **Invoice Payment Confirmation** → Use existing template
- **Current**: Not implemented (payment via Stripe would trigger this)
- **Recommendation**: Use `sendPaymentConfirmationEmail` when payment is completed

---

## Summary

### ✅ Well-Structured Templates (Active)
1. `sendInvoiceEmail` - Comprehensive invoice email
2. Quote send email (via template processor)

### ⚠️ Templates Defined But Unused
1. `sendPaymentConfirmationEmail` - Should be used for invoice payments
2. `sendContractorFeeEmail` - Should be used for individual contractor billing
3. `sendBulkContractorFeeEmail` - Should be used for bulk contractor billing

### ❌ Inline HTML That Should Be Templates
1. Quote approval confirmations (client + admin)
2. Quote feedback confirmations (client + admin)
3. Contractor fee payment confirmations (client + admin) - 4 instances
4. Client generic email

### 📊 Statistics
- **Total Template Functions**: 5
- **Active Template Functions**: 1 (sendInvoiceEmail)
- **Unused Template Functions**: 3
- **Inline HTML Templates**: 9
- **Total Email Sending Locations**: 11

---

## Recommendations

1. **Immediate Actions**:
   - Use existing `sendContractorFeeEmail` and `sendBulkContractorFeeEmail` in billing routes
   - Create template functions for quote approval/feedback emails
   - Use `sendPaymentConfirmationEmail` when implementing invoice payment confirmations

2. **Refactoring Priority**:
   - High: Contractor fee payment emails (duplicate code, templates exist)
   - Medium: Quote approval/feedback emails (frequently used)
   - Low: Client generic email (less frequently used)

3. **Template Structure**:
   - All templates should follow the same structure as `sendInvoiceEmail`
   - Include company branding consistently
   - Support customization while maintaining consistency


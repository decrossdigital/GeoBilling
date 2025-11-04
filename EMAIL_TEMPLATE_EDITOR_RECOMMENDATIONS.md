# Email Template Editor Recommendations

## Current State
The settings page currently has an editor for **Quote Email Template** with:
- Subject line editor (with merge fields)
- Body editor (with merge fields like `{{quoteNumber}}`, `{{clientName}}`, etc.)
- Stored in localStorage
- Processed by `processQuoteTemplate` function

---

## Recommended Templates for Settings Page Editors

### 🟢 **HIGH PRIORITY** - Add Editors

#### 1. **Invoice Email Template** ⭐⭐⭐
- **Why**: Client-facing, sent frequently, important for payment collection
- **Similar to**: Quote email (same pattern)
- **Merge Fields Needed**:
  - `{{invoiceNumber}}`
  - `{{clientName}}`
  - `{{project}}`
  - `{{total}}`
  - `{{dueDate}}`
  - `{{balanceDue}}`
  - `{{invoiceUrl}}`
  - `{{terms}}`
  - `{{termsUrl}}`
  - `{{paymentHistory}}` (formatted section)
  - `{{companyName}}`, `{{companyEmail}}`, `{{companyPhone}}`
- **Current State**: Uses `sendInvoiceEmail` function with hardcoded HTML
- **Recommendation**: Add editor similar to quote template, create `processInvoiceTemplate` function

#### 2. **Client Generic Email Template** ⭐⭐⭐
- **Why**: Used for general client communication, needs maximum flexibility
- **Similar to**: Quote email (customizable messaging)
- **Merge Fields Needed**:
  - `{{clientName}}`
  - `{{clientEmail}}`
  - `{{companyName}}`, `{{companyEmail}}`, `{{companyPhone}}`
  - Custom message field (user types directly)
- **Current State**: Inline HTML in `src/app/api/clients/send-email/route.ts`
- **Recommendation**: Add editor with subject and body fields, simpler than quote template

---

### 🟡 **MEDIUM PRIORITY** - Consider Adding Editors

#### 3. **Contractor Fee Payment Request Template** ⭐⭐
- **Why**: Important for business cash flow, sent to clients
- **Similar to**: Invoice email (payment-related)
- **Merge Fields Needed**:
  - `{{invoiceNumber}}`
  - `{{clientName}}`
  - `{{contractorName}}` or `{{contractorList}}` (for bulk)
  - `{{amount}}`
  - `{{paymentUrl}}`
  - `{{companyName}}`, `{{companyEmail}}`, `{{companyPhone}}`
- **Current State**: Uses `sendContractorFeeEmail` and `sendBulkContractorFeeEmail` (unused) or inline HTML
- **Recommendation**: Add editor if contractor billing becomes frequent, otherwise keep as template functions

#### 4. **Quote Approval Confirmation Template** ⭐
- **Why**: Client-facing automated email, but less critical than quote/invoice
- **Similar to**: Payment confirmation (automated)
- **Merge Fields Needed**:
  - `{{quoteNumber}}`
  - `{{clientName}}`
  - `{{project}}`
  - `{{paymentType}}` (deposit/full)
  - `{{paymentAmount}}`
  - `{{companyName}}`, `{{companyEmail}}`, `{{companyPhone}}`
- **Current State**: Inline HTML in `src/app/api/quotes/[id]/approve/route.ts`
- **Recommendation**: Lower priority - could be a simple template function instead

---

### 🔴 **LOW PRIORITY** - Don't Add Editors (Keep as Template Functions)

#### 5. **Payment Confirmation Templates**
- **Why**: Automated, standardized, rarely need customization
- **Examples**:
  - Invoice payment confirmation
  - Contractor fee payment confirmation
- **Recommendation**: Keep as template functions in `email.ts`, no editor needed

#### 6. **Admin Notification Templates**
- **Why**: Internal use, not client-facing
- **Examples**:
  - Quote approval admin notification
  - Quote feedback admin notification
  - Contractor payment admin notification
- **Recommendation**: Keep as inline HTML or template functions, no editor needed

#### 7. **Quote Feedback Confirmation**
- **Why**: Automated, less critical messaging
- **Recommendation**: Keep as template function, no editor needed

---

## Implementation Recommendations

### Phase 1: High Priority (Do First)
1. **Invoice Email Template Editor**
   - Add to settings page (similar to quote template section)
   - Create `processInvoiceTemplate` function
   - Update `sendInvoiceEmail` to use template processor
   - Merge fields: invoice details, payment history, terms

2. **Client Generic Email Template Editor**
   - Add simpler editor (subject + body)
   - Create `processClientEmailTemplate` function
   - Update client send-email route to use template

### Phase 2: Medium Priority (Consider Later)
3. **Contractor Fee Payment Request Template**
   - Only if contractor billing becomes a frequent feature
   - Create `processContractorFeeTemplate` function
   - Support both individual and bulk templates

### Phase 3: Keep as Functions (No Editors)
- Payment confirmations
- Admin notifications
- Automated confirmations

---

## Settings Page UI Structure

### Recommended Layout:
```
Settings Page
├── Company Information
├── Tax Settings
├── Email Templates (NEW SECTION)
│   ├── Quote Email Template [EXISTING]
│   ├── Invoice Email Template [NEW - HIGH PRIORITY]
│   ├── Client Generic Email Template [NEW - HIGH PRIORITY]
│   └── Contractor Fee Payment Request Template [NEW - MEDIUM PRIORITY]
└── Skills Management
```

### Template Editor Pattern:
Each template editor should have:
1. **Subject Field** - Single line input with merge field hints
2. **Body Field** - Multi-line textarea with merge field hints
3. **Available Merge Fields** - Collapsible section showing all available fields
4. **Preview** - Optional preview button (if time permits)

---

## Merge Field Documentation

### Quote Template (Existing)
- `{{quoteNumber}}`, `{{project}}`, `{{clientName}}`, `{{total}}`, `{{validUntil}}`
- `{{servicesSection}}`, `{{contractorsSection}}`, `{{notes}}`, `{{terms}}`
- `{{approvalUrl}}`, `{{termsUrl}}`
- `{{companyName}}`, `{{companyEmail}}`, `{{companyPhone}}`

### Invoice Template (Proposed)
- `{{invoiceNumber}}`, `{{project}}`, `{{clientName}}`, `{{total}}`, `{{dueDate}}`
- `{{balanceDue}}`, `{{paymentHistory}}` (formatted section)
- `{{invoiceUrl}}`, `{{terms}}`, `{{termsUrl}}`
- `{{companyName}}`, `{{companyEmail}}`, `{{companyPhone}}`

### Client Generic Email (Proposed)
- `{{clientName}}`, `{{clientEmail}}`
- `{{companyName}}`, `{{companyEmail}}`, `{{companyPhone}}`
- Custom message field (user types directly, no merge fields needed)

---

## Summary

**Must Have Editors:**
1. ✅ Quote Email Template (already exists)
2. 🆕 Invoice Email Template (high priority)
3. 🆕 Client Generic Email Template (high priority)

**Nice to Have Editors:**
4. Contractor Fee Payment Request Template (medium priority - only if frequently used)

**Keep as Functions (No Editors):**
- Payment confirmations
- Admin notifications
- Automated confirmations

The key principle: **Client-facing emails that are sent manually or frequently should have editors. Automated system notifications don't need editors.**


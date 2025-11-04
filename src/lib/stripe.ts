import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
})

export const STRIPE_CONFIG = {
  currency: 'usd',
  paymentMethods: ['card'],
  successUrl: process.env.NEXTAUTH_URL + '/payment/success',
  cancelUrl: process.env.NEXTAUTH_URL + '/payment/cancel',
}

/**
 * Convert amount to Stripe's format (cents for USD)
 */
export function formatAmountForStripe(amount: number, currency: string = 'usd'): number {
  const numberAmount = Number(amount)
  if (isNaN(numberAmount)) {
    throw new Error('Invalid amount')
  }
  
  // For USD and other currencies that use cents, multiply by 100
  const zeroDecimalCurrencies = ['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf']
  
  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return Math.round(numberAmount)
  }
  
  return Math.round(numberAmount * 100)
}

/**
 * Create a Stripe payment intent
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  metadata: {
    invoiceId?: string
    userId?: string
    description?: string
    clientName?: string
    [key: string]: string | undefined
  } = {}
): Promise<Stripe.PaymentIntent> {
  const paymentAmount = formatAmountForStripe(amount, currency)
  
  return await stripe.paymentIntents.create({
    amount: paymentAmount,
    currency: currency.toLowerCase(),
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: metadata as Record<string, string>,
    description: metadata.description || 'Payment',
  })
}
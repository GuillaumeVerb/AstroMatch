import { NextRequest, NextResponse } from 'next/server'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ''
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || ''
const API_BASE = 'https://web-production-37fb.up.railway.app'

export async function POST(request: NextRequest) {
  try {
    if (!STRIPE_SECRET_KEY || !STRIPE_PRICE_ID) {
      return NextResponse.json(
        { error: 'Stripe configuration missing' },
        { status: 500 }
      )
    }

    const stripe = require('stripe')(STRIPE_SECRET_KEY)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/full-report?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


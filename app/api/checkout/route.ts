import { NextRequest, NextResponse } from 'next/server'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ''
const API_BASE = 'https://web-production-37fb.up.railway.app'

export async function POST(request: NextRequest) {
  try {
    const { person1_firstname, person2_firstname } = await request.json()

    const stripe = require('stripe')(STRIPE_SECRET_KEY)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `AstroMatch - ${person1_firstname} & ${person2_firstname}`,
            },
            unit_amount: 990,
          },
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


import { NextRequest, NextResponse } from 'next/server'

const API_BASE = 'https://web-production-37fb.up.railway.app'
const API_KEY = process.env.ASTROMATCH_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${API_BASE}/api/compatibility/astromatch/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: errorText },
        { status: response.status }
      )
    }

    // Return the PDF blob
    const blob = await response.blob()
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment',
      },
    })
  } catch (error: any) {
    console.error('PDF error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


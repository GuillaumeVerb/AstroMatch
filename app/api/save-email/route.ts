import { NextRequest, NextResponse } from 'next/server'

const API_BASE = 'https://web-production-37fb.up.railway.app'
const API_KEY = process.env.ASTROMATCH_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${API_BASE}/api/compatibility/astromatch/save-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(body),
    })

    // Don't fail if this endpoint fails
    if (!response.ok) {
      console.warn('Failed to save email:', await response.text())
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Save email error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}


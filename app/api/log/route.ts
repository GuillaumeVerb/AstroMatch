import { NextRequest, NextResponse } from 'next/server'

const API_BASE = 'https://web-production-37fb.up.railway.app'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${API_BASE}/api/compatibility/astromatch/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    // Don't fail if this endpoint fails
    if (!response.ok) {
      console.warn('Failed to log:', await response.text())
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Log error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}


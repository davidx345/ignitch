import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get backend URL from environment or use default
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/billboards/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    
    const data = await response.json()
    
    if (response.ok) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { detail: data.detail || 'Failed to register billboard' },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('Billboard registration API error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Billboard registration endpoint',
    methods: ['POST'],
    description: 'Register a new billboard for the Nigeria marketplace'
  })
}

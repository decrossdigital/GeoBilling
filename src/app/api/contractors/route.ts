import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/contractors - Get all contractors for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const contractors = await prisma.contractor.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(contractors)
  } catch (error) {
    console.error('Error fetching contractors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/contractors - Create a new contractor
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, email, phone, address, skills, rate, currency, notes } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const contractor = await prisma.contractor.create({
      data: {
        name,
        email,
        phone: phone || '',
        address: address || '',
        skills: skills || [],
        rate: parseFloat(rate) || 0,
        currency: currency || 'USD',
        notes: notes || '',
        userId: user.id
      }
    })

    return NextResponse.json(contractor, { status: 201 })
  } catch (error) {
    console.error('Error creating contractor:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



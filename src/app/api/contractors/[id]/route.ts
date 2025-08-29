import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/contractors/[id] - Get a specific contractor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    const contractor = await prisma.contractor.findFirst({
      where: {
        id: (await params).id,
        userId: user.id
      }
    })

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 })
    }

    return NextResponse.json(contractor)
  } catch (error) {
    console.error('Error fetching contractor:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/contractors/[id] - Update a contractor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
    const { name, email, phone, address, skills, pricingType, rate, currency, notes, status } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const contractor = await prisma.contractor.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    })

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 })
    }

    const updatedContractor = await prisma.contractor.update({
      where: { id: id },
      data: {
        name,
        email,
        phone: phone || '',
        address: address || '',
        skills: skills || [],
        pricingType: pricingType || 'hourly',
        rate: parseFloat(rate) || 0,
        currency: currency || 'USD',
        notes: notes || '',
        status: status || 'active'
      }
    })

    return NextResponse.json(updatedContractor)
  } catch (error) {
    console.error('Error updating contractor:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/contractors/[id] - Delete a contractor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    const contractor = await prisma.contractor.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    })

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 })
    }

    await prisma.contractor.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Contractor deleted successfully' })
  } catch (error) {
    console.error('Error deleting contractor:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



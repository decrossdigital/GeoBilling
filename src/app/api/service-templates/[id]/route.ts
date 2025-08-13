import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/service-templates/[id] - Get a specific service template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const serviceTemplate = await prisma.serviceTemplate.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: user.id },
          { userId: null } // Global templates
        ]
      }
    })

    if (!serviceTemplate) {
      return NextResponse.json({ error: 'Service template not found' }, { status: 404 })
    }

    return NextResponse.json(serviceTemplate)
  } catch (error) {
    console.error('Error fetching service template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/service-templates/[id] - Update a service template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { name, description, category, basePrice, currency, isActive } = body

    if (!name || !category || !basePrice) {
      return NextResponse.json({ error: 'Name, category, and base price are required' }, { status: 400 })
    }

    const serviceTemplate = await prisma.serviceTemplate.findFirst({
      where: {
        id: params.id,
        userId: user.id // Only allow updating user's own templates
      }
    })

    if (!serviceTemplate) {
      return NextResponse.json({ error: 'Service template not found' }, { status: 404 })
    }

    const updatedServiceTemplate = await prisma.serviceTemplate.update({
      where: { id: params.id },
      data: {
        name,
        description: description || '',
        category,
        basePrice: parseFloat(basePrice),
        currency: currency || 'USD',
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json(updatedServiceTemplate)
  } catch (error) {
    console.error('Error updating service template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/service-templates/[id] - Delete a service template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const serviceTemplate = await prisma.serviceTemplate.findFirst({
      where: {
        id: params.id,
        userId: user.id // Only allow deleting user's own templates
      }
    })

    if (!serviceTemplate) {
      return NextResponse.json({ error: 'Service template not found' }, { status: 404 })
    }

    await prisma.serviceTemplate.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Service template deleted successfully' })
  } catch (error) {
    console.error('Error deleting service template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



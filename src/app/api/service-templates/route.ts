import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/service-templates - Get all service templates
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

    // Get both user-specific and global templates
    const serviceTemplates = await prisma.serviceTemplate.findMany({
      where: {
        OR: [
          { userId: user.id },
          { userId: null } // Global templates
        ],
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Add default icons based on category
    const templatesWithIcons = serviceTemplates.map(template => {
      let iconName = 'Music' // default icon
      
      if (template.category) {
        const category = template.category.toLowerCase()
        if (category.includes('mix') || category.includes('audio')) {
          iconName = 'Headphones'
        } else if (category.includes('master')) {
          iconName = 'Music'
        } else if (category.includes('edit')) {
          iconName = 'Mic'
        } else if (category.includes('produce') || category.includes('full')) {
          iconName = 'Music'
        }
      }
      
      return {
        ...template,
        icon: iconName
      }
    })

    return NextResponse.json(templatesWithIcons)
  } catch (error) {
    console.error('Error fetching service templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/service-templates - Create a new service template
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
    const { name, description, category, basePrice, currency } = body

    if (!name || !category || !basePrice) {
      return NextResponse.json({ error: 'Name, category, and base price are required' }, { status: 400 })
    }

    const serviceTemplate = await prisma.serviceTemplate.create({
      data: {
        name,
        description: description || '',
        category,
        basePrice: parseFloat(basePrice),
        currency: currency || 'USD',
        userId: user.id
      }
    })

    return NextResponse.json(serviceTemplate, { status: 201 })
  } catch (error) {
    console.error('Error creating service template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

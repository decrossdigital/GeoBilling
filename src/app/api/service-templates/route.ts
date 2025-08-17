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
    
    console.log('Session:', session)
    console.log('Session user:', session?.user)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    console.log('Found user:', user)

    // Parse the request body
    const body = await request.json()
    const { name, description, category, pricingType, rate, currency } = body

    if (!user) {
      // Try to create the user if they don't exist
      console.log('User not found, creating new user...')
      const newUser = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || 'Unknown User',
          image: session.user.image || null,
        }
      })
      console.log('Created new user:', newUser)
      
      // Use the newly created user
      const serviceTemplate = await prisma.serviceTemplate.create({
        data: {
          name,
          description: description || '',
          category,
          pricingType: pricingType || 'flat',
          rate: parseFloat(rate),
          currency: currency || 'USD',
          userId: newUser.id
        }
      })

      return NextResponse.json(serviceTemplate, { status: 201 })
    }

    if (!name || !category || !rate) {
      return NextResponse.json({ error: 'Name, category, and rate are required' }, { status: 400 })
    }

    const serviceTemplate = await prisma.serviceTemplate.create({
      data: {
        name,
        description: description || '',
        category,
        pricingType: pricingType || 'flat',
        rate: parseFloat(rate),
        currency: currency || 'USD',
        userId: user.id
      }
    })

    return NextResponse.json(serviceTemplate, { status: 201 })
  } catch (error) {
    console.error('Error creating service template:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

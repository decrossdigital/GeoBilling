import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/invoices/[id]/contractors - Get all contractors assigned to an invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: invoiceId } = await params

    // Get all invoice contractors with contractor details
    const invoiceContractors = await prisma.invoiceContractor.findMany({
      where: { invoiceId },
      include: {
        contractor: true
      }
    })

    // Convert Decimal to Number for JSON
    const result = invoiceContractors.map(ic => ({
      ...ic,
      hours: ic.hours ? Number(ic.hours) : null,
      cost: Number(ic.cost),
      contractor: {
        ...ic.contractor,
        hourlyRate: ic.contractor.hourlyRate ? Number(ic.contractor.hourlyRate) : null,
        flatRate: ic.contractor.flatRate ? Number(ic.contractor.flatRate) : null,
        rate: Number(ic.contractor.rate)
      }
    }))

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error fetching invoice contractors:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    })
    return NextResponse.json(
      { 
        error: 'Failed to fetch contractors',
        details: error.message,
        fullError: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          code: error.code,
          meta: error.meta,
          name: error.name
        } : undefined
      },
      { status: 500 }
    )
  }
}

// POST /api/invoices/[id]/contractors - Assign contractor to invoice
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: invoiceId } = await params
    const body = await request.json()
    const { contractorId, assignedSkills, rateType, hours, cost, includeInTotal, notes } = body

    // Get user for verification
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify invoice exists and belongs to user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: user.id
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Debug logging
    console.log('Creating invoice contractor with data:', {
      invoiceId,
      contractorId,
      assignedSkills,
      rateType,
      hours,
      hoursType: typeof hours,
      hoursValue: hours,
      cost,
      costType: typeof cost,
      costValue: cost
    })

    // Validate required fields
    if (!contractorId || !assignedSkills || !rateType || cost === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create invoice contractor assignment
    // Match the quote route EXACTLY - it works there
    try {
      const invoiceContractor = await prisma.invoiceContractor.create({
        data: {
          invoiceId,
          contractorId,
          assignedSkills,
          rateType,
          hours: hours !== undefined ? hours : null,
          cost,
          includeInTotal: includeInTotal !== undefined ? includeInTotal : true,
          notes: notes || null
        },
        include: {
          contractor: true
        }
      })

      // Convert Decimal to Number for JSON
      const result = {
        ...invoiceContractor,
        hours: invoiceContractor.hours ? Number(invoiceContractor.hours) : null,
        cost: Number(invoiceContractor.cost),
        contractor: {
          ...invoiceContractor.contractor,
          hourlyRate: invoiceContractor.contractor.hourlyRate ? Number(invoiceContractor.contractor.hourlyRate) : null,
          flatRate: invoiceContractor.contractor.flatRate ? Number(invoiceContractor.contractor.flatRate) : null,
          rate: Number(invoiceContractor.contractor.rate)
        }
      }

      return NextResponse.json(result, { status: 201 })
    } catch (createError: any) {
      console.error('Prisma create error:', createError)
      throw createError
    }

  } catch (error: any) {
    console.error('Error assigning contractor:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    })
    
    // Return full error details for debugging
    const errorDetails = {
      message: error.message || 'Unknown error',
      code: error.code || 'UNKNOWN',
      meta: error.meta || null,
      name: error.name || 'Error'
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to assign contractor', 
        details: error.message,
        fullError: errorDetails,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

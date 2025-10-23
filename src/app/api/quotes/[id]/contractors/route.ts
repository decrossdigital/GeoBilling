import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/quotes/[id]/contractors - Get all contractors for a quote
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: quoteId } = await params

    const contractors = await prisma.quoteContractor.findMany({
      where: { quoteId },
      include: {
        contractor: true
      },
      orderBy: { createdAt: 'asc' }
    })

    // Convert Decimal to Number for JSON
    const contractorsWithNumbers = contractors.map(qc => ({
      ...qc,
      hours: qc.hours ? Number(qc.hours) : null,
      cost: Number(qc.cost),
      contractor: {
        ...qc.contractor,
        hourlyRate: qc.contractor.hourlyRate ? Number(qc.contractor.hourlyRate) : null,
        flatRate: qc.contractor.flatRate ? Number(qc.contractor.flatRate) : null,
        rate: Number(qc.contractor.rate)
      }
    }))

    return NextResponse.json(contractorsWithNumbers)
  } catch (error) {
    console.error('Error fetching quote contractors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contractors' },
      { status: 500 }
    )
  }
}

// POST /api/quotes/[id]/contractors - Assign contractor to quote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: quoteId } = await params
    const body = await request.json()
    const { contractorId, assignedSkills, rateType, hours, cost, includeInTotal } = body

    // Validate required fields
    if (!contractorId || !assignedSkills || !rateType || cost === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create quote contractor assignment
    const quoteContractor = await prisma.quoteContractor.create({
      data: {
        quoteId,
        contractorId,
        assignedSkills,
        rateType,
        hours: hours !== undefined ? hours : null,
        cost,
        includeInTotal: includeInTotal !== undefined ? includeInTotal : true
      },
      include: {
        contractor: true
      }
    })

    // Convert Decimal to Number for JSON
    const result = {
      ...quoteContractor,
      hours: quoteContractor.hours ? Number(quoteContractor.hours) : null,
      cost: Number(quoteContractor.cost),
      contractor: {
        ...quoteContractor.contractor,
        hourlyRate: quoteContractor.contractor.hourlyRate ? Number(quoteContractor.contractor.hourlyRate) : null,
        flatRate: quoteContractor.contractor.flatRate ? Number(quoteContractor.contractor.flatRate) : null,
        rate: Number(quoteContractor.contractor.rate)
      }
    }

    console.log('API returning contractor assignment:', result)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error assigning contractor:', error)
    return NextResponse.json(
      { error: 'Failed to assign contractor' },
      { status: 500 }
    )
  }
}


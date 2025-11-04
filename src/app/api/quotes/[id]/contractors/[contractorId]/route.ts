import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT /api/quotes/[id]/contractors/[contractorId] - Update contractor assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contractorId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { contractorId } = await params
    const body = await request.json()
    const { assignedSkills, rateType, hours, cost, includeInTotal, notes } = body

    const updated = await prisma.quoteContractor.update({
      where: { id: contractorId },
      data: {
        assignedSkills,
        rateType,
        hours: hours !== undefined ? hours : null,
        cost,
        includeInTotal: includeInTotal !== undefined ? includeInTotal : true,
        notes: notes !== undefined ? notes : null
      },
      include: {
        contractor: true
      }
    })

    // Convert Decimal to Number
    const result = {
      ...updated,
      hours: updated.hours ? Number(updated.hours) : null,
      cost: Number(updated.cost),
      contractor: {
        ...updated.contractor,
        hourlyRate: updated.contractor.hourlyRate ? Number(updated.contractor.hourlyRate) : null,
        flatRate: updated.contractor.flatRate ? Number(updated.contractor.flatRate) : null,
        rate: Number(updated.contractor.rate)
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating contractor assignment:', error)
    return NextResponse.json(
      { error: 'Failed to update contractor' },
      { status: 500 }
    )
  }
}

// DELETE /api/quotes/[id]/contractors/[contractorId] - Remove contractor from quote
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contractorId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { contractorId } = await params

    await prisma.quoteContractor.delete({
      where: { id: contractorId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing contractor:', error)
    return NextResponse.json(
      { error: 'Failed to remove contractor' },
      { status: 500 }
    )
  }
}


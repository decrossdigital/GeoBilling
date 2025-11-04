import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// PUT /api/invoices/[id]/contractors/[contractorId] - Update contractor assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contractorId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: invoiceId, contractorId } = await params
    const body = await request.json()
    const { assignedSkills, rateType, hours, cost, includeInTotal, notes } = body

    // Update the invoice contractor assignment
    const updatedContractor = await prisma.invoiceContractor.update({
      where: {
        id: contractorId,
        invoiceId: invoiceId
      },
      data: {
        assignedSkills: assignedSkills || [],
        rateType: rateType || 'hourly',
        hours: hours !== undefined ? hours : null,
        cost: cost !== undefined ? cost : 0,
        includeInTotal: includeInTotal !== undefined ? includeInTotal : true,
        notes: notes !== undefined ? notes : null
      },
      include: {
        contractor: true
      }
    })

    // Convert Decimal to Number for JSON
    const result = {
      ...updatedContractor,
      hours: updatedContractor.hours ? Number(updatedContractor.hours) : null,
      cost: Number(updatedContractor.cost),
      contractor: {
        ...updatedContractor.contractor,
        hourlyRate: updatedContractor.contractor.hourlyRate ? Number(updatedContractor.contractor.hourlyRate) : null,
        flatRate: updatedContractor.contractor.flatRate ? Number(updatedContractor.contractor.flatRate) : null,
        rate: Number(updatedContractor.contractor.rate)
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating contractor:', error)
    return NextResponse.json(
      { error: 'Failed to update contractor' },
      { status: 500 }
    )
  }
}

// DELETE /api/invoices/[id]/contractors/[contractorId] - Remove contractor assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contractorId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: invoiceId, contractorId } = await params

    // Delete the invoice contractor assignment
    await prisma.invoiceContractor.delete({
      where: {
        id: contractorId,
        invoiceId: invoiceId
      }
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

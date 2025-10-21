# Contractor Skills System - Implementation Roadmap

## 📋 Overview

This document outlines the remaining implementation tasks for the Skills-Based Contractor Assignment system in GeoBilling.

---

## ✅ COMPLETED (Phase 1)

### 1. Database Schema ✓
**File:** `prisma/schema.prisma`

**Changes Made:**
- ✅ Added `QuoteContractor` model with:
  - `assignedSkills: String[]` - Skills for specific assignment
  - `rateType: String` - 'hourly' or 'flat'
  - `hours: Decimal?` - Nullable for flat rate
  - `cost: Decimal` - Calculated cost
  - `includeInTotal: Boolean` - Toggle for client-facing total
- ✅ Updated `Contractor` model:
  - Added `hourlyRate` and `flatRate` fields
  - Added `quoteContractors` relation
- ✅ Updated `Setting` model:
  - Added `availableSkills: String[]`
- ✅ Updated `Quote` model:
  - Added `contractors` relation

**Migration:** ✅ Applied with `npx prisma db push`

### 2. Skills Management (Settings Page) ✓
**File:** `src/app/settings/page.tsx`

**Features Implemented:**
- ✅ Load/save skills from localStorage
- ✅ Add new skills with input field
- ✅ Remove skills with X button
- ✅ Display skills as purple chips
- ✅ Default skills pre-loaded:
  ```javascript
  const DEFAULT_SKILLS = [
    'Vocals', 'Guitar', 'Bass', 'Piano', 'Keyboard', 'Organ',
    'Drums', 'Percussion', 'Saxophone', 'Trumpet', 'Violin',
    'Mixing', 'Mastering', 'Production', 'Recording Engineer',
    'Sound Design', 'Songwriting', 'Arranging', 'Audio Editing'
  ]
  ```

### 3. Contractor Detail Page ✓
**File:** `src/app/contractors/[id]/page.tsx`

**Features Implemented:**
- ✅ Load available skills from localStorage
- ✅ Display skills as checkbox grid in edit mode
- ✅ Display skills as purple chips in view mode
- ✅ Toggle function for skill selection
- ✅ Save skills array to API

---

## 🚧 REMAINING TASKS (Phase 2)

### Task 1: Update Contractors Page Add/Edit Modal
**File:** `src/app/contractors/page.tsx`  
**Estimated Effort:** ~20 tool calls  
**Priority:** Medium

**What Needs to Be Done:**

1. **Add state for available skills:**
```javascript
const [availableSkills, setAvailableSkills] = useState<string[]>([])

useEffect(() => {
  const savedSkills = localStorage.getItem('availableSkills')
  if (savedSkills) {
    try {
      setAvailableSkills(JSON.parse(savedSkills))
    } catch (error) {
      console.error('Failed to load skills:', error)
    }
  }
}, [])
```

2. **Add toggle function:**
```javascript
const toggleSkill = (skill: string) => {
  setNewContractor(prev => ({
    ...prev,
    skills: prev.skills.includes(skill)
      ? prev.skills.filter(s => s !== skill)
      : [...prev.skills, skill]
  }))
}
```

3. **Replace skills input in modal (around line 500-600):**

**Find:**
```javascript
<input
  type="text"
  value={skillsInput}
  onChange={(e) => setSkillsInput(e.target.value)}
  // ...
  placeholder="Enter skills (comma separated)"
/>
```

**Replace with:**
```javascript
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
  gap: '0.5rem',
  padding: '0.75rem',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '0.5rem',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  maxHeight: '300px',
  overflowY: 'auto'
}}>
  {availableSkills.map(skill => (
    <label
      key={skill}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        padding: '0.25rem',
        color: '#cbd5e1',
        fontSize: '0.875rem'
      }}
    >
      <input
        type="checkbox"
        checked={newContractor.skills.includes(skill)}
        onChange={() => toggleSkill(skill)}
        style={{cursor: 'pointer'}}
      />
      <span>{skill}</span>
    </label>
  ))}
</div>
```

4. **Update handleAddContractor (around line 97-120):**

**Remove:**
```javascript
const skills = skillsInput
  .split(',')
  .map(skill => skill.trim())
  .filter(skill => skill.length > 0)
```

**Use directly:**
```javascript
body: JSON.stringify(newContractor)
```

5. **Remove `skillsInput` state variable**

---

### Task 2: Create QuoteContractor API Routes
**Files:** `src/app/api/quotes/[id]/contractors/route.ts` (new)  
**Estimated Effort:** ~15 tool calls  
**Priority:** High

**Create new file:** `src/app/api/quotes/[id]/contractors/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/quotes/[id]/contractors - Get all contractors for a quote
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quoteId = params.id

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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quoteId = params.id
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

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error assigning contractor:', error)
    return NextResponse.json(
      { error: 'Failed to assign contractor' },
      { status: 500 }
    )
  }
}
```

**Create new file:** `src/app/api/quotes/[id]/contractors/[contractorId]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT /api/quotes/[id]/contractors/[contractorId] - Update contractor assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; contractorId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { contractorId } = params
    const body = await request.json()
    const { assignedSkills, rateType, hours, cost, includeInTotal } = body

    const updated = await prisma.quoteContractor.update({
      where: { id: contractorId },
      data: {
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
  { params }: { params: { id: string; contractorId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { contractorId } = params

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
```

---

### Task 3: Quote Page - Add Contractor Modal (COMPLEX)
**File:** `src/app/quotes/[id]/page.tsx`  
**Estimated Effort:** ~40 tool calls  
**Priority:** High

This is the most complex piece. Break it into sub-tasks:

#### 3A. Add State Variables

```javascript
const [availableSkills, setAvailableSkills] = useState<string[]>([])
const [selectedSkills, setSelectedSkills] = useState<string[]>([])
const [filteredContractors, setFilteredContractors] = useState<Contractor[]>([])
const [selectedContractorId, setSelectedContractorId] = useState('')
const [contractorRateType, setContractorRateType] = useState<'hourly' | 'flat'>('hourly')
const [contractorHours, setContractorHours] = useState(1)
const [contractorCost, setContractorCost] = useState(0)
const [assignedContractors, setAssignedContractors] = useState<QuoteContractor[]>([])
const [editingContractorId, setEditingContractorId] = useState<string | null>(null)
```

#### 3B. Load Skills and Assigned Contractors

```javascript
// Load available skills
useEffect(() => {
  const savedSkills = localStorage.getItem('availableSkills')
  if (savedSkills) {
    try {
      setAvailableSkills(JSON.parse(savedSkills))
    } catch (error) {
      console.error('Failed to load skills:', error)
    }
  }
}, [])

// Load assigned contractors
useEffect(() => {
  const fetchAssignedContractors = async () => {
    if (!quoteId) return
    
    try {
      const response = await fetch(`/api/quotes/${quoteId}/contractors`)
      if (response.ok) {
        const data = await response.json()
        setAssignedContractors(data)
      }
    } catch (error) {
      console.error('Error fetching assigned contractors:', error)
    }
  }
  
  fetchAssignedContractors()
}, [quoteId])
```

#### 3C. Filter Contractors by Skills

```javascript
useEffect(() => {
  if (selectedSkills.length === 0) {
    setFilteredContractors(contractors)
  } else {
    const filtered = contractors.filter(contractor =>
      selectedSkills.every(skill => contractor.skills.includes(skill))
    )
    setFilteredContractors(filtered)
  }
}, [selectedSkills, contractors])
```

#### 3D. Calculate Cost

```javascript
useEffect(() => {
  if (!selectedContractorId) {
    setContractorCost(0)
    return
  }
  
  const contractor = contractors.find(c => c.id === selectedContractorId)
  if (!contractor) return
  
  if (contractorRateType === 'hourly') {
    const rate = contractor.hourlyRate || contractor.rate
    setContractorCost(contractorHours * Number(rate))
  } else {
    setContractorCost(Number(contractor.flatRate || contractor.rate))
  }
}, [selectedContractorId, contractorRateType, contractorHours, contractors])
```

#### 3E. Handler Functions

```javascript
const toggleSkillFilter = (skill: string) => {
  setSelectedSkills(prev =>
    prev.includes(skill)
      ? prev.filter(s => s !== skill)
      : [...prev, skill]
  )
}

const handleAssignContractor = async () => {
  if (!selectedContractorId || selectedSkills.length === 0) {
    alert('Please select skills and a contractor')
    return
  }
  
  try {
    const response = await fetch(`/api/quotes/${quoteId}/contractors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractorId: selectedContractorId,
        assignedSkills: selectedSkills,
        rateType: contractorRateType,
        hours: contractorRateType === 'hourly' ? contractorHours : null,
        cost: contractorCost,
        includeInTotal: true
      })
    })
    
    if (response.ok) {
      const newAssignment = await response.json()
      setAssignedContractors([...assignedContractors, newAssignment])
      // Reset form
      setSelectedSkills([])
      setSelectedContractorId('')
      setContractorHours(1)
      setShowAddContractorModal(false)
      alert('Contractor assigned successfully!')
    } else {
      alert('Failed to assign contractor')
    }
  } catch (error) {
    console.error('Error assigning contractor:', error)
    alert('Error assigning contractor')
  }
}

const handleRemoveContractor = async (contractorId: string) => {
  if (!confirm('Remove this contractor from the quote?')) return
  
  try {
    const response = await fetch(`/api/quotes/${quoteId}/contractors/${contractorId}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      setAssignedContractors(assignedContractors.filter(c => c.id !== contractorId))
    } else {
      alert('Failed to remove contractor')
    }
  } catch (error) {
    console.error('Error removing contractor:', error)
    alert('Error removing contractor')
  }
}
```

#### 3F. Modal UI (Add after existing modals)

```javascript
{/* Add Contractor Modal */}
{showAddContractorModal && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }}>
    <div style={{
      backgroundColor: '#1e293b',
      borderRadius: '0.75rem',
      padding: '2rem',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '90vh',
      overflowY: 'auto',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem'}}>
        Assign Contractor
      </h2>
      
      {/* Skills Filter */}
      <div style={{marginBottom: '1.5rem'}}>
        <label style={{display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem'}}>
          Skills Needed:
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '0.5rem',
          padding: '0.75rem',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '0.5rem'
        }}>
          {availableSkills.map(skill => (
            <label
              key={skill}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                color: '#cbd5e1',
                fontSize: '0.875rem'
              }}
            >
              <input
                type="checkbox"
                checked={selectedSkills.includes(skill)}
                onChange={() => toggleSkillFilter(skill)}
                style={{cursor: 'pointer'}}
              />
              <span>{skill}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Contractor Selection */}
      <div style={{marginBottom: '1.5rem'}}>
        <label style={{display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem'}}>
          Available Contractors ({filteredContractors.length}):
        </label>
        <div style={{
          maxHeight: '200px',
          overflowY: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '0.5rem',
          backgroundColor: 'rgba(255, 255, 255, 0.05)'
        }}>
          {filteredContractors.map(contractor => (
            <label
              key={contractor.id}
              style={{
                display: 'block',
                padding: '0.75rem',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                backgroundColor: selectedContractorId === contractor.id ? 'rgba(147, 51, 234, 0.2)' : 'transparent'
              }}
            >
              <input
                type="radio"
                name="contractor"
                value={contractor.id}
                checked={selectedContractorId === contractor.id}
                onChange={(e) => setSelectedContractorId(e.target.value)}
                style={{marginRight: '0.5rem'}}
              />
              <span style={{color: 'white', fontWeight: '500'}}>{contractor.name}</span>
              <div style={{fontSize: '0.75rem', color: '#94a3b8', marginLeft: '1.5rem'}}>
                Skills: {contractor.skills.join(', ')}
              </div>
              <div style={{fontSize: '0.75rem', color: '#94a3b8', marginLeft: '1.5rem'}}>
                ${contractor.hourlyRate || contractor.rate}/hr | ${contractor.flatRate || contractor.rate} flat
              </div>
            </label>
          ))}
          {filteredContractors.length === 0 && (
            <p style={{padding: '1rem', color: '#94a3b8', textAlign: 'center', fontStyle: 'italic'}}>
              No contractors match selected skills
            </p>
          )}
        </div>
      </div>
      
      {/* Rate Type Selection */}
      {selectedContractorId && (
        <div style={{marginBottom: '1.5rem'}}>
          <label style={{display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem'}}>
            Rate Type:
          </label>
          <div style={{display: 'flex', gap: '1rem'}}>
            <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1'}}>
              <input
                type="radio"
                value="hourly"
                checked={contractorRateType === 'hourly'}
                onChange={(e) => setContractorRateType(e.target.value as 'hourly' | 'flat')}
              />
              Hourly Rate
            </label>
            <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1'}}>
              <input
                type="radio"
                value="flat"
                checked={contractorRateType === 'flat'}
                onChange={(e) => setContractorRateType(e.target.value as 'hourly' | 'flat')}
              />
              Flat Rate
            </label>
          </div>
        </div>
      )}
      
      {/* Hours Input (if hourly) */}
      {selectedContractorId && contractorRateType === 'hourly' && (
        <div style={{marginBottom: '1.5rem'}}>
          <label style={{display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem'}}>
            Hours:
          </label>
          <input
            type="number"
            value={contractorHours}
            onChange={(e) => setContractorHours(Number(e.target.value))}
            min="0.5"
            step="0.5"
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.25rem',
              color: 'white'
            }}
          />
        </div>
      )}
      
      {/* Cost Display */}
      {selectedContractorId && (
        <div style={{
          padding: '1rem',
          backgroundColor: 'rgba(147, 51, 234, 0.1)',
          border: '1px solid rgba(147, 51, 234, 0.3)',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          <p style={{color: '#e9d5ff', fontSize: '0.875rem', marginBottom: '0.25rem'}}>
            Assignment Summary:
          </p>
          <p style={{color: 'white', fontSize: '1.125rem', fontWeight: 'bold'}}>
            {selectedSkills.join(', ')} - ${contractorCost.toFixed(2)}
          </p>
          <p style={{color: '#cbd5e1', fontSize: '0.75rem'}}>
            {contractorRateType === 'hourly' 
              ? `${contractorHours} hrs @ $${(contractorCost / contractorHours).toFixed(2)}/hr`
              : 'Flat rate'
            }
          </p>
        </div>
      )}
      
      {/* Buttons */}
      <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
        <button
          onClick={() => {
            setShowAddContractorModal(false)
            setSelectedSkills([])
            setSelectedContractorId('')
            setContractorHours(1)
          }}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleAssignContractor}
          disabled={!selectedContractorId || selectedSkills.length === 0}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: selectedContractorId && selectedSkills.length > 0 ? '#9333ea' : '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: selectedContractorId && selectedSkills.length > 0 ? 'pointer' : 'not-allowed'
          }}
        >
          Assign Contractor
        </button>
      </div>
    </div>
  </div>
)}
```

#### 3G. Contractors Display Section (in Contractors box)

Replace the current contractors display with:

```javascript
{/* Contractors Section - Right Column */}
<div style={{...boxStyle}}>
  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
    <h3 style={{fontSize: '1.125rem', fontWeight: 'bold', color: 'white'}}>Contractors</h3>
    {quote?.status === 'draft' && (
      <button
        onClick={() => setShowAddContractorModal(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: 'linear-gradient(to right, #9333ea, #c026d3)',
          color: 'white',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: 'pointer',
          fontSize: '0.875rem'
        }}
      >
        <Plus style={{height: '1rem', width: '1rem'}} />
        Add Contractor
      </button>
    )}
  </div>
  
  {assignedContractors.length === 0 ? (
    <p style={{color: '#94a3b8', fontStyle: 'italic'}}>No contractors assigned</p>
  ) : (
    <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
      {assignedContractors.map(ac => (
        <div
          key={ac.id}
          style={{
            padding: '0.75rem',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '0.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
            <div style={{flex: 1}}>
              <p style={{color: 'white', fontWeight: '500', marginBottom: '0.25rem'}}>
                {ac.contractor.name}
              </p>
              <p style={{color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.25rem'}}>
                {ac.assignedSkills.join(', ')}
              </p>
              <p style={{color: '#94a3b8', fontSize: '0.75rem'}}>
                {ac.rateType === 'hourly' 
                  ? `${ac.hours} hrs @ $${(ac.cost / Number(ac.hours || 1)).toFixed(2)}/hr`
                  : 'Flat rate'
                }
              </p>
            </div>
            <div style={{textAlign: 'right'}}>
              <p style={{color: 'white', fontWeight: 'bold', marginBottom: '0.5rem'}}>
                ${Number(ac.cost).toFixed(2)}
              </p>
              {quote?.status === 'draft' && (
                <button
                  onClick={() => handleRemoveContractor(ac.id)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    color: '#fca5a5',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {/* Total Contractor Costs */}
      <div style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: '0.75rem',
        marginTop: '0.5rem'
      }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>
            Total Contractor Costs:
          </span>
          <span style={{color: 'white', fontWeight: 'bold'}}>
            ${assignedContractors
              .filter(ac => ac.includeInTotal)
              .reduce((sum, ac) => sum + Number(ac.cost), 0)
              .toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )}
</div>
```

---

### Task 4: Update Contractor API to Support New Rate Fields
**File:** `src/app/api/contractors/route.ts` and `src/app/api/contractors/[id]/route.ts`  
**Estimated Effort:** ~5 tool calls  
**Priority:** Medium

**In POST endpoint (create contractor):**
- Accept `hourlyRate` and `flatRate` in request body
- Store both rates (can be null)

**In PUT endpoint (update contractor):**
- Accept `hourlyRate` and `flatRate` in request body
- Update both rates

---

## 📊 Summary

### Completed: 3 tasks ✅
1. ✅ Database schema
2. ✅ Settings page skills management  
3. ✅ Contractor detail page skills checkboxes

### Remaining: 4 tasks 🚧
1. 🚧 Contractors page add/edit modal (~20 calls)
2. 🚧 QuoteContractor API routes (~15 calls)
3. 🚧 Quote page contractor modal (~40 calls)
4. 🚧 Contractor API updates (~5 calls)

**Total Estimated:** ~80 tool calls for full completion

---

## 🎯 Next Session Strategy

**Recommended Order:**
1. **Start with:** QuoteContractor API routes (foundational)
2. **Then:** Quote page modal (main feature)
3. **Then:** Contractors page modal (polish)
4. **Finally:** Contractor API updates (enhancement)

**OR Break into Phases:**
- **Phase A:** Get core assignment working (Tasks 2 + 3)
- **Phase B:** Polish contractor management (Tasks 1 + 4)

---

## 💡 Testing Checklist

Once implemented, test:
- [ ] Add skills in Settings
- [ ] Skills appear in contractor forms
- [ ] Assign contractor with skills to quote
- [ ] Calculate cost correctly (hourly vs flat)
- [ ] Display assigned contractors
- [ ] Remove contractor from quote
- [ ] Edit contractor assignment
- [ ] Include/exclude contractor costs in quote total
- [ ] Same contractor assigned multiple times with different skills

---

## 🔧 Known Considerations

1. **localStorage vs Database:** Currently using localStorage for skills - consider moving to database/Settings model for production
2. **Rate Migration:** Existing contractors have `rate` field - may need to populate `hourlyRate`/`flatRate` from it
3. **Quote Total Calculation:** Need to decide if contractor costs auto-update quote total
4. **Invoice Support:** Plan to replicate for invoices in future

---

**Document Created:** Session ending at ~117K/1M tokens  
**Status:** Foundation complete, ready for phase 2 implementation  
**Next Steps:** Review this roadmap and proceed when ready


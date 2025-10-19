const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://geobilling_xcw7_user:4NTO85LUhLTmIrvoXkvCtwMmIrqYwZZW@dpg-d3ptm2ili9vc73bte530-a.oregon-postgres.render.com/geobilling_xcw7"
    }
  }
})

async function fixQuoteTotals() {
  console.log('🔧 Starting quote totals fix...')
  
  try {
    // Get all quotes
    const quotes = await prisma.quote.findMany({
      include: {
        items: true
      }
    })

    console.log(`📊 Found ${quotes.length} quotes to check`)

    let fixedCount = 0

    for (const quote of quotes) {
      // Recalculate totals based on items
      const recalculatedSubtotal = quote.items.reduce((sum, item) => sum + Number(item.total), 0)
      const taxRate = Number(quote.taxRate)
      const recalculatedTaxAmount = recalculatedSubtotal * (taxRate / 100)
      const recalculatedTotal = recalculatedSubtotal + recalculatedTaxAmount

      // Check if totals need fixing
      const currentSubtotal = Number(quote.subtotal)
      const currentTaxAmount = Number(quote.taxAmount)
      const currentTotal = Number(quote.total)

      if (currentSubtotal !== recalculatedSubtotal || 
          currentTaxAmount !== recalculatedTaxAmount || 
          currentTotal !== recalculatedTotal) {
        
        console.log(`🔧 Fixing quote ${quote.quoteNumber}:`)
        console.log(`   Old: Subtotal=${currentSubtotal}, Tax=${currentTaxAmount}, Total=${currentTotal}`)
        console.log(`   New: Subtotal=${recalculatedSubtotal}, Tax=${recalculatedTaxAmount}, Total=${recalculatedTotal}`)

        // Update the quote with correct totals
        await prisma.quote.update({
          where: { id: quote.id },
          data: {
            subtotal: recalculatedSubtotal,
            taxAmount: recalculatedTaxAmount,
            total: recalculatedTotal
          }
        })

        fixedCount++
      }
    }

    console.log(`✅ Fixed ${fixedCount} quotes with incorrect totals`)
    console.log('🎉 Quote totals fix completed!')

  } catch (error) {
    console.error('❌ Error fixing quote totals:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixQuoteTotals()

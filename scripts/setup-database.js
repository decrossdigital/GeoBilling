#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Setting up GeoBilling database...')

  try {
    // Create default service templates
    console.log('📝 Creating default service templates...')
    const serviceTemplates = [
      {
        name: 'Recording Session',
        description: 'Professional recording session in studio',
        category: 'recording',
        basePrice: 150.00,
        currency: 'USD'
      },
      {
        name: 'Mixing',
        description: 'Professional audio mixing services',
        category: 'mixing',
        basePrice: 200.00,
        currency: 'USD'
      },
      {
        name: 'Mastering',
        description: 'Professional audio mastering services',
        category: 'mastering',
        basePrice: 250.00,
        currency: 'USD'
      },
      {
        name: 'Production',
        description: 'Music production and arrangement',
        category: 'production',
        basePrice: 300.00,
        currency: 'USD'
      },
      {
        name: 'Editing',
        description: 'Audio editing and cleanup',
        category: 'other',
        basePrice: 100.00,
        currency: 'USD'
      }
    ]

    for (const template of serviceTemplates) {
      await prisma.serviceTemplate.create({
        data: {
          ...template,
          isActive: true
        }
      })
    }

    console.log('✅ Service templates created successfully')

    // Create default settings
    console.log('⚙️ Creating default settings...')
    const defaultSettings = [
      {
        key: 'company.name',
        value: 'Uniquitous Music',
        category: 'company'
      },
      {
        key: 'company.email',
        value: 'george@uniquitousmusic.com',
        category: 'company'
      },
      {
        key: 'company.phone',
        value: '(609) 316-8080',
        category: 'company'
      },
      {
        key: 'company.address',
        value: '123 Music Studio Lane, NJ 08540',
        category: 'company'
      },
      {
        key: 'company.website',
        value: 'https://uniquitousmusic.com',
        category: 'company'
      },
      {
        key: 'payments.currency',
        value: 'USD',
        category: 'payments'
      },
      {
        key: 'payments.tax_rate',
        value: '0',
        category: 'payments'
      },
      {
        key: 'email.from_email',
        value: 'noreply@uniquitousmusic.com',
        category: 'email'
      }
    ]

    for (const setting of defaultSettings) {
      await prisma.setting.create({
        data: {
          ...setting,
          userId: null // Global settings
        }
      })
    }

    console.log('✅ Default settings created successfully')

    console.log('🎉 Database setup completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('1. Run: npm run dev')
    console.log('2. Visit: http://localhost:3000')
    console.log('3. Sign up with Google OAuth')
    console.log('4. Configure your settings in the Settings page')

  } catch (error) {
    console.error('❌ Error setting up database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

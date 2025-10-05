import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Admin User
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@alf-app.com' },
    update: {},
    create: {
      email: 'admin@alf-app.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  console.log('✅ Created admin user:', adminUser.email);

  // Create Test Customer
  const testCustomer = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      password: await bcrypt.hash('Test@123', 10),
      firstName: 'Test',
      lastName: 'Customer',
      role: 'CUSTOMER',
      emailVerified: true,
      wallet: {
        create: {
          balance: 100, // 100 kWh
          cashBalance: 50000, // ₦50,000
        },
      },
    },
  });
  console.log('✅ Created test customer:', testCustomer.email);

  // Create Nigerian Energy Companies
  const companies = [
    {
      name: 'Ikeja Electric',
      slug: 'ikeja-electric',
      description: 'Serving Lagos State residents',
      supportEmail: 'support@ikejaelectric.com',
      supportPhone: '+234-700-IKEJA-DISCO',
    },
    {
      name: 'Eko Electricity Distribution Company (EKEDC)',
      slug: 'eko-electricity',
      description: 'Powering parts of Lagos',
      supportEmail: 'support@ekedp.com',
      supportPhone: '+234-908-000-0343',
    },
    {
      name: 'Abuja Electricity Distribution Company (AEDC)',
      slug: 'abuja-electricity',
      description: 'Serving FCT, Niger, Kogi, and Nasarawa States',
      supportEmail: 'customercare@abujaelectricity.com',
      supportPhone: '+234-700-2382-3232',
    },
    {
      name: 'Kano Electricity Distribution Company (KEDCO)',
      slug: 'kano-electricity',
      description: 'Covering Kano and Jigawa States',
      supportEmail: 'info@kedco.ng',
      supportPhone: '+234-806-979-0572',
    },
    {
      name: 'Port Harcourt Electricity Distribution Company (PHED)',
      slug: 'port-harcourt-electric',
      description: 'Serving Rivers, Bayelsa, Cross River, and Akwa Ibom States',
      supportEmail: 'info@phed.com.ng',
      supportPhone: '+234-803-000-0000',
    },
    {
      name: 'Enugu Electricity Distribution Company (EEDC)',
      slug: 'enugu-electricity',
      description: 'Covering Enugu, Abia, Anambra, Ebonyi, and Imo States',
      supportEmail: 'customercare@enugudisco.com',
      supportPhone: '+234-700-3338-3333',
    },
    {
      name: 'Jos Electricity Distribution Company (JED)',
      slug: 'jos-electricity',
      description: 'Serving Plateau, Benue, Bauchi, and Gombe States',
      supportEmail: 'info@jedc.com',
      supportPhone: '+234-703-511-1111',
    },
    {
      name: 'Kaduna Electric',
      slug: 'kaduna-electric',
      description: 'Covering Kaduna, Kebbi, Sokoto, and Zamfara States',
      supportEmail: 'customercare@kadunaelectric.com',
      supportPhone: '+234-700-KADUNA-DISCO',
    },
    {
      name: 'Benin Electricity Distribution Company (BEDC)',
      slug: 'benin-electricity',
      description: 'Serving Edo, Delta, Ondo, and Ekiti States',
      supportEmail: 'info@bedc.com',
      supportPhone: '+234-708-692-7700',
    },
    {
      name: 'Ibadan Electricity Distribution Company (IBEDC)',
      slug: 'ibadan-electricity',
      description: 'Covering Oyo, Ogun, Osun, and Kwara States',
      supportEmail: 'customercare@ibedc.com',
      supportPhone: '+234-700-4233-9999',
    },
    {
      name: 'Lumos Nigeria',
      slug: 'lumos',
      description: 'Solar renewable energy provider',
      supportEmail: 'support@lumos-ng.com',
      supportPhone: '+234-708-060-5555',
    },
    {
      name: 'Arnergy Solar',
      slug: 'arnergy',
      description: 'Distributed solar energy solutions',
      supportEmail: 'hello@arnergy.com',
      supportPhone: '+234-909-000-0000',
    },
  ];

  for (const companyData of companies) {
    const company = await prisma.company.upsert({
      where: { slug: companyData.slug },
      update: {},
      create: companyData,
    });
    console.log(`✅ Created company: ${company.name}`);

    // Create tokens for each company
    await prisma.token.upsert({
      where: {
        companyId_type: {
          companyId: company.id,
          type: 'NON_RENEWABLE',
        },
      },
      update: {},
      create: {
        companyId: company.id,
        type: 'NON_RENEWABLE',
        pricePerUnit: 85, // ₦85 per kWh
        isAvailable: true,
        description: 'Standard grid electricity',
      },
    });

    await prisma.token.upsert({
      where: {
        companyId_type: {
          companyId: company.id,
          type: 'RENEWABLE',
        },
      },
      update: {},
      create: {
        companyId: company.id,
        type: 'RENEWABLE',
        pricePerUnit: 95, // ₦95 per kWh (slightly higher for renewable)
        isAvailable: company.slug === 'lumos' || company.slug === 'arnergy', // Only renewable providers have this available
        description: 'Clean renewable energy',
      },
    });
  }

  console.log('✅ Created tokens for all companies');

  // Create some sample usage logs for test customer
  const ikejaElectric = await prisma.company.findUnique({
    where: { slug: 'ikeja-electric' },
    include: { tokens: true },
  });

  if (ikejaElectric) {
    const token = ikejaElectric.tokens.find((t) => t.type === 'NON_RENEWABLE');
    if (token) {
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        await prisma.usageLog.create({
          data: {
            userId: testCustomer.id,
            tokenId: token.id,
            amount: Math.random() * 15 + 5, // Random usage between 5-20 kWh
            timestamp: date,
            metadata: {
              device: 'Smart Meter',
              location: 'Lagos',
            },
          },
        });
      }
      console.log('✅ Created sample usage logs');
    }
  }

  // Create sample carbon credits
  await prisma.carbonCredit.create({
    data: {
      userId: testCustomer.id,
      amount: 5.5,
      source: 'renewable_usage',
      renewableKwh: 55,
      isSold: false,
    },
  });
  console.log('✅ Created sample carbon credits');

  // Create usage limits for test customer
  await prisma.usageLimit.upsert({
    where: { userId: testCustomer.id },
    update: {},
    create: {
      userId: testCustomer.id,
      dailyLimit: 20,
      weeklyLimit: 120,
      monthlyLimit: 450,
      alertThreshold: 0.8,
    },
  });
  console.log('✅ Created usage limits');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

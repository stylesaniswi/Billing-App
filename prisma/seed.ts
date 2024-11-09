const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Seed admin user
  const adminPassword = await hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Seed default categories
  const categories = [
    { name: 'Services', color: '#4CAF50' },
    { name: 'Products', color: '#2196F3' },
    { name: 'Consulting', color: '#9C27B0' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  // Seed default configurations
  const configs = [
    {
      key: 'company_name',
      value: 'Modern Billing System',
      type: 'STRING',
      description: 'Company name displayed throughout the application',
    },
    {
      key: 'currency',
      value: 'USD',
      type: 'STRING',
      description: 'Default currency for invoices',
    },
    {
      key: 'tax_rate',
      value: '10',
      type: 'NUMBER',
      description: 'Default tax rate percentage',
    },
    {
      key: 'payment_methods',
      value: JSON.stringify(['CREDIT_CARD', 'PAYPAL', 'BANK_TRANSFER']),
      type: 'JSON',
      description: 'Enabled payment methods',
    },
  ];

  for (const config of configs) {
    await prisma.config.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }

  // Seed sample pages
  const pages = [
    {
      slug: 'about',
      title: 'About Us',
      content: '<h1>About Our Company</h1><p>We are a modern billing solution...</p>',
      published: true,
    },
    {
      slug: 'terms',
      title: 'Terms of Service',
      content: '<h1>Terms of Service</h1><p>Please read these terms carefully...</p>',
      published: true,
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }

  console.log('Seeding completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
// Script to create or update a manager user
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

(async () => {
  try {
    const email = process.argv[2] || 'manager@hrms.com';
    const password = process.argv[3] || 'password123';

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: { password: hashed, role: 'MANAGER' },
      create: { email, password: hashed, role: 'MANAGER' },
    });

    console.log(`Manager user ready:\n email: ${email}\n password: ${password}`);
  } catch (err) {
    console.error('Failed to create manager:', err);
  } finally {
    await prisma.$disconnect();
  }
})();

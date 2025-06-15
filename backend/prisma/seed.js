const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

  // Upsert an admin user and ensure it has a linked employee profile
  const adminPassword = await bcrypt.hash('adminpassword', 10); // Default password
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
      employee: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          department: 'Administration',
          jobTitle: 'System Administrator',
          hireDate: new Date(),
        },
      },
    },
    include: {
      employee: true,
    },
  });

  if (!adminUser.employee) {
    console.log('Admin user found but not linked to an employee. Linking now...');
    await prisma.employee.create({
      data: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        department: 'Administration',
        jobTitle: 'System Administrator',
        hireDate: new Date(),
        user: {
          connect: { id: adminUser.id },
        },
      },
    });
    console.log('Linked employee profile to admin user.');
  } else {
    console.log('Admin user already linked to an employee profile.');
  }

  // --- Upsert Manager User and link Employee Profile ---
  const managerPassword = await bcrypt.hash('password123', 10);
  let managerUser = await prisma.user.upsert({
    where: { email: 'manager@test.com' },
    update: { role: 'MANAGER' },
    create: {
      email: 'manager@test.com',
      password: managerPassword,
      role: 'MANAGER',
    },
    include: {
      employee: true,
    },
  });

  if (!managerUser.employee) {
    console.log('Manager user found but not linked to an employee. Linking now...');
    const managerEmployee = await prisma.employee.create({
      data: {
        firstName: 'Test',
        lastName: 'Manager',
        email: 'manager@test.com',
        department: 'Management',
        jobTitle: 'HR Manager',
        hireDate: new Date(),
        user: {
          connect: { id: managerUser.id },
        },
      },
    });
    console.log('Linked employee profile to manager user.');

    // Seed attendance records for the manager for the last 30 days
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      // Make it a weekday
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      let clockInTime, clockOutTime;

      // --- INTRODUCE ANOMALIES ---
      // On day 2, clock in very late.
      if (i === 2) {
        clockInTime = new Date(date.setHours(10, 30, 0, 0)); // 10:30 AM
      } else {
        clockInTime = new Date(date.setHours(9, 0, 0, 0) + Math.random() * 10 * 60 * 1000); // Clock in between 9:00 and 9:10
      }

      // On day 5, work an unusually long day.
      if (i === 5) {
        clockOutTime = new Date(date.setHours(22, 0, 0, 0)); // 10:00 PM
      } else {
        clockOutTime = new Date(date.setHours(17, 0, 0, 0) + Math.random() * 15 * 60 * 1000); // Clock out between 17:00 and 17:15
      }
      // --- END ANOMALIES ---

      await prisma.attendance.upsert({
        where: { employeeId_date: { employeeId: managerEmployee.id, date: date } },
        update: { clockIn: clockInTime, clockOut: clockOutTime, status: 'PRESENT' },
        create: {
          employeeId: managerEmployee.id,
          date: date,
          clockIn: clockInTime,
          clockOut: clockOutTime,
          status: 'PRESENT',
        },
      });
    }

    // Add a test payroll record for the manager
    await prisma.payroll.upsert({
      where: {
        employeeId_month_year: {
          employeeId: managerEmployee.id,
          month: 3, // March
          year: 2024,
        },
      },
      update: {},
      create: {
        employeeId: managerEmployee.id,
        month: 3, // March
        year: 2024,
        basic: 50000,
        allowances: 5000,
        deductions: 2000,
        net: 53000,
      },
    });
    console.log('Created test payroll for new manager employee.');

  } else {
    console.log('Manager user already linked to an employee profile.');

  // --- Seed a Default Onboarding Template ---
  const defaultTasks = [
    { taskName: 'Complete personal information form', order: 1 },
    { taskName: 'Sign employment contract', order: 2 },
    { taskName: 'Set up company email', order: 3 },
    { taskName: 'Complete IT security training', order: 4 },
    { taskName: 'Review employee handbook', order: 5 },
  ];

  const standardTemplate = await prisma.onboardingTemplate.upsert({
    where: { name: 'Standard Onboarding' },
    update: {},
    create: {
      name: 'Standard Onboarding',
      description: 'A standard set of tasks for all new employees.',
      tasks: {
        create: defaultTasks,
      },
    },
  });

  console.log(`Created/updated '${standardTemplate.name}' template.`);

  // --- Seed a Default Offboarding Template ---
  const defaultOffboardingTasks = [
    { taskName: 'Conduct exit interview', order: 1 },
    { taskName: 'Return company assets (laptop, ID card, etc.)', order: 2 },
    { taskName: 'Revoke access to all company systems', order: 3 },
    { taskName: 'Process final payroll', order: 4 },
    { taskName: 'Provide information on final benefits', order: 5 },
  ];

  const standardOffboardingTemplate = await prisma.offboardingTemplate.upsert({
    where: { name: 'Standard Offboarding' },
    update: {},
    create: {
      name: 'Standard Offboarding',
      description: 'A standard set of tasks for all departing employees.',
      tasks: {
        create: defaultOffboardingTasks,
      },
    },
  });

  console.log(`Created/updated '${standardOffboardingTemplate.name}' template.`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

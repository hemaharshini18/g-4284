const express = require('express');
const { PrismaClient } = require('@prisma/client');
const verifyToken = require('../middleware/verifyToken');
const { calculatePayroll } = require('../services/payrollCalculator');

const prisma = new PrismaClient();
const router = express.Router();

router.use(verifyToken);

// GET /api/payroll?month=&year=&employeeId=
router.get('/', async (req, res) => {
  const { month, year, employeeId } = req.query;
  try {
    const where = {};
    if (month) where.month = parseInt(month, 10);
    if (year) where.year = parseInt(year, 10);
    if (employeeId) where.employeeId = parseInt(employeeId, 10);

    const records = await prisma.payroll.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: { employee: { select: { firstName: true, lastName: true, position: true } } },
    });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch payroll' });
  }
});

// POST /api/payroll
router.post('/', async (req, res) => {
  if (req.user.role !== 'MANAGER') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { employeeId, month, year, basic } = req.body;
  if (!employeeId || !month || !year || basic == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { allowances, deductions, net } = calculatePayroll(basic);

    const record = await prisma.payroll.upsert({
      where: {
        employeeId_month_year: {
          employeeId,
          month,
          year,
        },
      },
      update: { basic, allowances, deductions, net },
      create: { employeeId, month, year, basic, allowances, deductions, net },
    });
    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save payroll' });
  }
});

module.exports = router;

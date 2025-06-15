const express = require('express');
const { PrismaClient } = require('@prisma/client');
const verifyToken = require('../middleware/verifyToken');

const prisma = new PrismaClient();
const router = express.Router();

router.use(verifyToken);

// GET /api/leave?employeeId=&from=&to=
router.get('/', async (req, res) => {
  const { employeeId, from, to } = req.query;
  try {
    const where = {};
    if (employeeId) where.employeeId = parseInt(employeeId, 10);
    if (from || to) {
      where.startDate = {};
      if (from) where.startDate.gte = new Date(from);
      if (to) where.startDate.lte = new Date(to);
    }
    const leaves = await prisma.leave.findMany({
      where,
      orderBy: { startDate: 'desc' },
      include: { employee: { select: { firstName: true, lastName: true } } },
    });
    res.json(leaves);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
});

// POST /api/leave
router.post('/', async (req, res) => {
  const { employeeId, startDate, endDate, type, reason } = req.body;
  if (!employeeId || !startDate || !endDate || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const leave = await prisma.leave.create({
      data: {
        employeeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type,
        reason,
      },
    });
    res.status(201).json(leave);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create leave' });
  }
});

// PUT /api/leave/:id -> update status (approve/reject)
router.put('/:id', async (req, res) => {
  if (req.user.role !== 'MANAGER') {
    return res.status(403).json({ error: 'Forbidden: Manager only' });
  }
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    const updated = await prisma.leave.update({
      where: { id },
      data: { status },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update leave' });
  }
});

module.exports = router;

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const verifyToken = require('../middleware/verifyToken');

const prisma = new PrismaClient();
const router = express.Router();

// protect all routes
router.use(verifyToken);

/**
 * GET /api/attendance
 * Optional query params:
 *  - from: ISO date (inclusive)
 *  - to:   ISO date (inclusive)
 *  - employeeId: number
 */
router.get('/', async (req, res) => {
  const { from, to, employeeId } = req.query;
  try {
    const where = {};
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }
    if (employeeId) where.employeeId = parseInt(employeeId, 10);

    const records = await prisma.attendance.findMany({
      where,
      orderBy: { date: 'asc' },
      include: {
        employee: {
          select: { firstName: true, lastName: true, department: true },
        },
      },
    });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

/**
 * POST /api/attendance/bulk
 * Accepts array of attendance objects.
 * Example body:
 * [ { employeeId, date, status, checkIn, checkOut, totalHours } ]
 */
router.post('/bulk', async (req, res) => {
  const records = req.body;
  if (!Array.isArray(records)) {
    return res.status(400).json({ error: 'Request body must be an array' });
  }
  try {
    const created = await prisma.$transaction(
      records.map((rec) =>
        prisma.attendance.upsert({
          where: {
            employeeId_date: {
              employeeId: rec.employeeId,
              date: new Date(rec.date),
            },
          },
          update: {
            status: rec.status,
            checkIn: rec.checkIn ? new Date(rec.checkIn) : null,
            checkOut: rec.checkOut ? new Date(rec.checkOut) : null,
            totalHours: rec.totalHours ?? null,
          },
          create: {
            employeeId: rec.employeeId,
            date: new Date(rec.date),
            status: rec.status || 'PRESENT',
            checkIn: rec.checkIn ? new Date(rec.checkIn) : null,
            checkOut: rec.checkOut ? new Date(rec.checkOut) : null,
            totalHours: rec.totalHours ?? null,
          },
        })
      )
    );
    res.json({ count: created.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upsert attendance' });
  }
});

/**
 * PUT /api/attendance/:id
 * Update an existing attendance record (correction)
 */
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const { status, checkIn, checkOut, totalHours } = req.body;
  try {
    const updated = await prisma.attendance.update({
      where: { id },
      data: {
        ...(status && { status }),
        checkIn: checkIn ? new Date(checkIn) : undefined,
        checkOut: checkOut ? new Date(checkOut) : undefined,
        totalHours: totalHours ?? undefined,
      },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});

/**
 * GET /api/attendance/today
 * Get the attendance record for the logged-in user for the current day.
 */
router.get('/today', async (req, res) => {
  const employeeId = req.user.employeeId;
  if (!employeeId) {
    return res.status(400).json({ error: 'User is not linked to an employee profile.' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const attendanceRecord = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: today,
      },
    });
    res.json(attendanceRecord);
  } catch (error) {
    console.error('Failed to fetch today\'s attendance', error);
    res.status(500).json({ error: 'Failed to fetch today\'s attendance' });
  }
});

/**
 * POST /api/attendance/clockin
 * Clock in the current user.
 */
router.post('/clockin', async (req, res) => {
  const employeeId = req.user.employeeId;
  if (!employeeId) {
    return res.status(400).json({ error: 'User is not linked to an employee profile.' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const existingRecord = await prisma.attendance.findFirst({
      where: { employeeId, date: today },
    });

    if (existingRecord) {
      return res.status(409).json({ error: 'Already clocked in for today.' });
    }

    const newRecord = await prisma.attendance.create({
      data: {
        employeeId,
        date: today,
        status: 'PRESENT',
        checkIn: new Date(),
      },
    });
    res.status(201).json(newRecord);
  } catch (error) {
    console.error('Clock-in failed', error);
    res.status(500).json({ error: 'Failed to clock in' });
  }
});

/**
 * POST /api/attendance/clockout
 * Clock out the current user.
 */
router.post('/clockout', async (req, res) => {
  const employeeId = req.user.employeeId;
  if (!employeeId) {
    return res.status(400).json({ error: 'User is not linked to an employee profile.' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const record = await prisma.attendance.findFirst({
      where: { employeeId, date: today },
    });

    if (!record) {
      return res.status(404).json({ error: 'No clock-in record found for today.' });
    }

    if (record.checkOut) {
      return res.status(409).json({ error: 'Already clocked out for today.' });
    }

    const checkOutTime = new Date();
    const totalHours = (checkOutTime - record.checkIn) / (1000 * 60 * 60); // in hours

    const updatedRecord = await prisma.attendance.update({
      where: { id: record.id },
      data: {
        checkOut: checkOutTime,
        totalHours: parseFloat(totalHours.toFixed(2)),
      },
    });
    res.json(updatedRecord);
  } catch (error) {
    console.error('Clock-out failed', error);
    res.status(500).json({ error: 'Failed to clock out' });
  }
});

module.exports = router;

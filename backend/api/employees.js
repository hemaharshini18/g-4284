const express = require('express');
const { PrismaClient } = require('@prisma/client');
const verifyToken = require('../middleware/verifyToken');

const prisma = new PrismaClient();
const router = express.Router();

// Apply JWT middleware to all routes in this router
router.use(verifyToken);

// GET /api/employees - list all employees
// List all employees
router.get('/', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { id: 'asc' },
    });
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// GET /api/employees/:id - get employee by id
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid employee id' });

  try {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { user: { select: { email: true } } },
    });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// POST /api/employees - create employee
router.post('/', async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    department,
    position,
    hireDate,
    status = 'FULL_TIME',
  } = req.body;

  if (!firstName || !lastName || !email || !department || !position || !hireDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Create user record as well (optional). For Phase-1 we allow employee without auth user.
    const employee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        department,
        position,
        hireDate: new Date(hireDate),
        status,
        user: {
          connect: { id: req.user.userId }
        }
      },
    });
    res.status(201).json(employee);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Email already exists.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// PUT /api/employees/:id - update employee
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid employee id' });

  try {
    const employee = await prisma.employee.update({
      where: { id },
      data: req.body,
    });
    res.json(employee);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Employee not found' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// DELETE /api/employees/:id - delete employee
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid employee id' });

  try {
    await prisma.employee.delete({ where: { id } });
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Employee not found' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

module.exports = router;

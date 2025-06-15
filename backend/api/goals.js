const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/verifyToken');
const authorize = require('../middleware/authorize');
const prisma = new PrismaClient();

// --- Goal Endpoints ---

// @route   POST api/goals
// @desc    Create a new goal for an employee
// @access  Private
router.post('/', auth, async (req, res) => {
  // An employee creates a goal for themselves. employeeId is from the authenticated user.
  const { title, description, dueDate } = req.body;
  const employeeId = req.user.employee.id;

  if (!title) {
    return res.status(400).json({ msg: 'Title is required.' });
  }

  try {
    const newGoal = await prisma.goal.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        employeeId: parseInt(employeeId),
      },
    });
    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// @route   GET api/goals/employee/:employeeId
// @desc    Get all goals for a specific employee
// @access  Private
router.get('/employee/:employeeId', auth, async (req, res) => {
  const { employeeId } = req.params;
  try {
    const goals = await prisma.goal.findMany({
      where: { employeeId: parseInt(employeeId) },
      include: {
        keyResults: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(goals);
  } catch (error) {
    console.error(`Error fetching goals for employee ${employeeId}:`, error);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// @route   PUT api/goals/:goalId
// @desc    Update a goal's details
// @access  Private
router.put('/:goalId', auth, async (req, res) => {
    const { goalId } = req.params;
    const { title, description, status, dueDate } = req.body;

    try {
        const goal = await prisma.goal.findUnique({ where: { id: parseInt(goalId) } });
        if (!goal) {
            return res.status(404).json({ msg: 'Goal not found.' });
        }

        if (goal.employeeId !== req.user.employee.id && !['ADMIN', 'HR'].includes(req.user.role)) {
            return res.status(403).json({ msg: 'Forbidden: You do not have permission to update this goal.' });
        }

        const updatedGoal = await prisma.goal.update({
            where: { id: parseInt(goalId) },
            data: {
                title,
                description,
                status,
                dueDate: dueDate ? new Date(dueDate) : undefined,
            },
        });
        res.json(updatedGoal);
    } catch (error) {
        console.error(`Error updating goal ${goalId}:`, error);
        res.status(500).json({ msg: 'Server error.' });
    }
});

// @route   DELETE api/goals/:goalId
// @desc    Delete a goal
// @access  Private
router.delete('/:goalId', auth, async (req, res) => {
    const { goalId } = req.params;
    try {
        const goal = await prisma.goal.findUnique({ where: { id: parseInt(goalId) } });
        if (!goal) {
            return res.status(404).json({ msg: 'Goal not found.' });
        }

        if (goal.employeeId !== req.user.employee.id && !['ADMIN', 'HR'].includes(req.user.role)) {
            return res.status(403).json({ msg: 'Forbidden: You do not have permission to delete this goal.' });
        }

        await prisma.goal.delete({ where: { id: parseInt(goalId) } });
        res.json({ msg: 'Goal deleted successfully.' });
    } catch (error) {
        console.error(`Error deleting goal ${goalId}:`, error);
        res.status(500).json({ msg: 'Server error.' });
    }
});


// --- Key Result Endpoints ---

// @route   POST api/goals/:goalId/key-results
// @desc    Add a key result to a goal
// @access  Private
router.post('/:goalId/key-results', auth, async (req, res) => {
  const { goalId } = req.params;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ msg: 'Title is required for a key result.' });
  }

  try {
    const goal = await prisma.goal.findUnique({ where: { id: parseInt(goalId) } });
    if (!goal) {
        return res.status(404).json({ msg: 'Goal not found.' });
    }

    if (goal.employeeId !== req.user.employee.id && !['ADMIN', 'HR'].includes(req.user.role)) {
        return res.status(403).json({ msg: 'Forbidden: You do not have permission to add key results to this goal.' });
    }

    const newKeyResult = await prisma.keyResult.create({
      data: {
        title,
        goalId: parseInt(goalId),
      },
    });
    res.status(201).json(newKeyResult);
  } catch (error) {
    console.error(`Error adding key result to goal ${goalId}:`, error);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// @route   PUT api/goals/key-results/:keyResultId
// @desc    Update a key result
// @access  Private
router.put('/key-results/:keyResultId', auth, async (req, res) => {
  const { keyResultId } = req.params;
  const { title, status, progress } = req.body;

  try {
    const keyResult = await prisma.keyResult.findUnique({ 
        where: { id: parseInt(keyResultId) },
        include: { goal: true }
    });
    if (!keyResult) {
        return res.status(404).json({ msg: 'Key result not found.' });
    }

    if (keyResult.goal.employeeId !== req.user.employee.id && !['ADMIN', 'HR'].includes(req.user.role)) {
        return res.status(403).json({ msg: 'Forbidden: You do not have permission to update this key result.' });
    }

    const updatedKeyResult = await prisma.keyResult.update({
      where: { id: parseInt(keyResultId) },
      data: {
        title,
        status,
        progress: progress !== undefined ? parseFloat(progress) : undefined,
      },
    });
    res.json(updatedKeyResult);
  } catch (error) {
    console.error(`Error updating key result ${keyResultId}:`, error);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// @route   DELETE api/goals/key-results/:keyResultId
// @desc    Delete a key result
// @access  Private
router.delete('/key-results/:keyResultId', auth, async (req, res) => {
    const { keyResultId } = req.params;
    try {
        const keyResult = await prisma.keyResult.findUnique({ 
            where: { id: parseInt(keyResultId) },
            include: { goal: true }
        });
        if (!keyResult) {
            return res.status(404).json({ msg: 'Key result not found.' });
        }

        if (keyResult.goal.employeeId !== req.user.employee.id && !['ADMIN', 'HR'].includes(req.user.role)) {
            return res.status(403).json({ msg: 'Forbidden: You do not have permission to delete this key result.' });
        }

        await prisma.keyResult.delete({ where: { id: parseInt(keyResultId) } });
        res.json({ msg: 'Key result deleted successfully.' });
    } catch (error) {
        console.error(`Error deleting key result ${keyResultId}:`, error);
        res.status(500).json({ msg: 'Server error.' });
    }
});

module.exports = router;

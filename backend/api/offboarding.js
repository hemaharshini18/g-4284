const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/verifyToken');
const authorize = require('../middleware/authorize');
const prisma = new PrismaClient();

// @route   POST api/offboarding/start/:employeeId
// @desc    Start the offboarding process for an employee
// @access  Private (HR only)
router.post('/start/:employeeId', [auth, authorize(['ADMIN', 'HR'])], async (req, res) => {
  const { employeeId } = req.params;

  try {
    // 1. Find the employee to ensure they exist
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(employeeId) },
    });

    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found.' });
    }

    // 2. Find the default offboarding template
    const standardTemplate = await prisma.offboardingTemplate.findUnique({
      where: { name: 'Standard Offboarding' },
      include: { tasks: { orderBy: { order: 'asc' } } },
    });

    if (!standardTemplate) {
      return res.status(500).json({ msg: 'Default offboarding template not found.' });
    }

    // 3. Create the offboarding tasks for the employee
    const tasksToCreate = standardTemplate.tasks.map(templateTask => ({
      employeeId: employee.id,
      taskName: templateTask.taskName,
    }));

    await prisma.offboardingTask.createMany({
      data: tasksToCreate,
    });

    // 4. Update the employee's status to OFFBOARDING
    const updatedEmployee = await prisma.employee.update({
      where: { id: parseInt(employeeId) },
      data: { status: 'OFFBOARDING' },
      include: { offboardingTasks: true },
    });

    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error('Error starting offboarding:', error);
    res.status(500).json({ msg: 'Server error while starting offboarding.' });
  }
});

// @route   GET api/offboarding
// @desc    Get all employees currently in offboarding
// @access  Private (HR, Manager)
router.get('/', [auth, authorize(['ADMIN', 'HR', 'MANAGER'])], async (req, res) => {
  try {
    const offboardingEmployees = await prisma.employee.findMany({
      where: { status: 'OFFBOARDING' },
      include: {
        offboardingTasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(offboardingEmployees);
  } catch (error) {
    console.error('Error fetching offboarding employees:', error);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// @route   PUT api/offboarding/tasks/:taskId
// @desc    Update the status of an offboarding task
// @access  Private (HR, Manager)
router.put('/tasks/:taskId', [auth, authorize(['ADMIN', 'HR', 'MANAGER'])], async (req, res) => {
  const { taskId } = req.params;
  const { completed } = req.body;

  try {
    const updatedTask = await prisma.offboardingTask.update({
      where: { id: parseInt(taskId) },
      data: { 
        completed,
        completedAt: completed ? new Date() : null,
      },
    });
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating offboarding task:', error);
    res.status(500).json({ msg: 'Server error.' });
  }
});

module.exports = router;

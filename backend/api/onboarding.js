const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/verifyToken');
const authorize = require('../middleware/authorize');
const prisma = new PrismaClient();



// @route   POST api/onboarding/start
// @desc    Start the onboarding process for a new employee
// @access  Private (HR only)
router.post('/', [auth, authorize(['ADMIN', 'HR'])], async (req, res) => {
  const { firstName, lastName, email, jobTitle, department, hireDate, userId } = req.body;

  if (!firstName || !lastName || !email || !jobTitle || !department || !hireDate || !userId) {
    return res.status(400).json({ msg: 'Please provide all required fields for the new employee.' });
  }

  try {
    // 1. Create the new employee record
    const newEmployee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        email,
        jobTitle,
        department,
        hireDate: new Date(hireDate),
        status: 'ONBOARDING',
        userId,
      },
    });

    // 2. Find the default onboarding template
    const standardTemplate = await prisma.onboardingTemplate.findUnique({
      where: { name: 'Standard Onboarding' },
      include: { tasks: { orderBy: { order: 'asc' } } },
    });

    if (!standardTemplate) {
      return res.status(500).json({ msg: 'Default onboarding template not found.' });
    }

    // 3. Create the onboarding tasks for the new employee from the template
    const tasksToCreate = standardTemplate.tasks.map(templateTask => ({
      employeeId: newEmployee.id,
      taskName: templateTask.taskName,
    }));

    await prisma.onboardingTask.createMany({
      data: tasksToCreate,
    });

    // 4. Fetch the employee with their new tasks to return
    const employeeWithTasks = await prisma.employee.findUnique({
      where: { id: newEmployee.id },
      include: { onboardingTasks: true },
    });

    res.status(201).json(employeeWithTasks);
  } catch (error) {
    console.error('Error starting onboarding:', error);
    if (error.code === 'P2002') {
        return res.status(409).json({ msg: 'An employee with this email or user ID already exists.' });
    }
    res.status(500).json({ msg: 'Server error while starting onboarding.' });
  }
});


// @route   GET api/onboarding
// @desc    Get all employees currently in onboarding
// @access  Private (HR only)
router.get('/', [auth, authorize(['ADMIN', 'HR', 'MANAGER'])], async (req, res) => {
  try {
    const onboardingEmployees = await prisma.employee.findMany({
      where: { status: 'ONBOARDING' },
      include: {
        onboardingTasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { hireDate: 'desc' },
    });
    res.json(onboardingEmployees);
  } catch (error) {
    console.error('Error fetching onboarding employees:', error);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// @route   GET api/onboarding/:employeeId
// @desc    Get onboarding status for a specific employee
// @access  Private
router.get('/:employeeId', auth, async (req, res) => {
    const { employeeId } = req.params;
    try {
        const employee = await prisma.employee.findUnique({
            where: { id: parseInt(employeeId) },
            include: {
                onboardingTasks: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!employee) {
            return res.status(404).json({ msg: 'Employee not found.' });
        }

        res.json(employee);
    } catch (error) {
        console.error(`Error fetching onboarding status for employee ${employeeId}:`, error);
        res.status(500).json({ msg: 'Server error.' });
    }
});


// @route   PUT api/onboarding/tasks/:taskId
// @desc    Mark an onboarding task as complete
// @access  Private
router.put('/tasks/:taskId', auth, async (req, res) => {
  const { taskId } = req.params;
  const { completed } = req.body;

  if (typeof completed !== 'boolean') {
      return res.status(400).json({ msg: 'Completed status must be a boolean.' });
  }

  try {
    const updatedTask = await prisma.onboardingTask.update({
      where: { id: parseInt(taskId) },
      data: {
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    // Optional: Check if all tasks are complete to update employee status
    if (completed) {
        const tasks = await prisma.onboardingTask.findMany({
            where: { employeeId: updatedTask.employeeId }
        });

        const allTasksCompleted = tasks.every(task => task.completed);

        if (allTasksCompleted) {
            await prisma.employee.update({
                where: { id: updatedTask.employeeId },
                data: { status: 'ACTIVE' },
            });
        }
    }

    res.json(updatedTask);
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    res.status(500).json({ msg: 'Server error.' });
  }
});


module.exports = router;

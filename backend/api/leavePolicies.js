const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/verifyToken');
const authorize = require('../middleware/authorize');
const prisma = new PrismaClient();

// @route   POST api/leave-policies
// @desc    Create a new leave policy
// @access  Private (Admin/HR)
router.post('/', [auth, authorize(['ADMIN', 'HR'])], async (req, res) => {
  const { name, defaultAllowance } = req.body;

  if (!name || !defaultAllowance) {
    return res.status(400).json({ msg: 'Please provide a name and default allowance.' });
  }

  try {
    const newPolicy = await prisma.leavePolicy.create({
      data: {
        name,
        defaultAllowance: parseFloat(defaultAllowance),
      },
    });

    // When a new policy is created, create a leave balance for all existing employees for the current year
    const employees = await prisma.employee.findMany({ select: { id: true } });
    const currentYear = new Date().getFullYear();

    const balancesToCreate = employees.map(employee => ({
      employeeId: employee.id,
      policyId: newPolicy.id,
      accrued: newPolicy.defaultAllowance,
      year: currentYear,
    }));

    if (balancesToCreate.length > 0) {
        await prisma.leaveBalance.createMany({
            data: balancesToCreate,
            skipDuplicates: true, // Avoid errors if a balance somehow already exists
        });
    }

    res.status(201).json(newPolicy);
  } catch (error) {
    console.error('Error creating leave policy:', error);
    if (error.code === 'P2002') {
        return res.status(409).json({ msg: 'A leave policy with this name already exists.' });
    }
    res.status(500).json({ msg: 'Server error.' });
  }
});

// @route   GET api/leave-policies
// @desc    Get all leave policies
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const policies = await prisma.leavePolicy.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(policies);
  } catch (error) {
    console.error('Error fetching leave policies:', error);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// @route   PUT api/leave-policies/:id
// @desc    Update a leave policy
// @access  Private (Admin/HR)
router.put('/:id', [auth, authorize(['ADMIN', 'HR'])], async (req, res) => {
  const { id } = req.params;
  const { name, defaultAllowance } = req.body;

  try {
    const updatedPolicy = await prisma.leavePolicy.update({
      where: { id: parseInt(id) },
      data: {
        name,
        defaultAllowance: defaultAllowance ? parseFloat(defaultAllowance) : undefined,
      },
    });
    res.json(updatedPolicy);
  } catch (error) {
    console.error(`Error updating leave policy ${id}:`, error);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// @route   DELETE api/leave-policies/:id
// @desc    Delete a leave policy
// @access  Private (Admin/HR)
router.delete('/:id', [auth, authorize(['ADMIN', 'HR'])], async (req, res) => {
  const { id } = req.params;
  try {
    // Note: Deleting a policy will also delete related leave balances due to cascading deletes in the schema
    await prisma.leavePolicy.delete({
      where: { id: parseInt(id) },
    });
    res.json({ msg: 'Leave policy removed.' });
  } catch (error) {
    console.error(`Error deleting leave policy ${id}:`, error);
    res.status(500).json({ msg: 'Server error.' });
  }
});

module.exports = router;

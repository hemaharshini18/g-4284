const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middleware/verifyToken');
const authorize = require('../middleware/authorize');

// @route   GET api/users
// @desc    Get all users
// @access  Private (Admin & HR)
router.get('/', [auth, authorize(['ADMIN', 'HR'])], async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        employee: {
            select: {
                firstName: true,
                lastName: true
            }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// @route   PUT api/users/:id/role
// @desc    Update a user's role
// @access  Private (Admin only)
router.put('/:id/role', [auth, authorize('ADMIN')], async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // Basic validation for the role
  if (!['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'].includes(role)) {
    return res.status(400).json({ msg: 'Invalid role specified.' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role },
      select: { id: true, email: true, role: true },
    });
    res.json(updatedUser);
  } catch (error) {
    console.error(`Error updating role for user ${id}:`, error);
    res.status(500).json({ msg: 'Server error.' });
  }
});

module.exports = router;

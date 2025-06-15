const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middleware/verifyToken');
const authorize = require('../middleware/authorize');

// @route   GET api/manager/team-overview
// @desc    Get an overview of the manager's team (direct reports)
// @access  Private (Manager only)
router.get('/team-overview', [auth, authorize(['MANAGER'])], async (req, res) => {
  try {
    const managerId = req.user.employee.id;

    // Get direct reports
    const teamMembers = await prisma.employee.findMany({
      where: { managerId: managerId },
      include: {
        goals: {
          include: {
            keyResults: true,
          },
        },
        leaves: {
          where: { status: 'PENDING' },
        },
      },
    });

    // Process data for the dashboard
    const overview = {
      teamSize: teamMembers.length,
      teamData: teamMembers.map(member => ({
        id: member.id,
        name: `${member.firstName} ${member.lastName}`,
        jobTitle: member.jobTitle,
        goalsInProgress: member.goals.filter(g => g.status === 'ON_TRACK').length,
        goalsAtRisk: member.goals.filter(g => g.status === 'AT_RISK').length,
        pendingLeaveRequests: member.leaves.length,
      })),
    };

    res.json(overview);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

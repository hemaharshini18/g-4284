const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middleware/verifyToken');

// @route   GET api/employee/dashboard
// @desc    Get dashboard data for the logged-in employee
// @access  Private (Employee only)
router.get('/dashboard', auth, async (req, res) => {
  try {
    const employeeId = req.user.employee.id;

    // Fetch data in parallel
    const [goals, leaveBalances, recentAttendance] = await Promise.all([
      prisma.goal.findMany({
        where: { 
          employeeId: employeeId,
          status: { in: ['ON_TRACK', 'AT_RISK'] }
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),
      prisma.leaveBalance.findMany({
        where: { employeeId: employeeId },
        include: { policy: true },
      }),
      prisma.attendance.findMany({
        where: { employeeId: employeeId },
        orderBy: { date: 'desc' },
        take: 7, // Last 7 days
      }),
    ]);

    const dashboardData = {
      upcomingGoals: goals,
      leaveBalances: leaveBalances.map(lb => ({
        policyName: lb.policy.name,
        balance: lb.accrued - lb.used,
      })),
      recentAttendance,
    };

    res.json(dashboardData);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

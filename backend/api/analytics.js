const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middleware/verifyToken');
const authorize = require('../middleware/authorize');

// Assuming these services exist and have placeholder logic
const { predictAttrition } = require('../services/attritionPredictor');
const { detectAnomalies } = require('../services/anomalyDetector');
const { generateFeedback } = require('../services/feedbackGenerator');
const { generateReportSummary } = require('../services/reportGenerator');

// Middleware to protect all analytics routes
router.use(auth, authorize(['ADMIN', 'HR', 'MANAGER']));

// @route   GET api/analytics/summary
// @desc    Get high-level dashboard summary metrics
// @access  Private (Admin, HR, Manager)
router.get('/summary', async (req, res) => {
  try {
    const totalEmployees = await prisma.employee.count();
    const onboardingCount = await prisma.employee.count({ where: { status: 'ONBOARDING' } });
    
    const goals = await prisma.goal.findMany({
      select: { status: true }
    });
    const totalGoals = goals.length;
    const achievedGoals = goals.filter(g => g.status === 'ACHIEVED').length;
    const completionRate = totalGoals > 0 ? (achievedGoals / totalGoals) * 100 : 0;

    res.json({
      totalEmployees,
      onboardingCount,
      totalGoals,
      achievedGoals,
      goalCompletionRate: completionRate.toFixed(1),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/analytics/goal-performance
// @desc    Get data for goal performance charts
// @access  Private (Admin, HR, Manager)
router.get('/goal-performance', async (req, res) => {
    try {
        const goalsByStatus = await prisma.goal.groupBy({
            by: ['status'],
            _count: {
                id: true,
            },
        });

        // Reformat for charting library
        const formattedGoalsByStatus = goalsByStatus.map(item => ({
            name: item.status.replace('_', ' '),
            value: item._count.id,
        }));

        res.json({ goalsByStatus: formattedGoalsByStatus });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/analytics/leave-trends
// @desc    Get data for leave analysis charts
// @access  Private (Admin, HR, Manager)
router.get('/leave-trends', async (req, res) => {
    try {
        const leaveData = await prisma.leave.findMany({
            where: { status: 'APPROVED' },
            include: { policy: true },
        });

        const leaveByPolicy = leaveData.reduce((acc, leave) => {
            const policyName = leave.policy.name;
            if (!acc[policyName]) {
                acc[policyName] = 0;
            }
            acc[policyName] += leave.days;
            return acc;
        }, {});
        
        const formattedLeaveByPolicy = Object.entries(leaveByPolicy).map(([name, value]) => ({
            name,
            days: value,
        }));

        res.json({ leaveByPolicy: formattedLeaveByPolicy });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- Existing AI/ML Endpoints (Now Secured) ---

// @route   POST api/analytics/predict-attrition/:id
// @desc    Get attrition prediction for a single employee
// @access  Private (Admin, HR, Manager)
router.post('/predict-attrition/:id', auth, authorize(['ADMIN', 'HR']), async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id, 10);

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    // This is a placeholder for a real ML model
    const prediction = await predictAttrition(employee);

    res.json(prediction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



// @route   GET api/analytics/anomalies
// @desc    Get all detected HR data anomalies
// @access  Private (Admin, HR, Manager)
router.get('/anomalies', async (req, res) => {
  try {
    const anomalies = await detectAnomalies();
    res.json(anomalies);
  } catch (err) {
    console.error('Error fetching anomalies:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/analytics/generate-feedback
// @desc    Generate AI-powered performance feedback
// @access  Private (Admin, HR, Manager)
router.post('/generate-feedback', async (req, res) => {
  try {
    const { rating, comments } = req.body;

    if (!rating || !comments) {
      return res.status(400).json({ msg: 'Rating and comments are required.' });
    }

    const feedback = await generateFeedback(rating, comments);
    res.json({ feedback });
  } catch (err) {
    console.error('Error generating feedback:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/analytics/generate-summary
// @desc    Generate a natural language summary of HR analytics
// @access  Private (Admin, HR, Manager)
router.post('/generate-summary', async (req, res) => {
  try {
    // 1. Get Total Employees
    const totalEmployees = await prisma.employee.count();

    // 2. Calculate Average Tenure
    const employees = await prisma.employee.findMany({
      select: { hireDate: true },
    });
    const totalTenure = employees.reduce((acc, emp) => {
      return acc + (new Date().getTime() - new Date(emp.hireDate).getTime());
    }, 0);
    const averageTenureInYears = employees.length > 0
      ? (totalTenure / employees.length) / (1000 * 60 * 60 * 24 * 365.25)
      : 0;

    // 3. Calculate Average Satisfaction from Performance Reviews
    const reviews = await prisma.performanceReview.findMany({
      select: { rating: true },
    });
    const totalSatisfaction = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageSatisfaction = reviews.length > 0 ? totalSatisfaction / reviews.length : 0;

    // 4. Get Leave Data
    const today = new Date();
    const totalOnLeave = await prisma.leave.count({
      where: {
        status: 'APPROVED',
        startDate: { lte: today },
        endDate: { gte: today },
      },
    });

    const leaveReasons = await prisma.leave.groupBy({
      by: ['reason'],
      _count: { reason: true },
      orderBy: { _count: { reason: 'desc' } },
      take: 1,
    });
    const mostCommonReason = leaveReasons.length > 0 ? leaveReasons[0].reason : 'N/A';

    // 5. Consolidate data and generate report
    const reportData = {
      totalEmployees,
      averageTenure: averageTenureInYears,
      averageSatisfaction,
      leaveData: {
        totalOnLeave,
        mostCommonReason,
      },
    };

    const summary = generateReportSummary(reportData);

    res.json({ summary });

  } catch (err) {
    console.error('Error generating report summary:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

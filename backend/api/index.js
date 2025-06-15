const express = require('express');
const router = express.Router();

// Define all API routes
router.use('/auth', require('./auth'));
router.use('/employees', require('./employees'));
router.use('/attendance', require('./attendance'));
router.use('/leave', require('./leave'));
router.use('/payroll', require('./payroll'));
router.use('/performance', require('./performance')); // The new performance route
router.use('/reports', require('./reports'));
router.use('/chatbot', require('./chatbot'));
router.use('/offboarding', require('./offboarding'));
router.use('/analytics', require('./analytics'));
router.use('/recruitment', require('./recruitment'));
router.use('/documents', require('./documents'));
router.use('/onboarding', require('./onboarding'));
router.use('/leave-policies', require('./leavePolicies'));
router.use('/goals', require('./goals'));
router.use('/users', require('./users'));
router.use('/manager', require('./manager'));
router.use('/employee', require('./employee'));

module.exports = router;

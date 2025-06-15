const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const prisma = new PrismaClient();

// Helper to convert JSON to CSV
const jsonToCsv = (items) => {
  const header = Object.keys(items[0]);
  const headerString = header.join(',');
  const replacer = (key, value) => value ?? '';
  const rowItems = items.map((row) =>
    header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(',')
  );
  return [headerString, ...rowItems].join('\r\n');
};

// @route   GET api/reports/attendance
// @desc    Generate an attendance report as a CSV file
// @access  Private
router.get('/attendance', async (req, res) => {
  try {
    const attendanceRecords = await prisma.attendance.findMany({
      include: {
        employee: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    if (attendanceRecords.length === 0) {
      return res.status(404).json({ msg: 'No attendance records found' });
    }

    const formattedRecords = attendanceRecords.map(r => ({
      employee: `${r.employee.firstName} ${r.employee.lastName}`,
      email: r.employee.email,
      date: r.date.toISOString().split('T')[0],
      status: r.status,
      checkIn: r.checkIn?.toLocaleTimeString() || 'N/A',
      checkOut: r.checkOut?.toLocaleTimeString() || 'N/A',
      totalHours: r.totalHours?.toFixed(2) || 'N/A',
    }));

    const csv = jsonToCsv(formattedRecords);

    res.header('Content-Type', 'text/csv');
    res.attachment('attendance_report.csv');
    res.send(csv);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/reports/payroll
// @desc    Generate a payroll report as a PDF file
// @access  Private
router.get('/payroll', async (req, res) => {
  try {
    const payrollRecords = await prisma.payroll.findMany({
      include: {
        employee: {
          select: { firstName: true, lastName: true, department: true },
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    if (payrollRecords.length === 0) {
      return res.status(404).json({ msg: 'No payroll records found' });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=payroll_report.pdf');

    doc.pipe(res);

    // Add header
    doc.fontSize(20).text('Payroll Report', { align: 'center' });
    doc.moveDown();

    // Table Header
    const tableTop = doc.y;
    const nameX = 50;
    const departmentX = 150;
    const periodX = 250;
    const basicX = 320;
    const netX = 400;

    doc.fontSize(10).text('Employee', nameX, tableTop);
    doc.text('Department', departmentX, tableTop);
    doc.text('Period', periodX, tableTop);
    doc.text('Basic', basicX, tableTop, { width: 60, align: 'right' });
    doc.text('Net Pay', netX, tableTop, { width: 60, align: 'right' });

    doc.moveTo(nameX, doc.y + 15).lineTo(netX + 60, doc.y + 15).stroke();
    doc.y += 20;

    // Table Rows
    payrollRecords.forEach(record => {
      const y = doc.y;
      doc.fontSize(10).text(`${record.employee.firstName} ${record.employee.lastName}`, nameX, y, { width: 100 });
      doc.text(record.employee.department, departmentX, y, { width: 100 });
      doc.text(`${record.month}/${record.year}`, periodX, y);
      doc.text(record.basic.toFixed(2), basicX, y, { width: 60, align: 'right' });
      doc.text(record.net.toFixed(2), netX, y, { width: 60, align: 'right' });
      doc.y += 20;
    });

    doc.end();

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/reports/leave
// @desc    Generate a leave report as a CSV file
// @access  Private
router.get('/leave', async (req, res) => {
  try {
    const leaveRecords = await prisma.leave.findMany({
      include: {
        employee: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    if (leaveRecords.length === 0) {
      return res.status(404).json({ msg: 'No leave records found' });
    }

    const formattedRecords = leaveRecords.map(r => ({
      employee: `${r.employee.firstName} ${r.employee.lastName}`,
      email: r.employee.email,
      startDate: r.startDate.toISOString().split('T')[0],
      endDate: r.endDate.toISOString().split('T')[0],
      type: r.type,
      status: r.status,
      reason: r.reason || 'N/A',
    }));

    const csv = jsonToCsv(formattedRecords);

    res.header('Content-Type', 'text/csv');
    res.attachment('leave_report.csv');
    res.send(csv);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

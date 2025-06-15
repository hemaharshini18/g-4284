const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

/**
 * Main function to detect anomalies using an external AI service.
 * It gathers all relevant HR data and sends it to an AI for analysis.
 * If the AI service is unavailable, it falls back to a local placeholder.
 */
async function detectAnomalies() {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    console.warn('AI_API_KEY not set. Falling back to placeholder anomaly detector.');
    return detectAnomaliesPlaceholder();
  }

  try {
    // 1. Gather all necessary data from the database
    const analysisPeriodDays = 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - analysisPeriodDays);

    const attendanceData = await prisma.attendance.findMany({
      where: { date: { gte: startDate } },
      select: { employeeId: true, checkIn: true, totalHours: true, date: true },
    });

    const leaveData = await prisma.leave.findMany({
      where: { date: { gte: startDate }, status: 'APPROVED' },
      select: { employeeId: true, days: true, reason: true },
    });

    const goalData = await prisma.goal.findMany({
      select: { employeeId: true, status: true },
    });

    // 2. Create a comprehensive prompt for the AI model
    const prompt = `
      Analyze the following raw HR data from the last ${analysisPeriodDays} days to identify any potential anomalies.
      An anomaly is an observation that deviates significantly from other observations.
      For each detected anomaly, provide a JSON object with the keys: "id", "type", "description", "employeeId", "severity", "date", and "recommendation".
      Return a single JSON array containing all detected anomaly objects.

      Data:
      - Attendance Records: ${JSON.stringify(attendanceData)}
      - Approved Leave Records: ${JSON.stringify(leaveData)}
      - Goal Statuses: ${JSON.stringify(goalData)}

      Look for patterns such as:
      - Consistently late clock-ins.
      - Unusually high or low work hours compared to peers or personal average.
      - Excessive leave-taking.
      - Sudden drops in goal achievement.
      - Any other patterns that seem unusual for a corporate environment.

      If no anomalies are found, return an empty array.
    `;

    // 3. Call the external AI service
    const response = await axios.post(
      'https://api.some-ai-provider.com/v1/completions', // Replace with your actual endpoint
      {
        model: 'text-davinci-003',
        prompt,
        max_tokens: 1024, // Allow for a larger response
        temperature: 0.3,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    if (response.data && response.data.choices && response.data.choices[0].text) {
      const resultText = response.data.choices[0].text.trim();
      const anomalies = JSON.parse(resultText);
      // Add employee names to the anomalies
      for (const anomaly of anomalies) {
        const employee = await prisma.employee.findUnique({ where: { id: anomaly.employeeId }, select: { firstName: true, lastName: true } });
        if (employee) {
          anomaly.employeeName = `${employee.firstName} ${employee.lastName}`;
        }
      }
      return anomalies;
    } else {
      throw new Error('Invalid response structure from AI service.');
    }
  } catch (error) {
    console.error('Error calling AI service for anomaly detection:', error.message);
    console.log('Falling back to placeholder detection due to API error.');
    return detectAnomaliesPlaceholder();
  }
}


// --- Placeholder Logic (Fallback) ---

async function detectAnomaliesPlaceholder() {
  console.log('Running placeholder anomaly detection services...');
  const allAnomalies = [];
  const prisma = new PrismaClient();
  try {
    const attendanceAnomalies = await detectAttendanceAnomalies(prisma);
    const leaveAnomalies = await detectHighLeaveBalances(prisma);
    allAnomalies.push(...attendanceAnomalies, ...leaveAnomalies);
    return allAnomalies.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error during placeholder anomaly detection:', error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

// Configuration for placeholder anomaly detection
const LATE_THRESHOLD_MINUTES = 15;
const WORK_DAY_START_HOUR = 9;
const STD_DEV_THRESHOLD = 2;
const ANALYSIS_PERIOD_DAYS = 30;
const HIGH_LEAVE_BALANCE_THRESHOLD_MULTIPLIER = 2;

function getStats(data) {
  if (data.length === 0) return { mean: 0, stdDev: 0 };
  const mean = data.reduce((acc, val) => acc + val, 0) / data.length;
  const stdDev = Math.sqrt(
    data.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / data.length
  );
  return { mean, stdDev };
}

async function detectAttendanceAnomalies(prisma) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - ANALYSIS_PERIOD_DAYS);
  const records = await prisma.attendance.findMany({
    where: { date: { gte: startDate }, checkIn: { not: null }, totalHours: { not: null } },
    include: { employee: { select: { id: true, firstName: true, lastName: true } } },
  });
  const anomalies = [];
  const employeeHours = {};
  for (const record of records) {
    const checkInTime = new Date(record.checkIn);
    const expectedCheckInTime = new Date(record.date);
    expectedCheckInTime.setHours(WORK_DAY_START_HOUR, LATE_THRESHOLD_MINUTES, 0, 0);
    if (checkInTime > expectedCheckInTime) {
      anomalies.push({
        id: `late-${record.id}`, type: 'Late Clock-In',
        description: `Clocked in at ${checkInTime.toLocaleTimeString()} on ${record.date.toLocaleDateString()}`,
        employeeId: record.employee.id, employeeName: `${record.employee.firstName} ${record.employee.lastName}`,
        severity: 'Low', date: record.date.toISOString(), recommendation: 'Monitor for repeated occurrences.',
      });
    }
    if (!employeeHours[record.employeeId]) employeeHours[record.employeeId] = [];
    employeeHours[record.employeeId].push(record.totalHours);
  }
  for (const empId in employeeHours) {
    const hoursData = employeeHours[empId];
    if (hoursData.length < 5) continue;
    const { mean, stdDev } = getStats(hoursData);
    const employee = records.find(r => r.employeeId == empId).employee;
    for (const record of records.filter(r => r.employeeId == empId)) {
      const deviation = Math.abs(record.totalHours - mean);
      if (deviation > STD_DEV_THRESHOLD * stdDev) {
        const type = record.totalHours > mean ? 'Unusually Long Hours' : 'Unusually Short Hours';
        anomalies.push({
          id: `${type.toLowerCase().replace(/\s+/g, '-')}-${record.id}`, type,
          description: `Worked ${record.totalHours.toFixed(1)} hours on ${record.date.toLocaleDateString()}, average is ${mean.toFixed(1)} hours.`,
          employeeId: record.employee.id, employeeName: `${employee.firstName} ${employee.lastName}`,
          severity: 'Medium', date: record.date.toISOString(), recommendation: 'Manager to verify reason for deviation.',
        });
      }
    }
  }
  return anomalies;
}

async function detectHighLeaveBalances(prisma) {
  const balances = await prisma.leaveBalance.findMany({
    select: { accrued: true, employee: { select: { id: true, firstName: true, lastName: true } } }
  });
  if (balances.length < 5) return [];
  const { mean } = getStats(balances.map(b => b.accrued));
  const threshold = mean * HIGH_LEAVE_BALANCE_THRESHOLD_MULTIPLIER;
  return balances
    .filter(b => b.accrued > threshold)
    .map(b => ({
      id: `high-leave-${b.employee.id}`, type: 'High Leave Balance', severity: 'Warning',
      description: `${b.employee.firstName} ${b.employee.lastName} has an accrued leave balance of ${b.accrued}, well above the average of ${mean.toFixed(1)}.`, 
      employeeId: b.employee.id, employeeName: `${b.employee.firstName} ${b.employee.lastName}`,
      date: new Date().toISOString(), recommendation: 'Encourage employee to take leave to prevent burnout.',
    }));
}

module.exports = { detectAnomalies };

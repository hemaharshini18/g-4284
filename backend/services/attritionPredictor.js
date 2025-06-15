const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

/**
 * Predicts employee attrition using an external AI service.
 * @param {object} employee The employee object from Prisma.
 * @returns {Promise<object>} An object containing the attrition prediction details.
 */
async function predictAttrition(employee) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    console.warn('AI_API_KEY not set. Falling back to placeholder attrition predictor.');
    return predictAttritionPlaceholder(employee);
  }

  // 1. Gather comprehensive data for the prompt
  const recentLeaves = await getRecentLeaveDays(employee.id);
  const performanceRatio = await getGoalPerformanceRatio(employee.id);
  const tenureInDays = (new Date() - new Date(employee.hireDate)) / (1000 * 60 * 60 * 24);

  // 2. Create a detailed prompt for the AI model
  const prompt = `Analyze the following employee profile to predict the risk of attrition (Low, Medium, or High). Provide a risk score between 0.0 and 1.0 and a list of the key contributing factors.

Employee Data:
- Job Title: ${employee.jobTitle}
- Department: ${employee.department}
- Tenure: ${tenureInDays.toFixed(0)} days
- Recent Leave Days (last 90 days): ${recentLeaves}
- Goal Achievement Rate: ${(performanceRatio * 100).toFixed(0)}%

Based on this data, provide a JSON object with the keys: "riskLevel", "riskScore", and "factors".`;

  try {
    // 3. Call the external AI service
    const response = await axios.post(
      'https://api.some-ai-provider.com/v1/completions', // Replace with your actual endpoint
      {
        model: 'text-davinci-003', // Example model
        prompt: prompt,
        max_tokens: 150,
        temperature: 0.5,
        n: 1,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    if (response.data && response.data.choices && response.data.choices[0].text) {
      const result = JSON.parse(response.data.choices[0].text.trim());
      return {
        employeeId: employee.id,
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        predictionDate: new Date().toISOString(),
        factors: result.factors || ['AI model did not provide specific factors.'],
      };
    } else {
      throw new Error('Invalid response structure from AI service.');
    }
  } catch (error) {
    console.error('Error calling AI service for attrition prediction:', error.message);
    console.log('Falling back to placeholder prediction due to API error.');
    return predictAttritionPlaceholder(employee); // Fallback
  }
}

// --- Placeholder Logic (Fallback) ---

async function predictAttritionPlaceholder(employee) {
  let riskScore = 0;
  const factors = [];

  const tenureInDays = (new Date() - new Date(employee.hireDate)) / (1000 * 60 * 60 * 24);
  if (tenureInDays < 180) {
    riskScore += 0.2;
    factors.push('New hire (less than 6 months)');
  } else if (tenureInDays < 730) {
    riskScore += 0.1;
    factors.push('Relatively new hire (less than 2 years)');
  }

  const roleRisk = getRoleRisk(employee.jobTitle);
  if (roleRisk > 0) {
    riskScore += roleRisk;
    factors.push(`High-turnover role detected: ${employee.jobTitle}`);
  }

  const recentLeaves = await getRecentLeaveDays(employee.id);
  if (recentLeaves > 10) {
    riskScore += 0.25;
    factors.push(`High number of leave days recently (${recentLeaves} days)`);
  }

  const performanceRatio = await getGoalPerformanceRatio(employee.id);
  if (performanceRatio < 0.5) {
    riskScore += 0.3;
    factors.push(`Low goal achievement rate (${(performanceRatio * 100).toFixed(0)}%)`);
  }

  riskScore = Math.min(riskScore, 1.0);

  let riskLevel = 'Low';
  if (riskScore > 0.7) {
    riskLevel = 'High';
  } else if (riskScore > 0.4) {
    riskLevel = 'Medium';
  }

  return {
    employeeId: employee.id,
    riskScore: riskScore.toFixed(2),
    riskLevel,
    predictionDate: new Date().toISOString(),
    factors: factors.length > 0 ? factors : ['No significant risk factors detected.'],
  };
}

function getRoleRisk(jobTitle) {
  const highRiskRoles = ['Sales Development Representative', 'Customer Support Agent', 'Junior Developer'];
  if (jobTitle && highRiskRoles.includes(jobTitle)) {
    return 0.15;
  }
  return 0;
}

async function getRecentLeaveDays(employeeId) {
  const ninetyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 90));
  const leaves = await prisma.leave.aggregate({
    _sum: { days: true },
    where: {
      employeeId,
      status: 'APPROVED',
      startDate: { gte: ninetyDaysAgo },
    },
  });
  return leaves._sum.days || 0;
}

async function getGoalPerformanceRatio(employeeId) {
  const goals = await prisma.goal.findMany({
    where: { employeeId },
    select: { status: true },
  });

  if (goals.length === 0) return 1;

  const achievedCount = goals.filter(g => g.status === 'ACHIEVED').length;
  return achievedCount / goals.length;
}

module.exports = { predictAttrition };

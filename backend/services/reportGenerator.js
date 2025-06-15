/**
 * Generates a natural language summary from structured analytics data.
 * @param {object} data - The analytics data.
 * @param {number} data.totalEmployees - Total number of employees.
 * @param {number} data.averageTenure - Average employee tenure in years.
 * @param {number} data.averageSatisfaction - Average employee satisfaction score (1-5).
 * @param {object} data.leaveData - Data about employee leaves.
 * @param {number} data.leaveData.totalOnLeave - Total employees on leave.
 * @param {string} data.leaveData.mostCommonReason - Most common reason for leave.
 * @returns {string} A natural language summary.
 */
const generateReportSummary = (data) => {
  const {
    totalEmployees,
    averageTenure,
    averageSatisfaction,
    leaveData,
  } = data;

  let summary = `### HR Analytics Summary\n\n`;
  summary += `The organization currently has **${totalEmployees} employees**. `;
  summary += `The average employee tenure is **${averageTenure.toFixed(1)} years**, indicating a stable workforce. `;

  if (averageSatisfaction > 4.0) {
    summary += `Employee satisfaction is **very high**, with an average rating of **${averageSatisfaction.toFixed(2)} out of 5**. `;
  } else if (averageSatisfaction > 3.0) {
    summary += `Employee satisfaction is **good**, with an average rating of **${averageSatisfaction.toFixed(2)} out of 5**. `;
  } else {
    summary += `Attention may be needed to improve employee satisfaction, which currently has an average rating of **${averageSatisfaction.toFixed(2)} out of 5**. `;
  }

  summary += `\n\nRegarding attendance, there are currently **${leaveData.totalOnLeave} employees on leave**. `;
  summary += `The most frequently cited reason for absence is **"${leaveData.mostCommonReason}"**. `;

  summary += `\n\n**Key Insights:**\n`;
  summary += `- **Workforce Stability:** The average tenure suggests good employee retention.\n`;
  summary += `- **Satisfaction Levels:** Overall satisfaction is positive, but continuous monitoring is advised.\n`;
  summary += `- **Leave Trends:** Monitoring the reasons for leave, especially "${leaveData.mostCommonReason}", could highlight areas for employee support initiatives.`;

  return summary;
};

module.exports = { generateReportSummary };

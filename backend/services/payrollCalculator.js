/**
 * Simplified Indian Payroll Calculator
 * Note: This is a simplified model for demonstration purposes and may not be fully compliant
 * with all Indian tax laws, which are subject to change and individual circumstances.
 */

// Simplified TDS calculation based on the New Tax Regime (FY 2023-24)
const calculateTDS = (annualGrossSalary) => {
  // Standard Deduction under the new regime
  const taxableIncome = annualGrossSalary - 50000;

  if (taxableIncome <= 300000) {
    return 0;
  }

  let tax = 0;
  if (taxableIncome > 1500000) {
    tax += (taxableIncome - 1500000) * 0.30;
  }
  if (taxableIncome > 1200000) {
    tax += (Math.min(taxableIncome, 1500000) - 1200000) * 0.20;
  }
  if (taxableIncome > 900000) {
    tax += (Math.min(taxableIncome, 1200000) - 900000) * 0.15;
  }
  if (taxableIncome > 600000) {
    tax += (Math.min(taxableIncome, 900000) - 600000) * 0.10;
  }
  if (taxableIncome > 300000) {
    tax += (Math.min(taxableIncome, 600000) - 300000) * 0.05;
  }

  return tax / 12; // Return monthly TDS
};

const calculatePayroll = (basic) => {
  // 1. Allowances
  // Simplified HRA calculation (e.g., 40% of basic)
  const hra = basic * 0.40;
  const allowances = hra;

  // 2. Deductions
  // Simplified PF calculation (12% of basic)
  const pf = basic * 0.12;
  
  // Simplified TDS calculation
  const annualGross = (basic + allowances) * 12;
  const tds = calculateTDS(annualGross);

  const deductions = pf + tds;

  // 3. Net Salary
  const net = basic + allowances - deductions;

  return {
    allowances: parseFloat(allowances.toFixed(2)),
    deductions: parseFloat(deductions.toFixed(2)),
    net: parseFloat(net.toFixed(2)),
  };
};

module.exports = { calculatePayroll };

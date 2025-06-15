// A simple rule-based chatbot logic
const getChatbotResponse = (message) => {
  const lowerCaseMessage = message.toLowerCase();

  if (lowerCaseMessage.includes('leave balance')) {
    return 'You can check your leave balance on the Leave page. You have 12 days of casual leave and 5 days of sick leave remaining.';
  } else if (lowerCaseMessage.includes('payroll')) {
    return 'Payroll is processed on the last working day of each month. Your latest payslip is available on the Payroll page.';
  } else if (lowerCaseMessage.includes('policy')) {
    return 'Our company policies are available in the employee handbook. If you need a specific policy, please let me know.';
  } else if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
    return 'Hello! How can I help you today?';
  } else {
    return "I'm sorry, I don't understand that question. You can ask me about leave balance, payroll, or company policies.";
  }
};

module.exports = { getChatbotResponse };

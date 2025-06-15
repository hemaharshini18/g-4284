import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { downloadAttendanceReport, downloadPayrollReport, downloadLeaveReport, generateReportSummary } from '../services/api';
import './ReportsPage.css';

const ReportsPage = () => {
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    setError('');
    setSummary('');
    try {
      const response = await generateReportSummary();
      setSummary(response.data.summary);
    } catch (err) {
      setError('Failed to generate summary. Please try again.');
      console.error('Error generating summary:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="reports-page">
      <h1>Reports & Analytics</h1>

      <div className="smart-summary-section report-card">
        <h2>AI-Powered Smart Summary</h2>
        <p>Get a quick, AI-generated natural language overview of key HR metrics.</p>
        <button onClick={handleGenerateSummary} disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Generate Smart Summary'}
        </button>
        {error && <div className="error-message" style={{ marginTop: '1rem' }}>{error}</div>}
        {summary && (
          <div className="summary-content">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        )}
      </div>

      <h2>Standard Reports</h2>
      <div className="reports-grid">
        <div className="report-card">
          <h3>Attendance Report</h3>
          <p>Download a monthly attendance report for all employees.</p>
          <button onClick={async () => {
            try {
              const response = await downloadAttendanceReport();
              const url = window.URL.createObjectURL(new Blob([response.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'attendance_report.csv');
              document.body.appendChild(link);
              link.click();
              link.remove();
            } catch (error) {
              console.error('Error downloading report:', error);
            }
          }}>Download CSV</button>
        </div>
        <div className="report-card">
          <h3>Payroll Report</h3>
          <p>Generate a summary of the latest payroll run.</p>
          <button onClick={async () => {
            try {
              const response = await downloadPayrollReport();
              const url = window.URL.createObjectURL(new Blob([response.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'payroll_report.pdf');
              document.body.appendChild(link);
              link.click();
              link.remove();
            } catch (error) {
              console.error('Error downloading report:', error);
            }
          }}>Download PDF</button>
        </div>
        <div className="report-card">
          <h3>Leave Report</h3>
          <p>View a report of all leave taken in the last quarter.</p>
          <button onClick={async () => {
            try {
              const response = await downloadLeaveReport();
              const url = window.URL.createObjectURL(new Blob([response.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'leave_report.csv');
              document.body.appendChild(link);
              link.click();
              link.remove();
            } catch (error) {
              console.error('Error downloading report:', error);
            }
          }}>Download CSV</button>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

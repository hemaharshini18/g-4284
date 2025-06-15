import React, { useState, useEffect } from 'react';
import { getAnalyticsSummary, getGoalPerformance, getLeaveTrends } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../../pages/AnalyticsDashboardPage.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [goalPerformance, setGoalPerformance] = useState([]);
  const [leaveTrends, setLeaveTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, goalsRes, leavesRes] = await Promise.all([
          getAnalyticsSummary(),
          getGoalPerformance(),
          getLeaveTrends(),
        ]);

        setSummary(summaryRes.data);
        setGoalPerformance(goalsRes.data.goalsByStatus);
        setLeaveTrends(leavesRes.data.leaveByPolicy);

      } catch (err) {
        setError('Failed to fetch analytics data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading Admin Analytics...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="analytics-dashboard-refreshed">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back! Here's a summary of your organization's key metrics.</p>
      </div>

      <div className="summary-cards-refreshed">
        <div className="card-refreshed">
          <div className="card-icon employees"></div>
          <div className="card-content">
            <h4>Total Employees</h4>
            <span>{summary?.totalEmployees}</span>
          </div>
        </div>
        <div className="card-refreshed">
          <div className="card-icon onboarding"></div>
          <div className="card-content">
            <h4>Onboarding</h4>
            <span>{summary?.onboardingCount}</span>
          </div>
        </div>
        <div className="card-refreshed">
          <div className="card-icon goals"></div>
          <div className="card-content">
            <h4>Goals In Progress</h4>
            <span>{summary?.totalGoals}</span>
          </div>
        </div>
        <div className="card-refreshed">
          <div className="card-icon completion"></div>
          <div className="card-content">
            <h4>Goal Completion</h4>
            <span>{summary?.goalCompletionRate}%</span>
          </div>
        </div>
      </div>

      <div className="charts-grid-refreshed">
        <div className="chart-container-refreshed">
          <h3>Goal Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={goalPerformance} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                return (
                  <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                );
              }}>
                {goalPerformance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container-refreshed">
          <h3>Leave Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={leaveTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

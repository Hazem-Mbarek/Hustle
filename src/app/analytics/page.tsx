'use client';
import { useEffect, useState } from 'react';

interface AnalyticsData {
  trendingCategories: Array<{ category: string; count: number }>;
  avgPayByCategory: Array<{ category: string; avgPay: number }>;
  competitiveJobs: Array<{ title: string; application_count: number }>;
  jobsOverTime: Array<{ date: string; count: number }>;
  recentActivity: Array<{ type: string; title: string; time: string; category: string }>;
  aiInsights: {
    marketTrends: string;
    salaryAnalysis: string;
    timestamp: string;
  };
}

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/job/analytics');
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchAnalytics();
  }, []);

  if (!analyticsData) return <div>Loading...</div>;

  return (
    <main className="container my-4">
      <h1 className="text-center mb-4">Job Market Analytics</h1>
      
      {/* AI Insights */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="card-title">
            <i className="bi bi-robot"></i> AI Market Insights
          </h4>
          <div className="row">
            <div className="col-md-6">
              <h5>Market Trends</h5>
              <p className="text-muted">{analyticsData.aiInsights.marketTrends}</p>
            </div>
            <div className="col-md-6">
              <h5>Salary Analysis</h5>
              <p className="text-muted">{analyticsData.aiInsights.salaryAnalysis}</p>
            </div>
          </div>
          <small className="text-muted">
            Last updated: {new Date(analyticsData.aiInsights.timestamp).toLocaleString()}
          </small>
        </div>
      </div>

      {/* Trending Categories */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="card-title">Trending Categories</h4>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Job Count</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.trendingCategories.map((category, index) => (
                  <tr key={index}>
                    <td>{category.category}</td>
                    <td>{category.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Average Pay by Category */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="card-title">Average Pay by Category</h4>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Average Pay</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.avgPayByCategory.map((category, index) => (
                  <tr key={index}>
                    <td>{category.category}</td>
                    <td>${Number(category.avgPay).toFixed(2)}/hr</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="card-title">Recent Activity</h4>
          <div className="list-group">
            {analyticsData.recentActivity.map((activity, index) => (
              <div key={index} className="list-group-item">
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-1">{activity.title}</h6>
                  <small className="text-muted">
                    {new Date(activity.time).toLocaleDateString()}
                  </small>
                </div>
                <p className="mb-1">{activity.type}</p>
                <small className="text-muted">Category: {activity.category}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
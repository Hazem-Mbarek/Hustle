'use client';
import { useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { CategoryScale } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

Chart.register(CategoryScale);

interface AnalyticsData {
  trendingCategories: Array<{
    category: string;
    count: number;
  }>;
  avgPayByCategory: Array<{
    category: string;
    avgPay: number;
  }>;
  competitiveJobs: Array<{
    title: string;
    application_count: number;
  }>;
  jobsOverTime: Array<{
    date: string;
    count: number;
  }>;
}

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/job/analytics');
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return <div className="text-center mt-5">Loading analytics...</div>;
  }

  if (!analyticsData) {
    return <div className="text-center mt-5">Failed to load analytics</div>;
  }

  const categoryChartData = {
    labels: analyticsData.trendingCategories.map(item => item.category),
    datasets: [{
      label: 'Number of Jobs',
      data: analyticsData.trendingCategories.map(item => item.count),
      backgroundColor: '#17a589',
    }]
  };

  const payChartData = {
    labels: analyticsData.avgPayByCategory.map(item => item.category),
    datasets: [{
      label: 'Average Pay Rate ($/hr)',
      data: analyticsData.avgPayByCategory.map(item => item.avgPay),
      backgroundColor: '#148f77',
    }]
  };

  const competitiveJobsData = {
    labels: analyticsData.competitiveJobs.map(item => item.title),
    datasets: [{
      data: analyticsData.competitiveJobs.map(item => item.application_count),
      backgroundColor: [
        '#17a589',
        '#148f77',
        '#117864',
        '#0e6251',
        '#0b4c3f',
      ],
    }]
  };

  return (
    <div className="container my-5">
      <h1 className="text-center mb-5">Job Market Analytics</h1>

      <div className="row mb-5">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title">Trending Job Categories</h3>
              <Bar data={categoryChartData} options={{
                responsive: true,
                plugins: {
                  legend: { display: false }
                }
              }} />
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title">Average Pay by Category</h3>
              <Bar data={payChartData} options={{
                responsive: true,
                plugins: {
                  legend: { display: false }
                }
              }} />
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title">Most Competitive Jobs</h3>
              <Doughnut data={competitiveJobsData} options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }} />
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title">Key Statistics</h3>
              <div className="list-group">
                {analyticsData.trendingCategories.map((category, index) => (
                  <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    {category.category}
                    <span className="badge bg-success rounded-pill">
                      {category.count} jobs
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
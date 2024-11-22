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
  recentActivity: Array<{
    type: string;
    title: string;
    time: string;
    category: string;
  }>;
}

const CHART_COLORS = {
  primary: ['#20B2AA', '#26CBC2', '#2CE4DA', '#5EEAE2', '#8EFFF8'],  // Light Sea Green shades
  secondary: ['#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'], // Complementary grays
  text: '#334155',
  grid: '#e2e8f0'
};

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
      backgroundColor: '#20B2AA',  // Match navbar color
    }]
  };

  const payChartData = {
    labels: analyticsData.avgPayByCategory.map(item => item.category),
    datasets: [{
      label: 'Average Pay Rate ($/hr)',
      data: analyticsData.avgPayByCategory.map(item => item.avgPay),
      backgroundColor: '#26CBC2',  // Slightly lighter shade
    }]
  };

  const competitiveJobsData = {
    labels: analyticsData.competitiveJobs.map(item => item.title),
    datasets: [{
      data: analyticsData.competitiveJobs.map(item => item.application_count),
      backgroundColor: CHART_COLORS.primary,  // Array of Light Sea Green shades
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
              <div className="bg-white rounded-xl shadow-md p-6">
              
                
                <div className="space-y-6">
                  {/* Job Counts Section */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-600 mb-3">Job Counts</h4>
                    <div className="space-y-2">
                      {analyticsData.trendingCategories.map((category, index) => (
                        <div 
                          key={`count-${index}`}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-gray-700 font-medium min-w-[120px]">{category.category}    </span>
                          <span className="px-3 py-1 text-white text-sm rounded-full ml-4" style={{ backgroundColor: '#20B2AA' }}>
                            {category.count} jobs
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Latest Activity Section */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-600 mb-3">Latest Activity</h4>
                    <div className="space-y-2">
                      {analyticsData.recentActivity
                        .filter(activity => activity.type === 'New Job')
                        .map((activity, index) => (
                        <div 
                          key={`activity-${index}`}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-gray-700 font-medium min-w-[120px]">{activity.title} </span>
                            <span className="text-sm text-gray-500">
                              {new Date(activity.time).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <span 
                            className="px-3 py-1 text-white text-sm rounded-full ml-4" 
                            style={{ backgroundColor: '#20B2AA' }}
                          >
                            New Job
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
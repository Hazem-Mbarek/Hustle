'use client';
import { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useRouter } from 'next/navigation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const CHART_COLORS = {
  primary: ['#4e73df', '#6610f2', '#6f42c1', '#e83e8c'],
  secondary: ['#858796', '#f8f9fc', '#e3e6f0', '#d1d3e2'],
  grid: '#e3e6f0'
};

interface DashboardStats {
  totalUsers: number;
  totalJobs: number;
  totalRequests: number;
  activeJobs: number;
  jobsByCategory: Array<{ category: string; count: number }>;
  userGrowth: Array<{ date: string; count: number }>;
  jobSuccess: { completed: number; cancelled: number; active: number };
  categoryGrowth: Array<{
    category: string;
    previousCount: number;
    currentCount: number;
    growthRate: number;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalJobs: 0,
    totalRequests: 0,
    activeJobs: 0,
    jobsByCategory: [],
    userGrowth: [],
    jobSuccess: { completed: 0, cancelled: 0, active: 0 },
    categoryGrowth: []
  });
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError('Failed to fetch dashboard data. Please try again later.');
      console.error('Failed to fetch dashboard data:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const chartData = {
    userGrowth: {
      labels: stats?.userGrowth?.map(data => new Date(data.date).toLocaleDateString()) || [],
      datasets: [{
        label: 'New Users',
        data: stats?.userGrowth?.map(data => data.count) || [],
        borderColor: CHART_COLORS.primary[0],
        tension: 0.1
      }]
    },
    jobStatus: {
      labels: ['Completed', 'Cancelled', 'Active'],
      datasets: [{
        data: [
          Number(stats?.jobSuccess?.completed) || 0,
          Number(stats?.jobSuccess?.cancelled) || 0,
          Number(stats?.jobSuccess?.active) || 0
        ],
        backgroundColor: [
          '#4e73df',  // Blue for Completed
          '#858796',  // Gray for Cancelled
          '#6f42c1'   // Purple for Active
        ],
        borderWidth: 0
      }]
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">Admin Dashboard</h1>
        <select 
          className="form-select w-auto" 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Users
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats?.totalUsers || 0}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-people fs-2 text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Total Jobs
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats?.totalJobs || 0}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-briefcase fs-2 text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Active Jobs
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats?.activeJobs || 0}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-clock-history fs-2 text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Total Requests
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats?.totalRequests || 0}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-file-earmark-text fs-2 text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row mb-4">
        <div className="col-xl-8">
          <div className="card shadow">
            <div className="card-header">
              <h6 className="m-0 font-weight-bold text-primary">User Growth</h6>
            </div>
            <div className="card-body">
              <Line data={chartData.userGrowth} options={{
                responsive: true,
                plugins: {
                  legend: { display: false }
                }
              }} />
            </div>
          </div>
        </div>
        <div className="col-xl-4">
          <div className="card shadow h-100">
            <div className="card-header">
              <h6 className="m-0 font-weight-bold text-primary">Job Status</h6>
            </div>
            <div className="card-body">
              <div style={{ height: '300px', position: 'relative' }}>
                <Pie 
                  data={chartData.jobStatus} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          usePointStyle: true,
                          padding: 20,
                          font: {
                            size: 12
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title h5">Top Categories</h3>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Name</th>
                      <th scope="col">Popularity</th>
                      <th scope="col">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.jobsByCategory?.map((item, index) => (
                      <tr key={`category-${index}`}>
                        <td>{(index + 1).toString().padStart(2, '0')}</td>
                        <td>{item.category}</td>
                        <td>
                          <div className="progress" style={{ height: '8px' }}>
                            <div 
                              className="progress-bar bg-primary" 
                              role="progressbar" 
                              style={{ 
                                width: `${(item.count / Math.max(...stats.jobsByCategory.map(i => i.count))) * 100}%` 
                              }}
                              aria-valuenow={(item.count / Math.max(...stats.jobsByCategory.map(i => i.count))) * 100}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            />
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-primary rounded-pill">{item.count}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title h5">Category Growth</h3>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Previous</th>
                      <th>Current</th>
                      <th>Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.categoryGrowth?.map((item, index) => (
                      <tr key={`growth-${index}`}>
                        <td>{item.category}</td>
                        <td>{item.previousCount}</td>
                        <td>{item.currentCount}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div 
                              className={`badge ${item.growthRate >= 0 ? 'bg-success' : 'bg-danger'} me-2`}
                            >
                              {item.growthRate >= 0 ? '↑' : '↓'}
                            </div>
                            <span>{Math.abs(item.growthRate)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Job {
  id_job: number;
  title: string;
  category: string;
  state: string;
  pay: number;
  location: string;
  created_at: string;
}

const AdminJobs = () => {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and filter states
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/jobs?search=${search}&category=${categoryFilter}&state=${stateFilter}&sortBy=${sortBy}&sortOrder=${sortOrder}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.status}`);
      }
      
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to fetch jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, stateFilter, sortBy, sortOrder]);

  // Initial fetch on mount
  useEffect(() => {
    fetchJobs();
  }, []); // Empty dependency array

  // Handle filter changes with debounce
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (loading) return; // Prevent duplicate fetches while loading
      fetchJobs();
    }, 300);
    
    return () => clearTimeout(debounce);
  }, [search, categoryFilter, stateFilter, sortBy, sortOrder, fetchJobs]);

  const handleDelete = async (jobId: string) => {
    try {
      setError('');
      
      const response = await fetch(`/api/admin/jobs?id=${jobId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete job');
      }
      
      await fetchJobs();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Delete error:', errorMessage);
      setError(errorMessage);
    }
  };

  // Get unique categories for filter dropdown
  const categories = Array.from(new Set(jobs.map(job => job.category)));

  return (
    <div className="container-fluid py-4">
      <h1 className="h2 mb-4">Jobs Management</h1>

      {/* Filter Panel */}
      <div className="card shadow mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <input
                type="search"
                className="form-control"
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <select 
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select 
                className="form-select"
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
              >
                <option value="all">All States</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-md-2">
              <select 
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="created_at">Post Date</option>
                <option value="pay">Pay</option>
              </select>
            </div>
            <div className="col-md-1">
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="card shadow">
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>State</th>
                    <th>Pay</th>
                    <th>Location</th>
                    <th>Posted Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center">No jobs found</td>
                    </tr>
                  ) : (
                    jobs.map((job) => (
                      <tr key={job.id_job}>
                        <td>{job.id_job}</td>
                        <td>{job.title}</td>
                        <td>{job.category}</td>
                        <td>
                          <span className={`badge bg-${
                            job.state === 'active' ? 'success' : 
                            job.state === 'completed' ? 'primary' : 'danger'
                          }`}>
                            {job.state}
                          </span>
                        </td>
                        <td>${job.pay}</td>
                        <td>{job.location}</td>
                        <td>{new Date(job.created_at).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this job?')) {
                                handleDelete(job.id_job.toString());
                              }
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminJobs; 
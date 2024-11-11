'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

interface UserProfile {
  id_profile: number;
  description: string;
  image: Blob | string;
  first_name: string;
  last_name: string;
  email: string;
  average_rating: number;
}

interface Job {
  id_job: number;
  title: string;
  description: string;
  category: string;
  state: string;
  num_workers: number;
  pay: number;
  location: string;
  time: string;
}

interface Request {
  id_request: number;
  id_job: number;
  id_profile_receiver: number;
  status: string;
  bid: number;
  title: string;
  description: string;
  category: string;
  state: string;
  num_workers: number;
  pay: number;
  location: string;
  time: string;
}

const ViewProfile: React.FC = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [acceptedRequests, setAcceptedRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [postedCurrentPage, setPostedCurrentPage] = useState(1);
  const [acceptedCurrentPage, setAcceptedCurrentPage] = useState(1);
  const jobsPerPage = 5;
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Request[]>([]);
  const [pendingCurrentPage, setPendingCurrentPage] = useState(1);
  const [activeView, setActiveView] = useState('posted');
  const [editingRequest, setEditingRequest] = useState<Request | null>(null);
  const [jobCreatorProfile, setJobCreatorProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.image) {
      // Convert blob to URL
      const imageStr = profile.image as string;
      if (imageStr) {
        setImageUrl(`data:image/jpeg;base64,${imageStr}`);
      }
    }
  }, [profile]);

  const fetchJobs = async (profileId: number) => {
    try {
      const response = await fetch(`/api/job?profile_id=${profileId}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  const fetchAcceptedRequests = async (profileId: number) => {
    try {
      const response = await fetch(`/api/request?profile_id=${profileId}&status=accepted`);
      if (response.ok) {
        const data = await response.json();
        setAcceptedRequests(data);
      }
    } catch (error) {
      console.error('Failed to load accepted requests:', error);
    }
  };

  const fetchPendingRequests = async (profileId: number) => {
    try {
      const response = await fetch(`/api/request?pending=true`);
      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data);
      }
    } catch (error) {
      console.error('Failed to load pending requests:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      // First get the profile ID from the auth endpoint
      const authResponse = await fetch('/api/auth/profile');
      if (!authResponse.ok) {
        throw new Error('Failed to get profile ID');
      }
      const { profileId } = await authResponse.json();
      
      // Then fetch the full profile data with the ID
      const response = await fetch(`/api/profile?id=${profileId}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        // Fetch jobs after getting profile
        await fetchJobs(profileId);
        // Fetch accepted requests after getting profile
        await fetchAcceptedRequests(profileId);
        await fetchPendingRequests(profileId);
      }
    } catch (error) {
      setError('Failed to load profile');
    }
  };

  // Add deleteJob function
  const deleteJob = async (jobId: number) => {
    try {
      const response = await fetch(`/api/job?id=${jobId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the deleted job from the state
        setJobs(jobs.filter(job => job.id_job !== jobId));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job. Please try again.');
    }
  };

  // Add useEffect for Bootstrap modal
  useEffect(() => {
    if (typeof window !== 'undefined') {
      require('bootstrap/dist/js/bootstrap.bundle.min.js');
    }
  }, []);

  // Calculate pagination indexes for posted jobs
  const postedIndexOfLastJob = postedCurrentPage * jobsPerPage;
  const postedIndexOfFirstJob = postedIndexOfLastJob - jobsPerPage;
  const currentPostedJobs = jobs.slice(postedIndexOfFirstJob, postedIndexOfLastJob);

  // Calculate pagination indexes for accepted jobs
  const acceptedIndexOfLastJob = acceptedCurrentPage * jobsPerPage;
  const acceptedIndexOfFirstJob = acceptedIndexOfLastJob - jobsPerPage;
  const currentAcceptedJobs = jobs.slice(acceptedIndexOfFirstJob, acceptedIndexOfLastJob);

  // Calculate pagination indexes for pending requests
  const pendingIndexOfLastRequest = pendingCurrentPage * jobsPerPage;
  const pendingIndexOfFirstRequest = pendingIndexOfLastRequest - jobsPerPage;
  const currentPendingRequests = pendingRequests.slice(pendingIndexOfFirstRequest, pendingIndexOfLastRequest);

  // Pagination component
  const Pagination = ({ currentPage, setCurrentPage, totalItems }: { 
    currentPage: number; 
    setCurrentPage: (page: number) => void;
    totalItems: number;
  }) => {
    const totalPages = Math.ceil(totalItems / jobsPerPage);
    
    return (
      <nav aria-label="Page navigation" className="mt-4">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>
          {[...Array(totalPages)].map((_, index) => (
            <li 
              key={index} 
              className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
            >
              <button 
                className="page-link" 
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  // Add function to handle job update
  const updateJob = async (jobId: number, updatedData: Partial<Job>) => {
    try {
      const response = await fetch(`/api/job?id=${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        setJobs(jobs.map(job => 
          job.id_job === jobId ? { ...job, ...updatedData } : job
        ));
        return true;
      } else {
        throw new Error('Failed to update job');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Failed to update job. Please try again.');
      return false;
    }
  };

  // Add these functions near your other state management functions
  const deleteRequest = async (requestId: number) => {
    try {
      const response = await fetch(`/api/request?id=${requestId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the deleted request from the state
        setPendingRequests(pendingRequests.filter(request => request.id_request !== requestId));
      } else {
        throw new Error('Failed to delete request');
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Failed to delete request. Please try again.');
    }
  };

  const fetchJobCreatorProfile = async (profileId: number) => {
    try {
      const response = await fetch(`/api/profile?id=${profileId}`);
      if (response.ok) {
        const data = await response.json();
        setJobCreatorProfile(data);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <main className="container py-5">
      <div className="row">
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h2 className="mb-4">Profile</h2>
              
              <div className="mb-4">
                <div className="d-flex flex-column align-items-center gap-2">
                  <div className="d-flex flex-column align-items-center">
                    <small className="text-muted">Average Rating</small>
                    <div className="stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star} 
                          className={`fs-4 ${star <= Number(profile.average_rating) ? 'text-warning' : 'text-muted'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="fs-5">{Number(profile.average_rating).toFixed(1)}</span>
                  </div>
                </div>
              </div>
              
              {imageUrl && (
                <div className="mb-4">
                  <img
                    src={imageUrl}
                    alt="Profile"
                    style={{
                      width: '200px',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }}
                  />
                </div>
              )}
              
              <h3 className="mb-0">{profile.first_name} {profile.last_name}</h3>
              <p className="text-muted">{profile.email}</p>
              
              <div className="mt-4">
                <button 
                  className="btn btn-outline-primary me-2"
                  onClick={() => router.push(`/profile?edit=true&id=${profile.id_profile}`)}
                >
                  Edit Profile
                </button>
                <button 
                  className="btn btn-outline-danger"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete your profile?')) {
                      // Add delete functionality
                    }
                  }}
                >
                  Delete Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="card-title mb-4">About Me</h4>
              <p className="card-text">{profile.description}</p>
            </div>
          </div>

          <div className="card shadow-sm mt-4">
            <div className="card-body">
              <h4 className="card-title mb-4">Personal Information</h4>
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Email:</strong> {profile.email}</p>
                  <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm mt-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="card-title mb-0">History</h4>
                <select 
                  className="form-select w-auto"
                  value={activeView}
                  onChange={(e) => setActiveView(e.target.value)}
                >
                  <option value="posted">Posted Jobs</option>
                  <option value="accepted">Accepted Jobs</option>
                  <option value="pending">Pending Requests</option>
                </select>
              </div>

              {/* Posted Jobs View */}
              {activeView === 'posted' && (
                <>
                  {jobs.length === 0 ? (
                    <p className="text-muted">No jobs posted yet.</p>
                  ) : (
                    <>
                      <div className="list-group">
                        {currentPostedJobs.map((job) => (
                          <div 
                            key={job.id_job} 
                            className="list-group-item border-0 mb-3 rounded-4"
                            style={{ 
                              backgroundColor: '#f8f9fa',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                          >
                            <div className="d-flex flex-column">
                              <h5 className="mb-2">
                                <span style={{ color: '#0066FF' }}>{job.title}</span>
                              </h5>
                              <p className="mb-3">{job.description}</p>
                              <div className="d-flex align-items-center gap-3">
                                <span>
                                  <span className="me-1">📍</span>
                                  {job.location}
                                </span>
                                <span>
                                  <span className="me-1">💰</span>
                                  ${job.pay}
                                </span>
                                <span>
                                  <span className="me-1">👥</span>
                                  {job.num_workers} workers needed
                                </span>
                              </div>
                              <div className="text-muted mt-2 mb-2">
                                {new Date(job.time).toLocaleString()}
                              </div>
                              <div className="d-flex justify-content-end">
                                <button 
                                  className="btn btn-outline-primary btn-sm me-2"
                                  style={{
                                    borderRadius: '20px',
                                    paddingLeft: '20px',
                                    paddingRight: '20px'
                                  }}
                                  data-bs-toggle="modal"
                                  data-bs-target="#jobDetailsModal"
                                  onClick={() => setSelectedJob(job)}
                                >
                                  View
                                </button>
                                <button 
                                  className="btn btn-outline-warning btn-sm me-2"
                                  style={{
                                    borderRadius: '20px',
                                    paddingLeft: '20px',
                                    paddingRight: '20px'
                                  }}
                                  data-bs-toggle="modal"
                                  data-bs-target="#editJobModal"
                                  onClick={() => setEditingJob(job)}
                                >
                                  Update
                                </button>
                                <button 
                                  className="btn btn-outline-danger btn-sm"
                                  style={{
                                    borderRadius: '20px',
                                    paddingLeft: '20px',
                                    paddingRight: '20px'
                                  }}
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this job?')) {
                                      deleteJob(job.id_job);
                                    }
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Pagination 
                        currentPage={postedCurrentPage}
                        setCurrentPage={setPostedCurrentPage}
                        totalItems={jobs.length}
                      />
                    </>
                  )}
                </>
              )}

              {/* Accepted Jobs View */}
              {activeView === 'accepted' && (
                <>
                  {acceptedRequests.length === 0 ? (
                    <p className="text-muted">No accepted jobs yet.</p>
                  ) : (
                    <>
                      <div className="list-group">
                        {acceptedRequests.map((request) => (
                          <div 
                            key={request.id_request} 
                            className="list-group-item border-0 mb-3 rounded-4"
                            style={{ 
                              backgroundColor: '#f8f9fa',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                          >
                            <div className="d-flex flex-column">
                              <h5 className="mb-2">
                                <span style={{ color: '#0066FF' }}>{request.title}</span>
                              </h5>
                              <p className="mb-3">{request.description}</p>
                              <div className="d-flex align-items-center gap-3">
                                <span>
                                  <span className="me-1">📍</span>
                                  {request.location}
                                </span>
                                <span>
                                  <span className="me-1">💰</span>
                                  Your Bid: ${request.bid}
                                </span>
                                <span>
                                  <span className="me-1">💼</span>
                                  Status: {request.status}
                                </span>
                              </div>
                              <div className="text-muted mt-2 mb-2">
                                {new Date(request.time).toLocaleString()}
                              </div>
                              <div className="d-flex justify-content-end">
                                <button 
                                  className="btn btn-outline-primary btn-sm"
                                  style={{
                                    borderRadius: '20px',
                                    paddingLeft: '20px',
                                    paddingRight: '20px'
                                  }}
                                  data-bs-toggle="modal"
                                  data-bs-target="#requestDetailsModal"
                                  onClick={async () => {
                                    setSelectedRequest(request);
                                    await fetchJobCreatorProfile(request.id_profile_receiver);
                                  }}
                                >
                                  View Employer
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Pagination 
                        currentPage={acceptedCurrentPage}
                        setCurrentPage={setAcceptedCurrentPage}
                        totalItems={acceptedRequests.length}
                      />
                    </>
                  )}
                </>
              )}

              {/* Pending Requests View */}
              {activeView === 'pending' && (
                <>
                  {pendingRequests.length === 0 ? (
                    <p className="text-muted">No pending requests.</p>
                  ) : (
                    <>
                      <div className="list-group">
                        {currentPendingRequests.map((request) => (
                          <div 
                            key={request.id_request} 
                            className="list-group-item border-0 mb-3 rounded-4"
                            style={{ 
                              backgroundColor: '#f8f9fa',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                          >
                            <div className="d-flex flex-column">
                              <h5 className="mb-2">
                                <span style={{ color: '#0066FF' }}>{request.title}</span>
                              </h5>
                              <p className="mb-3">{request.description}</p>
                              <div className="d-flex align-items-center gap-3">
                                <span>
                                  <span className="me-1">📍</span>
                                  {request.location}
                                </span>
                                <span>
                                  <span className="me-1">💰</span>
                                  Your Bid: ${request.bid}
                                </span>
                                <span>
                                  <span className="me-1">💼</span>
                                  Status: {request.status}
                                </span>
                              </div>
                              <div className="text-muted mt-2 mb-2">
                                {new Date(request.time).toLocaleString()}
                              </div>
                              <div className="d-flex justify-content-end gap-2">
                                <button 
                                  className="btn btn-outline-primary btn-sm"
                                  style={{
                                    borderRadius: '20px',
                                    paddingLeft: '20px',
                                    paddingRight: '20px'
                                  }}
                                  data-bs-toggle="modal"
                                  data-bs-target="#requestDetailsModal"
                                  onClick={() => setSelectedRequest(request)}
                                >
                                  View
                                </button>
                                <button 
                                  className="btn btn-outline-warning btn-sm"
                                  style={{
                                    borderRadius: '20px',
                                    paddingLeft: '20px',
                                    paddingRight: '20px'
                                  }}
                                  data-bs-toggle="modal"
                                  data-bs-target="#editRequestModal"
                                  onClick={() => setEditingRequest(request)}
                                >
                                  Update
                                </button>
                                <button 
                                  className="btn btn-outline-danger btn-sm"
                                  style={{
                                    borderRadius: '20px',
                                    paddingLeft: '20px',
                                    paddingRight: '20px'
                                  }}
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this request?')) {
                                      deleteRequest(request.id_request);
                                    }
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Pagination 
                        currentPage={pendingCurrentPage}
                        setCurrentPage={setPendingCurrentPage}
                        totalItems={pendingRequests.length}
                      />
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Request Details Modal */}
      <div
        className="modal fade"
        id="requestDetailsModal"
        tabIndex={-1}
        aria-labelledby="requestDetailsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="requestDetailsModalLabel">
                {activeView === 'accepted' ? 'Job Creator Profile' : selectedRequest?.title}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => setJobCreatorProfile(null)}
              ></button>
            </div>
            <div className="modal-body">
              {activeView === 'accepted' && jobCreatorProfile ? (
                <div className="d-flex flex-column align-items-center">
                  {jobCreatorProfile.image && (
                    <div className="mb-4">
                      <img
                        src={`data:image/jpeg;base64,${jobCreatorProfile.image}`}
                        alt="Profile"
                        style={{
                          width: '150px',
                          height: '150px',
                          objectFit: 'cover',
                          borderRadius: '50%'
                        }}
                      />
                    </div>
                  )}
                  <h4 className="mb-3">{jobCreatorProfile.first_name} {jobCreatorProfile.last_name}</h4>
                  <div className="d-flex align-items-center mb-3">
                    <div className="stars me-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star} 
                          className={`fs-5 ${star <= Number(jobCreatorProfile.average_rating) ? 'text-warning' : 'text-muted'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-muted">
                      ({Number(jobCreatorProfile.average_rating).toFixed(1)})
                    </span>
                  </div>
                  <p className="text-center mb-3">{jobCreatorProfile.description}</p>
                  <div className="text-muted mb-2">
                    <i className="bi bi-envelope me-2"></i>
                    {jobCreatorProfile.email}
                  </div>
                </div>
              ) : (
                // Existing request details view for non-accepted requests
                <>
                  <p>{selectedRequest?.description}</p>
                  <div className="d-flex flex-column gap-2">
                    <div>Category: {selectedRequest?.category}</div>
                    <div>State: {selectedRequest?.state}</div>
                    <div>Location: {selectedRequest?.location}</div>
                    <div>Original Pay: ${selectedRequest?.pay}/hr</div>
                    <div>Your Bid: ${selectedRequest?.bid}</div>
                    <div>Workers Needed: {selectedRequest?.num_workers}</div>
                    <div>Status: {selectedRequest?.status}</div>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={() => setJobCreatorProfile(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Simplified Job Details Modal */}
      <div
        className="modal fade"
        id="jobDetailsModal"
        tabIndex={-1}
        aria-labelledby="jobDetailsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="jobDetailsModalLabel">
                {selectedJob?.title}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p>{selectedJob?.description}</p>
              <div className="d-flex flex-column gap-2">
                <div>Category: {selectedJob?.category}</div>
                <div>State: {selectedJob?.state}</div>
                <div>Location: {selectedJob?.location}</div>
                <div>Pay: ${selectedJob?.pay}/hr</div>
                <div>Workers Needed: {selectedJob?.num_workers}</div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Edit Job Modal */}
      <div
        className="modal fade"
        id="editJobModal"
        tabIndex={-1}
        aria-labelledby="editJobModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editJobModalLabel">
                Edit Job
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {editingJob && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const updatedData = {
                    title: formData.get('title') as string,
                    description: formData.get('description') as string,
                    category: formData.get('category') as string,
                    state: formData.get('state') as string,
                    num_workers: Number(formData.get('num_workers')),
                    pay: Number(formData.get('pay')),
                    location: formData.get('location') as string,
                  };
                  
                  const success = await updateJob(editingJob.id_job, updatedData);
                  if (success) {
                    const closeButton = document.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
                    closeButton?.click();
                    setEditingJob(null);
                  }
                }}>
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      defaultValue={editingJob.title}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      defaultValue={editingJob.description}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      className="form-control"
                      name="category"
                      defaultValue={editingJob.category}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      className="form-control"
                      name="state"
                      defaultValue={editingJob.state}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Number of Workers</label>
                    <input
                      type="number"
                      className="form-control"
                      name="num_workers"
                      defaultValue={editingJob.num_workers}
                      required
                      min="1"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Pay Rate ($/hr)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="pay"
                      defaultValue={editingJob.pay}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      name="location"
                      defaultValue={editingJob.location}
                      required
                    />
                  </div>
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Edit Request Modal */}
      <div
        className="modal fade"
        id="editRequestModal"
        tabIndex={-1}
        aria-labelledby="editRequestModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editRequestModalLabel">
                Edit Request
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {editingRequest && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const updatedData = {
                    bid: Number(formData.get('bid')),
                  };
                  
                  try {
                    const response = await fetch(`/api/request?id=${editingRequest.id_request}`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(updatedData),
                    });

                    if (response.ok) {
                      // Update the request in the state
                      setPendingRequests(pendingRequests.map(request => 
                        request.id_request === editingRequest.id_request 
                          ? { ...request, ...updatedData }
                          : request
                      ));
                      
                      // Close the modal
                      const closeButton = document.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
                      closeButton?.click();
                      setEditingRequest(null);
                    } else {
                      throw new Error('Failed to update request');
                    }
                  } catch (error) {
                    console.error('Error updating request:', error);
                    alert('Failed to update request. Please try again.');
                  }
                }}>
                  <div className="mb-3">
                    <label className="form-label">Your Bid ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="bid"
                      defaultValue={editingRequest.bid}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ViewProfile; 
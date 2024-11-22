'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Badge } from '../../components/Badge';


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
  id_profile_sender: number;
  average_rating?: number;
}

interface Employee {
  id_profile_sender: number;
  bid: number;
  id_request: number;
  average_rating?: number;
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
  const [ratingExists, setRatingExists] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(0);
  const [currentRating, setCurrentRating] = useState(0);
  const [newRating, setNewRating] = useState(0);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [existingRatingId, setExistingRatingId] = useState<number | null>(null);
  const [jobEmployees, setJobEmployees] = useState<{ [key: number]: Request[] }>({});
  const [employeeRatings, setEmployeeRatings] = useState<{ [key: number]: number | null }>({});
  const [selectedEmployee, setSelectedEmployee] = useState<Request | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [userBadges, setUserBadges] = useState({
    topPerformer: false,
    fiveStarCount: 0
  });

  // D'abord, améliorons la fonction d'analyse de sentiment
  const analyzeSentimentWithHF = async (text: string) => {
    console.log('Analyzing sentiment for:', text);
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/nlptown/bert-base-multilingual-uncased-sentiment",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_HF_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: text }),
        }
      );
      const data = await response.json();
      if (data[0] && data[0][0] && data[0][0].label) {
        const rating = parseInt(data[0][0].label.charAt(0));
        return rating;
      }
      return ratingValue;
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return ratingValue;
    }
  };

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

  const checkExistingRating = async (jobId: number, userId: number, subjectId: number) => {
    try {
      const response = await fetch(
        `/api/rating?check_id_job=${jobId}&check_id_user=${userId}&check_id_subject=${subjectId}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking existing rating:', error);
      return null;
    }
  };

  const checkRating = async () => {
    if (selectedRequest && currentUserId && jobCreatorProfile) {
      try {
        const response = await fetch(
          `/api/rating?check_id_job=${selectedRequest.id_job}&check_id_user=${currentUserId}&check_id_subject=${jobCreatorProfile.id_profile}`
        );
        const data = await response.json();
        console.log('Rating check response:', data);
        
        setRatingExists(data.exists);
        if (data.rating) {
          setRatingValue(data.rating.value);
          setExistingRatingId(data.rating.id_rating);
        } else {
          setRatingValue(0);
          setExistingRatingId(null);
        }
      } catch (error) {
        console.error('Error checking rating:', error);
      }
    }
  };

  // Move the useEffect that uses checkRating after the function definition
  useEffect(() => {
    if (selectedRequest && currentUserId && jobCreatorProfile) {
      checkRating();
    }
  }, [selectedRequest?.id_job, currentUserId, jobCreatorProfile?.id_profile]);

  // Add these handler functions
  const handleRatingSubmit = async () => {
    if (!ratingValue || !selectedEmployee) return;
    
    const method = existingRatingId ? 'PATCH' : 'POST';
    const url = existingRatingId ? 
      `/api/rating?id=${existingRatingId}` : 
      '/api/rating';
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_user: currentUserId,
          id_subject: selectedEmployee.id_profile_sender,
          id_job: selectedJob?.id_job,
          value: ratingValue,
          feedback: feedbackText
        }),
      });
      
      if (response.ok) {
        setEmployeeRatings(prev => ({
          ...prev,
          [selectedEmployee.id_profile_sender]: ratingValue
        }));
        setFeedbackText('');
        
        // Create notification with different messages for new vs updated ratings
        await createNotification({
          id_profile_receiver: selectedEmployee.id_profile_sender,
          id_profile_sender: currentUserId,
          type: 'rating',
          message: existingRatingId 
            ? `Your rating has been updated to ${ratingValue}-stars${feedbackText ? ` with new feedback: "${feedbackText}"` : ''}`
            : `You received a new ${ratingValue}-star rating${feedbackText ? ` with feedback: "${feedbackText}"` : ''}`
        });

        const closeButton = document.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
        closeButton?.click();
      }
    } catch (error) {
      console.error('Error updating rating:', error);
      alert('Failed to update rating');
    }
  };

  // Update the handleRatingUpdate function for employer ratings
  const handleRatingUpdate = async () => {
    console.log('Update button clicked');
    
    try {
      if (feedbackText.length > 0) {
        console.log('Analyzing feedback...');
        const suggestedRating = await analyzeSentimentWithHF(feedbackText);
        console.log('Suggested rating:', suggestedRating);
        
        const finalRating = suggestedRating || 5;
        
        const response = await fetch(`/api/rating?id=${existingRatingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id_user: currentUserId,
            id_subject: jobCreatorProfile?.id_profile,
            id_job: selectedRequest?.id_job,
            value: finalRating,
            feedback: feedbackText
          }),
        });
        
        if (response.ok) {
          console.log('Rating updated successfully');
          
          // Send notification for rating update
          await createNotification({
            id_profile_receiver: jobCreatorProfile?.id_profile!,
            id_profile_sender: currentUserId,
            type: 'rating',
            message: `Your rating has been updated to ${finalRating}-stars${feedbackText ? ` with new feedback: "${feedbackText}"` : ''}`
          });

          if (jobCreatorProfile) {
            await fetchJobCreatorProfile(jobCreatorProfile.id_profile);
          }
          await checkRating();
          const closeButton = document.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
          closeButton?.click();
        } else {
          const errorData = await response.json();
          console.error('Server error:', errorData);
          throw new Error(errorData.message || 'Failed to update rating');
        }
      }
    } catch (error) {
      console.error('Error in handleRatingUpdate:', error);
      alert('Failed to update rating. Please try again.');
    }
  };

  // Update the handleRatingDelete function to notify when a rating is deleted
  const handleRatingDelete = async () => {
    if (!existingRatingId) {
      console.error('No rating to delete');
      return;
    }

    if (!confirm('Are you sure you want to delete this rating?')) {
      return;
    }

    try {
      const response = await fetch(`/api/rating?id=${existingRatingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete rating');
      }

      // Send notification for rating deletion
      const receiverId = selectedEmployee?.id_profile_sender || jobCreatorProfile?.id_profile;
      if (receiverId) {
        await createNotification({
          id_profile_receiver: receiverId,
          id_profile_sender: currentUserId,
          type: 'rating',
          message: 'Your rating has been removed'
        });
      }

      alert('Rating deleted successfully!');
      if (jobCreatorProfile) {
        await fetchJobCreatorProfile(jobCreatorProfile.id_profile);
      }
      setRatingExists(false);
      setRatingValue(0);
      setExistingRatingId(null);
      setFeedbackText('');
    } catch (error) {
      console.error('Error deleting rating:', error);
      alert('Failed to delete rating. Please try again.');
    }
  };

  const handleSubmit = async () => {
    // Implement POST request to create new rating
  };

  const handleUpdateSubmit = async () => {
    // Implement PATCH request to update existing rating
  };

  // Make sure we're getting the currentUserId when the component loads
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/profile');
        if (response.ok) {
          const data = await response.json();
          setCurrentUserId(data.profileId);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    getCurrentUser();
  }, []);

  // Update the click handler for viewing employer
  const handleViewEmployer = async (request: Request) => {
    setSelectedRequest(request);
    await fetchJobCreatorProfile(request.id_profile_receiver);
  };

  const fetchJobEmployees = async (jobId: number) => {
    try {
      const response = await fetch(`/api/request?accepted_job_id=${jobId}`);
      if (response.ok) {
        const data = await response.json();
        
        const ratingPromises = data.map(async (employee: Request) => {
          const ratingCheck = await checkExistingRating(
            jobId,
            currentUserId,
            employee.id_profile_sender
          );
          return { 
            id: employee.id_profile_sender, 
            rating: ratingCheck.exists ? ratingCheck.rating.value : null,
            ratingId: ratingCheck.exists ? ratingCheck.rating.id_rating : null
          };
        });

        const ratings = await Promise.all(ratingPromises);
        const ratingMap = Object.fromEntries(
          ratings.map(({ id, rating }) => [id, rating])
        );

        setEmployeeRatings(ratingMap);
        setJobEmployees(prev => ({
          ...prev,
          [jobId]: data
        }));
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const fetchWorkerRating = async (workerId: number) => {
    try {
      const response = await fetch(`/api/rating/${workerId}`);
      if (response.ok) {
        const data = await response.json();
        return data.average_rating || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching rating:', error);
      return 0;
    }
  };

  const createNotification = async ({
    id_profile_receiver,
    id_profile_sender,
    type,
    message
  }: {
    id_profile_receiver: number;
    id_profile_sender: number;
    type: string;
    message: string;
  }) => {
    try {
      const response = await fetch('/api/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_profile_receiver,
          id_profile_sender,
          type,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create notification');
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  useEffect(() => {
    const loadBadges = async () => {
      if (profile?.id_profile) {
        try {
          const response = await fetch(`/api/badges?profile_id=${profile.id_profile}`);
          if (response.ok) {
            const badgeData = await response.json();
            setUserBadges(badgeData);
          }
        } catch (error) {
          console.error('Error loading badges:', error);
        }
      }
    };

    loadBadges();
  }, [profile?.id_profile]);

  if (!profile) return <div>Loading...</div>;

  return (
    <main className="container py-5">
      <div className="row">
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h2 className="mb-4">Profile</h2>
              
              {imageUrl && (
                <div className="mb-4 position-relative">
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
                  {userBadges.topPerformer && (
                    <div 
                      className="position-absolute"
                      style={{
                        bottom: '-30px',  // Adjust this value to move badge up/down
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 2
                      }}
                    >
                      <img 
                        src="/images/badge.png"
                        alt="Top Performer Badge"
                        style={{
                          width: '70px',  // Adjust size as needed
                          height: '70px', // Adjust size as needed
                          objectFit: 'contain'
                        }}
                        title={`Received 5 stars from ${userBadges.fiveStarCount} employers`}
                      />
                    </div>
                  )}
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
                  <p>
                    <strong>Name:</strong> {profile.first_name} {profile.last_name}
                    
                  </p>
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
                                  onClick={() => {
                                    setSelectedJob(job);
                                    fetchJobEmployees(job.id_job);
                                  }}
                                >
                                  View Employees
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
                                  onClick={() => handleViewEmployer(request)}
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
        data-bs-backdrop="static"
        data-bs-keyboard="false"
      >
        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                  
                  {/* Add Rating Interface */}
                  <div className="mt-4 w-100">
                    <div className="rating-container">
                      <h5>Rate this employer</h5>
                      
                      {/* Stars */}
                      <div className="stars-container mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            onClick={() => setRatingValue(star)}
                            style={{ cursor: 'pointer', fontSize: '24px' }}
                            className={`star ${star <= ratingValue ? 'text-warning' : 'text-muted'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>

                      {/* Feedback textarea */}
                      <div className="mb-3">
                        <label className="form-label">Feedback (optional)</label>
                        <textarea
                          className="form-control"
                          value={feedbackText}
                          onChange={async (e) => {
                            const newValue = e.target.value;
                            setFeedbackText(newValue);
                            
                            if (newValue.trim().length > 0) {
                              const suggestedRating = await analyzeSentimentWithHF(newValue);
                              if (suggestedRating !== ratingValue) {
                                setRatingValue(suggestedRating);
                              }
                            }
                          }}
                          placeholder="Share your experience with this employer..."
                          rows={4}
                        />
                      </div>

                      {/* Submit button */}
                      <div className="d-flex gap-2">
                        {ratingExists ? (
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-warning"
                              onClick={handleRatingUpdate}
                              disabled={!feedbackText.length}
                            >
                              Update Rating
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={handleRatingDelete}
                            >
                              Delete Rating
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-primary"
                            onClick={handleRatingSubmit}
                            disabled={!feedbackText.length}
                          >
                            Submit Rating
                          </button>
                        )}
                      </div>
                    </div>
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

      {/* Job Details Modal */}
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
                Accepted Employees
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {jobEmployees[selectedJob?.id_job ?? 0]?.length > 0 ? (
                <div className="list-group">
                  {jobEmployees[selectedJob?.id_job ?? 0].map((employee) => (
                    <div 
                      key={employee.id_request}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div className="d-flex align-items-center gap-3">
                        <span>Worker ID: {employee.id_profile_sender}</span>
                        <div className="d-flex align-items-center">
                          <span className="me-1">Rating:</span>
                          <div className="text-warning">
                            {employeeRatings[employee.id_profile_sender] ? (
                              <>
                                <i className="bi bi-star-fill"></i>
                                <span className="ms-1">
                                  {Number(employeeRatings[employee.id_profile_sender]).toFixed(1)}
                                </span>
                              </>
                            ) : (
                              <span className="text-muted">No ratings</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="badge bg-primary rounded-pill me-2">
                          Bid: ${employee.bid}
                        </span>
                        <button
                          className="btn btn-outline-warning btn-sm"
                          onClick={async () => {
                            setSelectedEmployee(employee);
                            setRatingValue(employeeRatings[employee.id_profile_sender] || 0);
                            const ratingCheck = await checkExistingRating(
                              selectedJob?.id_job ?? 0,
                              currentUserId,
                              employee.id_profile_sender
                            );
                            setExistingRatingId(ratingCheck.exists ? ratingCheck.rating.id_rating : null);
                          }}
                          data-bs-toggle="modal"
                          data-bs-target="#rateEmployeeModal"
                        >
                          {employeeRatings[employee.id_profile_sender] ? 'Update Rating' : 'Rate Employee'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No accepted employees yet.</p>
              )}
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

      {/* Add Rate Employee Modal */}
      <div
        className="modal fade"
        id="rateEmployeeModal"
        tabIndex={-1}
        aria-labelledby="rateEmployeeModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="rateEmployeeModalLabel">
                {employeeRatings[selectedEmployee?.id_profile_sender ?? 0] !== null 
                  ? 'Update Employee Rating' 
                  : 'Rate Employee'}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {selectedEmployee && (
                <div className="rating-container">
                  <div className="stars-container mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => setRatingValue(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        style={{ cursor: 'pointer', fontSize: '24px' }}
                        className={`star ${
                          star <= (hoveredRating || ratingValue) ? 'text-warning' : 'text-muted'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Feedback (optional)</label>
                    <textarea
                      className="form-control"
                      value={feedbackText}
                      onChange={async (e) => {
                        const newValue = e.target.value;
                        setFeedbackText(newValue);
                        
                        if (newValue.trim().length > 0) {
                          const suggestedRating = await analyzeSentimentWithHF(newValue);
                          if (suggestedRating !== ratingValue) {
                            setRatingValue(suggestedRating);
                          }
                        }
                      }}
                      placeholder="Share your experience working with this employee..."
                      rows={4}
                    />
                  </div>

                  <div className="d-flex gap-2 justify-content-end">
                    {employeeRatings[selectedEmployee.id_profile_sender] !== null && (
                      <button
                        className="btn btn-danger"
                        onClick={async () => {
                          if (!existingRatingId || !confirm('Are you sure you want to delete this rating?')) {
                            return;
                          }
                          
                          try {
                            const response = await fetch(`/api/rating?id=${existingRatingId}`, {
                              method: 'DELETE',
                            });
                            
                            if (response.ok) {
                              setEmployeeRatings(prev => ({
                                ...prev,
                                [selectedEmployee.id_profile_sender]: null
                              }));
                              setExistingRatingId(null);
                              setRatingValue(0);
                              setFeedbackText('');
                              
                              const closeButton = document.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
                              closeButton?.click();
                            }
                          } catch (error) {
                            console.error('Error deleting rating:', error);
                            alert('Failed to delete rating');
                          }
                        }}
                      >
                        Delete Rating
                      </button>
                    )}
                    <button
                      className="btn btn-primary"
                      onClick={handleRatingSubmit}
                      disabled={!ratingValue}
                    >
                      {existingRatingId ? 'Update Rating' : 'Submit Rating'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ViewProfile; 
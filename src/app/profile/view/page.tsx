'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

const ViewProfile: React.FC = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);

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

          <div className="card mt-4 border-0">
            <div className="card-body">
              <h4 className="card-title mb-4">My Posted Jobs</h4>
              
              {jobs.length === 0 ? (
                <p className="text-muted">No jobs posted yet.</p>
              ) : (
                <div className="list-group">
                  {jobs.map((job) => (
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
                        <div className="d-flex justify-content-end mt-3">
                          <button 
                            className="btn btn-outline-primary btn-sm me-2"
                            style={{
                              borderRadius: '20px',
                              paddingLeft: '20px',
                              paddingRight: '20px'
                            }}
                            onClick={() => router.push(`/jobs/${job.id_job}`)}
                          >
                            View
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
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ViewProfile; 
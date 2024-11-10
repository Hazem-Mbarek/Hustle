'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  profileId: number;
  description: string;
  image: Blob | string;
  first_name: string;
  last_name: string;
  email: string;
  average_rating: number | null;
}

interface Job {
  id_job: number;
  title: string;
  description: string;
  category: string;
  state: string;
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

  useEffect(() => {
    fetchUserJobs();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Auth profile data:', data);
        setProfile(data);
        
        if (data.profileId) {
          const jobResponse = await fetch(`/api/job?profile_id=${data.profileId}&t=${Date.now()}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          if (jobResponse.ok) {
            const jobData = await jobResponse.json();
            console.log('Jobs for profile:', jobData);
            setJobs(jobData);
          }
        }
      }
    } catch (error) {
      setError('Failed to load profile');
      console.error('Error:', error);
    }
  };

  const fetchUserJobs = async () => {
    try {
      const profileResponse = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const profileData = await profileResponse.json();
      console.log('Auth profile data:', profileData);
      
      if (!profileData.profileId) {
        console.error('No profile ID found in profile data');
        return;
      }
      
      const response = await fetch(`/api/job?profile_id=${profileData.profileId}&t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched jobs:', data);
        setJobs(data);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
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
              
              <div className="text-center mb-3">
                <div className="d-flex align-items-center justify-content-center">
                  <span className="h4 mb-0 me-2">Rating:</span>
                  <div className="d-flex align-items-center">
                    <span className="h4 mb-0">
                      {profile.average_rating 
                        ? Number(profile.average_rating).toFixed(1) 
                        : 'No ratings yet'}
                    </span>
                    <span className="text-warning ms-2">★</span>
                  </div>
                </div>
                {profile.average_rating !== null && profile.average_rating > 0 && (
                  <small className="text-muted">
                    Based on user ratings
                  </small>
                )}
              </div>
              
              <div className="mt-4">
                <button 
                  className="btn btn-outline-primary me-2"
                  onClick={() => router.push(`/profile?edit=true&id=${profile.profileId}`)}
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
              <h4 className="card-title mb-4">Posted Jobs</h4>
              {jobs.length > 0 ? (
                <div className="row">
                  {jobs.map((job) => (
                    <div key={job.id_job} className="col-12 mb-3">
                      <div className="border rounded p-3">
                        <h5>{job.title}</h5>
                        <p className="mb-2">{job.description}</p>
                        <div className="d-flex flex-wrap gap-2">
                          <span className="badge bg-primary">{job.category}</span>
                          <span className="badge bg-secondary">{job.location}</span>
                          <span className="badge bg-success">${job.pay}</span>
                          <span className="badge bg-info">{job.state}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No jobs posted yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ViewProfile; 
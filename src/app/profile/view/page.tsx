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
  average_rating: number | null;
}

const ViewProfile: React.FC = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [error, setError] = useState('');

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

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      setError('Failed to load profile');
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
        </div>
      </div>
    </main>
  );
};

export default ViewProfile; 
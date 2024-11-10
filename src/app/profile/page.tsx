'use client';
import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface ProfileFormData {
  description: string;
  image: string | null;
}

export default function CreateProfile() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = searchParams.get('edit') === 'true';
  const profileId = searchParams.get('id');

  const [formData, setFormData] = useState<ProfileFormData>({
    description: '',
    image: null
  });
  const [preview, setPreview] = useState<string>('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isEditing && profileId) {
      fetchProfileData();
    } else {
      setIsLoading(false);
    }
  }, [isEditing, profileId]);

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`/api/profile?id=${profileId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          description: data.description || '',
          image: data.image ? `data:image/jpeg;base64,${data.image}` : null
        });
        if (data.image) {
          setPreview(`data:image/jpeg;base64,${data.image}`);
        }
      }
    } catch (error) {
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const url = isEditing ? `/api/profile?id=${profileId}` : '/api/profile';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: formData.description,
          image: formData.image
        })
      });

      if (response.ok) {
        router.push('/');
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save profile');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">
                {isEditing ? 'Edit Profile' : 'Create Profile'}
              </h2>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4 text-center">
                  <div className="position-relative mx-auto" style={{ width: '150px', height: '150px' }}>
                    {preview ? (
                      <img
                        src={preview}
                        alt="Profile preview"
                        style={{ 
                          width: '150px', 
                          height: '150px',
                          objectFit: 'cover',
                          borderRadius: '50%'
                        }}
                      />
                    ) : (
                      <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" 
                           style={{ width: '150px', height: '150px' }}>
                        <span className="text-muted">Add Photo</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <input
                      type="file"
                      className="form-control"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <small className="text-muted">Max file size: 5MB</small>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({
                      ...formData,
                      description: e.target.value
                    })}
                    placeholder="Tell us about yourself..."
                    required
                  />
                </div>

                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-success"
                    style={{ backgroundColor: '#17a589', borderColor: '#17a589' }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Profile' : 'Create Profile')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 
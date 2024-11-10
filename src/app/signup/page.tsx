'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SignupFormData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        if (loginResponse.ok) {
          router.push('/profile');
        } else {
          router.push('/login');
        }
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <main className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Sign Up</h2>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="first_name" className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({
                      ...formData,
                      first_name: e.target.value
                    })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="last_name" className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({
                      ...formData,
                      last_name: e.target.value
                    })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      email: e.target.value
                    })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({
                      ...formData,
                      password: e.target.value
                    })}
                    required
                  />
                </div>

                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-success"
                    style={{ backgroundColor: '#17a589', borderColor: '#17a589' }}
                  >
                    Sign Up
                  </button>
                </div>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    Already have an account? <Link href="/login">Login here</Link>
                  </small>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 
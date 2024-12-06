'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const lockoutDuration = 1 * 60 * 1000;

  useEffect(() => {
    if (isLocked) {
      const timer = setTimeout(() => {
        setIsLocked(false);
        setFailedAttempts(0);
      }, lockoutDuration);
      return () => clearTimeout(timer);
    }
  }, [isLocked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLocked) {
      setError('Account is temporarily locked. Please try again later.');
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('Login response:', data);
    
      if (response.ok) {
        if (data.user.role === 'admin') {
          console.log('Admin user detected, redirecting to dashboard...');
          await router.push('/admin/dashboard');
        } else {
          const redirectTo = searchParams.get('from') || '/job';
          router.refresh();
          console.log('Non-admin user, redirecting to:', redirectTo);
          await router.push(redirectTo);
          
          
        }
        router.refresh();
        setFailedAttempts(0);
      } else {
        setFailedAttempts(prev => prev + 1);
        if (failedAttempts + 1 >= 3) {
          setIsLocked(true);
          setError('Account is temporarily locked due to multiple failed attempts. Please try again later.');
        } else {
          setError(data.message || 'Login failed');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <main className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Login</h2>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
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

                <div className="d-grid">
                  <button 
                    type="submit" 
                    className="btn btn-success"
                    style={{ backgroundColor: '#17a589', borderColor: '#17a589' }}
                  >
                    Login
                  </button>
                </div>

                <div className="text-center mt-3">
                  <p className="mb-0">
                    Don't have an account? <Link href="/signup" className="text-primary">Sign up here</Link>
                  </p>
                  <p className="mb-0">
                    <Link href="/forgot-password" className="text-primary">Forgot Password?</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 
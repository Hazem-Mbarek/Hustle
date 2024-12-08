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
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    lowerCase: false,
    upperCase: false,
    number: false,
  });

  const checkPasswordStrength = (password: string) => {
    // Example criteria: at least 8 characters, 1 uppercase, 1 number
    const strongPassword = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return strongPassword.test(password);
  };

  const getPasswordStrengthMessage = (password: string) => {
    if (password.length < 8) return 'Too short';
    if (!/[A-Z]/.test(password)) return 'Add at least one uppercase letter';
    if (!/\d/.test(password)) return 'Add at least one number';
    return 'Strong password';
  };

  const getPasswordRequirements = (password: string) => {
    return {
      length: password.length >= 8,
      lowerCase: /[a-z]/.test(password),
      upperCase: /[A-Z]/.test(password),
      number: /\d/.test(password),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // New password strength validation
    if (!checkPasswordStrength(formData.password)) {
      setError('Password must be at least 8 characters long, contain at least one uppercase letter and one number.');
      return; // Prevent submission
    }

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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setFormData({
      ...formData,
      password: newPassword
    });
    
    const requirements = getPasswordRequirements(newPassword);
    setPasswordRequirements(requirements); // Update password requirements state
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
                    className={`form-control ${checkPasswordStrength(formData.password) ? 'is-valid' : 'is-invalid'}`}
                    id="password"
                    value={formData.password}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="password-requirements">
                  <h6>Password requirements:</h6>
                  <ul>
                    <li className={passwordRequirements.length ? 'text-success' : 'text-danger'}>
                      {passwordRequirements.length ? '✔️' : '❌'} Minimum 8 characters in length
                    </li>
                    <li className={passwordRequirements.lowerCase ? 'text-success' : 'text-danger'}>
                      {passwordRequirements.lowerCase ? '✔️' : '❌'} At least one lower case letter (a-z)
                    </li>
                    <li className={passwordRequirements.upperCase ? 'text-success' : 'text-danger'}>
                      {passwordRequirements.upperCase ? '✔️' : '❌'} At least one upper case letter (A-Z)
                    </li>
                    <li className={passwordRequirements.number ? 'text-success' : 'text-danger'}>
                      {passwordRequirements.number ? '✔️' : '❌'} At least one number (0-9)
                    </li>
                  </ul>
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
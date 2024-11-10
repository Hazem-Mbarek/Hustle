'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, [pathname]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setHasProfile(true);
      } else if (response.status === 401) {
        setIsAuthenticated(false);
        setHasProfile(false);
      } else {
        setIsAuthenticated(true);
        setHasProfile(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setHasProfile(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      });

      if (response.ok) {
        setIsAuthenticated(false);
        setHasProfile(false);
        document.cookie = 'auth_token=; max-age=0; path=/';
        document.cookie = 'profile_creation_token=; max-age=0; path=/';
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link href="/" className="navbar-brand">PartTime Hub</Link>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-center">
            <li className="nav-item">
              <Link href="/" className="nav-link">Home</Link>
            </li>
            <li className="nav-item">
              <Link href="/job" className="nav-link">Find Jobs</Link>
            </li>
            
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link href="/chat" className="nav-link">Messages</Link>
                </li>
                {hasProfile && (
                  <li className="nav-item mx-2">
                    <Link href="/profile/view" className="nav-link">
                      <i className="bi bi-person-circle fs-4"></i>
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <button onClick={handleLogout} className="btn btn-outline-danger">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link href="/login" className="btn btn-primary">Login</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
} 
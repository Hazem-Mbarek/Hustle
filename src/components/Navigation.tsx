'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navigation() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      });

      if (response.ok) {
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
        <Link href="/" className="navbar-brand">Job Portal</Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link href="/job" className="nav-link">Jobs</Link>
            </li>
            <li className="nav-item">
              <Link href="/job/add" className="nav-link">Post Job</Link>
            </li>
          </ul>
          
          <button 
            onClick={handleLogout} 
            className="btn btn-outline-danger"
            style={{ marginLeft: '10px' }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
} 
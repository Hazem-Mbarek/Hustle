'use client';
import { useRouter } from 'next/navigation';

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
    // Your existing navigation JSX with added logout button
    <button onClick={handleLogout} className="btn btn-outline-danger">
      Logout
    </button>
  );
} 
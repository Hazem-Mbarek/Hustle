'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface PendingRequest {
  id_request: number;
  id_profile_sender: number;
  id_job: number;
  status: string;
  bid: number;
  id_profile_receiver: number;
}

interface Notification {
  id_notification: number;
  message: string;
  created_at: string;
  is_read: boolean;
}

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const POLLING_INTERVAL = 5000; // 5 seconds

  useEffect(() => {
    checkAuthStatus();
    if (isAuthenticated) {
      fetchPendingRequests();
      fetchNotifications();

      const pollInterval = setInterval(() => {
        fetchPendingRequests();
        fetchNotifications();
      }, POLLING_INTERVAL);

      return () => clearInterval(pollInterval);
    }
  }, [isAuthenticated]);

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

  const fetchPendingRequests = async () => {
    try {
      const profileResponse = await fetch('/api/auth/profile', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!profileResponse.ok) {
        console.warn('Profile response not OK:', profileResponse.status);
        return;
      }
      
      const profileData = await profileResponse.json();
      if (!profileData?.profileId) {
        console.warn('No profile ID in response');
        return;
      }

      const response = await fetch(`/api/request?pending=true&profile_id=${profileData.profileId}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        console.warn('Request response not OK:', response.status);
        return;
      }

      const data = await response.json();
      
      // Validate that data is an array
      if (!Array.isArray(data)) {
        console.warn('Received data is not an array');
        setPendingRequests([]);
        return;
      }

      // Only update if the data has changed
      const currentRequests = JSON.stringify(pendingRequests);
      const newRequests = JSON.stringify(data);
      
      if (currentRequests !== newRequests) {
        setPendingRequests(data);
        // Safely calculate unread count
        const unreadNotificationCount = notifications?.filter(n => !n.is_read)?.length || 0;
        setUnreadCount(unreadNotificationCount + data.length);
      }
    } catch (error) {
      console.warn('Error in fetchPendingRequests:', error instanceof Error ? error.message : 'Unknown error');
      setPendingRequests([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      const profileResponse = await fetch('/api/auth/profile', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!profileResponse.ok) {
        console.warn('Profile response not OK:', profileResponse.status);
        return;
      }
      
      const profileData = await profileResponse.json();
      if (!profileData?.profileId) {
        console.warn('No profile ID in response');
        return;
      }

      const response = await fetch(`/api/notification?profile_id=${profileData.profileId}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        console.warn('Notification response not OK:', response.status);
        return;
      }

      const data = await response.json();
      
      // Validate that data is an array
      if (!Array.isArray(data)) {
        console.warn('Received notifications data is not an array');
        setNotifications([]);
        return;
      }

      // Only update if the data has changed
      const currentNotifications = JSON.stringify(notifications);
      const newNotifications = JSON.stringify(data);
      
      if (currentNotifications !== newNotifications) {
        setNotifications(data);
        const unreadCount = data.filter(n => !n.is_read).length;
        setUnreadCount(unreadCount + (pendingRequests?.length || 0));
      }
    } catch (error) {
      console.warn('Error in fetchNotifications:', error instanceof Error ? error.message : 'Unknown error');
      setNotifications([]);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notification?id=${notificationId}`, {
        method: 'PATCH',
      });
      
      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
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
    <nav className="navbar navbar-expand-lg navbar-light" style={{ backgroundColor: '#20B2AA' }}>
      <div className="container">
        <Link href="/" className="navbar-brand text-white">Hustle</Link>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-center">
            <li className="nav-item">
              <Link href="/" className="nav-link text-white">Home</Link>
            </li>
            <li className="nav-item">
              <Link href="/job" className="nav-link text-white">Find Jobs</Link>
            </li>
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link href="/job/add" className="nav-link text-white">Create Job</Link>
                </li>
                <li className="nav-item">
                  <Link href="/analytics" className="nav-link text-white">Analytics</Link>
                </li>
                <li className="nav-item">
                  <Link href="/recommendations" className="nav-link text-white">Recommendations</Link>
                </li>
              </>
            )}
            
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link href="/chat" className="nav-link text-white">Messages</Link>
                </li>
                <li className="nav-item mx-2">
                  <div className="position-relative">
                    <button
                      className="btn btn-link nav-link p-0 text-white position-relative"
                      onClick={() => setShowNotifications(!showNotifications)}
                    >
                      <i className="bi bi-bell fs-4"></i>
                      {unreadCount > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                          {unreadCount}
                          <span className="visually-hidden">unread notifications</span>
                        </span>
                      )}
                    </button>
                    
                    {showNotifications && (
                      <div className="position-absolute end-0 mt-2 py-2 bg-white rounded-3 shadow-lg" 
                           style={{ width: '300px', zIndex: 1000 }}>
                        <h6 className="px-3 mb-2">Notifications</h6>
                        <div className="dropdown-divider"></div>
                        <div className="notification-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                          {/* Pending Requests Section */}
                          {pendingRequests.length > 0 && (
                            <>
                              <h6 className="px-3 py-2 text-muted small">Job Requests</h6>
                              {pendingRequests.map((request) => (
                                <div key={request.id_request} className="px-3 py-2 border-bottom hover-bg-light">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                      <p className="mb-1">New job request</p>
                                      <small className="text-muted">
                                        Bid amount: ${request.bid}
                                      </small>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={async () => {
                                          try {
                                            const response = await fetch(`http://localhost:3000/api/request?id=${request.id_request}&action=accept`, {
                                              method: 'PATCH',
                                            });
                                            if (response.ok) {
                                              fetchPendingRequests(); // Refresh the notifications
                                            }
                                          } catch (error) {
                                            console.error('Error accepting request:', error);
                                          }
                                        }}
                                        className="btn btn-sm btn-outline-success d-flex align-items-center justify-content-center"
                                        style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                                      >
                                        <i className="bi bi-check-lg"></i>
                                      </button>

                                      <button
                                        onClick={async () => {
                                          try {
                                            const response = await fetch(`http://localhost:3000/api/request?id=${request.id_request}`, {
                                              method: 'DELETE',
                                            });
                                            if (response.ok) {
                                              fetchPendingRequests(); // Refresh the notifications
                                            }
                                          } catch (error) {
                                            console.error('Error deleting request:', error);
                                          }
                                        }}
                                        className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
                                        style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                                      >
                                        <i className="bi bi-x-lg"></i>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </>
                          )}

                          {/* Notifications Section */}
                          {notifications.length > 0 && (
                            <>
                              <h6 className="px-3 py-2 text-muted small">Other Notifications</h6>
                              {notifications.map((notification) => (
                                <div 
                                  key={notification.id_notification} 
                                  className={`px-3 py-2 border-bottom hover-bg-light ${!notification.is_read ? 'bg-light' : ''}`}
                                  onClick={() => markAsRead(notification.id_notification)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <p className="mb-1">{notification.message}</p>
                                  <small className="text-muted">
                                    {new Date(notification.created_at).toLocaleDateString()} {new Date(notification.created_at).toLocaleTimeString()}
                                  </small>
                                </div>
                              ))}
                            </>
                          )}

                          {pendingRequests.length === 0 && notifications.length === 0 && (
                            <div className="px-3 py-2 text-muted text-center">
                              No new notifications
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </li>
                {hasProfile && (
                  <li className="nav-item mx-2">
                    <Link href="/profile/view" className="nav-link text-white">
                      <i className="bi bi-person-circle fs-4"></i>
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <button onClick={handleLogout} className="btn btn-outline-light">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link href="/login" className="btn btn-outline-light">Login</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
} 
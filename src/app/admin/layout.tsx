import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers();
  const cookies = headersList.get('cookie') || '';
  
  if (!cookies.includes('auth_token')) {
    redirect('/login');
  }

  const authToken = cookies.split(';')
    .find((c: string) => c.trim().startsWith('auth_token='))
    ?.split('=')[1];

  if (!authToken) {
    redirect('/login');
  }

  try {
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET || 'your-secret-key') as any;
    console.log('Decoded token:', decoded);
    if (decoded.role !== 'admin') {
      redirect('/login');
    }
  } catch (error) {
    console.error('Token verification error:', error);
    redirect('/login');
  }

  return (
    <div className="admin-layout">
      <nav className="navbar navbar-dark bg-dark">
        <div className="container-fluid">
          <span className="navbar-brand">Admin Dashboard</span>
        </div>
      </nav>
      <div className="container-fluid">
        <div className="row">
          <nav className="col-md-2 d-md-block bg-light sidebar">
            <div className="position-sticky pt-3">
              <ul className="nav flex-column">
                <li className="nav-item">
                  <a className="nav-link" href="/admin/dashboard">
                    Dashboard
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/admin/users">
                    Users
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/admin/jobs">
                    Jobs
                  </a>
                </li>
              </ul>
            </div>
          </nav>
          <main className="col-md-10 ms-sm-auto px-md-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 
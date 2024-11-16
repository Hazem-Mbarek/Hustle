'use client';
import './Job.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Job {
  id_job: number;
  title: string;
  description: string;
  category: string;
  state: string;
  num_workers: number;
  pay: number;
  location: string;
  time: string;
  id_employer: number;
}

interface CurrentUser {
  id: number;
  email: string;
  name: string;
}

export default function Job() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(6); // Show 6 jobs per page (2 rows of 3)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const router = useRouter();
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('title');
  const [sortField, setSortField] = useState('time');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/job');
        if (!response.ok) throw new Error('Failed to fetch jobs');
        const data = await response.json();
        setJobs(data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const userData = await response.json();
          console.log('Current user data:', userData);
          setCurrentUser(userData);
        } else {
          console.log('Response not OK:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchProfileId = async () => {
      try {
        const response = await fetch('/api/auth/profile');
        if (response.ok) {
          const data = await response.json();
          setProfileId(data.profileId);
        } else {
          console.error('Failed to fetch profile ID');
        }
      } catch (error) {
        console.error('Error fetching profile ID:', error);
      }
    };

    fetchProfileId();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      require('bootstrap/dist/js/bootstrap.bundle.min.js');
    }
  }, []);

  // Get current jobs
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const sortJobs = (jobs: Job[]) => {
    return [...jobs].sort((a, b) => {
      switch (sortField) {
        case 'time':
          return sortDirection === 'desc' 
            ? new Date(b.time).getTime() - new Date(a.time).getTime()
            : new Date(a.time).getTime() - new Date(b.time).getTime();
        case 'pay':
          return sortDirection === 'desc' 
            ? b.pay - a.pay
            : a.pay - b.pay;
        default:
          return 0;
      }
    });
  };
  const filteredJobs = sortJobs(jobs.filter((job) => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = searchField === 'title' ? job.title.toLowerCase().includes(searchLower)
      : searchField === 'description' ? job.description.toLowerCase().includes(searchLower)
      : searchField === 'location' ? job.location.toLowerCase().includes(searchLower)
      : true;

    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;

    return matchesSearch && matchesCategory;
  }));
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const handleShowDetails = (job: Job) => {
    setSelectedJob(job);
  };

  const handleApply = async (job: Job) => {
    if (!profileId) {
      alert('Please log in to apply for jobs');
      return;
    }

    try {
      const jobResponse = await fetch(`/api/job?id=${job.id_job}`);
      if (!jobResponse.ok) throw new Error('Failed to fetch job details');
      const jobData = await jobResponse.json();

      const requestData = {
        id_profile_sender: profileId,
        id_job: job.id_job,
        id_profile_receiver: jobData.id_employer,
        status: 'pending',
        bid: bidAmount
      };

      console.log('Job object:', job);
      console.log('Request Data:', requestData);

      const response = await fetch('/api/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'credentials': 'include'
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        if (response.status === 409) {
          alert('You have already applied for this job');
          return;
        }
        
        let errorMessage = 'Failed to submit application';
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // If JSON parsing fails, use default error message
        }
        alert(errorMessage);
        return;
      }

      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Request failed:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  return (
    <main>
      {/* Welcome Section */}
      <div className="text-center mb-4 pt-5">
        <h2>Welcome to Your Job Portal</h2>
        <p>Explore job opportunities and enhance your skills.</p>
        <button
          className="btn btn-success"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasTutorial"
          aria-controls="offcanvasTutorial"
          style={{ backgroundColor: '#17a589', borderColor: '#17a589' }}
        >
          Show Tutorial
        </button>
      </div>

      {/* Offcanvas Tutorial */}
      <div
        className="offcanvas offcanvas-start"
        data-bs-scroll="true"
        tabIndex={-1}
        id="offcanvasTutorial"
        aria-labelledby="offcanvasTutorialLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasTutorialLabel">
            Welcome Tutorial
          </h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <p>Welcome to the Job Portal! Here are some tips to get you started:</p>
          <ul>
            <li>Explore the job listings to find opportunities that match your skills.</li>
            <li>Use the filters to narrow down your search by location, salary, and job type.</li>
            <li>Create a profile to apply easily and keep track of your applications.</li>
            <li>Don't forget to check our resources for resume tips and interview preparation!</li>
          </ul>
          <p>Good luck on your job search!</p>
        </div>
      </div>

      {/* Bootstrap Search Bar and Dropdown */}
      <div className="container mb-4 pt-10">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="d-flex gap-2">
              {/* Search Section */}
              <div className="input-group shadow-sm">
                <select 
                  className="form-select" 
                  style={{ maxWidth: '150px' }}
                  onChange={(e) => setSearchField(e.target.value)}
                  value={searchField}
                >
                  <option value="title">Title</option>
                  <option value="description">Description</option>
                  <option value="location">Location</option>
                </select>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                  className="btn btn-success" 
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  style={{ backgroundColor: '#17a589', borderColor: '#17a589' }}
                >
                  Search
                </button>
              </div>

              {/* Sort and Filter Controls */}
              <div className="d-flex gap-2">
                {/* Sort Controls */}
                <div className="input-group shadow-sm" style={{ width: '350px' }}>
                  <select 
                    className="form-select form-select-lg"
                    onChange={(e) => setSortField(e.target.value)}
                    value={sortField}
                    style={{ fontSize: '1rem', height: '42px' }}
                  >
                    <option value="time">Date Posted</option>
                    <option value="pay">Pay Rate</option>
                  </select>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                    style={{ width: '50px', fontSize: '1.2rem' }}
                  >
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </button>
                </div>

                {/* Category Filter */}
                <select
                  className="form-select shadow-sm"
                  style={{ maxWidth: '200px' }}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="Warehouse Worker">Warehouse Worker</option>
                  <option value="Handyman">Handyman</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Gardener">Gardener</option>
                  <option value="Pet Sitter">Pet Sitter</option>
                  <option value="Babysitter">Babysitter</option>
                  <option value="Janitor">Janitor</option>
                  <option value="Security Guard">Security Guard</option>
                  <option value="Musician/Performer">Musician/Performer</option>
                  <option value="Waiter/Cook">Waiter/Cook</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Tutor">Tutor</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job list with pagination */}
      <div className="container p-4">
        <div className="row justify-content-center">
          {currentJobs.map((job) => (
            <div key={job.id_job} className="col-md-4 mb-4">
              <div className="card card-custom mx-auto">
                <img
                  src={job.category === 'Warehouse Worker' ? '/images/WarehouseWorker.jpg' :
                      job.category === 'Handyman' ? '/images/Handyman.jpg' :
                      job.category === 'Delivery' ? '/images/Delivery.jpg' :
                      job.category === 'Gardener' ? '/images/Gardener.jpg' :
                      job.category === 'Pet Sitter' ? '/images/PetSitter.jpg' :
                      job.category === 'Babysitter' ? '/images/Babysitter.jpg' :
                      job.category === 'Janitor' ? '/images/Janitor.jpg' :
                      job.category === 'Security Guard' ? '/images/SecurityGuard.jpg' :
                      job.category === 'Musician/Performer' ? '/images/MusicianPerformer.jpg' :
                      job.category === 'Waiter/Cook' ? '/images/WaiterCook.jpg' :
                      job.category === 'Cashier' ? '/images/Cashier.jpg' :
                      job.category === 'Tutor' ? '/images/Tutor.jpg' :
                      '/images/logo4.png'}
                  className="card-img-top card-image"
                  alt={job.title}
                  onError={(e: any) => {
                    e.target.src = '/images/logo4.png';
                  }}
                />
                <div className="card-body">
                  <h5 className="card-title">{job.title}</h5>
                  <p className="card-text">{job.description}</p>
                  <div className="mb-2">
                    <small className="text-muted">
                      <div>Location: {job.location}</div>
                      <div>Pay: ${job.pay}/hr</div>
                      <div>Category: {job.category}</div>
                      <div>Workers needed: {job.num_workers}</div>
                    </small>
                  </div>
                  <button 
                    className="btn btn-success w-100"
                    data-bs-toggle="modal"
                    data-bs-target="#jobDetailsModal"
                    onClick={() => handleShowDetails(job)}
                    style={{ backgroundColor: '#17a589', borderColor: '#17a589' }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="row mt-4">
          <div className="col-12">
            <nav aria-label="Job listings pagination">
              <ul className="pagination justify-content-center">
                {/* Previous button */}
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </li>

                {/* Page numbers */}
                {pageNumbers.map(number => (
                  <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => paginate(number)}
                    >
                      {number}
                    </button>
                  </li>
                ))}

                {/* Next button */}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>

            {/* Page info with updated styling */}
            <div className="text-center mt-2">
              <small className="text-muted">
                Showing {indexOfFirstJob + 1} to {Math.min(indexOfLastJob, filteredJobs.length)} of {filteredJobs.length} jobs
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Job Details Modal */}
      <div
        className="modal fade"
        id="jobDetailsModal"
        tabIndex={-1}
        aria-labelledby="jobDetailsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="jobDetailsModalLabel">
                {selectedJob?.title}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {selectedJob && (
                <div className="container-fluid">
                  <div className="row">
                    <div className="col-md-6">
                      <img
                        src={selectedJob.category === 'Warehouse Worker' ? '/images/WarehouseWorker.jpg' :
                            selectedJob.category === 'Handyman' ? '/images/Handyman.jpg' :
                            selectedJob.category === 'Delivery' ? '/images/Delivery.jpg' :
                            selectedJob.category === 'Gardener' ? '/images/Gardener.jpg' :
                            selectedJob.category === 'Pet Sitter' ? '/images/PetSitter.jpg' :
                            selectedJob.category === 'Babysitter' ? '/images/Babysitter.jpg' :
                            selectedJob.category === 'Janitor' ? '/images/Janitor.jpg' :
                            selectedJob.category === 'Security Guard' ? '/images/SecurityGuard.jpg' :
                            selectedJob.category === 'Musician/Performer' ? '/images/MusicianPerformer.jpg' :
                            selectedJob.category === 'Waiter/Cook' ? '/images/WaiterCook.jpg' :
                            selectedJob.category === 'Cashier' ? '/images/Cashier.jpg' :
                            selectedJob.category === 'Tutor' ? '/images/Tutor.jpg' :
                            '/images/logo4.png'}
                        className="img-fluid rounded mb-3"
                        alt={selectedJob.title}
                        onError={(e: any) => {
                          e.target.src = '/images/logo4.png';
                        }}
                      />
                    </div>
                    <div className="col-md-6">
                      <h6 className="fw-bold">Job Details</h6>
                      <p>{selectedJob.description}</p>
                      <div className="mb-3">
                        <h6 className="fw-bold">Location</h6>
                        <p>{selectedJob.location}</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="fw-bold">Pay Rate</h6>
                        <p>${selectedJob.pay}/hr</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="fw-bold">Category</h6>
                        <p>{selectedJob.category}</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="fw-bold">Workers Needed</h6>
                        <p>{selectedJob.num_workers}</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="fw-bold">State</h6>
                        <p>{selectedJob.state}</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="fw-bold">Time Posted</h6>
                        <p>{selectedJob.time}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer d-flex align-items-center">
              <div className="input-group me-2" style={{ maxWidth: '200px' }}>
                <span className="input-group-text">$</span>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Your bid"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
                <span className="input-group-text">/hr</span>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn btn-success"
                onClick={() => selectedJob && handleApply(selectedJob)}
                style={{ backgroundColor: '#17a589', borderColor: '#17a589' }}
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

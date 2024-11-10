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

  // Get current jobs
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const handleShowDetails = (job: Job) => {
    setSelectedJob(job);
  };

  const handleApply = async (job: Job) => {
    const requestData = {
      id_profile_sender: currentUser?.id,
      id_job: job.id_job,
      id_profile_receiver: job.id_employer,
      status: 'pending',
      bid: job.pay
    };

    console.log('Request JSON:', requestData);

    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'credentials': 'include'
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        alert('Application submitted successfully!');
      } else {
        const errorData = await response.json();
        console.error('Server response:', errorData);
        alert(errorData.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application. Please try again.');
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
          <div className="col-md-6">
            <div className="input-group shadow-sm">
              <select className="form-select" aria-label="Default select example" defaultValue="">
                <option value="" disabled>Select a filter</option>
                <option value="1">Filter One</option>
                <option value="2">Filter Two</option>
                <option value="3">Filter Three</option>
              </select>
              <input
                type="text"
                className="form-control"
                placeholder="Search for jobs..."
              />
              <button 
                className="btn btn-success" 
                type="button"
                style={{ backgroundColor: '#17a589', borderColor: '#17a589' }}
              >
                Search
              </button>
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
                  src="/images/logo4.png"
                  className="card-img-top card-image"
                  alt={job.title}
                  onError={(e: any) => {
                    e.target.src = '/images/c.jpg';
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
                Showing {indexOfFirstJob + 1} to {Math.min(indexOfLastJob, jobs.length)} of {jobs.length} jobs
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
                        src="/images/logo4.png"
                        className="img-fluid rounded mb-3"
                        alt={selectedJob.title}
                        onError={(e: any) => {
                          e.target.src = '/images/c.jpg';
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
            <div className="modal-footer">
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

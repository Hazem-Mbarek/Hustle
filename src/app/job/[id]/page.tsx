'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

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
  profile_id: number;
}

interface Request {
  id_request: number;
  id_profile_sender: number;
  bid: number;
  status: string;
  sender_first_name?: string;
  sender_last_name?: string;
  rating?: number;
}

export default function JobDetails() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [acceptedRequests, setAcceptedRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratings, setRatings] = useState<{[key: number]: number}>({});

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`/api/job?id=${params.id}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch job details');
        }

        const data = await response.json();
        setJob(data);

        // Fetch accepted requests for this job
        const requestsResponse = await fetch(`/api/request?job_id=${params.id}&status=accepted`);
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          setAcceptedRequests(requestsData);

          // Fetch ratings for each accepted request
          const ratingsPromises = requestsData.map(async (request: Request) => {
            const ratingResponse = await fetch(`/api/rating?id_subject=${request.id_profile_sender}&job_id=${params.id}`);
            if (ratingResponse.ok) {
              const ratingData = await ratingResponse.json();
              if (Array.isArray(ratingData) && ratingData.length > 0) {
                setRatings(prev => ({
                  ...prev,
                  [request.id_profile_sender]: ratingData[0].value
                }));
              }
            }
          });

          await Promise.all(ratingsPromises);
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchJobDetails();
    }
  }, [params.id]);

  const handleRatingChange = async (profileId: number, rating: number) => {
    try {
      const response = await fetch('/api/rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_user: job?.profile_id,
          id_subject: profileId,
          value: rating,
          id_job: job?.id_job
        }),
      });

      if (response.ok) {
        setRatings(prev => ({
          ...prev,
          [profileId]: rating
        }));
      } else {
        console.error('Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const renderAcceptedWorkersTable = () => (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead>
          <tr>
            <th>Worker Name</th>
            <th>Bid Amount</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {acceptedRequests.map((request) => (
            <tr key={request.id_request}>
              <td>
                {request.sender_first_name} {request.sender_last_name}
              </td>
              <td>${request.bid}/hr</td>
              <td>
                <div className="rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingChange(request.id_profile_sender, star)}
                      className={`btn btn-link p-0 ${
                        ratings[request.id_profile_sender] >= star ? 'text-warning' : 'text-muted'
                      }`}
                      style={{ textDecoration: 'none' }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) return <div className="container mt-5">Loading...</div>;
  if (error) return <div className="container mt-5 text-danger">{error}</div>;
  if (!job) return <div className="container mt-5">Job not found</div>;

  return (
    <main className="container py-5">
      <div className="card shadow">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="card-title mb-0">{job.title}</h1>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-primary"
                onClick={() => router.push(`/job/edit/${job.id_job}`)}
                style={{ backgroundColor: '#17a589', borderColor: '#17a589' }}
              >
                Update Job
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => router.back()}
              >
                Back
              </button>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-8">
              <h5 className="text-muted mb-3">Description</h5>
              <p>{job.description}</p>

              {acceptedRequests.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-muted mb-3">Accepted Workers</h5>
                  {renderAcceptedWorkersTable()}
                </div>
              )}
            </div>
            <div className="col-md-4">
              <div className="card bg-light">
                <div className="card-body">
                  <h5 className="card-title">Job Details</h5>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <strong>Category:</strong> {job.category}
                    </li>
                    <li className="mb-2">
                      <strong>Location:</strong> {job.location}
                    </li>
                    <li className="mb-2">
                      <strong>Pay:</strong> ${job.pay}
                    </li>
                    <li className="mb-2">
                      <strong>Status:</strong> {job.state}
                    </li>
                    <li className="mb-2">
                      <strong>Workers Needed:</strong> {job.num_workers}
                    </li>
                    <li className="mb-2">
                      <strong>Workers Accepted:</strong> {acceptedRequests.length}
                    </li>
                    <li className="mb-2">
                      <strong>Date:</strong> {new Date(job.time).toLocaleDateString()}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

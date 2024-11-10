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

export default function JobDetails() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <div className="container mt-5">Loading...</div>;
  if (error) return <div className="container mt-5 text-danger">{error}</div>;
  if (!job) return <div className="container mt-5">Job not found</div>;

  return (
    <main className="container py-5">
      <div className="card shadow">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="card-title mb-0">{job.title}</h1>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => router.back()}
            >
              Back
            </button>
          </div>

          <div className="row mb-4">
            <div className="col-md-8">
              <h5 className="text-muted mb-3">Description</h5>
              <p>{job.description}</p>
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

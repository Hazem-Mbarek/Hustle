'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface JobFormData {
  title: string;
  description: string;
  category: string;
  state: string;
  num_workers: number;
  pay: number;
  location: string;
  time: string;
}

export default function JobEdit() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    category: '',
    state: '',
    num_workers: 1,
    pay: 0,
    location: '',
    time: new Date().toISOString(),
  });

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`/api/job?id=${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch job details');
        const data = await response.json();
        
        setFormData({
          title: data.title,
          description: data.description,
          category: data.category,
          state: data.state,
          num_workers: data.num_workers,
          pay: data.pay,
          location: data.location,
          time: data.time,
        });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'num_workers' || name === 'pay' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/job?id=${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Job updated successfully!');
        router.push(`/job/${params.id}`);
      } else {
        const result = await response.json();
        alert('Failed to update job: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Error updating job. Please try again.');
    }
  };

  if (loading) return <div className="container mt-5">Loading...</div>;
  if (error) return <div className="container mt-5 text-danger">{error}</div>;

  return (
    <main className="container my-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Edit Job</h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Job Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="category" className="form-label">Category</label>
                    <input
                      type="text"
                      className="form-control"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="state" className="form-label">State</label>
                    <select
                      className="form-select"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a state</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="pay" className="form-label">Pay Rate ($/hr)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="pay"
                      name="pay"
                      min="0"
                      step="0.01"
                      value={formData.pay}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="num_workers" className="form-label">Number of Workers</label>
                    <input
                      type="number"
                      className="form-control"
                      id="num_workers"
                      name="num_workers"
                      min="1"
                      value={formData.num_workers}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="location" className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-control"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-success"
                    style={{ backgroundColor: '#17a589', borderColor: '#17a589' }}
                  >
                    Update Job
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

export default function JobAdd() {
  const router = useRouter();
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
      const response = await fetch('/api/job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Job posted successfully!');
        router.push('/job'); // Redirect to jobs list
      } else {
        alert('Failed to post job: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error posting job. Please try again.');
    }
  };

  return (
    <main className="container my-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Post a New Job</h2>

              <form onSubmit={handleSubmit}>
                {/* Job Title */}
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

                {/* Job Description */}
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

                {/* Category */}
                <div className="mb-3">
                  <label htmlFor="category" className="form-label">Category</label>
                  <select
                    className="form-select"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
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

                {/* Location and State */}
                <div className="row mb-3">
                  <div className="col-md-6">
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
                  <div className="col-md-6">
                    <label htmlFor="state" className="form-label">State</label>
                    <input
                      type="text"
                      className="form-control"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Pay and Workers */}
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

                {/* Submit Button */}
                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-success"
                    style={{ backgroundColor: '#17a589', borderColor: '#17a589' }}
                  >
                    Post Job
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => router.push('/job')}
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

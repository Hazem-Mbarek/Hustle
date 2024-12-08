'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RequestFormData {
  id_job: number;
}

export default function RequestAdd() {
  const router = useRouter();
  const [formData, setFormData] = useState<RequestFormData>({
    id_job: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const jobResponse = await fetch(`/api/job?id=${formData.id_job}`);
      const jobData = await jobResponse.json();

      if (!jobResponse.ok) {
        alert('Failed to fetch job details: ' + jobData.message);
        return;
      }

      const requestData = {
        ...formData,
        id_profile_sender: 2,
        status: 'pending',
        bid: 33,
        id_profile_receiver: jobData.profile_id
      };

      const response = await fetch('/api/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Request submitted successfully!');
        router.push('/job');
      } else {
        alert('Failed to submit request: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting request. Please try again.');
    }
  };

  return (
    <main className="container my-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Submit a New Request</h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="id_job" className="form-label">Job ID</label>
                  <input
                    type="number"
                    className="form-control"
                    id="id_job"
                    name="id_job"
                    value={formData.id_job}
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
                    Submit Request
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
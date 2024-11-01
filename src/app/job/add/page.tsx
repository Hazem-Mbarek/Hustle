'use client';
import { useState } from 'react';

export default function JobAdd() {
  const [formData, setFormData] = useState({
    username: '',
    recipientUsername: '',
    vanityUrl: '',
    amount: '',
    serverUsername: '',
    server: '',
    textarea: '',
  });

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        // Handle success
        console.log('Job added successfully:', result);
      } else {
        // Handle error
        console.error('Failed to add job:', result.message);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <main className="container my-4">
      <h2 className="mb-4 text-center">User Information</h2>

      {/* Form with onSubmit handler */}
      <form onSubmit={handleSubmit}>
        {/* Username input with prefix */}
        <div className="input-group mb-3">
          <span className="input-group-text" id="basic-addon1">@</span>
          <input
            type="text"
            className="form-control"
            placeholder="Username"
            aria-label="Username"
            aria-describedby="basic-addon1"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        {/* Recipient's username input with suffix */}
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Recipient's username"
            aria-label="Recipient's username"
            aria-describedby="basic-addon2"
            name="recipientUsername"
            value={formData.recipientUsername}
            onChange={handleChange}
          />
          <span className="input-group-text" id="basic-addon2">@example.com</span>
        </div>

        {/* Vanity URL input with prefix */}
        <label htmlFor="basic-url" className="form-label">Your vanity URL</label>
        <div className="input-group mb-3">
          <span className="input-group-text" id="basic-addon3">https://example.com/users/</span>
          <input
            type="text"
            className="form-control"
            id="basic-url"
            aria-describedby="basic-addon3"
            name="vanityUrl"
            value={formData.vanityUrl}
            onChange={handleChange}
          />
        </div>

        {/* Amount input with prefix and suffix */}
        <div className="input-group mb-3">
          <span className="input-group-text">$</span>
          <input
            type="text"
            className="form-control"
            aria-label="Amount (to the nearest dollar)"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
          />
          <span className="input-group-text">.00</span>
        </div>

        {/* Server username input */}
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Username"
            aria-label="Username"
            name="serverUsername"
            value={formData.serverUsername}
            onChange={handleChange}
          />
          <span className="input-group-text">@</span>
          <input
            type="text"
            className="form-control"
            placeholder="Server"
            aria-label="Server"
            name="server"
            value={formData.server}
            onChange={handleChange}
          />
        </div>

        {/* Textarea input group */}
        <div className="input-group mb-3">
          <span className="input-group-text">With textarea</span>
          <textarea
            className="form-control"
            aria-label="With textarea"
            name="textarea"
            value={formData.textarea}
            onChange={handleChange}
          ></textarea>
        </div>

        {/* Submit button */}
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </main>
  );
}

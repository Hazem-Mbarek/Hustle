'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false); // Loading state
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setLoading(true); // Set loading to true

        try {
            // Update the fetch request here
            const response = await fetch('/api/auth/verifyemail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 
                    // Include your token here if needed    
                    // 'Authorization': `Bearer ${yourToken}    `
                },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                // Redirect to the verify-email page if the token is sent successfully
                router.push('/verify-email'); // Adjust the path as necessary
            } else {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    setMessage(data.message || 'Failed to send reset link.');
                } else {
                    setMessage('Failed to send reset link. Please try again.');
                }
            }
        } catch (error) {
            console.error('Error sending reset link:', error);
            setMessage('An error occurred. Please try again.');
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    return (
        <main className="container mt-5">
            <h2 className="text-center mb-4">Forgot Password</h2>
            {message && <div className="alert alert-info">{message}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="d-grid">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </div>
            </form>
        </main>
    );
}
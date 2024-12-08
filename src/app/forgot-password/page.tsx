'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                setMessage('Password reset link sent to your email.');
            } else {
                const data = await response.json();
                setMessage(data.message || 'Failed to send reset link.');
            }
        } catch (error) {
            console.error('Error sending reset link:', error);
            setMessage('An error occurred. Please try again.');
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
                    <button type="submit" className="btn btn-primary">Send Reset Link</button>
                </div>
            </form>
        </main>
    );
} 
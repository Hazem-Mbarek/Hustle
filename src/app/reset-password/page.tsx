'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }) // Include token in real implementation
            });

            if (response.ok) {
                setMessage('Password has been reset successfully.');
                router.push('/login'); // Redirect to login after successful reset
            } else {
                const data = await response.json();
                setMessage(data.message || 'Failed to reset password.');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            setMessage('An error occurred. Please try again.');
        }
    };

    return (
        <main className="container mt-5">
            <h2 className="text-center mb-4">Reset Password</h2>
            {message && <div className="alert alert-info">{message}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">New Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="d-grid">
                    <button type="submit" className="btn btn-primary">Reset Password</button>
                </div>
            </form>
        </main>
    );
} 
// Hustle/src/app/verify-email/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyEmail() {
    const [token, setToken] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        // Ici, vous devriez vérifier le token avec votre base de données
        // Pour l'exemple, nous allons simplement rediriger vers la page de réinitialisation
        if (token) {
            router.push('/reset-password'); // Rediriger vers la page de réinitialisation
        } else {
            setMessage('Token invalide. Veuillez réessayer.');
        }
    };

    return (
        <main className="container mt-5">
            <h2 className="text-center mb-4">Vérifiez votre email</h2>
            {message && <div className="alert alert-info">{message}</div>}
            <form onSubmit={handleVerify}>
                <input
                    type="text"
                    placeholder="Entrez le token envoyé à votre email"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                />
                <button type="submit">Vérifier le token</button>
            </form>
        </main>
    );
}
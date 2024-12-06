// Hustle/src/app/api/auth/verifyemail/verify-email.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getUserByEmail } from '../../../../lib/db'; // Ensure this function is defined

export async function POST(req: Request) {
    const { email } = await req.json();

    // Check if the email exists in the database
    const user = await getUserByEmail(email);
    if (!user) {
        return NextResponse.json({ message: 'Cet email n\'existe pas.' }, { status: 404 });
    }

    // Generate a token (you can use a library like uuid or crypto for this)
    const token = Math.random().toString(36).substring(2); // Simple token generation

    // Set up nodemailer with your SMTP settings
    const transporter = nodemailer.createTransport({
        host: 'smtp.esprit.tn', // Replace with your SMTP host
        port: 465, // Use 587 for TLS
        secure: true, // Set to true if using port 465
        auth: {
            user: process.env.EMAIL_USER, // Your email address
            pass: process.env.EMAIL_PASS, // Your email password
        },
    });

    const subject = 'Password Reset Request';
    const body = `Click the link to reset your password: <a href="http://yourwebsite.com/resetpassword?token=${token}">Reset Password</a>`;

    try {
        await transporter.sendMail({
            from: 'info@esprit.tn', // Your email address
            to: email,
            subject: subject,
            html: body,
        });

        return NextResponse.json({ message: 'Token envoyé avec succès.' }, { status: 200 });
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        return NextResponse.json({ message: 'Échec de l\'envoi du token. Veuillez réessayer.' }, { status: 500 });
    }
}
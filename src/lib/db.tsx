// Hustle/src/lib/db.ts
import mysql, { Pool, RowDataPacket } from 'mysql2/promise'; // Import RowDataPacket

let pool: Pool | null = null;

export const initDB = (): Pool => {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.DB_HOST as string,
            user: process.env.DB_USER as string,
            password: process.env.DB_PASSWORD as string,
            database: process.env.DB_NAME as string,
            waitForConnections: true,
            connectionLimit: 10,
        });
    }
    return pool;
};

export async function getUserByEmail(email: string): Promise<RowDataPacket | null> {
    const pool = initDB();
    const [rows]: [RowDataPacket[], any] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null; // Return the user if found, or null if not
}
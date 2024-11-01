import mysql, { Pool } from 'mysql2/promise';

// Define connection pool type
let pool: Pool;

export const initDB = () => {
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

export default initDB();

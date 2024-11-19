import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';

export async function GET() {
  const pool = initDB();
  
  try {
    // Get trending categories
    const [trendingCategories] = await pool.query(`
      SELECT category, COUNT(*) as count
      FROM Jobs
      WHERE time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY category
      ORDER BY count DESC
      LIMIT 5
    `);

    // Get average pay by category
    const [avgPayByCategory] = await pool.query(`
      SELECT category, ROUND(AVG(pay), 2) as avgPay
      FROM Jobs
      GROUP BY category
      ORDER BY avgPay DESC
    `);

    // Get most competitive jobs
    const [competitiveJobs] = await pool.query(`
      SELECT j.title, COUNT(r.id_request) as application_count
      FROM Jobs j
      LEFT JOIN Requests r ON j.id_job = r.id_job
      GROUP BY j.id_job, j.title
      HAVING application_count > 0
      ORDER BY application_count DESC
      LIMIT 5
    `);

    // Get jobs posted over time
    const [jobsOverTime] = await pool.query(`
      SELECT DATE(time) as date, COUNT(*) as count
      FROM Jobs
      WHERE time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(time)
      ORDER BY date
    `);

    return NextResponse.json({
      trendingCategories,
      avgPayByCategory,
      competitiveJobs,
      jobsOverTime
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { message: 'Error fetching analytics' },
      { status: 500 }
    );
  }
}
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

    // Add to your existing queries
    const [recentActivity] = await pool.query(`
      (
        SELECT 
          'New Job' as type,
          title,
          time,
          category
        FROM Jobs
        WHERE time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      )
      UNION ALL
      (
        SELECT 
          'Application' as type,
          j.title,
          j.time,
          j.category
        FROM Requests r
        JOIN Jobs j ON r.id_job = j.id_job
        WHERE r.id_request >= (
          SELECT MAX(id_request) - 10 FROM Requests
        )
      )
      ORDER BY time DESC
      LIMIT 5
    `);

    return NextResponse.json({
      trendingCategories,
      avgPayByCategory,
      competitiveJobs,
      jobsOverTime,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { message: 'Error fetching analytics' },
      { status: 500 }
    );
  }
}
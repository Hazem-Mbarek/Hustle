import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { initDB } from '@/lib/db';

export async function GET(req: Request) {
  const pool = initDB();
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token');
  const { searchParams } = new URL(req.url);
  const range = searchParams.get('range') || 'week';

  if (!authToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(authToken.value, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get total users (excluding admins)
    const [userCount] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM Users 
      WHERE role != 'admin'
    `);

    // Get total jobs
    const [jobCount] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM Jobs
    `);

    // Get active jobs
    const [activeJobCount] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM Jobs 
      WHERE state = 'active'
    `);

    // Get total requests
    const [requestCount] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM Requests
    `);

    // Get jobs by category
    const [jobsByCategory] = await pool.query(`
      SELECT category, COUNT(*) as count
      FROM Jobs
      GROUP BY category
      ORDER BY count DESC
    `);

    // Get the earliest date from the Users table
    const [earliestDate] = await pool.query(`
      SELECT MIN(created_at) as first_date 
      FROM Users 
      WHERE role != 'admin'
    `);

    const firstDate = (earliestDate as any)[0].first_date;
    
    // Get user growth data from the first date
    const [userGrowth] = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM Users
      WHERE role != 'admin'
        AND created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [firstDate]);

    // Get job success metrics
    const [jobSuccess] = await pool.query(`
      SELECT 
        COUNT(CASE WHEN state = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN state = 'cancelled' THEN 1 END) as cancelled,
        COUNT(CASE WHEN state = 'active' THEN 1 END) as active
      FROM Jobs
    `);

    // Get category growth comparison
    const [categoryGrowth] = await pool.query(`
      SELECT 
        category,
        COUNT(CASE WHEN created_at < DATE_SUB(NOW(), INTERVAL 1 MONTH) THEN 1 END) as previousCount,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH) THEN 1 END) as currentCount,
        ROUND(
          ((COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH) THEN 1 END) * 100.0) /
          NULLIF(COUNT(CASE WHEN created_at < DATE_SUB(NOW(), INTERVAL 1 MONTH) THEN 1 END), 0)) - 100,
          1
        ) as growthRate
      FROM Jobs
      GROUP BY category
      HAVING previousCount > 0 OR currentCount > 0
      ORDER BY growthRate DESC
    `);

    return NextResponse.json({
      totalUsers: (userCount as any)[0].count,
      totalJobs: (jobCount as any)[0].count,
      activeJobs: (activeJobCount as any)[0].count,
      totalRequests: (requestCount as any)[0].count,
      jobsByCategory: jobsByCategory,
      categoryGrowth: categoryGrowth,
      userGrowth: userGrowth,
      firstDate: firstDate,
      jobSuccess: {
        completed: (jobSuccess as any)[0].completed || 0,
        cancelled: (jobSuccess as any)[0].cancelled || 0,
        active: (jobSuccess as any)[0].active || 0
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 
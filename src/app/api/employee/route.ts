import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';
import { OkPacket } from 'mysql2';

interface EmployeeData {
  description: string;
  image?: Buffer;
  average_rating?: number;
}

// CREATE (POST)
export async function POST(request: Request) {
  const pool = initDB();

  try {
    const employeeData: EmployeeData = await request.json();

    const [result] = await pool.query(
      `INSERT INTO Employees (description, image, average_rating) 
       VALUES (?, ?, ?)`,
      [
        employeeData.description,
        employeeData.image || null,
        employeeData.average_rating || null
      ]
    );

    return NextResponse.json({ 
      message: 'Employee created successfully',
      id: (result as OkPacket).insertId 
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create employee:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// READ (GET)
export async function GET(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    if (id) {
      // Get specific employee
      const [rows] = await pool.query('SELECT * FROM Employees WHERE id_employee = ?', [id]);
      const employees = rows as any[];
      
      if (employees.length === 0) {
        return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
      }
      
      return NextResponse.json(employees[0]);
    } else {
      // Get all employees
      const [rows] = await pool.query('SELECT * FROM Employees');
      return NextResponse.json(rows);
    }
  } catch (error) {
    console.error('Database query failed:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// UPDATE (PATCH)
export async function PATCH(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    if (!id) {
      return NextResponse.json({ message: 'Employee ID is required' }, { status: 400 });
    }

    const updateFields = await request.json();
    
    // Build dynamic query based on provided fields
    const updates = Object.keys(updateFields)
      .filter(key => updateFields[key] !== undefined)
      .map(key => `${key} = ?`);
    
    if (updates.length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const query = `
      UPDATE Employees 
      SET ${updates.join(', ')}
      WHERE id_employee = ?
    `;

    const values = [
      ...Object.keys(updateFields)
        .filter(key => updateFields[key] !== undefined)
        .map(key => updateFields[key]),
      id
    ];

    const [result] = await pool.query(query, values);
    
    const affectedRows = (result as OkPacket).affectedRows;
    
    if (affectedRows === 0) {
      return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Employee updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Failed to update employee:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE
export async function DELETE(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'Employee ID is required' }, { status: 400 });
  }

  try {
    const [result] = await pool.query('DELETE FROM Employees WHERE id_employee = ?', [id]);
    
    const affectedRows = (result as OkPacket).affectedRows;
    
    if (affectedRows === 0) {
      return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Employee deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Failed to delete employee:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// OPTIONS (for CORS)
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS'
    },
  });
} 
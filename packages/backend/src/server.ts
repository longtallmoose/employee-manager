// packages/backend/src/server.ts
import express from 'express';
import cors from 'cors';
import { db } from './lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Vanguard HR Engine: Active 🚀');
});

// 1. REGISTER NEW STAFF (Atomic Transaction)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, jobTitle, department, payAmount } = req.body;

    const result = await db.$transaction(async (tx) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          // Use string casting to bypass generation mismatch
          role: (role as any) || 'EMPLOYEE',
        },
      });

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          records: {
            create: {
              jobTitle: jobTitle || 'New Starter',
              department: (department as any) || 'OPERATIONS',
              location: 'Head Office',
              payAmount: payAmount || 0,
              startDate: new Date(),
              employmentType: 'FULL_TIME' as any,
              payBasis: 'SALARIED' as any,
              hoursPerWeek: 37.5,
              changeReason: 'Initial Hire'
            }
          }
        }
      });

      return employee;
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create staff record' });
  }
});

// 2. UPDATE EMPLOYEE (Versioned logic)
app.put('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, jobTitle, department, payAmount, changeReason } = req.body;

    const result = await db.$transaction(async (tx) => {
      const employee = await tx.employee.update({
        where: { id },
        data: { firstName, lastName }
      });

      await tx.employmentRecord.updateMany({
        where: { employeeId: id, endDate: null },
        data: { endDate: new Date() }
      });

      const newRecord = await tx.employmentRecord.create({
        data: {
          employeeId: id,
          jobTitle: jobTitle || 'Updated Role',
          department: (department as any) || 'OPERATIONS',
          location: 'Head Office',
          payAmount: payAmount || 0,
          startDate: new Date(),
          employmentType: 'FULL_TIME' as any,
          payBasis: 'SALARIED' as any,
          hoursPerWeek: 37.5,
          changeReason: changeReason || 'Role/Salary Adjustment',
          changedBy: 'SYSTEM_ADMIN'
        }
      });

      return { employee, newRecord };
    });

    res.json(result);
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ error: 'Failed to update versioned record' });
  }
});

// 3. GET ALL EMPLOYEES
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await db.employee.findMany({
      include: {
        records: {
          where: { endDate: null },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// 4. LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: (user as any).role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '8h' }
    );

    res.json({ token, user: { email: user.email, role: (user as any).role } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// 5. DELETE
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.employee.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Vanguard HR Engine: Listening on port ${PORT}`);
});
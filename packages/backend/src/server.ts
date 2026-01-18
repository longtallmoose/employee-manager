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

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// 1. ONBOARD (Creates User + Employee + EmploymentRecord)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, jobTitle, department, payAmount, niNumber, addressLine1, postcode, emergencyName, emergencyPhone } = req.body;
    const result = await db.$transaction(async (tx) => {
      const hashedPassword = await bcrypt.hash(password || 'TempPass123!', 10);
      const user = await tx.user.create({
        data: { email, passwordHash: hashedPassword, role: 'EMPLOYEE' },
      });
      const employee = await tx.employee.create({
        data: {
          userId: user.id, firstName, lastName, niNumber, addressLine1, postcode,
          emergencyName, emergencyPhone, dateOfBirth: new Date('1990-01-01'), city: 'London', country: 'UK'
        }
      });
      await tx.employmentRecord.create({
        data: {
          employeeId: employee.id, jobTitle: jobTitle || 'New Starter',
          department: department || 'OPERATIONS', location: 'Head Office',
          payAmount: Number(payAmount) || 0, startDate: new Date(),
          employmentType: 'FULL_TIME', payBasis: 'SALARIED', hoursPerWeek: 37.5,
          changeReason: 'Initial Hire', changedBy: 'SYSTEM_AUTO'
        }
      });
      return employee;
    });
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// 2. UPDATE (Handles Personal Edit + Job/Salary Versioning)
app.put('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, niNumber, addressLine1, postcode, emergencyName, emergencyPhone, jobTitle, department, payAmount } = req.body;

    const result = await db.$transaction(async (tx) => {
      // Update Personal Data
      await tx.employee.update({
        where: { id },
        data: { firstName, lastName, niNumber, addressLine1, postcode, emergencyName, emergencyPhone }
      });

      // Versioning Logic: Close old record, open new one
      await tx.employmentRecord.updateMany({
        where: { employeeId: id, endDate: null },
        data: { endDate: new Date() }
      });

      await tx.employmentRecord.create({
        data: {
          employeeId: id, jobTitle, department, payAmount: Number(payAmount),
          startDate: new Date(), location: 'Head Office',
          employmentType: 'FULL_TIME', payBasis: 'SALARIED', hoursPerWeek: 37.5,
          changeReason: 'Dossier Update', changedBy: 'ADMIN'
        }
      });
      return { success: true };
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Update failed' });
  }
});

// 3. DELETE (Cascading Fix)
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const emp = await db.employee.findUnique({ where: { id } });
    if (emp) {
      await db.$transaction([
        db.employmentRecord.deleteMany({ where: { employeeId: id } }),
        db.employee.delete({ where: { id } }),
        db.user.delete({ where: { id: emp.userId } })
      ]);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

app.get('/api/employees', async (req, res) => {
  const employees = await db.employee.findMany({
    include: { records: { where: { endDate: null }, take: 1 } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(employees);
});

app.listen(PORT, () => console.log(`🚀 Engine Live on ${PORT}`));
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

// --- AUTH & EMPLOYEE ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, jobTitle, department, payAmount, niNumber, addressLine1, postcode, emergencyName, emergencyPhone } = req.body;
    const result = await db.$transaction(async (tx) => {
      const hashedPassword = await bcrypt.hash(password || 'Vanguard2026!', 10);
      const user = await tx.user.create({
        data: { email: email || `${firstName.toLowerCase()}.${Date.now()}@vanguard.com`, passwordHash: hashedPassword, role: 'EMPLOYEE' },
      });
      const employee = await tx.employee.create({
        data: {
          userId: user.id, firstName, lastName, niNumber: niNumber || 'PENDING', addressLine1: addressLine1 || 'No Address', postcode: postcode || 'N/A',
          emergencyName: emergencyName || 'Not Set', emergencyPhone: emergencyPhone || 'Not Set', dateOfBirth: new Date('1990-01-01'), city: 'London', country: 'UK'
        }
      });
      await tx.employmentRecord.create({
        data: {
          employeeId: employee.id, jobTitle: jobTitle || 'New Starter', department: department || 'OPERATIONS', location: 'Head Office',
          payAmount: Number(payAmount) || 0, startDate: new Date(), employmentType: 'FULL_TIME', payBasis: 'SALARIED', hoursPerWeek: 37.5,
          changeReason: 'Initial Hire', changedBy: 'SYSTEM_ADMIN'
        }
      });
      return employee;
    });
    res.status(201).json(result);
  } catch (error) { res.status(500).json({ error: 'Registration failed' }); }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, niNumber, addressLine1, postcode, emergencyName, emergencyPhone, jobTitle, department, payAmount } = req.body;
    await db.$transaction(async (tx) => {
      await tx.employee.update({
        where: { id },
        data: { firstName, lastName, niNumber, addressLine1, postcode, emergencyName, emergencyPhone }
      });
      if (jobTitle || department || payAmount) {
         await tx.employmentRecord.updateMany({ where: { employeeId: id, endDate: null }, data: { endDate: new Date() } });
         await tx.employmentRecord.create({
           data: {
             employeeId: id, jobTitle, department, payAmount: Number(payAmount), startDate: new Date(), location: 'Head Office',
             employmentType: 'FULL_TIME', payBasis: 'SALARIED', hoursPerWeek: 37.5, changeReason: 'Dossier Update', changedBy: 'ADMIN'
           }
         });
      }
    });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Update failed' }); }
});

app.get('/api/employees', async (req, res) => {
  const employees = await db.employee.findMany({
    include: { records: { orderBy: { startDate: 'desc' } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(employees);
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const emp = await db.employee.findUnique({ where: { id } });
    if (emp) {
      await db.$transaction([
        // Cascade delete cases involved with this employee
        db.caseInvolvedParty.deleteMany({ where: { employeeId: id } }),
        db.employmentRecord.deleteMany({ where: { employeeId: id } }),
        db.employee.delete({ where: { id } }),
        db.user.delete({ where: { id: emp.userId } })
      ]);
    }
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Delete failed' }); }
});

// --- NEW: HR CASE MANAGEMENT ROUTES (MATCHING SCHEMA.PRISMA) ---

// GET Cases with Subject and Timeline
app.get('/api/cases', async (req, res) => {
  try {
    const cases = await db.hRCase.findMany({
      include: {
        involvedParties: { include: { employee: true } }, // Get the subject
        timeline: { orderBy: { occurredAt: 'desc' } }     // Get history
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(cases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch cases' }); 
  }
});

// POST Create New Case
app.post('/api/cases', async (req, res) => {
  try {
    const { subjectId, type, summary, detailedDesc, riskLevel } = req.body;
    const ref = `CASE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newCase = await db.hRCase.create({
      data: {
        reference: ref,
        type: type, // DISCIPLINARY, GRIEVANCE etc.
        summary: summary,
        detailedDesc: detailedDesc || '',
        status: 'INTAKE',
        riskLevel: riskLevel || 'LOW',
        leadHrUserId: 'admin-user', // Placeholder for now
        involvedParties: {
          create: {
            employeeId: subjectId,
            role: 'SUBJECT'
          }
        },
        timeline: {
          create: {
            stage: 'INTAKE',
            title: 'Case Opened',
            description: `Case initiated: ${summary}`,
            occurredAt: new Date(),
            loggedByUserId: 'admin-user'
          }
        }
      }
    });
    res.status(201).json(newCase);
  } catch (error) { 
    console.error(error);
    res.status(500).json({ error: 'Failed to create case' }); 
  }
});

// POST Add Timeline Event (Note)
app.post('/api/cases/:id/timeline', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, stage } = req.body;
    
    const event = await db.caseTimelineEvent.create({
      data: {
        caseId: id,
        title,
        description,
        stage: stage || 'INVESTIGATION',
        occurredAt: new Date(),
        loggedByUserId: 'admin-user'
      }
    });
    
    // Optionally update case status
    if (stage) {
      await db.hRCase.update({ where: { id }, data: { status: stage } });
    }

    res.status(201).json(event);
  } catch (error) { res.status(500).json({ error: 'Failed to add event' }); }
});

// --- NEW: AUTHENTICATION MIDDLEWARE & /ME ENDPOINT ---

// Middleware to verify JWT Token
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// GET /api/auth/me - Returns the logged-in employee's profile
app.get('/api/auth/me', authenticate, async (req: any, res: any) => {
  try {
    const employee = await db.employee.findUnique({
      where: { userId: req.userId },
      include: { 
        records: { orderBy: { startDate: 'desc' } }, // Career History
        cases: true // Any cases they are involved in
      }
    });
    
    if (!employee) return res.status(404).json({ error: 'Employee profile not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.listen(PORT, () => console.log(`🚀 Engine Live on ${PORT}`));
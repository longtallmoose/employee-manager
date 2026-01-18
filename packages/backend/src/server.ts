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

// --- MIDDLEWARE ---
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

// --- AUTH ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { 
      email, password, firstName, lastName, 
      jobTitle, department, payAmount, 
      niNumber, phoneNumber, rightToWorkStatus,
      addressLine1, city, region, postcode, country,
      emergencyName, emergencyPhone, emergencyRel,
      sortCode, accountNumber, bankName
    } = req.body;
    
    // Transaction: Create User -> Employee -> Employment Record -> Bank Details
    const result = await db.$transaction(async (tx) => {
      const hashedPassword = await bcrypt.hash(password || 'StaffPilot2026!', 10);
      
      const user = await tx.user.create({
        data: { 
          email: email || `${firstName.toLowerCase()}.${Date.now()}@staffpilot.co.uk`, 
          passwordHash: hashedPassword, 
          role: 'EMPLOYEE' 
        },
      });

      const employee = await tx.employee.create({
        data: {
          userId: user.id, 
          firstName, lastName, niNumber, 
          phoneNumber, rightToWorkStatus: rightToWorkStatus || 'PENDING_CHECK',
          addressLine1, city, region, postcode, country,
          emergencyName, emergencyPhone, emergencyRel,
          dateOfBirth: new Date('1990-01-01')
        }
      });

      // Optional: Create Bank Details if provided
      if (sortCode && accountNumber) {
        await tx.bankDetails.create({
          data: {
            employeeId: employee.id,
            accountName: `${firstName} ${lastName}`,
            sortCode, accountNumber, bankName: bankName || 'Main Bank'
          }
        });
      }

      await tx.employmentRecord.create({
        data: {
          employeeId: employee.id, 
          jobTitle: jobTitle || 'New Starter', 
          department: department || 'OPERATIONS', 
          location: 'Head Office',
          payAmount: Number(payAmount) || 0, 
          startDate: new Date(), 
          employmentType: 'FULL_TIME', 
          payBasis: 'SALARIED', 
          hoursPerWeek: 37.5,
          changeReason: 'Initial Hire', 
          changedBy: 'SYSTEM_ADMIN'
        }
      });
      return employee;
    });
    res.status(201).json(result);
  } catch (error) { 
    console.error("Register Error:", error);
    res.status(500).json({ error: 'Registration failed' }); 
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // FIX: Fetch user AND their employee record to get the employeeId
    const user = await db.user.findUnique({ 
      where: { email },
      include: { employee: true } // <--- CRITICAL for iOS App
    });

    if (user && await bcrypt.compare(password, user.passwordHash)) {
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret');
      
      // FIX: Return the full user object along with the token
      res.json({ 
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          // This ensures the iOS app can link the user to their profile
          employeeId: user.employee ? user.employee.id : null
        }
      });
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (error) { 
    console.error("Login Error:", error); 
    res.status(500).json({ error: 'Login error' }); 
  }
});

app.get('/api/auth/me', authenticate, async (req: any, res: any) => {
  try {
    const employee = await db.employee.findUnique({
      where: { userId: req.userId },
      include: { 
        records: { orderBy: { startDate: 'desc' } },
        bankDetails: true
      }
    });
    if (!employee) return res.status(404).json({ error: 'Profile not found' });
    res.json(employee);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch profile' }); }
});

// --- EMPLOYEE ROUTES ---

app.get('/api/employees', async (req, res) => {
  try {
    const employees = await db.employee.findMany({
      include: { 
        records: { orderBy: { startDate: 'desc' } },
        bankDetails: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(employees);
  } catch (error) {
    console.error("Fetch Employees Error:", error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      firstName, lastName, niNumber, phoneNumber, rightToWorkStatus,
      addressLine1, city, region, postcode, country,
      emergencyName, emergencyPhone, emergencyRel,
      jobTitle, department, payAmount,
      sortCode, accountNumber, bankName
    } = req.body;
    
    await db.$transaction(async (tx) => {
      // 1. Update Core Profile
      await tx.employee.update({
        where: { id },
        data: { 
          firstName, lastName, niNumber, phoneNumber, rightToWorkStatus,
          addressLine1, city, region, postcode, country,
          emergencyName, emergencyPhone, emergencyRel
        }
      });

      // 2. Update Banking (Upsert ensures it creates if missing)
      if (sortCode && accountNumber) {
        await tx.bankDetails.upsert({
          where: { employeeId: id },
          create: {
            employeeId: id,
            accountName: `${firstName} ${lastName}`,
            sortCode, accountNumber, bankName
          },
          update: { sortCode, accountNumber, bankName }
        });
      }
      
      // 3. Update Job (Versioned)
      if (jobTitle || department || payAmount) {
         await tx.employmentRecord.updateMany({ where: { employeeId: id, endDate: null }, data: { endDate: new Date() } });
         await tx.employmentRecord.create({
           data: {
             employeeId: id, jobTitle, department, payAmount: Number(payAmount), 
             startDate: new Date(), location: 'Head Office',
             employmentType: 'FULL_TIME', payBasis: 'SALARIED', hoursPerWeek: 37.5, 
             changeReason: 'Dossier Update', changedBy: 'ADMIN'
           }
         });
      }
    });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Update failed' }); }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const emp = await db.employee.findUnique({ where: { id } });
    if (emp) {
      await db.$transaction([
        db.bankDetails.deleteMany({ where: { employeeId: id } }),
        db.employmentRecord.deleteMany({ where: { employeeId: id } }),
        db.caseInvolvedParty.deleteMany({ where: { employeeId: id } }),
        db.employee.delete({ where: { id } }),
        db.user.delete({ where: { id: emp.userId } })
      ]);
    }
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Delete failed' }); }
});

// --- CASE MANAGEMENT ROUTES ---

app.get('/api/cases', async (req, res) => {
  try {
    const cases = await db.hRCase.findMany({
      include: {
        involvedParties: { include: { employee: true } }, 
        timeline: { orderBy: { occurredAt: 'desc' } }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(cases);
  } catch (error) { res.json([]); }
});

app.post('/api/cases', async (req, res) => {
  try {
    const { subjectId, type, summary, detailedDesc, riskLevel } = req.body;
    const ref = `CASE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newCase = await db.hRCase.create({
      data: {
        reference: ref,
        type, summary, detailedDesc: detailedDesc || '',
        status: 'INTAKE', riskLevel: riskLevel || 'LOW',
        leadHrUserId: 'admin-user',
        involvedParties: { create: { employeeId: subjectId, role: 'SUBJECT' } },
        timeline: { create: { stage: 'INTAKE', title: 'Case Opened', description: `Case initiated: ${summary}`, occurredAt: new Date(), loggedByUserId: 'admin-user' } }
      }
    });
    res.status(201).json(newCase);
  } catch (error) { res.status(500).json({ error: 'Failed to create case' }); }
});

app.post('/api/cases/:id/timeline', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, stage } = req.body;
    
    const event = await db.caseTimelineEvent.create({
      data: {
        caseId: id, title: title || 'Note', description, stage: stage || 'INVESTIGATION',
        occurredAt: new Date(), loggedByUserId: 'admin-user'
      }
    });
    
    if (stage) await db.hRCase.update({ where: { id }, data: { status: stage } });
    res.status(201).json(event);
  } catch (error) { res.status(500).json({ error: 'Failed to add event' }); }
});

app.listen(PORT, () => console.log(`🚀 StaffPilot Engine Live on ${PORT}`));
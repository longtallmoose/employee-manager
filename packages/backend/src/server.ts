// packages/backend/src/server.ts
import express from 'express';
import cors from 'cors';
import { AuthService } from './services/auth-service';
import { db } from './lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Use the port Render gives us, or fallback to 4000 locally
const PORT = process.env.PORT || 4000;

// Middleware - Configured for your specific frontend URL
app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
  credentials: true
}));
app.use(express.json());

// --- ROUTES ---

// 1. Health Check
app.get('/', (req, res) => {
  res.send('Vanguard HR Platform API is Active 🚀');
});

// 2. UPDATE AN EMPLOYEE
app.put('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role } = req.body;

    console.log(`Update request for ID: ${id}`);

    const updatedEmployee = await db.employee.update({
      where: { id },
      data: {
        firstName,
        lastName,
        // @ts-ignore - Bypass Enum check for rapid UK role updates
        role: role, 
      },
    });

    res.json(updatedEmployee);
  } catch (error) {
    console.error('Database update error:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// 3. Registration Endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const result = await AuthService.register({
      email,
      password,
      firstName,
      lastName,
      role: role || 'EMPLOYEE',
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// 4. GET ALL EMPLOYEES
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await db.employee.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(employees);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// 5. DELETE AN EMPLOYEE
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.employee.delete({
      where: { id },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// 6. LOGIN ROUTE
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Pull secret from .env for security
    const secret = process.env.JWT_SECRET || 'fallback_super_secret';
    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      secret, 
      { expiresIn: '1h' }
    );

    res.json({ token, user: { email: user.email } });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`\n⚡️ Vanguard HR Server is running on port ${PORT}`);
});
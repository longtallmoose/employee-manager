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

// CRITICAL FIX: Use the port Render gives us, or fallback to 4000 locally
const PORT = process.env.PORT || 4000;

// Middleware (Allows the frontend to talk to the backend)
app.use(cors());
app.use(express.json());

// --- ROUTES ---

// Health Check
app.get('/', (req, res) => {
  res.send('Employee Platform API is Active 🚀');
});

// Registration Endpoint
app.post('/api/auth/register', async (req, res) => {
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
});

// GET ALL EMPLOYEES
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await db.employee.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// DELETE AN EMPLOYEE
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

// LOGIN ROUTE
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // 2. Check the password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // 3. Generate the Token using the Environment Variable (Secure)
    // If JWT_SECRET is missing, it falls back to 'super_secret' (preventing crashes)
    const secret = process.env.JWT_SECRET || 'super_secret';
    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      secret, 
      { expiresIn: '1h' }
    );

    res.json({ token, user: { email: user.email } });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`\n⚡️ Server is running on port ${PORT}`);
});
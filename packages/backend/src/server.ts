// packages/backend/src/server.ts
import express from 'express';
import cors from 'cors';
import { AuthService } from './services/auth-service';
import { db } from './lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 4000;

// Middleware (Allows us to read JSON data)
app.use(cors());
app.use(express.json());

// --- ROUTES ---

// Health Check (To test if server is running)
app.get('/', (req, res) => {
  res.send('Employee Platform API is Active 🚀');
});

// Registration Endpoint
app.post('/api/auth/register', async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;

  // Basic validation
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  // Call the service we just built
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
      orderBy: { createdAt: 'desc' } // Newest first
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// DELETE AN EMPLOYEE
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL
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
    // We compare the 'password' sent by the user with 'passwordHash' in the DB
    // (Note: In a real app, we would use bcrypt.compare(password, user.passwordHash))
    // Use bcrypt to compare the plain password with the stored hash
    const isValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // 3. Generate the "ID Card" (Token)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'SUPER_SECRET_KEY', 
      { expiresIn: '1h' }
    );

    // 4. Send the token back
    // (We removed firstName because it's not in the User table)
    res.json({ token, user: { email: user.email } });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`\n⚡️ Server is running on http://localhost:${PORT}`);
  console.log(`   Database connected: postgresql://localhost:5432/employee_db\n`);
});
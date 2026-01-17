"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// packages/backend/src/server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_service_1 = require("./services/auth-service");
const db_1 = require("./lib/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app = (0, express_1.default)();
const PORT = 4000;
// Middleware (Allows us to read JSON data)
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// --- ROUTES ---
// Health Check (To test if server is running)
app.get('/', (req, res) => {
    res.send('Employee Platform API is Active 🚀');
});
// Registration Endpoint
app.post('/api/auth/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, firstName, lastName, role } = req.body;
    // Basic validation
    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }
    // Call the service we just built
    const result = yield auth_service_1.AuthService.register({
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
}));
// GET ALL EMPLOYEES
app.get('/api/employees', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employees = yield db_1.db.employee.findMany({
            orderBy: { createdAt: 'desc' } // Newest first
        });
        res.json(employees);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
}));
// DELETE AN EMPLOYEE
app.delete('/api/employees/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // Get the ID from the URL
        yield db_1.db.employee.delete({
            where: { id },
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete employee' });
    }
}));
// LOGIN ROUTE
app.post('/api/auth/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // 1. Find the user
        const user = yield db_1.db.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
        // 2. Check the password
        // We compare the 'password' sent by the user with 'passwordHash' in the DB
        // (Note: In a real app, we would use bcrypt.compare(password, user.passwordHash))
        // Use bcrypt to compare the plain password with the stored hash
        const isValid = yield bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid password' });
        }
        // 3. Generate the "ID Card" (Token)
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, 'SUPER_SECRET_KEY', { expiresIn: '1h' });
        // 4. Send the token back
        // (We removed firstName because it's not in the User table)
        res.json({ token, user: { email: user.email } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
}));
// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`\n⚡️ Server is running on http://localhost:${PORT}`);
    console.log(`   Database connected: postgresql://localhost:5432/employee_db\n`);
});

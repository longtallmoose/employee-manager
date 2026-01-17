// packages/backend/src/services/auth-service.ts
import bcrypt from 'bcryptjs';
import { db } from '../lib/db';
import { Result } from '../types/service-result';

export class AuthService {
  
  // REGISTER A NEW EMPLOYEE
  static async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'EMPLOYEE' | 'HR_ADVISOR' | 'SUPER_ADMIN';
  }) {
    try {
      // 1. Check if email exists
      const existingUser = await db.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return Result.fail('USER_EXISTS', 'This email is already in use.');
      }

      // 2. Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);

      // 3. Transaction: Create User AND Employee Profile together
      // WE CHANGED THIS LINE BELOW:
      const result = await db.$transaction(async (tx: any) => {
        // A. Create Login User
        const newUser = await tx.user.create({
          data: {
            email: data.email,
            passwordHash: hashedPassword,
          },
        });

        // B. Create Employee Profile
        const newEmployee = await tx.employee.create({
          data: {
            userId: newUser.id,
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: new Date('1990-01-01'), 
            addressLine1: 'Pending Address',
            city: 'Pending City',
            postcode: 'Pending',
          },
        });

        return { user: newUser, employee: newEmployee };
      });

      return Result.ok(result);

    } catch (error: any) {
      console.error('Registration Error:', error);
      return Result.fail('INTERNAL_ERROR', 'System error during registration', error);
    }
  }
}
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
exports.AuthService = void 0;
// packages/backend/src/services/auth-service.ts
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../lib/db");
const service_result_1 = require("../types/service-result");
class AuthService {
    // REGISTER A NEW EMPLOYEE
    static register(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 1. Check if email exists
                const existingUser = yield db_1.db.user.findUnique({
                    where: { email: data.email },
                });
                if (existingUser) {
                    return service_result_1.Result.fail('USER_EXISTS', 'This email is already in use.');
                }
                // 2. Hash the password
                const salt = yield bcryptjs_1.default.genSalt(10);
                const hashedPassword = yield bcryptjs_1.default.hash(data.password, salt);
                // 3. Transaction: Create User AND Employee Profile together
                // WE CHANGED THIS LINE BELOW:
                const result = yield db_1.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    // A. Create Login User
                    const newUser = yield tx.user.create({
                        data: {
                            email: data.email,
                            passwordHash: hashedPassword,
                        },
                    });
                    // B. Create Employee Profile
                    const newEmployee = yield tx.employee.create({
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
                }));
                return service_result_1.Result.ok(result);
            }
            catch (error) {
                console.error('Registration Error:', error);
                return service_result_1.Result.fail('INTERNAL_ERROR', 'System error during registration', error);
            }
        });
    }
}
exports.AuthService = AuthService;

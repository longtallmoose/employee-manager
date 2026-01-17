-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('EMPLOYEE', 'LINE_MANAGER', 'DEPT_MANAGER', 'HR_ADVISOR', 'PAYROLL_OFFICER', 'SCHEDULER', 'COMPLIANCE_OFFICER', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'ZERO_HOURS', 'CONTRACTOR', 'FREELANCE', 'APPRENTICE');

-- CreateEnum
CREATE TYPE "PayBasis" AS ENUM ('SALARIED', 'HOURLY', 'DAY_RATE');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('ANNUAL_LEAVE', 'SICKNESS_SELF_CERT', 'SICKNESS_DOCTOR_CERT', 'TOIL', 'UNPAID', 'MATERNITY', 'PATERNITY', 'ADOPTION', 'BEREAVEMENT', 'JURY_SERVICE', 'TRAINING');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'REQUIRES_INFO');

-- CreateEnum
CREATE TYPE "RightToWorkStatus" AS ENUM ('BRITISH_CITIZEN', 'SETTLED_STATUS', 'VISA_TIER_2', 'VISA_STUDENT', 'VISA_SPOUSAL', 'PENDING_CHECK');

-- CreateEnum
CREATE TYPE "CaseType" AS ENUM ('DISCIPLINARY', 'GRIEVANCE', 'CAPABILITY_PERFORMANCE', 'SAFEGUARDING', 'WHISTLEBLOWING');

-- CreateEnum
CREATE TYPE "CaseStage" AS ENUM ('INTAKE', 'INVESTIGATION', 'HEARING', 'OUTCOME', 'APPEAL', 'CLOSED');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('CONTRACT', 'ID_PROOF', 'PAYSLIP', 'POLICY_ACK', 'CERTIFICATION', 'MEDICAL_NOTE', 'CASE_EVIDENCE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "preferredName" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "niNumber" TEXT,
    "phoneNumber" TEXT,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'UK',
    "emergencyName" TEXT,
    "emergencyRel" TEXT,
    "emergencyPhone" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "managerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmploymentRecord" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "jobTitle" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "employmentType" "EmploymentType" NOT NULL,
    "payBasis" "PayBasis" NOT NULL,
    "payAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "hoursPerWeek" DECIMAL(4,2) NOT NULL,
    "contractUrl" TEXT,
    "changeReason" TEXT,
    "changedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmploymentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankDetails" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "sortCode" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "bankName" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" "LeaveType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isHalfDay" BOOLEAN NOT NULL DEFAULT false,
    "totalDays" DECIMAL(4,1) NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "managerNote" TEXT,
    "rejectionReason" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "documentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "breakMinutes" INTEGER NOT NULL DEFAULT 0,
    "locationId" TEXT NOT NULL,
    "roleRequired" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isOpenShift" BOOLEAN NOT NULL DEFAULT false,
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HRCase" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "type" "CaseType" NOT NULL,
    "summary" TEXT NOT NULL,
    "detailedDesc" TEXT NOT NULL,
    "status" "CaseStage" NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "leadHrUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HRCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseInvolvedParty" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "CaseInvolvedParty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseTimelineEvent" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "stage" "CaseStage" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "loggedByUserId" TEXT NOT NULL,

    CONSTRAINT "CaseTimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT,
    "caseId" TEXT,
    "title" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeTraining" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "certificateUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeTraining_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BankDetails_employeeId_key" ON "BankDetails"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "HRCase_reference_key" ON "HRCase"("reference");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploymentRecord" ADD CONSTRAINT "EmploymentRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankDetails" ADD CONSTRAINT "BankDetails_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseInvolvedParty" ADD CONSTRAINT "CaseInvolvedParty_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "HRCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseInvolvedParty" ADD CONSTRAINT "CaseInvolvedParty_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseTimelineEvent" ADD CONSTRAINT "CaseTimelineEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "HRCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "HRCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeTraining" ADD CONSTRAINT "EmployeeTraining_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

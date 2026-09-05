-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('BANK', 'BROKER', 'CRYPTO', 'MANUAL');

-- CreateEnum
CREATE TYPE "AccountCategory" AS ENUM ('CASH', 'PRIVATE_EQUITY', 'REAL_ESTATE', 'OTHER');

-- CreateEnum
CREATE TYPE "BankConnectionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'ERROR');

-- CreateEnum
CREATE TYPE "BalanceSource" AS ENUM ('SYNC', 'MANUAL');

-- CreateEnum
CREATE TYPE "TransactionSource" AS ENUM ('AUTO', 'MANUAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "institution" TEXT,
    "country" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "type" "AccountType" NOT NULL,
    "category" "AccountCategory" NOT NULL,
    "bankConnectionId" TEXT,
    "externalId" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankConnection" (
    "id" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "consentValidUntil" TIMESTAMP(3),
    "status" "BankConnectionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Balance" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "source" "BalanceSource" NOT NULL DEFAULT 'MANUAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT,
    "subcategory" TEXT,
    "source" "TransactionSource" NOT NULL DEFAULT 'AUTO',
    "isManuallyCorrected" BOOLEAN NOT NULL DEFAULT false,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllocationTarget" (
    "id" TEXT NOT NULL,
    "broker" TEXT NOT NULL,
    "horizon" TEXT NOT NULL,
    "managementType" TEXT NOT NULL,
    "controlLevel" TEXT NOT NULL,
    "strategyName" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "potentialGrowth" DECIMAL(5,2),
    "drawdown" DECIMAL(5,2),
    "riskAdjustedReward" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AllocationTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectionAssumption" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "annualGrowthRate" DECIMAL(5,2) NOT NULL,
    "startingBalance" DECIMAL(18,2) NOT NULL,
    "startingDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectionAssumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL,
    "base" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "rate" DECIMAL(18,8) NOT NULL,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_category_idx" ON "Account"("category");

-- CreateIndex
CREATE INDEX "Balance_accountId_date_idx" ON "Balance"("accountId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Balance_accountId_date_key" ON "Balance"("accountId", "date");

-- CreateIndex
CREATE INDEX "Transaction_accountId_date_idx" ON "Transaction"("accountId", "date");

-- CreateIndex
CREATE INDEX "Transaction_category_idx" ON "Transaction"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_accountId_externalId_key" ON "Transaction"("accountId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_base_quote_date_key" ON "ExchangeRate"("base", "quote", "date");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_bankConnectionId_fkey" FOREIGN KEY ("bankConnectionId") REFERENCES "BankConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

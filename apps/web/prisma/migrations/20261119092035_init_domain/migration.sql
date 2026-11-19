-- CreateEnum
CREATE TYPE "CountryCode" AS ENUM ('ZW', 'NG', 'GH', 'KE', 'ZA');

-- CreateEnum
CREATE TYPE "Corridor" AS ENUM ('UK_ZW', 'UK_NG', 'UK_GH');

-- CreateEnum
CREATE TYPE "KybStatus" AS ENUM ('pending', 'verified', 'rejected');

-- CreateEnum
CREATE TYPE "SettleDestinationType" AS ENUM ('bank_usd', 'ecocash', 'cash_pickup', 'paynow', 'zipit');

-- CreateEnum
CREATE TYPE "EcoCashOwnership" AS ENUM ('school_merchant', 'school_institutional', 'relative_personal', 'staff_personal');

-- CreateEnum
CREATE TYPE "LinkBinding" AS ENUM ('open_student_school', 'payer_bound');

-- CreateEnum
CREATE TYPE "ObligationStatus" AS ENUM ('open', 'instructed', 'proven', 'cancelled', 'needs_reconcile');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('created', 'instructed', 'confirmed', 'proven', 'needs_reconcile', 'cancelled');

-- CreateEnum
CREATE TYPE "ConfirmationSource" AS ENUM ('partner_api', 'dogfood_stub', 'manual_ops');

-- CreateEnum
CREATE TYPE "ReconResult" AS ENUM ('proven', 'needs_reconcile');

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "api_key_hash" TEXT NOT NULL,
    "api_key_hint" TEXT NOT NULL,
    "corridors" "CountryCode"[],
    "destination_capabilities" "SettleDestinationType"[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institutions" (
    "id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" "CountryCode" NOT NULL,
    "kyb_status" "KybStatus" NOT NULL DEFAULT 'pending',
    "live_connect" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_stub" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "school_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settle_destinations" (
    "id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "type" "SettleDestinationType" NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "account_title" TEXT,
    "bank_name" TEXT,
    "account_number" TEXT,
    "ownership" "EcoCashOwnership",
    "msisdn" TEXT,
    "merchant_id" TEXT,
    "school_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settle_destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beneficiaries" (
    "id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "student_ref" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grade" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beneficiaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "links" (
    "id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "link_code" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "beneficiary_id" TEXT NOT NULL,
    "binding" "LinkBinding" NOT NULL DEFAULT 'open_student_school',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_templates" (
    "id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "corridor" "Corridor" NOT NULL DEFAULT 'UK_ZW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fee_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "obligations" (
    "id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "beneficiary_id" TEXT NOT NULL,
    "fee_template_id" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "ObligationStatus" NOT NULL DEFAULT 'open',
    "stale" BOOLEAN NOT NULL DEFAULT false,
    "due_label" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "obligations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempts" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT,
    "obligation_id" TEXT NOT NULL,
    "link_id" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "status" "AttemptStatus" NOT NULL DEFAULT 'created',
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "destination_type" "SettleDestinationType" NOT NULL,
    "payer_hint" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instructions" (
    "id" TEXT NOT NULL,
    "attempt_id" TEXT NOT NULL,
    "customer_reference" TEXT NOT NULL,
    "settle_destination_id" TEXT NOT NULL,
    "frozen_destination" JSONB NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instructions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "confirmations" (
    "id" TEXT NOT NULL,
    "attempt_id" TEXT NOT NULL,
    "customer_reference" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "partner_payment_id" TEXT,
    "settled_at" TIMESTAMP(3) NOT NULL,
    "source" "ConfirmationSource" NOT NULL DEFAULT 'partner_api',
    "recon_result" "ReconResult" NOT NULL,
    "recon_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proofs" (
    "id" TEXT NOT NULL,
    "attempt_id" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proofs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partners_partner_id_key" ON "partners"("partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "institutions_external_id_key" ON "institutions"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "school_users_email_key" ON "school_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "settle_destinations_external_id_key" ON "settle_destinations"("external_id");

-- CreateIndex
CREATE INDEX "settle_destinations_institution_id_idx" ON "settle_destinations"("institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "beneficiaries_external_id_key" ON "beneficiaries"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "beneficiaries_institution_id_student_ref_key" ON "beneficiaries"("institution_id", "student_ref");

-- CreateIndex
CREATE UNIQUE INDEX "links_external_id_key" ON "links"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "links_link_code_key" ON "links"("link_code");

-- CreateIndex
CREATE INDEX "links_institution_id_idx" ON "links"("institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "fee_templates_external_id_key" ON "fee_templates"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "obligations_external_id_key" ON "obligations"("external_id");

-- CreateIndex
CREATE INDEX "obligations_institution_id_status_idx" ON "obligations"("institution_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "attempts_idempotency_key_key" ON "attempts"("idempotency_key");

-- CreateIndex
CREATE INDEX "attempts_obligation_id_idx" ON "attempts"("obligation_id");

-- CreateIndex
CREATE UNIQUE INDEX "instructions_attempt_id_key" ON "instructions"("attempt_id");

-- CreateIndex
CREATE UNIQUE INDEX "instructions_customer_reference_key" ON "instructions"("customer_reference");

-- CreateIndex
CREATE UNIQUE INDEX "confirmations_attempt_id_key" ON "confirmations"("attempt_id");

-- CreateIndex
CREATE UNIQUE INDEX "proofs_attempt_id_key" ON "proofs"("attempt_id");

-- AddForeignKey
ALTER TABLE "school_users" ADD CONSTRAINT "school_users_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settle_destinations" ADD CONSTRAINT "settle_destinations_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiaries" ADD CONSTRAINT "beneficiaries_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "links" ADD CONSTRAINT "links_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "links" ADD CONSTRAINT "links_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "beneficiaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_templates" ADD CONSTRAINT "fee_templates_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obligations" ADD CONSTRAINT "obligations_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obligations" ADD CONSTRAINT "obligations_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "beneficiaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obligations" ADD CONSTRAINT "obligations_fee_template_id_fkey" FOREIGN KEY ("fee_template_id") REFERENCES "fee_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_obligation_id_fkey" FOREIGN KEY ("obligation_id") REFERENCES "obligations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "links"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructions" ADD CONSTRAINT "instructions_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "attempts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructions" ADD CONSTRAINT "instructions_settle_destination_id_fkey" FOREIGN KEY ("settle_destination_id") REFERENCES "settle_destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confirmations" ADD CONSTRAINT "confirmations_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "attempts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proofs" ADD CONSTRAINT "proofs_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "attempts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

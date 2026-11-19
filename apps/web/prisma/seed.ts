import {
  CountryCode,
  Corridor,
  EcoCashOwnership,
  PrismaClient,
  SettleDestinationType,
} from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

function hashApiKey(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex");
}

async function main() {
  console.log("Seeding Senda 4.0 pilot fixture (Heritage Demo Academy)…");

  // Wipe in FK-safe order for idempotent re-seed
  await prisma.proof.deleteMany();
  await prisma.confirmation.deleteMany();
  await prisma.instruction.deleteMany();
  await prisma.attempt.deleteMany();
  await prisma.obligation.deleteMany();
  await prisma.feeTemplate.deleteMany();
  await prisma.link.deleteMany();
  await prisma.beneficiary.deleteMany();
  await prisma.settleDestination.deleteMany();
  await prisma.schoolUser.deleteMany();
  await prisma.institution.deleteMany();
  await prisma.partner.deleteMany();

  // Fixture ids keep historical names for YAML compatibility; display names are generic.
  const demoPartnerKey =
    process.env.SANDBOX_API_KEY_MUKURU || "sk_sandbox_mukuru_demo";
  const bankOnlyKey =
    process.env.SANDBOX_API_KEY_BANK_ONLY || "sk_sandbox_bank_only";
  const noZwKey = process.env.SANDBOX_API_KEY_NO_ZW || "sk_sandbox_no_zw";

  await prisma.partner.createMany({
    data: [
      {
        partnerId: "partner_mukuru_sbx",
        name: "Demo remittance partner",
        apiKeyHash: hashApiKey(demoPartnerKey),
        apiKeyHint: "sandbox",
        corridors: [CountryCode.ZW],
        destinationCapabilities: [
          SettleDestinationType.bank_usd,
          SettleDestinationType.ecocash,
        ],
      },
      {
        partnerId: "partner_bank_only",
        name: "Bank-only demo partner",
        apiKeyHash: hashApiKey(bankOnlyKey),
        apiKeyHint: "bank_only",
        corridors: [CountryCode.ZW],
        destinationCapabilities: [SettleDestinationType.bank_usd],
      },
      {
        partnerId: "partner_no_zw",
        name: "No-corridor demo partner",
        apiKeyHash: hashApiKey(noZwKey),
        apiKeyHint: "no_zw",
        corridors: [],
        destinationCapabilities: [],
      },
    ],
  });

  const institution = await prisma.institution.create({
    data: {
      externalId: "inst_heritage_demo",
      name: "Heritage Demo Academy",
      country: CountryCode.ZW,
      kybStatus: "verified",
      liveConnect: true,
    },
  });

  await prisma.schoolUser.create({
    data: {
      email: "bursar@heritage-demo.zw",
      name: "Demo Bursar",
      passwordStub: "pilot",
      institutionId: institution.id,
    },
  });

  await prisma.settleDestination.createMany({
    data: [
      {
        externalId: "dest_bank_1",
        institutionId: institution.id,
        type: SettleDestinationType.bank_usd,
        verified: true,
        currency: "USD",
        accountTitle: "Heritage Demo Academy FCA",
        bankName: "Steward Bank",
        accountNumber: "USD-100200300",
      },
      {
        externalId: "dest_eco_1",
        institutionId: institution.id,
        type: SettleDestinationType.ecocash,
        verified: true,
        currency: "USD",
        ownership: EcoCashOwnership.school_merchant,
        msisdn: "+263771000001",
      },
      // Rejected examples kept for negative tests (not Connect-eligible)
      {
        externalId: "dest_cash_reject",
        institutionId: institution.id,
        type: SettleDestinationType.cash_pickup,
        verified: true,
        currency: "USD",
      },
      {
        externalId: "dest_relative_eco",
        institutionId: institution.id,
        type: SettleDestinationType.ecocash,
        verified: true,
        currency: "USD",
        ownership: EcoCashOwnership.relative_personal,
        msisdn: "+263771999999",
      },
      {
        externalId: "dest_paynow",
        institutionId: institution.id,
        type: SettleDestinationType.paynow,
        verified: true,
        currency: "USD",
        merchantId: "PN-DEMO",
      },
      {
        externalId: "dest_zipit",
        institutionId: institution.id,
        type: SettleDestinationType.zipit,
        verified: true,
        currency: "USD",
        schoolCode: "HER123",
      },
    ],
  });

  const ada = await prisma.beneficiary.create({
    data: {
      externalId: "ben_student_001",
      institutionId: institution.id,
      studentRef: "HD-001",
      name: "Ada Demo",
      grade: "Form 3",
    },
  });

  const ben = await prisma.beneficiary.create({
    data: {
      externalId: "ben_student_002",
      institutionId: institution.id,
      studentRef: "HD-002",
      name: "Ben Demo",
      grade: "Form 3",
    },
  });

  await prisma.link.createMany({
    data: [
      {
        externalId: "link_001",
        linkCode: "HDA-ADA-001",
        institutionId: institution.id,
        beneficiaryId: ada.id,
        binding: "open_student_school",
      },
      {
        externalId: "link_002",
        linkCode: "HDA-BEN-002",
        institutionId: institution.id,
        beneficiaryId: ben.id,
        binding: "open_student_school",
      },
    ],
  });

  const template = await prisma.feeTemplate.create({
    data: {
      externalId: "tmpl_form3_term1",
      institutionId: institution.id,
      grade: "Form 3",
      term: "2026-T1",
      amount: "850.00",
      currency: "USD",
      corridor: Corridor.UK_ZW,
    },
  });

  await prisma.obligation.createMany({
    data: [
      {
        externalId: "obl_001",
        institutionId: institution.id,
        beneficiaryId: ada.id,
        feeTemplateId: template.id,
        amount: "850.00",
        currency: "USD",
        status: "open",
        stale: false,
        dueLabel: "Form 3 · 2026-T1",
      },
      {
        externalId: "obl_002",
        institutionId: institution.id,
        beneficiaryId: ben.id,
        feeTemplateId: template.id,
        amount: "850.00",
        currency: "USD",
        status: "open",
        stale: false,
        dueLabel: "Form 3 · 2026-T1",
      },
      {
        externalId: "obl_stale",
        institutionId: institution.id,
        beneficiaryId: ada.id,
        feeTemplateId: template.id,
        amount: "850.00",
        currency: "USD",
        status: "open",
        stale: true,
        dueLabel: "Form 3 · 2026-T1 (stale)",
      },
    ],
  });

  console.log("Seed complete.");
  console.log("  Biller login: bursar@heritage-demo.zw / pilot");
  console.log(`  Demo partner API key: ${demoPartnerKey}`);
  console.log("  Pay codes: HDA-ADA-001 (obl_001), HDA-BEN-002 (obl_002)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

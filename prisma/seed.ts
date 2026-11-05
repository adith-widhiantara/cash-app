import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "../src/lib/constants";

// Seeding only creates reference data: one household and the category list.
// Users need password hashing and accounts need the setup flow, so both are
// created by the application, not here.

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. It comes from compose.yaml.");
}

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

const HOUSEHOLD_NAME = "Keluarga";

// Starting keywords for the regex layer. Every user correction appends to
// this list, so the AI layer gradually stops being needed.
const KEYWORDS: Record<string, string[]> = {
  Makanan: ["makan", "bakso", "nasi", "kopi", "warung", "resto", "gofood"],
  "Belanja Harian": ["indomaret", "alfamart", "pasar", "sayur", "belanja"],
  Transportasi: ["bensin", "pertamina", "gojek", "grab", "parkir", "tol"],
  Tagihan: ["listrik", "pln", "air", "pdam", "internet", "pulsa", "wifi"],
  Kesehatan: ["apotek", "dokter", "obat", "rumah sakit", "klinik"],
  Anak: ["sekolah", "spp", "susu", "popok", "mainan"],
  Rumah: ["sewa", "perabot", "servis", "kebersihan"],
  Hiburan: ["bioskop", "netflix", "spotify", "game", "liburan"],
  "Transfer Keluarga": ["kirim", "orang tua", "saudara"],
  Gaji: ["gaji", "payroll"],
  "Bonus/THR": ["bonus", "thr", "tunjangan"],
  Usaha: ["usaha", "jualan", "omzet"],
};

async function main() {
  const household = await prisma.household.upsert({
    where: { id: "seed-household" },
    update: {},
    create: { id: "seed-household", name: HOUSEHOLD_NAME },
  });

  const categories: { name: string; kind: string }[] = [
    ...EXPENSE_CATEGORIES.map((name) => ({ name, kind: "expense" })),
    ...INCOME_CATEGORIES.map((name) => ({ name, kind: "income" })),
  ];

  for (const { name, kind } of categories) {
    await prisma.category.upsert({
      where: {
        householdId_name_kind: {
          householdId: household.id,
          name,
          kind,
        },
      },
      update: {},
      create: {
        householdId: household.id,
        name,
        kind,
        keywords: JSON.stringify(KEYWORDS[name] ?? []),
      },
    });
  }

  const count = await prisma.category.count({
    where: { householdId: household.id },
  });

  console.log(`Household: ${household.name}`);
  console.log(`Categories: ${count}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

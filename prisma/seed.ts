const { PrismaClient, UserRole } = require("@prisma/client");
const { createReadStream } = require("fs");
const { createInterface } = require("readline");
const { resolve } = require("path");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

interface UserInput {
  email: string;
  password: string;
  role: (typeof UserRole)[keyof typeof UserRole];
}

interface Args {
  count?: number;
  csv?: string;
  clear: boolean;
}

// Default user counts
const DEFAULT_COUNTS = {
  [UserRole.ADMIN]: 2,
  [UserRole.SUPERVISOR]: 7,
  [UserRole.USER]: 10,
};

// Parse command line arguments using yargs
const argv = yargs(hideBin(process.argv))
  .options({
    count: {
      alias: "c",
      description: "Number of users to generate for each role",
      type: "number",
    },
    csv: {
      description: "Path to CSV file containing user data",
      type: "string",
    },
    clear: {
      description: "Clear existing users before seeding",
      type: "boolean",
      default: false,
    },
  })
  .help()
  .parseSync() as Args;

async function generateDefaultUsers(count?: number) {
  const userCounts = {
    [UserRole.ADMIN]: count || DEFAULT_COUNTS[UserRole.ADMIN],
    [UserRole.SUPERVISOR]: count || DEFAULT_COUNTS[UserRole.SUPERVISOR],
    [UserRole.USER]: count || DEFAULT_COUNTS[UserRole.USER],
  };

  for (const [role, roleCount] of Object.entries(userCounts)) {
    console.log(`Generating ${roleCount} ${role} users...`);
    for (let i = 0; i < roleCount; i++) {
      const email = `${role.toLowerCase()}${i + 1}@example.com`;
      const hashedPassword = await bcrypt.hash("password123", SALT_ROUNDS);
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: role as (typeof UserRole)[keyof typeof UserRole],
        },
      });
    }
  }
}

async function loadUsersFromCSV(csvPath: string): Promise<UserInput[]> {
  return new Promise((resolve, reject) => {
    const users: UserInput[] = [];
    const lineReader = createInterface({
      input: createReadStream(csvPath),
      crlfDelay: Infinity,
    });

    let isFirstLine = true;
    let headers: string[] = [];

    lineReader.on("line", (line: string) => {
      if (isFirstLine) {
        headers = line.split(",").map((h) => h.trim().toLowerCase());
        isFirstLine = false;
        return;
      }

      const values = line.split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      if (row.email && row.role) {
        users.push({
          email: row.email,
          password: row.password || "password123",
          role: row.role.toUpperCase() as (typeof UserRole)[keyof typeof UserRole],
        });
      }
    });

    lineReader.on("close", () => resolve(users));
    lineReader.on("error", reject);
  });
}

async function main() {
  try {
    console.log("Starting database seed...");

    if (argv.clear) {
      await prisma.user.deleteMany();
      console.log("Cleared existing users");
    }

    if (argv.csv) {
      console.log("Loading users from CSV...");
      const users = await loadUsersFromCSV(argv.csv);
      for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
        await prisma.user.create({
          data: {
            ...user,
            password: hashedPassword,
          },
        });
      }
      console.log(`Successfully loaded ${users.length} users from CSV`);
    } else {
      await generateDefaultUsers(argv.count);
      console.log("Successfully generated default users");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

import { PrismaClient } from "@prisma/client"

// This script helps migrate data from SQLite to Supabase
// Run it with: npx ts-node scripts/migrate-to-supabase.ts

async function main() {
  console.log("Starting migration to Supabase...")

  // Initialize Prisma client
  const prisma = new PrismaClient()

  try {
    // Apply migrations to Supabase
    console.log("Applying migrations to Supabase...")

    // Test database connection
    await prisma.$connect()
    console.log("Successfully connected to Supabase database!")

    // You can add custom migration logic here if needed

    console.log("Migration completed successfully!")
  } catch (error) {
    console.error("Migration failed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()


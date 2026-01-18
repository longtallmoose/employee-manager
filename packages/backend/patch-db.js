const { Client } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_uOUtWev2rRF1@ep-orange-scene-abto4jjh-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require";

async function patchDatabase() {
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();
    console.log("🔌 Connected to Neon Database...");

    console.log("🛠️  Patching Database for compatibility...");

    // 1. Create the 'password' column if it's missing
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT;`);
    
    // 2. Copy the hash from 'passwordHash' to 'password' so both are identical
    await client.query(`UPDATE "User" SET "password" = "passwordHash" WHERE "password" IS NULL AND "passwordHash" IS NOT NULL;`);

    console.log("✅ PATCH COMPLETE.");
    console.log("   Your database now has both 'password' and 'passwordHash' columns.");
    console.log("   This ensures the backend will work regardless of which version it is using.");

  } catch (err) {
    console.error("\n❌ Error patching database:", err);
  } finally {
    await client.end();
  }
}

patchDatabase();
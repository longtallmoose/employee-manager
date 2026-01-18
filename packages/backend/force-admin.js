const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = "postgresql://neondb_owner:npg_uOUtWev2rRF1@ep-orange-scene-abto4jjh-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require";

async function forceCreate() {
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();
    console.log("🔌 Connected to Neon Database...");

    console.log("👤 Creating Admin User...");
    const email = 'admin@staffpilot.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // FIX: We insert into "passwordHash" because that is what your DB demands.
    const insertQuery = `
      INSERT INTO "User" (id, email, "passwordHash", role, "firstName", "lastName", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING email;
    `;

    const values = [
      'admin_final_' + Date.now(), 
      email,
      hashedPassword,
      'SUPER_ADMIN', 
      'System',
      'Admin'
    ];

    await client.query(insertQuery, values);
    
    console.log("\n🚀 VICTORY! Admin user created.");
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log("📱 You can now log in to the iOS App.\n");

  } catch (err) {
    if (err.code === '23505') {
        console.log("\n⚠️  User already exists! You can just log in.");
    } else {
        console.error("\n❌ Error:", err);
    }
  } finally {
    await client.end();
  }
}

forceCreate();
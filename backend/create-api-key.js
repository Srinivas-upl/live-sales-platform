const crypto = require('crypto');
const { Client } = require('pg');

async function createApiKey() {
  const client = new Client({
    host: 'localhost',
    database: 'live_sales_platform',
    port: 5432,
  });

  try {
    await client.connect();

    // Generate token and salt
    const token = crypto.randomBytes(32).toString('hex');
    const salt = crypto.randomBytes(8).toString('hex');
    
    // Create redacted token (first 7 chars)
    const redacted = token.substring(0, 7);
    
    // Get a user ID (created_by)
    const userResult = await client.query('SELECT id FROM "user" LIMIT 1');
    const userId = userResult.rows[0]?.id || 'usr_01J123456789ABCDEFGHIJKLMN';
    
    // Generate UUID for API key
    const id = `pk_${Date.now()}`;
    
    const query = `
      INSERT INTO api_key (
        id, token, salt, redacted, title, type, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
    `;
    
    const values = [
      id,
      token,
      salt,
      redacted,
      'Live Sales Platform Storefront',
      'publishable',
      userId
    ];
    
    await client.query(query, values);
    
    console.log('API Key created successfully!');
    console.log('Token:', token);
    console.log('Add this header to your requests:');
    console.log('x-publishable-api-key:', token);
    
  } catch (error) {
    console.error('Error creating API key:', error);
  } finally {
    await client.end();
  }
}

createApiKey();

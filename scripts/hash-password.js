const { createHash } = require('crypto');

// Get password from command line argument
const password = process.argv[2];

if (!password) {
  console.error('Please provide a password as an argument');
  process.exit(1);
}

// Hash the password using SHA-256 (same method as in auth.js)
const hash = createHash('sha256').update(password).digest('hex');

console.log('Your password hash is:');
console.log(hash);
console.log('\nUse this hash with the Vercel KV key: site:password'); 
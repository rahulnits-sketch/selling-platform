import crypto from "crypto";

const password = process.argv[2];

if (!password) {
  console.error("Usage: node scripts/hash-password.mjs <password>");
  process.exit(1);
}

console.log(crypto.createHash("sha256").update(password).digest("hex"));

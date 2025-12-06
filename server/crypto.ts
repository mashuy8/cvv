import crypto from "crypto";

const SALT_LENGTH = 32;

// New password hashing with salt (for new passwords)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

// Verify password - supports both old (SHA256) and new (PBKDF2) formats
export function verifyPassword(password: string, storedHash: string): boolean {
  // Check if it's the new format with salt (contains ":")
  if (storedHash.includes(":")) {
    const [salt, hash] = storedHash.split(":");
    if (!salt || !hash) return false;
    const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
    return hash === verifyHash;
  }
  
  // Old format - simple SHA256 hash (no salt)
  const sha256Hash = crypto.createHash("sha256").update(password).digest("hex");
  return sha256Hash === storedHash;
}

export function generateToken(length: number = 64): string {
  return crypto.randomBytes(length).toString("hex");
}

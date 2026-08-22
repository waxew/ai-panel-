import { createCipheriv, createHash, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';

function getKey() {
  const secret = process.env.APP_ENCRYPTION_KEY;
  if (!secret || secret.length < 32) {
    throw new Error('APP_ENCRYPTION_KEY must be at least 32 characters');
  }
  return createHash('sha256').update(secret).digest();
}

export function encryptSecret(plaintext: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    'v1',
    iv.toString('base64url'),
    authTag.toString('base64url'),
    encrypted.toString('base64url'),
  ].join('.');
}

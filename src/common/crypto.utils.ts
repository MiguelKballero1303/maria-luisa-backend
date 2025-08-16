import { createCipheriv, createDecipheriv } from 'crypto';

const algorithm = 'aes-256-cbc';

export function encrypt(data: any, key: string): string {
  const cipher = createCipheriv(algorithm, Buffer.from(key), Buffer.alloc(16, 0));
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decrypt(encrypted: string, key: string): any {
  const decipher = createDecipheriv(algorithm, Buffer.from(key), Buffer.alloc(16, 0));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}
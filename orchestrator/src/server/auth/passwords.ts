import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const SALT_BYTES = 16;
const KEY_BYTES = 64;
const HASH_PREFIX = "scrypt";

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES).toString("base64url");
  const derivedKey = (await scrypt(password, salt, KEY_BYTES)) as Buffer;

  return `${HASH_PREFIX}$${salt}$${derivedKey.toString("base64url")}`;
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  const [prefix, salt, storedHash] = passwordHash.split("$");
  if (prefix !== HASH_PREFIX || !salt || !storedHash) {
    return false;
  }

  const derivedKey = (await scrypt(password, salt, KEY_BYTES)) as Buffer;
  const storedBuffer = Buffer.from(storedHash, "base64url");

  if (storedBuffer.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, storedBuffer);
}

import { count, eq } from "drizzle-orm";
import { db, schema } from "../db/index";

const { users } = schema;

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

function isMissingUsersTableError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes("no such table") &&
    error.message.includes("users")
  );
}

export async function getUserByUsername(username: string): Promise<{
  id: string;
  username: string;
  usernameNormalized: string;
  passwordHash: string;
} | null> {
  try {
    const [row] = await db
      .select({
        id: users.id,
        username: users.username,
        usernameNormalized: users.usernameNormalized,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.usernameNormalized, normalizeUsername(username)));

    return row ?? null;
  } catch (error) {
    if (isMissingUsersTableError(error)) {
      return null;
    }
    throw error;
  }
}

export async function createUser(input: {
  id: string;
  username: string;
  passwordHash: string;
}): Promise<void> {
  const now = new Date().toISOString();

  await db.insert(users).values({
    id: input.id,
    username: input.username.trim(),
    usernameNormalized: normalizeUsername(input.username),
    passwordHash: input.passwordHash,
    createdAt: now,
    updatedAt: now,
  });
}

export async function countUsers(): Promise<number> {
  try {
    const [result] = await db.select({ value: count() }).from(users);
    return result?.value ?? 0;
  } catch (error) {
    if (isMissingUsersTableError(error)) {
      return 0;
    }
    throw error;
  }
}

export async function hasUsers(): Promise<boolean> {
  return (await countUsers()) > 0;
}

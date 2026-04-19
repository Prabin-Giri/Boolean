/**
 * Settings repository - key/value storage for runtime configuration.
 */

import type { settingsRegistry } from "@shared/settings-registry";
import { getUserId } from "@infra/request-context";
import { eq } from "drizzle-orm";
import { db, schema } from "../db/index";

const { settings } = schema;

function getScopedKey(key: SettingKey): string {
  const userId = getUserId();
  return userId ? `user:${userId}:${key}` : key;
}

export type SettingKey = Exclude<
  {
    [K in keyof typeof settingsRegistry]: (typeof settingsRegistry)[K]["kind"] extends "virtual"
      ? never
      : K;
  }[keyof typeof settingsRegistry],
  undefined
>;

export async function getSetting(key: SettingKey): Promise<string | null> {
  const [row] = await db
    .select()
    .from(settings)
    .where(eq(settings.key, getScopedKey(key)));
  return row?.value ?? null;
}

export async function getAllSettings(): Promise<
  Partial<Record<SettingKey, string>>
> {
  const prefix = (() => {
    const userId = getUserId();
    return userId ? `user:${userId}:` : "";
  })();
  const rows = await db.select().from(settings);
  return rows.reduce(
    (acc, row) => {
      if (prefix) {
        if (!row.key.startsWith(prefix)) return acc;
        acc[row.key.slice(prefix.length) as SettingKey] = row.value;
        return acc;
      }
      if (row.key.startsWith("user:")) return acc;
      acc[row.key as SettingKey] = row.value;
      return acc;
    },
    {} as Partial<Record<SettingKey, string>>,
  );
}

export async function setSetting(
  key: SettingKey,
  value: string | null,
): Promise<void> {
  const now = new Date().toISOString();
  const scopedKey = getScopedKey(key);

  if (value === null) {
    await db.delete(settings).where(eq(settings.key, scopedKey));
    return;
  }

  const [existing] = await db
    .select({ key: settings.key })
    .from(settings)
    .where(eq(settings.key, scopedKey));

  if (existing) {
    await db
      .update(settings)
      .set({ value, updatedAt: now })
      .where(eq(settings.key, scopedKey));
    return;
  }

  await db.insert(settings).values({
    key: scopedKey,
    value,
    createdAt: now,
    updatedAt: now,
  });
}

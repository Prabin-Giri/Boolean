import { randomUUID } from "node:crypto";
import {
  badRequest,
  conflict,
  serviceUnavailable,
  unauthorized,
} from "@infra/errors";
import { asyncRoute, fail, ok } from "@infra/http";
import { blacklistToken, signToken, verifyToken } from "@server/auth/jwt";
import { hashPassword, verifyPassword } from "@server/auth/passwords";
import * as usersRepo from "@server/repositories/users";
import type { Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().trim().min(1).max(200),
  password: z.string().min(1).max(2000),
});

const registerSchema = z.object({
  username: z.string().trim().min(3).max(200),
  password: z.string().min(8).max(2000),
});

export const authRouter = Router();

function getLegacyAuthConfig(): {
  user: string;
  password: string;
  enabled: boolean;
} {
  const user = process.env.BASIC_AUTH_USER || "";
  const password = process.env.BASIC_AUTH_PASSWORD || "";

  return {
    user,
    password,
    enabled: Boolean(user && password),
  };
}

function usernamesMatch(left: string, right: string): boolean {
  return (
    usersRepo.normalizeUsername(left) === usersRepo.normalizeUsername(right)
  );
}

authRouter.post(
  "/login",
  asyncRoute(async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, badRequest("Invalid request body", parsed.error.flatten()));
      return;
    }

    const { username, password } = parsed.data;
    const registeredUser = await usersRepo.getUserByUsername(username);

    let tokenSubject: string | null = null;
    if (registeredUser) {
      const passwordMatches = await verifyPassword(
        password,
        registeredUser.passwordHash,
      );
      if (!passwordMatches) {
        fail(res, unauthorized("Invalid credentials"));
        return;
      }

      tokenSubject = registeredUser.id;
    } else {
      const legacyAuth = getLegacyAuthConfig();
      if (legacyAuth.enabled) {
        if (
          !usernamesMatch(username, legacyAuth.user) ||
          password !== legacyAuth.password
        ) {
          fail(res, unauthorized("Invalid credentials"));
          return;
        }

        tokenSubject = legacyAuth.user;
      } else if (!(await usersRepo.hasUsers())) {
        fail(res, badRequest("Authentication is not enabled"));
        return;
      } else {
        fail(res, unauthorized("Invalid credentials"));
        return;
      }
    }

    let token: string;
    let expiresIn: number;
    try {
      ({ token, expiresIn } = await signToken(tokenSubject));
    } catch (error) {
      fail(
        res,
        serviceUnavailable(
          error instanceof Error
            ? error.message
            : "Authentication is not fully configured",
        ),
      );
      return;
    }

    ok(res, { token, expiresIn });
  }),
);

authRouter.post(
  "/register",
  asyncRoute(async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, badRequest("Invalid request body", parsed.error.flatten()));
      return;
    }

    const { username, password } = parsed.data;
    const existingUser = await usersRepo.getUserByUsername(username);
    if (existingUser) {
      fail(res, conflict("An account with that username already exists"));
      return;
    }

    const legacyAuth = getLegacyAuthConfig();
    if (legacyAuth.enabled && usernamesMatch(username, legacyAuth.user)) {
      fail(res, conflict("That username is already reserved"));
      return;
    }

    const userId = randomUUID();
    const passwordHash = await hashPassword(password);
    await usersRepo.createUser({
      id: userId,
      username,
      passwordHash,
    });

    let token: string;
    let expiresIn: number;
    try {
      ({ token, expiresIn } = await signToken(userId));
    } catch (error) {
      fail(
        res,
        serviceUnavailable(
          error instanceof Error
            ? error.message
            : "Authentication is not fully configured",
        ),
      );
      return;
    }

    ok(res, {
      token,
      expiresIn,
      user: {
        id: userId,
        username: username.trim(),
      },
    });
  }),
);

authRouter.post(
  "/logout",
  asyncRoute(async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization || "";
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice("Bearer ".length).trim();
      try {
        const { jti } = await verifyToken(token);
        await blacklistToken(jti);
      } catch {
        // Token already invalid — logout is idempotent.
      }
    }
    ok(res, { message: "Logged out" });
  }),
);

import { passwordError } from "./authPolicy";

export type LoginCredentials = { id: number; role: string; password_hash: string };
export type LoginOutcome =
  | { status: "throttled" }
  | { status: "invalid" }
  | { status: "authenticated"; id: number; role: string };

export async function authenticate(
  email: string,
  password: string,
  deps: {
    allowAttempt: (email: string) => Promise<boolean>;
    findUser: (email: string) => Promise<LoginCredentials | undefined>;
    verifyPassword: (password: string, hash: string) => Promise<boolean>;
    createSession: (userId: number) => Promise<void>;
  },
): Promise<LoginOutcome> {
  if (!(await deps.allowAttempt(email))) return { status: "throttled" };
  const user = await deps.findUser(email);
  if (!user || !(await deps.verifyPassword(password, user.password_hash))) return { status: "invalid" };
  await deps.createSession(user.id);
  return { status: "authenticated", id: user.id, role: user.role };
}

export type ResetOutcome = { status: "invalid" | "short" | "mismatch" | "throttled" } | { status: "updated" };

export async function resetPasswordFlow(
  token: string,
  password: string,
  confirmation: string,
  deps: {
    allowAttempt: (token: string) => Promise<boolean>;
    hasValidToken: (token: string) => Promise<boolean>;
    hashPassword: (password: string) => Promise<string>;
    consumeAndUpdate: (token: string, passwordHash: string) => Promise<boolean>;
  },
): Promise<ResetOutcome> {
  const validation = passwordError(password, confirmation);
  if (validation) return { status: validation };
  if (!/^[a-f0-9]{48}$/.test(token)) return { status: "invalid" };
  if (!(await deps.allowAttempt(token))) return { status: "throttled" };
  if (!(await deps.hasValidToken(token))) return { status: "invalid" };
  const passwordHash = await deps.hashPassword(password);
  if (!(await deps.consumeAndUpdate(token, passwordHash))) return { status: "invalid" };
  return { status: "updated" };
}

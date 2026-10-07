import assert from "node:assert/strict";
import test from "node:test";
import { isCourseOwner, normalizeEmail, passwordError } from "../lib/authPolicy";
import { authenticate, resetPasswordFlow } from "../lib/authFlows";

test("email lookup normalization is consistent", () => {
  assert.equal(normalizeEmail("  Student@Example.edu "), "student@example.edu");
});

test("password policy distinguishes short, mismatched, and accepted passwords", () => {
  assert.equal(passwordError("short", "short"), "short");
  assert.equal(passwordError("long-enough", "different"), "mismatch");
  assert.equal(passwordError("long-enough", "long-enough"), null);
});

test("only the owning lecturer can pass the course ownership check", () => {
  assert.equal(isCourseOwner(12, 12), true);
  assert.equal(isCourseOwner(12, 13), false);
  assert.equal(isCourseOwner(12, null), false);
  assert.equal(isCourseOwner(12, undefined), false);
});

test("login authenticates a valid user and creates a session", async () => {
  const sessions: number[] = [];
  const result = await authenticate("student@example.edu", "correct-password", {
    allowAttempt: async () => true,
    findUser: async () => ({ id: 7, role: "student", password_hash: "hash" }),
    verifyPassword: async (password, hash) => password === "correct-password" && hash === "hash",
    createSession: async (id) => { sessions.push(id); },
  });
  assert.deepEqual(result, { status: "authenticated", id: 7, role: "student" });
  assert.deepEqual(sessions, [7]);
});

test("login rejects invalid credentials without creating a session", async () => {
  let sessions = 0;
  const result = await authenticate("student@example.edu", "wrong-password", {
    allowAttempt: async () => true,
    findUser: async () => ({ id: 7, role: "student", password_hash: "hash" }),
    verifyPassword: async () => false,
    createSession: async () => { sessions += 1; },
  });
  assert.deepEqual(result, { status: "invalid" });
  assert.equal(sessions, 0);
});

test("login throttling short-circuits credential lookup", async () => {
  let lookups = 0;
  const result = await authenticate("student@example.edu", "password", {
    allowAttempt: async () => false,
    findUser: async () => { lookups += 1; return undefined; },
    verifyPassword: async () => false,
    createSession: async () => {},
  });
  assert.deepEqual(result, { status: "throttled" });
  assert.equal(lookups, 0);
});

test("password reset rejects malformed and expired tokens before hashing", async () => {
  let hashes = 0;
  const deps = {
    allowAttempt: async () => true,
    hasValidToken: async () => false,
    hashPassword: async () => { hashes += 1; return "hash"; },
    consumeAndUpdate: async () => true,
  };
  assert.deepEqual(await resetPasswordFlow("bad-token", "new-password", "new-password", deps), { status: "invalid" });
  assert.deepEqual(await resetPasswordFlow("a".repeat(48), "new-password", "new-password", deps), { status: "invalid" });
  assert.equal(hashes, 0);
});

test("password reset only updates the account after validating and consuming the token", async () => {
  const order: string[] = [];
  const result = await resetPasswordFlow("a".repeat(48), "new-password", "new-password", {
    allowAttempt: async () => { order.push("throttle"); return true; },
    hasValidToken: async () => { order.push("validate"); return true; },
    hashPassword: async () => { order.push("hash"); return "new-hash"; },
    consumeAndUpdate: async (_token, hash) => { order.push(`consume:${hash}`); return true; },
  });
  assert.deepEqual(result, { status: "updated" });
  assert.deepEqual(order, ["throttle", "validate", "hash", "consume:new-hash"]);
});

test("password reset throttling prevents token lookup and hashing", async () => {
  let checks = 0;
  const result = await resetPasswordFlow("a".repeat(48), "new-password", "new-password", {
    allowAttempt: async () => false,
    hasValidToken: async () => { checks += 1; return true; },
    hashPassword: async () => { checks += 1; return "hash"; },
    consumeAndUpdate: async () => true,
  });
  assert.deepEqual(result, { status: "throttled" });
  assert.equal(checks, 0);
});

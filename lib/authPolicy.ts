export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export function passwordError(password: string, confirmation: string): "short" | "mismatch" | null {
  if (password.length < 8) return "short";
  if (password !== confirmation) return "mismatch";
  return null;
}

export function isCourseOwner(actorId: number, ownerId: number | null | undefined): boolean {
  return ownerId != null && actorId === ownerId;
}

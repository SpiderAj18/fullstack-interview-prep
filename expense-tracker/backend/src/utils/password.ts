import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

/** Used when no user exists so password checks take similar time. */
export const DUMMY_PASSWORD_HASH = bcrypt.hashSync("__timing_safe_dummy__", BCRYPT_ROUNDS);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function comparePassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

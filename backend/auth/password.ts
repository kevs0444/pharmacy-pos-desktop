import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const KEY_LENGTH = 64

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':')

  if (!salt || !key) {
    return false
  }

  const derived = scryptSync(password, salt, KEY_LENGTH)
  const stored = Buffer.from(key, 'hex')

  return stored.length === derived.length && timingSafeEqual(stored, derived)
}

// Password validation criteria
// This file can be used both on the frontend and in validation logic

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

export type PasswordValidationResult = {
  isValid: boolean
  errors: string[]
  checks: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumber: boolean
    hasSpecialChar: boolean
  }
}

export function validatePassword(password: string): PasswordValidationResult {
  const checks = {
    minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: new RegExp(`[${escapeRegex(PASSWORD_REQUIREMENTS.specialChars)}]`).test(
      password,
    ),
  }

  const errors: string[] = []

  if (!checks.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`)
  }
  if (!checks.hasUppercase) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!checks.hasLowercase) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!checks.hasNumber) {
    errors.push('Password must contain at least one number')
  }
  if (!checks.hasSpecialChar) {
    errors.push(
      `Password must contain at least one special character (${PASSWORD_REQUIREMENTS.specialChars})`,
    )
  }

  return {
    isValid: errors.length === 0,
    errors,
    checks,
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

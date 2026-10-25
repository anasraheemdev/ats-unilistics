import { describe, it, expect } from 'vitest';
import {
  RequestAccessFormSchema,
  SignInFormSchema,
} from '@/types/validation';

describe('Validation Schemas', () => {
  it('accepts valid Request Access data for Germany', () => {
    const validData = {
      fullName: 'Muhammad Bilal',
      email: 'bilal@example.com',
      phone: '+92 300 1234567',
      city: 'Islamabad',
      highestEducation: '4-Year BS Computer Science (CGPA 3.32)',
      targetCountry: 'germany',
      targetDegree: 'master',
      requestType: 'managed_support',
      statementOfIntent: 'Seeking admission into German public university Master in Informatics.',
    };

    const result = RequestAccessFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects deferred / unsupported country (e.g. hungary)', () => {
    const invalidData = {
      fullName: 'Muhammad Bilal',
      email: 'bilal@example.com',
      phone: '+92 300 1234567',
      city: 'Islamabad',
      highestEducation: 'FSC Pre-Engineering',
      targetCountry: 'hungary', // Invalid / deferred country
      targetDegree: 'bachelor',
      requestType: 'explorer_catalogue',
    };

    const result = RequestAccessFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('validates SignIn credentials schema', () => {
    const valid = { email: 'student@example.com', password: 'password123' };
    expect(SignInFormSchema.safeParse(valid).success).toBe(true);

    const invalidEmail = { email: 'invalid-email', password: 'password123' };
    expect(SignInFormSchema.safeParse(invalidEmail).success).toBe(false);

    const tooShortPassword = { email: 'student@example.com', password: '123' };
    expect(SignInFormSchema.safeParse(tooShortPassword).success).toBe(false);
  });
});

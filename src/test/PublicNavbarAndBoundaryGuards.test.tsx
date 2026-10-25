import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import {
  ROUTES,
  validateInternalReturnUrl,
  isRouteAllowedForRole,
  getSafePostLoginRedirect,
} from '@/config/routes';
import { api } from '@/lib/api';

describe('Public Navbar & Access-Control Boundary Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Signed-Out Public Navbar Specification', () => {
    it('renders ONLY the canonical 5 public navigation items', () => {
      render(
        <MemoryRouter>
          <PublicNavbar currentRole="visitor" onRoleChange={() => {}} />
        </MemoryRouter>
      );

      // Verify the allowed items are present
      expect(screen.getByRole('link', { name: /Unilistics Home/i })).toBeDefined();
      expect(screen.getByRole('link', { name: /^Explore Universities$/i })).toBeDefined();
      expect(screen.getByRole('link', { name: /^Contact$/i })).toBeDefined();
      expect(screen.getByRole('link', { name: /^Sign in$/i })).toBeDefined();
      expect(screen.getByRole('link', { name: /^Sign up$/i })).toBeDefined();

      // Verify prohibited private items are strictly NOT rendered
      expect(screen.queryByText(/Student Portal/i)).toBeNull();
      expect(screen.queryByText(/Staff Workspace/i)).toBeNull();
      expect(screen.queryByText(/My Applications/i)).toBeNull();
      expect(screen.queryByText(/Documents/i)).toBeNull();
      expect(screen.queryByText(/Tasks & Deadlines/i)).toBeNull();
      expect(screen.queryByText(/Messages/i)).toBeNull();
      expect(screen.queryByText(/Switch Role/i)).toBeNull();
      expect(screen.queryByText(/Notification/i)).toBeNull();
      expect(screen.queryByPlaceholderText(/Search/i)).toBeNull();
    });

    it('does not contain public role switchers or demo selectors', () => {
      render(
        <MemoryRouter>
          <PublicNavbar currentRole="visitor" onRoleChange={() => {}} />
        </MemoryRouter>
      );

      expect(screen.queryByText(/managed_student/i)).toBeNull();
      expect(screen.queryByText(/counsellor/i)).toBeNull();
      expect(screen.queryByText(/super_admin/i)).toBeNull();
    });
  });

  describe('2. Malformed URL Sanitization & Return Path Validation', () => {
    it('rejects external protocol URLs and defaults to safe fallback', () => {
      expect(validateInternalReturnUrl('https://evil.com/phish', ROUTES.HOME)).toBe(ROUTES.HOME);
      expect(validateInternalReturnUrl('http://evil.com', ROUTES.HOME)).toBe(ROUTES.HOME);
    });

    it('rejects protocol-relative URLs (//)', () => {
      expect(validateInternalReturnUrl('//evil.com/exploit', ROUTES.HOME)).toBe(ROUTES.HOME);
      expect(validateInternalReturnUrl('///evil.com', ROUTES.HOME)).toBe(ROUTES.HOME);
    });

    it('rejects backslash scheme evasions (/\\)', () => {
      expect(validateInternalReturnUrl('/\\evil.com', ROUTES.HOME)).toBe(ROUTES.HOME);
    });

    it('rejects javascript and data URI schemes', () => {
      expect(validateInternalReturnUrl('javascript:alert(1)', ROUTES.HOME)).toBe(ROUTES.HOME);
      expect(validateInternalReturnUrl('data:text/html,<script>alert(1)</script>', ROUTES.HOME)).toBe(ROUTES.HOME);
    });

    it('rejects the reported malformed concatenated staff URL', () => {
      const malformedUrl = 'http://localhost:5173/student/http://localhost:5173/staff';
      expect(validateInternalReturnUrl(malformedUrl, ROUTES.HOME)).toBe(ROUTES.HOME);

      const relativeMalformed = '/student/http://localhost:5173/staff';
      expect(validateInternalReturnUrl(relativeMalformed, ROUTES.HOME)).toBe(ROUTES.HOME);
    });

    it('preserves valid internal paths with query parameters', () => {
      expect(validateInternalReturnUrl('/universities', ROUTES.HOME)).toBe('/universities');
      expect(validateInternalReturnUrl('/contact?topic=visa', ROUTES.HOME)).toBe('/contact?topic=visa');
      expect(validateInternalReturnUrl('/student/tasks', ROUTES.HOME)).toBe('/student/tasks');
    });
  });

  describe('3. Role Authorization Matrix & Post-Login Redirection', () => {
    it('prohibits explorers from accessing student, staff, and admin routes', () => {
      expect(isRouteAllowedForRole('/student', 'explorer')).toBe(false);
      expect(isRouteAllowedForRole('/student/tasks', 'explorer')).toBe(false);
      expect(isRouteAllowedForRole('/staff', 'explorer')).toBe(false);
      expect(isRouteAllowedForRole('/admin', 'explorer')).toBe(false);

      expect(isRouteAllowedForRole('/universities', 'explorer')).toBe(true);
      expect(isRouteAllowedForRole('/saved', 'explorer')).toBe(true);
      expect(isRouteAllowedForRole('/help', 'explorer')).toBe(true);
    });

    it('prohibits managed students from accessing staff and admin routes', () => {
      expect(isRouteAllowedForRole('/student/tasks', 'managed_student')).toBe(true);
      expect(isRouteAllowedForRole('/staff', 'managed_student')).toBe(false);
      expect(isRouteAllowedForRole('/admin', 'managed_student')).toBe(false);
    });

    it('prevents an explorer who requested /student/tasks from being sent there after login', () => {
      const redirected = getSafePostLoginRedirect('/student/tasks', 'explorer');
      expect(redirected).toBe(ROUTES.UNIVERSITIES);
      expect(redirected).not.toBe('/student/tasks');
    });

    it('permits an approved student who requested /student/tasks to be directed there', () => {
      const redirected = getSafePostLoginRedirect('/student/tasks', 'managed_student');
      expect(redirected).toBe('/student/tasks');
    });

    it('rejects external returnUrl during post-login and sends to role landing', () => {
      const redirected = getSafePostLoginRedirect('https://attacker.com/steal', 'explorer');
      expect(redirected).toBe(ROUTES.UNIVERSITIES);
    });
  });

  describe('4. Unauthenticated Contact Submission & Abuse Controls', () => {
    it('submits genuine public inquiries without requiring authentication', async () => {
      const result = await api.support.submitPublicContact({
        fullName: 'Muhammad Ahmad',
        email: 'ahmad.test@example.pk',
        targetCountry: 'germany',
        subject: 'Visa Appointment Inquiry',
        message: 'Requesting clarification on Germany APS verification timelines for bachelor degree holders.',
      });

      expect(result.success).toBe(true);
      expect(result.inquiryId).toBeDefined();
      expect(result.inquiryId).toMatch(/^inq-/);
    });

    it('rejects invalid email formats server-side', async () => {
      await expect(
        api.support.submitPublicContact({
          fullName: 'Test User',
          email: 'not-an-email',
          targetCountry: 'germany',
          subject: 'General Question',
          message: 'Valid length test message here.',
        })
      ).rejects.toThrow(/valid email address/i);
    });

    it('rejects messages that are too short', async () => {
      await expect(
        api.support.submitPublicContact({
          fullName: 'Test User',
          email: 'test@example.com',
          targetCountry: 'germany',
          subject: 'General Question',
          message: 'hi',
        })
      ).rejects.toThrow(/at least 10 characters/i);
    });

    it('enforces rate limiting against abuse from the same email', async () => {
      const payload = {
        fullName: 'Rate Limit Test',
        email: 'spammer@example.com',
        targetCountry: 'france',
        subject: 'Admissions Question',
        message: 'Checking Campus France Etudes en France procedure requirements.',
      };

      // Submit 5 successful inquiries
      for (let i = 0; i < 5; i++) {
        await api.support.submitPublicContact(payload);
      }

      // The 6th submission within 10 minutes must be rejected
      await expect(api.support.submitPublicContact(payload)).rejects.toThrow(
        /Rate limit exceeded/i
      );
    });
  });
});

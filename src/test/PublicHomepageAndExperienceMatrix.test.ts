import { describe, it, expect, beforeEach } from 'vitest';
import { api } from '@/lib/api';

describe('Public Homepage, Experience Matrix & Entitlement Journeys', () => {
  beforeEach(async () => {
    localStorage.clear();
    await api.auth.signOut();
  });

  describe('1. Signed Out (Visitor) Experience', () => {
    it('defaults to visitor role upon fresh launch with no private sidebar', async () => {
      const user = await api.auth.getCurrentUser();
      expect(user.role).toBe('visitor');
      expect(user.fullName).toBe('Visitor');
      expect(user.entitlements).toEqual([]);
    });

    it('enforces visitor preview cap of at most 50 universities across queries', async () => {
      const result = await api.universities.browse({ page: 1, pageSize: 50 });
      expect(result.items.length).toBeLessThanOrEqual(50);
      expect(result.is_preview_restricted).toBe(true);
    });

    it('prevents anonymous URL parameter tampering from bypassing preview allowlist', async () => {
      // Anonymous request passing filters should remain restricted to preview allowlist
      const result = await api.universities.browse({
        country: 'germany',
        institutionType: 'private',
        page: 1,
        pageSize: 50,
      });
      expect(result.is_preview_restricted).toBe(true);
      expect(result.items.length).toBeLessThanOrEqual(50);
    });

    it('gates scholarships catalogue for visitors with clear CTA message', async () => {
      const result = await api.scholarships.browse();
      expect(result.is_gated).toBe(true);
      expect(result.items).toEqual([]);
      expect(result.cta_message).toBeDefined();
    });
  });

  describe('2. Signed-in Verified Explorer Experience (Self-Service)', () => {
    it('creates an explorer account via self-service signup without requiring admin approval', async () => {
      const signupRes = await api.auth.signUp({
        fullName: 'Ayesha Khan',
        email: 'ayesha.explorer@test.local',
        password: 'SecurePassword123!',
        targetCountry: 'germany',
        consentPrivacy: true,
      });

      expect(signupRes.success).toBe(true);

      const currentUser = await api.auth.getCurrentUser();
      expect(currentUser.role).toBe('explorer');
      expect(currentUser.entitlements).toContain('explorer_catalogue');
      expect(currentUser.entitlements).not.toContain('managed_application_case');
    });

    it('rejects self-service signup if privacy consent is missing', async () => {
      await expect(
        api.auth.signUp({
          fullName: 'Test Student',
          email: 'student@test.local',
          password: 'Password123!',
          targetCountry: 'germany',
          consentPrivacy: false,
        })
      ).rejects.toThrow('Privacy Policy');
    });

    it('allows verified explorers full catalogue browsing and bookmarks', async () => {
      await api.auth.switchRole('explorer');

      const browseRes = await api.universities.browse();
      expect(browseRes.is_preview_restricted).toBe(false);

      // Bookmark functionality
      const toggleRes = await api.bookmarks.toggle('test-uni-1');
      expect(toggleRes.is_bookmarked).toBe(true);

      const saved = await api.bookmarks.getBookmarkedProgramIds();
      expect(saved).toContain('test-uni-1');
    });
  });

  describe('3. Explorer with Guidance Request Pending Review', () => {
    it('submits a guidance request without interrupting explorer catalogue access', async () => {
      await api.auth.switchRole('explorer');

      const reqRes = await api.requests.submitAccessRequest({
        fullName: 'Bilal Ahmed',
        email: 'bilal.explorer@test.local',
        countryInterests: ['germany'],
        requestedService: 'managed_application_case',
        consentPrivacy: true,
        isUpgrade: true,
        studentMessage: 'Applying for MSc Computer Science Winter intake.',
      });

      expect(reqRes.success).toBe(true);
      expect(reqRes.status).toBe('pending_review');

      // Check active guidance request query
      const activeReq = await api.requests.getRequestStatus(reqRes.requestId);
      expect(activeReq).not.toBeNull();
      expect(activeReq?.status).toBe('pending_review');

      // Explorer catalogue access remains intact
      const user = await api.auth.getCurrentUser();
      expect(user.role).toBe('explorer');
    });

    it('prevents unvetted pending explorers from accessing managed case room tasks', async () => {
      await api.auth.switchRole('explorer');
      const user = await api.auth.getCurrentUser();
      expect(user.entitlements).not.toContain('managed_application_case');
    });
  });

  describe('4. Administrative Approval & Seamless Account Upgrade', () => {
    it('upgrades the same account to managed_student upon approval without requiring a new signup', async () => {
      // 1. Explorer creates account
      await api.auth.signUp({
        fullName: 'Hamza Tariq',
        email: 'hamza.explorer@test.local',
        consentPrivacy: true,
      });

      // 2. Submits guidance request
      const reqRes = await api.requests.submitAccessRequest({
        fullName: 'Hamza Tariq',
        email: 'hamza.explorer@test.local',
        countryInterests: ['france'],
        requestedService: 'managed_application_case',
        consentPrivacy: true,
        isUpgrade: true,
      });

      // 3. Admin approves request
      const approvalRes = await api.requests.adminApproveRequest(reqRes.requestId, 'managed_application_case');
      expect(approvalRes.success).toBe(true);

      // 4. On next login or session evaluation, account role is upgraded
      const upgradedUser = await api.auth.signIn('hamza.explorer@test.local', 'Password123!');
      expect(upgradedUser.role).toBe('managed_student');
      expect(upgradedUser.entitlements).toContain('managed_application_case');
    });
  });

  describe('5. Clean Sign Out & State Isolation', () => {
    it('purges session and cached data on sign out and resets to visitor', async () => {
      await api.auth.switchRole('managed_student');
      let user = await api.auth.getCurrentUser();
      expect(user.role).toBe('managed_student');

      await api.auth.signOut();
      user = await api.auth.getCurrentUser();
      expect(user.role).toBe('visitor');
    });
  });
});

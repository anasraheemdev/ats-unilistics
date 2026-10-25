import { describe, it, expect, beforeEach } from 'vitest';
import { api } from '@/lib/api';

describe('Draft Storage Security & Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists and restores form text drafts without error', () => {
    const textDraft = {
      fullName: 'Muhammad Bilal',
      city: 'Islamabad',
      targetCountry: 'germany',
      targetDegree: 'master',
    };

    api.drafts.save('test_draft', textDraft);
    const restored = api.drafts.get<typeof textDraft>('test_draft');

    expect(restored).not.toBeNull();
    expect(restored?.fullName).toBe('Muhammad Bilal');
    expect(restored?.city).toBe('Islamabad');
  });

  it('clears draft when requested', () => {
    api.drafts.save('test_draft', { city: 'Lahore' });
    expect(api.drafts.get('test_draft')).not.toBeNull();

    api.drafts.clear('test_draft');
    expect(api.drafts.get('test_draft')).toBeNull();
  });

  it('does not store function or symbol objects', () => {
    const complexData = {
      city: 'Karachi',
      customFunc: () => 'sensitive',
    };

    api.drafts.save('test_func_strip', complexData as never);
    const retrieved = api.drafts.get<Record<string, unknown>>('test_func_strip');
    expect(retrieved?.customFunc).toBeUndefined();
    expect(retrieved?.city).toBe('Karachi');
  });

  it('strictly rejects sensitive keys such as passport, cnic, bank, and financial details', () => {
    const studentFormData = {
      fullName: 'Fatima Noor',
      city: 'Rawalpindi',
      targetCountry: 'germany',
      passportNumber: 'AB1234567',
      cnic: '37405-1234567-1',
      bankBalance: '15000 EUR',
      solvencyCertificate: 'Uploaded file binary content',
      ibanNumber: 'PK36SCBL0000001123456701',
      wireTransferDetails: 'SWIFT wire receipt',
    };

    api.drafts.save('student_onboarding_draft', studentFormData);

    const storedRaw = localStorage.getItem('unilistics:draft:student_onboarding_draft');
    expect(storedRaw).not.toBeNull();

    // Verify stored JSON does NOT contain any sensitive keys or values
    expect(storedRaw).not.toContain('passportNumber');
    expect(storedRaw).not.toContain('AB1234567');
    expect(storedRaw).not.toContain('cnic');
    expect(storedRaw).not.toContain('37405-1234567-1');
    expect(storedRaw).not.toContain('bankBalance');
    expect(storedRaw).not.toContain('solvencyCertificate');
    expect(storedRaw).not.toContain('ibanNumber');
    expect(storedRaw).not.toContain('wireTransferDetails');

    // Safe fields should be retained
    const restored = api.drafts.get<typeof studentFormData>('student_onboarding_draft');
    expect(restored?.fullName).toBe('Fatima Noor');
    expect(restored?.city).toBe('Rawalpindi');
    expect(restored?.targetCountry).toBe('germany');
    expect((restored as Record<string, unknown>).passportNumber).toBeUndefined();
    expect((restored as Record<string, unknown>).cnic).toBeUndefined();
  });

  it('rejects data URLs and base64 document attachments in draft values', () => {
    const documentUploadDraft = {
      documentCategory: 'academic_transcript',
      notes: 'Final transcript attested by HEC',
      fileData: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr...',
    };

    api.drafts.save('doc_upload_draft', documentUploadDraft);

    const storedRaw = localStorage.getItem('unilistics:draft:doc_upload_draft');
    expect(storedRaw).not.toContain('base64');
    expect(storedRaw).not.toContain('JVBERi0xLjQK');

    const restored = api.drafts.get<typeof documentUploadDraft>('doc_upload_draft');
    expect(restored?.documentCategory).toBe('academic_transcript');
    expect(restored?.notes).toBe('Final transcript attested by HEC');
    expect((restored as Record<string, unknown>).fileData).toBeUndefined();
  });

  it('clears all draft entries across forms on drafts.clearAll()', () => {
    api.drafts.save('draft_1', { step: 1, field: 'value1' });
    api.drafts.save('draft_2', { step: 2, field: 'value2' });
    localStorage.setItem('other_app_key', 'persisted');

    expect(api.drafts.get('draft_1')).not.toBeNull();
    expect(api.drafts.get('draft_2')).not.toBeNull();

    api.drafts.clearAll();

    expect(api.drafts.get('draft_1')).toBeNull();
    expect(api.drafts.get('draft_2')).toBeNull();
    // Non-draft keys should not be inadvertently wiped
    expect(localStorage.getItem('other_app_key')).toBe('persisted');
  });

  it('automatically purges drafts and resets sensitive state on api.auth.signOut()', async () => {
    api.drafts.save('sensitive_session_draft', { intendedIntake: 'winter_2026' });
    expect(api.drafts.get('sensitive_session_draft')).not.toBeNull();

    await api.auth.signOut();

    expect(api.drafts.get('sensitive_session_draft')).toBeNull();
  });
});



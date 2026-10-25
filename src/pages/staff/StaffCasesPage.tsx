import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, formatUtcInTimezone } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import {
  StudentCase,
  Application,
  ExternalApplicationStatus,
  DossierReviewStatus,
  DecisionOutcomeType,
  CaseMessage,
  CaseDocument,
} from '@/types';
import {
  UserCheck,
  PlusCircle,
  Edit3,
  History,
  Lock,
  Compass,
  MessageSquare,
  Send,
  Paperclip,
  FileText,
} from 'lucide-react';

export const StaffCasesPage: React.FC = () => {
  const [isCreateAppOpen, setIsCreateAppOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [reassigningCase, setReassigningCase] = useState<StudentCase | null>(null);
  const [viewHistoryApp, setViewHistoryApp] = useState<Application | null>(null);

  const {
    data: cases,
    isLoading: casesLoading,
    error: casesError,
    refetch: refetchCases,
  } = useQuery({
    queryKey: ['staff-assigned-cases'],
    queryFn: () => api.staff.getCases(),
  });

  const {
    data: applications,
    isLoading: appsLoading,
    refetch: refetchApps,
  } = useQuery({
    queryKey: ['staff-case-applications'],
    queryFn: () => api.student.getApplications(),
  });

  const {
    data: cataloguePrograms,
  } = useQuery({
    queryKey: ['catalogue-programs-for-app'],
    queryFn: () => api.programs.browse({ pageSize: 50 }),
  });

  if (casesLoading || appsLoading) {
    return <LoadingState message="Loading assigned student cases & dossiers..." />;
  }

  if (casesError || !cases) {
    return <ErrorState message="Could not load staff cases." onRetry={() => refetchCases()} />;
  }

  const activeCase = cases[0];
  const caseApps = applications || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Student Cases & Application Manager</h1>
          <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.875rem' }}>
            Restricted by Postgres RLS: Educational counsellors access strictly assigned cases. Administrators oversee all student pipelines.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateAppOpen(true)}
            leftIcon={<PlusCircle size={15} />}
          >
            Create / Snapshot Application
          </Button>
        </div>
      </div>

      {/* Security Advisory */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          padding: '0.875rem 1rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          fontSize: '0.8125rem',
        }}
      >
        <Lock size={18} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Optimistic Concurrency & Audit Guarantee:</strong> Simultaneous counsellor edits will trigger a conflict error
          rather than silently overwriting. All submissions, status transitions, and authorised corrections require evidence and non-empty justifications.
        </div>
      </div>

      {/* Case Dossier Summary Card or Honest Empty State */}
      {!activeCase ? (
        <div style={{ textAlign: 'center', padding: '3rem 1.5rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-card, 16px)', border: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-charcoal)', marginBottom: '0.5rem' }}>
            No students added yet
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            There are currently no active student cases in the system. Use the admin invite action or review incoming access requests to onboard students.
          </p>
        </div>
      ) : (
        <Card padding="lg" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Badge variant="primary" size="sm">{activeCase.targetCountry.toUpperCase()}</Badge>
                <Badge variant="success" size="sm">{activeCase.currentStage.toUpperCase()}</Badge>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-family-mono)', color: 'var(--color-foreground-muted)' }}>
                  ID: {activeCase.id}
                </span>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {activeCase.studentName} — {activeCase.targetDegree.toUpperCase()} ({activeCase.targetIntakeSeason.toUpperCase()} {activeCase.targetIntakeYear})
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
                Assigned Counsellor: <strong>{activeCase.assignedCounsellorName || 'A counsellor has not been assigned yet.'}</strong> {activeCase.assignedCounsellorEmail ? `(${activeCase.assignedCounsellorEmail})` : ''}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReassigningCase(activeCase)}
                leftIcon={<UserCheck size={14} />}
              >
                Reassign Counsellor
              </Button>
            </div>
          </div>

          {/* Student Study Preferences Snapshot */}
          {activeCase.studyPreferences && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-hover)',
                border: '1px solid var(--color-border)',
                marginBottom: '1rem',
                fontSize: '0.8125rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                <Compass size={14} style={{ color: 'var(--color-primary)' }} />
                <span>Student Onboarding & Study Preferences</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--color-foreground-muted)', display: 'block' }}>Prior Academic Degree:</span>
                  <strong>{activeCase.studyPreferences.highestQualification || 'Not Specified'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-foreground-muted)', display: 'block' }}>CGPA / Score:</span>
                  <strong>{activeCase.studyPreferences.gpaOrPercentage || 'N/A'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-foreground-muted)', display: 'block' }}>English Proficiency:</span>
                  <strong>{activeCase.studyPreferences.englishTestScore || activeCase.studyPreferences.englishProficiency?.toUpperCase()}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-foreground-muted)', display: 'block' }}>Budget Solvency:</span>
                  <strong>€{activeCase.studyPreferences.budgetPerYearEur?.toLocaleString()}/yr ({activeCase.studyPreferences.fundingSource?.replace('_', ' ')})</strong>
                </div>
              </div>
            </div>
          )}

          {/* Applications Table */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                University Applications ({caseApps.length})
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>
                Preserved snapshots isolate applications from subsequent catalogue changes
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-surface-hover)', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '0.625rem 0.75rem', fontWeight: 700 }}>Institution & Program</th>
                    <th style={{ padding: '0.625rem 0.75rem', fontWeight: 700 }}>Dossier Review</th>
                    <th style={{ padding: '0.625rem 0.75rem', fontWeight: 700 }}>External Status</th>
                    <th style={{ padding: '0.625rem 0.75rem', fontWeight: 700 }}>Portal Ref</th>
                    <th style={{ padding: '0.625rem 0.75rem', fontWeight: 700 }}>Lock Ver</th>
                    <th style={{ padding: '0.625rem 0.75rem', fontWeight: 700 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {caseApps.map((app) => (
                    <tr key={app.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.625rem 0.75rem' }}>
                        <strong style={{ display: 'block', fontSize: '0.875rem' }}>{app.universitySnapshot.name}</strong>
                        <span style={{ color: 'var(--color-foreground-muted)' }}>
                          {app.programSnapshot.title} • {app.programSnapshot.degree_level?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem' }}>
                        <Badge
                          variant={
                            app.dossierReviewStatus === 'dossier_approved'
                              ? 'success'
                              : app.dossierReviewStatus === 'revision_requested'
                              ? 'destructive'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {app.dossierReviewStatus.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem' }}>
                        <Badge
                          variant={
                            ['accepted_offer', 'unconditional_offer', 'visa_approved'].includes(app.externalStatus)
                              ? 'success'
                              : ['rejected', 'visa_refused'].includes(app.externalStatus)
                              ? 'destructive'
                              : ['submitted', 'awaiting_decision'].includes(app.externalStatus)
                              ? 'warning'
                              : 'default'
                          }
                          size="sm"
                        >
                          {app.externalStatus === 'awaiting_decision' ? 'Awaiting university response' : app.externalStatus.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem', fontFamily: 'var(--font-family-mono)' }}>
                        {app.portalApplicationNumber || '—'}
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem' }}>
                        <Badge variant="default" size="sm">v{app.lockVersion}</Badge>
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingApp(app)}
                            leftIcon={<Edit3 size={13} />}
                          >
                            Update
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewHistoryApp(app)}
                            leftIcon={<History size={13} />}
                          >
                            History
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* Case-Level Advisory Messaging & Separate Staff-Only Notes */}
      {activeCase && (
        <StaffCaseMessagingPanel
          caseId={activeCase.id}
          studentName={activeCase.studentName}
        />
      )}

      {/* Modal: Create Application with Snapshots */}
      {isCreateAppOpen && (
        <CreateApplicationModal
          caseId={activeCase.id}
          programs={cataloguePrograms?.items || []}
          onClose={() => setIsCreateAppOpen(false)}
          onSuccess={() => {
            setIsCreateAppOpen(false);
            refetchApps();
          }}
        />
      )}

      {/* Modal: Update Application with Optimistic Concurrency */}
      {editingApp && (
        <UpdateApplicationModal
          application={editingApp}
          onClose={() => setEditingApp(null)}
          onSuccess={() => {
            setEditingApp(null);
            refetchApps();
          }}
        />
      )}

      {/* Modal: Audited Reassignment */}
      {reassigningCase && (
        <ReassignCaseModal
          studentCase={reassigningCase}
          onClose={() => setReassigningCase(null)}
          onSuccess={() => {
            setReassigningCase(null);
            refetchCases();
          }}
        />
      )}

      {/* Modal: Application History Inspector */}
      {viewHistoryApp && (
        <StaffHistoryModal
          application={viewHistoryApp}
          onClose={() => setViewHistoryApp(null)}
        />
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// Create Application Modal (Snapshots from Catalogue)
// ----------------------------------------------------------------------
interface CreateApplicationModalProps {
  caseId: string;
  programs: any[];
  onClose: () => void;
  onSuccess: () => void;
}

const CreateApplicationModal: React.FC<CreateApplicationModalProps> = ({
  caseId,
  programs,
  onClose,
  onSuccess,
}) => {
  const [selectedProgramId, setSelectedProgramId] = useState(programs[0]?.id || 'prog-de-001');
  const [deadline, setDeadline] = useState('2027-05-31');
  const [portalUrl, setPortalUrl] = useState('https://campus.tum.de');
  const [accountEmail, setAccountEmail] = useState('student.applicant@example.com');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await api.staff.createApplication({
        caseId,
        programId: selectedProgramId,
        intakeId: 'intk-2027w',
        submissionDeadline: deadline,
        portalUrl,
        portalAccountEmail: accountEmail,
      });
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '540px',
          border: '1px solid var(--color-border)',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Create Target Application (Catalogue Snapshot)
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', marginBottom: '1rem' }}>
          Freezes an immutable snapshot of university accreditation, curriculum requirements, and tuition policies.
        </p>

        {errorMsg && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', fontSize: '0.8125rem', marginBottom: '1rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Target Catalogue Program
            </label>
            <select
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            >
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.university_name || 'University'} — {p.program_name} ({p.country_name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Official Submission Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Official Portal URL
            </label>
            <input
              type="url"
              value={portalUrl}
              onChange={(e) => setPortalUrl(e.target.value)}
              placeholder="https://..."
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Registered Student Portal Email
            </label>
            <input
              type="email"
              value={accountEmail}
              onChange={(e) => setAccountEmail(e.target.value)}
              placeholder="student.applicant@example.com"
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>
              Note: Unilistics does not store or accept portal passwords.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Creating Snapshot...' : 'Create Application'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Update Application Modal with Optimistic Concurrency Control
// ----------------------------------------------------------------------
interface UpdateApplicationModalProps {
  application: Application;
  onClose: () => void;
  onSuccess: () => void;
}

const UpdateApplicationModal: React.FC<UpdateApplicationModalProps> = ({
  application,
  onClose,
  onSuccess,
}) => {
  const [dossierStatus, setDossierStatus] = useState<DossierReviewStatus>(application.dossierReviewStatus);
  const [dossierNotes, setDossierNotes] = useState(application.dossierReviewNotes || '');
  const [externalStatus, setExternalStatus] = useState<ExternalApplicationStatus>(application.externalStatus);
  const [portalRef, setPortalRef] = useState(application.portalApplicationNumber || '');
  const [evidenceRef, setEvidenceRef] = useState(application.externalEvidenceReference || '');
  const [submittedAt, setSubmittedAt] = useState(application.submittedAt ? application.submittedAt.split('T')[0] : '');
  const [decisionOutcome, setDecisionOutcome] = useState<DecisionOutcomeType | ''>(application.decisionOutcomeType || '');
  const [offerConditions, setOfferConditions] = useState(application.offerConditions || '');
  const [decisionReason, setDecisionReason] = useState(application.decisionReason || '');
  const [deferralIntake, setDeferralIntake] = useState(application.deferralTargetIntake || '');
  const [nextAction, setNextAction] = useState(application.nextAction || '');
  const [isCorrection, setIsCorrection] = useState(false);
  const [correctionReason, setCorrectionReason] = useState('');
  const [isInternalOnly, setIsInternalOnly] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      await api.staff.updateApplication({
        applicationId: application.id,
        expectedLockVersion: application.lockVersion,
        dossierReviewStatus: dossierStatus,
        dossierReviewNotes: dossierNotes,
        externalStatus,
        externalEvidenceReference: evidenceRef,
        submittedAt: submittedAt ? new Date(submittedAt).toISOString() : undefined,
        portalApplicationNumber: portalRef,
        decisionOutcomeType: decisionOutcome ? decisionOutcome : undefined,
        offerConditions: decisionOutcome === 'conditional_offer' ? offerConditions : undefined,
        decisionReason: ['rejected', 'visa_refused', 'deferred'].includes(decisionOutcome) ? decisionReason : undefined,
        deferralTargetIntake: decisionOutcome === 'deferred' ? deferralIntake : undefined,
        nextAction,
        isCorrection,
        correctionReason: isCorrection ? correctionReason : undefined,
        isInternalOnly,
      });
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            Update Application Dossier & Outcomes
          </h2>
          <Badge variant="default" size="sm">Expected Lock: v{application.lockVersion}</Badge>
        </div>

        <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', marginBottom: '1rem' }}>
          {application.universitySnapshot.name} — {application.programSnapshot.title}
        </p>

        {errorMsg && (
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              fontSize: '0.8125rem',
              marginBottom: '1rem',
              fontWeight: 600,
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {/* Section 1: Internal Dossier Review */}
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-hover)', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              1. Internal Staff Document Review Status
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Dossier Status
                </label>
                <select
                  value={dossierStatus}
                  onChange={(e) => setDossierStatus(e.target.value as any)}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                >
                  <option value="pending_documents">Pending Documents</option>
                  <option value="under_counsellor_review">Under Counsellor Review</option>
                  <option value="dossier_approved">Dossier Approved by Staff</option>
                  <option value="revision_requested">Revision Requested from Student</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Next Required Action
                </label>
                <input
                  type="text"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  placeholder="e.g. Awaiting MOFA Apostille courier receipt"
                  style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Internal Review Notes
              </label>
              <textarea
                value={dossierNotes}
                onChange={(e) => setDossierNotes(e.target.value)}
                rows={2}
                placeholder="Prerequisite theoretical CS credit comparison, HEC QR verification details..."
                style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              />
            </div>
          </div>

          {/* Section 2: External Institutional Status */}
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-hover)', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              2. External Institutional Status (Reported by Counsellor)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  External Outcome Status
                </label>
                <select
                  value={externalStatus}
                  onChange={(e) => {
                    const val = e.target.value as ExternalApplicationStatus;
                    setExternalStatus(val);
                    if (
                      [
                        'conditional_offer',
                        'unconditional_offer',
                        'accepted_offer',
                        'rejected',
                        'deferred',
                        'withdrawn',
                        'visa_approved',
                        'visa_refused',
                        'visa_administrative_processing',
                      ].includes(val)
                    ) {
                      setDecisionOutcome(val as any);
                    } else {
                      setDecisionOutcome('');
                    }
                  }}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                >
                  <option value="not_submitted">Not Yet Submitted</option>
                  <option value="submitted">Submitted (Recorded Submission)</option>
                  <option value="awaiting_decision">Awaiting University Response</option>
                  <option value="conditional_offer">Conditional Offer</option>
                  <option value="unconditional_offer">Unconditional Offer</option>
                  <option value="accepted_offer">Offer Accepted</option>
                  <option value="rejected">Admission Rejected</option>
                  <option value="deferred">Deferred to Future Intake</option>
                  <option value="withdrawn">Withdrawn</option>
                  <option value="visa_processing">Visa Processing Underway</option>
                  <option value="visa_approved">Visa Approved</option>
                  <option value="visa_refused">Visa Refused</option>
                  <option value="visa_administrative_processing">Visa Administrative Processing</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Actual Submitted Date
                </label>
                <input
                  type="date"
                  value={submittedAt}
                  onChange={(e) => setSubmittedAt(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Portal Application Reference Number
                </label>
                <input
                  type="text"
                  value={portalRef}
                  onChange={(e) => setPortalRef(e.target.value)}
                  placeholder="e.g. TUM-2027W-88914"
                  style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  External Evidence Reference (Mandatory for Submissions)
                </label>
                <input
                  type="text"
                  value={evidenceRef}
                  onChange={(e) => setEvidenceRef(e.target.value)}
                  placeholder="e.g. TUM-SUBMISSION-CONFIRMATION-PDF-20261015.pdf"
                  style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
              </div>
            </div>

            {/* Conditional Offer Specifics */}
            {externalStatus === 'conditional_offer' && (
              <div style={{ marginTop: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--color-primary)' }}>
                  Specific Offer Conditions (Mandatory)
                </label>
                <textarea
                  value={offerConditions}
                  onChange={(e) => setOfferConditions(e.target.value)}
                  rows={2}
                  placeholder="Specify academic or language conditions (e.g. submit bachelor degree certificate before enrolment)..."
                  style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
              </div>
            )}

            {/* Rejection / Refusal / Deferral Specifics */}
            {['rejected', 'visa_refused', 'deferred'].includes(externalStatus) && (
              <div style={{ marginTop: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--color-danger)' }}>
                  Official Reason or Consular Refusal Code (Mandatory)
                </label>
                <input
                  type="text"
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="e.g. Insufficient ECTS in Theoretical Computer Science or Consular Section 6"
                  style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
                {externalStatus === 'deferred' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Target Deferred Intake
                    </label>
                    <input
                      type="text"
                      value={deferralIntake}
                      onChange={(e) => setDeferralIntake(e.target.value)}
                      placeholder="e.g. Summer Semester 2028"
                      style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Authorised Correction Checkbox & Reason */}
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isCorrection}
                onChange={(e) => setIsCorrection(e.target.checked)}
              />
              <span>This is an Authorised Correction of an Earlier Record</span>
            </label>

            {isCorrection && (
              <div style={{ marginTop: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--color-warning)' }}>
                  Correction Justification (Minimum 5 characters required for audit trail)
                </label>
                <input
                  type="text"
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="e.g. Corrected typo in portal reference code after university confirmation email"
                  style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
              </div>
            )}

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', marginTop: '0.5rem', cursor: 'pointer', color: 'var(--color-foreground-muted)' }}>
              <input
                type="checkbox"
                checked={isInternalOnly}
                onChange={(e) => setIsInternalOnly(e.target.checked)}
              />
              <span>Internal staff entry (hide note from student view)</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Applying Transition...' : 'Save & Increment Version'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Reassign Case Modal (Admin Action)
// ----------------------------------------------------------------------
interface ReassignCaseModalProps {
  studentCase: StudentCase;
  onClose: () => void;
  onSuccess: () => void;
}

const ReassignCaseModal: React.FC<ReassignCaseModalProps> = ({
  studentCase,
  onClose,
  onSuccess,
}) => {
  const [newCounsellorId, setNewCounsellorId] = useState('usr-demo-counsellor-005');
  const [reason, setReason] = useState('Reassigned due to counsellor caseload balancing and specialization in German visa waitlists.');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await api.staff.reassignCase(studentCase.id, newCounsellorId, reason);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reassign case');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '520px',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <UserCheck size={20} style={{ color: 'var(--color-primary)' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Audited Case Reassignment</h2>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', marginBottom: '1rem' }}>
          Assigning a new counsellor immediately revokes future access from the previous counsellor via Postgres RLS.
        </p>

        {errorMsg && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', fontSize: '0.8125rem', marginBottom: '1rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleReassign} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Designated Educational Counsellor
            </label>
            <select
              value={newCounsellorId}
              onChange={(e) => setNewCounsellorId(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            >
              <option value="usr-demo-counsellor-005">Usman Ghani (Senior German Corridor Lead)</option>
              <option value="usr-demo-counsellor-004">Sara Ahmed (Education Counsellor)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Audit Reassignment Justification (Mandatory, min 5 chars)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
              placeholder="Explain why this student case is being transferred..."
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Executing Transfer...' : 'Confirm Reassignment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Staff Application History Inspector Modal
// ----------------------------------------------------------------------
interface StaffHistoryModalProps {
  application: Application;
  onClose: () => void;
}

const StaffHistoryModal: React.FC<StaffHistoryModalProps> = ({
  application,
  onClose,
}) => {
  const { data: history, isLoading } = useQuery({
    queryKey: ['staff-app-history', application.id],
    queryFn: () => api.staff.getApplicationHistory(application.id),
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '85vh',
          overflowY: 'auto',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Full Chronological History & Audit Log</h2>
          <Badge variant="primary" size="sm">Staff View (Internal Notes Included)</Badge>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', marginBottom: '1rem' }}>
          {application.universitySnapshot.name} — {application.programSnapshot.title}
        </p>

        {isLoading ? (
          <p style={{ fontSize: '0.8125rem' }}>Loading audit records...</p>
        ) : !history || history.length === 0 ? (
          <p style={{ fontSize: '0.8125rem' }}>No history entries logged.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {history.map((h) => (
              <div
                key={h.id}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: h.isInternalOnly ? 'var(--color-warning-bg)' : 'var(--color-surface-hover)',
                  border: `1px solid ${h.isInternalOnly ? 'var(--color-warning-border)' : 'var(--color-border)'}`,
                  fontSize: '0.8125rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong>{h.eventType.toUpperCase()}</strong>
                    {h.isInternalOnly && <Badge variant="warning" size="sm">Internal Only</Badge>}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>
                    {new Date(h.reportedAt).toLocaleString()}
                  </span>
                </div>
                {h.reason && <p style={{ margin: '0.25rem 0' }}>{h.reason}</p>}
                {h.evidenceReference && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', display: 'block' }}>
                    Evidence: {h.evidenceReference}
                  </span>
                )}
                <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>
                  By: {h.actorName} ({h.actorRole})
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Staff Case Messaging & Separate Internal Notes Panel
// ----------------------------------------------------------------------
interface StaffCaseMessagingPanelProps {
  caseId: string;
  studentName: string;
}

const StaffCaseMessagingPanel: React.FC<StaffCaseMessagingPanelProps> = ({ caseId, studentName }) => {
  const queryClient = useQueryClient();
  const [filterMode, setFilterMode] = useState<'all' | 'student_only' | 'notes_only'>('all');
  const [msgText, setMsgText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ticketNotice, setTicketNotice] = useState<string | null>(null);

  // Fetch messages with staff view = true (includes internal notes)
  const { data: messages, isLoading, error, refetch } = useQuery({
    queryKey: ['staff-case-messages', caseId],
    queryFn: () => api.messages.getCaseMessages(caseId, true),
  });

  // Fetch case documents for authorized attachments
  const { data: documents } = useQuery({
    queryKey: ['staff-case-docs', caseId],
    queryFn: () => api.documents.getDocuments(caseId),
  });

  const eligibleDocs = (documents || []).filter(
    (d: CaseDocument) => d.quarantineStatus !== 'malware_detected' && d.quarantineStatus !== 'rejected'
  );

  const sendMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(null);
      return api.messages.sendCaseMessage({
        caseId,
        content: msgText,
        isInternalNote,
        attachmentDocumentId: selectedDocId || undefined,
      });
    },
    onSuccess: () => {
      setMsgText('');
      setSelectedDocId('');
      setIsInternalNote(false);
      queryClient.invalidateQueries({ queryKey: ['staff-case-messages', caseId] });
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || 'Failed to dispatch message.');
    },
  });

  const handleDownloadAttachment = async (docId: string, fileName: string) => {
    try {
      const ticket = await api.documents.getAuthorizedDownloadTicket(docId);
      setTicketNotice(`Authorized download generated for ${fileName} (valid for ${ticket.expiresInSeconds}s).`);
      setTimeout(() => setTicketNotice(null), 5000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not generate download ticket.');
    }
  };

  const displayedMessages = (messages || []).filter((m: CaseMessage) => {
    if (filterMode === 'student_only') return !m.isInternalStaffNote;
    if (filterMode === 'notes_only') return m.isInternalStaffNote;
    return true;
  });

  const staffNotesCount = (messages || []).filter((m: CaseMessage) => m.isInternalStaffNote).length;

  return (
    <Card padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.875rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <MessageSquare size={18} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>
              Case Advisory Correspondence & Internal Notes
            </h3>
            {staffNotesCount > 0 && (
              <Badge variant="warning" size="sm">
                <Lock size={10} style={{ display: 'inline', marginRight: '3px' }} />
                {staffNotesCount} Staff {staffNotesCount === 1 ? 'Note' : 'Notes'}
              </Badge>
            )}
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', margin: 0 }}>
            Chronological advisory thread with {studentName}. Staff notes are strictly isolated and never visible to students.
          </p>
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', gap: '0.375rem', backgroundColor: 'var(--color-surface-hover)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            style={{
              padding: '0.25rem 0.625rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: filterMode === 'all' ? 'var(--color-surface)' : 'transparent',
              color: filterMode === 'all' ? 'var(--color-primary)' : 'var(--color-foreground-muted)',
              boxShadow: filterMode === 'all' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            All Items
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('student_only')}
            style={{
              padding: '0.25rem 0.625rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: filterMode === 'student_only' ? 'var(--color-surface)' : 'transparent',
              color: filterMode === 'student_only' ? 'var(--color-primary)' : 'var(--color-foreground-muted)',
              boxShadow: filterMode === 'student_only' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            Student Visible
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('notes_only')}
            style={{
              padding: '0.25rem 0.625rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: filterMode === 'notes_only' ? 'var(--color-surface)' : 'transparent',
              color: filterMode === 'notes_only' ? '#d97706' : 'var(--color-foreground-muted)',
              boxShadow: filterMode === 'notes_only' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            Internal Notes Only
          </button>
        </div>
      </div>

      {errorMsg && (
        <Alert variant="destructive">
          {errorMsg}
        </Alert>
      )}

      {ticketNotice && (
        <Alert variant="success">
          {ticketNotice}
        </Alert>
      )}

      {/* Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', maxHeight: '400px', overflowY: 'auto', padding: '0.25rem' }}>
        {isLoading ? (
          <LoadingState message="Loading case communications..." />
        ) : error ? (
          <ErrorState message="Could not load case messages." onRetry={() => refetch()} />
        ) : displayedMessages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-foreground-muted)', fontSize: '0.8125rem' }}>
            No messages or notes matching this filter.
          </div>
        ) : (
          displayedMessages.map((m: CaseMessage) => {
            const isNote = m.isInternalStaffNote;

            return (
              <div
                key={m.id}
                style={{
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isNote ? '#fffbeb' : 'var(--color-surface-hover)',
                  border: isNote ? '1px solid #fde68a' : '1px solid var(--color-border)',
                  borderLeft: isNote ? '4px solid #f59e0b' : '4px solid var(--color-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.375rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isNote ? (
                      <Badge variant="warning" size="sm">
                        <Lock size={10} style={{ display: 'inline', marginRight: '3px' }} />
                        STAFF ONLY INTERNAL NOTE
                      </Badge>
                    ) : (
                      <Badge variant="primary" size="sm">
                        STUDENT VISIBLE
                      </Badge>
                    )}
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{m.senderName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>
                      ({m.senderRole.replace(/_/g, ' ')})
                    </span>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>
                    {formatUtcInTimezone(m.createdAt)}
                  </span>
                </div>

                <div style={{ fontSize: '0.875rem', lineHeight: 1.5, color: isNote ? '#78350f' : 'var(--color-foreground)' }}>
                  {m.messageBody}
                </div>

                {/* Attachment info */}
                {m.attachmentDocumentId && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      padding: '0.375rem 0.625rem',
                      marginTop: '0.25rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isNote ? 'rgba(255,255,255,0.8)' : 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: 0 }}>
                      <FileText size={13} style={{ color: 'var(--color-primary)' }} />
                      <span style={{ fontWeight: 600 }}>{m.attachmentDocumentTitle || m.attachmentFileName}</span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadAttachment(m.attachmentDocumentId!, m.attachmentFileName || 'attachment.pdf')}
                    >
                      Download
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Composition Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!msgText.trim()) return;
          sendMutation.mutate();
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          borderTop: '1px solid var(--color-border)',
          paddingTop: '1rem',
          backgroundColor: isInternalNote ? '#fffbeb' : 'transparent',
          padding: isInternalNote ? '1rem' : '1rem 0 0',
          borderRadius: isInternalNote ? 'var(--radius-md)' : 0,
          border: isInternalNote ? '1px dashed #f59e0b' : 'none',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem' }}>
            <input
              type="checkbox"
              checked={isInternalNote}
              onChange={(e) => setIsInternalNote(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#f59e0b' }}
            />
            <span style={{ fontWeight: 700, color: isInternalNote ? '#b45309' : 'var(--color-foreground)' }}>
              🔒 Mark as Staff-Only Internal Note (Students will never see this)
            </span>
          </label>

          {isInternalNote && (
            <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>
              Confidential internal memorandum
            </span>
          )}
        </div>

        <Textarea
          label={isInternalNote ? 'Internal Staff Observation / Case Strategy' : 'Official Message to Student'}
          value={msgText}
          onChange={(e) => setMsgText(e.target.value)}
          placeholder={
            isInternalNote
              ? 'Record confidential consular risk assessment, faculty interview insights, or attestation blockers...'
              : 'Provide guidance on next attestation milestones, visa appointment dates, or catalogue choices...'
          }
          rows={3}
          required
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Paperclip size={14} style={{ color: 'var(--color-foreground-muted)' }} />
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                maxWidth: '250px',
              }}
              aria-label="Attach case document"
            >
              <option value="">No attachment</option>
              {eligibleDocs.map((doc: CaseDocument) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title} ({doc.fileName || doc.safeDisplayName})
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            variant={isInternalNote ? 'secondary' : 'primary'}
            disabled={sendMutation.isPending || !msgText.trim()}
            rightIcon={<Send size={15} />}
          >
            {sendMutation.isPending
              ? 'Saving...'
              : isInternalNote
              ? 'Record Internal Note'
              : 'Send Message to Student'}
          </Button>
        </div>
      </form>
    </Card>
  );
};


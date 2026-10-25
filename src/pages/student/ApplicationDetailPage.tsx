import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import {
  ChevronLeft,
  CheckCircle2,
  Clock,
  Lock,
  ShieldCheck,
  FileCheck2,
  MessageSquare,
  Upload,
} from 'lucide-react';
import { CaseDocument, CaseTask } from '@/types';

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'timeline' | 'tasks' | 'documents' | 'history'>('timeline');

  // 1. Fetch application details
  const {
    data: application,
    isLoading: appLoading,
    error: appError,
    refetch: refetchApp,
  } = useQuery({
    queryKey: ['application-detail', id],
    queryFn: () => (id ? api.student.getApplication(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });

  // 2. Fetch tasks for this case
  const { data: tasks = [] } = useQuery({
    queryKey: ['student-tasks'],
    queryFn: () => api.student.getTasks(),
  });

  // 3. Fetch documents for this case
  const { data: documents = [] } = useQuery({
    queryKey: ['student-documents'],
    queryFn: () => api.student.getDocuments(),
  });

  // 4. Fetch history for this application
  const { data: history = [] } = useQuery({
    queryKey: ['application-history', id],
    queryFn: () => (id ? api.student.getApplicationHistory(id) : Promise.resolve([])),
    enabled: Boolean(id),
  });

  if (appLoading) {
    return <LoadingState message="Loading university application workspace..." />;
  }

  if (appError || !application) {
    return (
      <div style={{ maxWidth: '960px', margin: '2rem auto', padding: '0 1rem' }}>
        <ErrorState
          title="Application not found"
          message="The requested university application record does not exist or has been archived."
          onRetry={() => refetchApp()}
        />
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/student/applications" style={{ color: 'var(--action-primary)', fontWeight: 600, textDecoration: 'none' }}>
            ← Back to My Applications
          </Link>
        </div>
      </div>
    );
  }

  const uniName = application.universitySnapshot?.name || 'Target University';
  const progTitle = application.programSnapshot?.title || 'Degree Program';
  const country = application.universitySnapshot?.country || 'europe';

  // Country-specific portal & requirements mapping
  const countryProceduralBranch: Record<string, { portal: string; authority: string; specialMilestone: string }> = {
    germany: {
      portal: 'Uni-Assist e.V. & Hochschulstart',
      authority: 'German Embassy Islamabad / Consulate Karachi',
      specialMilestone: 'HEC Transcript Verification & APS Attestation Certificate',
    },
    france: {
      portal: 'Études en France (Campus France)',
      authority: 'Consulat Général de France au Pakistan',
      specialMilestone: 'Campus France Academic Interview & Pre-Consular Approval',
    },
    italy: {
      portal: 'Universitaly & CIMEA / DOV',
      authority: 'Embassy of Italy Islamabad',
      specialMilestone: 'Declaration of Value (DOV) & CIMEA Statement of Comparability',
    },
    romania: {
      portal: 'Romanian Ministry of Education (ARACIS)',
      authority: 'Embassy of Romania in Islamabad',
      specialMilestone: 'Letter of Acceptance issued by the Romanian Ministry of Education',
    },
  };

  const branchInfo = countryProceduralBranch[country.toLowerCase()] || {
    portal: 'Direct University Admissions Portal',
    authority: 'Designated Consular Section',
    specialMilestone: 'Ministry & Higher Education Attestation Stamp',
  };

  // Determine stage progression index (1 to 5)
  let activeStageIndex = 2;
  if (application.externalStatus === 'not_submitted' && application.dossierReviewStatus === 'pending_documents') {
    activeStageIndex = 1;
  } else if (application.dossierReviewStatus === 'under_counsellor_review' || application.dossierReviewStatus === 'revision_requested') {
    activeStageIndex = 2;
  } else if (application.externalStatus === 'submitted' || application.externalStatus === 'awaiting_decision') {
    activeStageIndex = 3;
  } else if (['conditional_offer', 'unconditional_offer', 'accepted_offer'].includes(application.externalStatus)) {
    activeStageIndex = 4;
  } else if (['visa_processing', 'visa_approved'].includes(application.externalStatus)) {
    activeStageIndex = 5;
  }

  const stages = [
    {
      index: 1,
      title: 'Attestation & Initial Document Verification',
      description: branchInfo.specialMilestone,
      lockedReason: null,
      status: activeStageIndex > 1 ? 'completed' : activeStageIndex === 1 ? 'current' : 'locked',
      badge: 'Prerequisite',
    },
    {
      index: 2,
      title: 'Dossier Preparation & Counsellor Review',
      description: 'Educational counsellor reviews SOP, CV, recommendation letters and certified transcripts.',
      lockedReason: 'Requires validated attestation stamps before counsellor sign-off.',
      status: activeStageIndex > 2 ? 'completed' : activeStageIndex === 2 ? 'current' : 'locked',
      badge: 'Staff Review',
    },
    {
      index: 3,
      title: `Submission via ${branchInfo.portal}`,
      description: `Official application dispatch to ${uniName}. Portal reference and payment recorded.`,
      lockedReason: 'Counsellor dossier approval required before portal application can be officially dispatched.',
      status: activeStageIndex > 3 ? 'completed' : activeStageIndex === 3 ? 'current' : 'locked',
      badge: 'Submission Gate',
    },
    {
      index: 4,
      title: 'Admissions Decision & Offer Letter',
      description: 'University faculty evaluation. Issuance of unconditional or conditional admission offer.',
      lockedReason: 'Awaiting faculty evaluation committee decision from the target institution.',
      status: activeStageIndex > 4 ? 'completed' : activeStageIndex === 4 ? 'current' : 'locked',
      badge: 'Decision',
    },
    {
      index: 5,
      title: 'Consular Visa Queue & Student Travel',
      description: `${branchInfo.authority} visa appointment, blocked account/guarantee, and pre-departure briefing.`,
      lockedReason: 'Official university acceptance letter and wire receipt required to open consular visa file.',
      status: activeStageIndex >= 5 ? 'current' : 'locked',
      badge: 'Embassy Phase',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Breadcrumbs */}
      <div>
        <Link
          to="/student/applications"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--action-primary)',
            textDecoration: 'none',
          }}
        >
          <ChevronLeft size={16} />
          <span>Back to My Applications</span>
        </Link>
      </div>

      {/* 2. Application Header Card */}
      <div
        className="bento-card"
        style={{
          padding: '2rem',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--accent-peach-bg)',
                  color: 'var(--action-primary)',
                  border: '1px solid var(--accent-peach-border)',
                }}
              >
                {country.toUpperCase()} • {application.intakeSnapshot?.season?.toUpperCase()} {application.intakeSnapshot?.academic_year}
              </span>
              <span
                className="badge-semantic"
                style={{
                  backgroundColor:
                    ['accepted_offer', 'unconditional_offer', 'visa_approved'].includes(application.externalStatus)
                      ? 'var(--color-success-bg)'
                      : ['submitted', 'awaiting_decision'].includes(application.externalStatus)
                      ? 'var(--color-info-bg)'
                      : 'var(--color-warning-bg)',
                  color:
                    ['accepted_offer', 'unconditional_offer', 'visa_approved'].includes(application.externalStatus)
                      ? 'var(--color-success)'
                      : ['submitted', 'awaiting_decision'].includes(application.externalStatus)
                      ? 'var(--color-info)'
                      : 'var(--color-warning)',
                  border: '1px solid currentColor',
                }}
              >
                {application.externalStatus.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-charcoal)', margin: 0, letterSpacing: '-0.02em' }}>
              {uniName}
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
              {progTitle} • {application.programSnapshot?.degree_level?.toUpperCase()} ({application.programSnapshot?.instruction_language?.toUpperCase()})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link
              to="/student/messages"
              className="btn-pill btn-pill-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', textDecoration: 'none' }}
            >
              <MessageSquare size={15} />
              <span>Message Counsellor</span>
            </Link>
            <Link
              to="/student/documents"
              className="btn-pill btn-pill-primary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', textDecoration: 'none' }}
            >
              <Upload size={15} />
              <span>Upload Document</span>
            </Link>
          </div>
        </div>

        {/* Submission References & Evidence Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--surface-recessed)',
            borderRadius: 'var(--radius-card-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8125rem',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Portal Application No:</span>
            <strong style={{ fontFamily: 'var(--font-mono, monospace)' }}>
              {application.portalApplicationNumber || 'Not submitted yet'}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Submission Deadline:</span>
            <strong>{application.submissionDeadline || application.intakeSnapshot?.deadline_date || 'Not specified'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Dossier Review:</span>
            <strong style={{ textTransform: 'capitalize' }}>
              {application.dossierReviewStatus.replace(/_/g, ' ')}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>External Evidence:</span>
            <span>{application.externalEvidenceReference || 'Official dossier review record'}</span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        {[
          { id: 'timeline', label: 'Vertical Milestone Timeline', icon: Clock },
          { id: 'tasks', label: `Related Tasks (${tasks.length})`, icon: CheckCircle2 },
          { id: 'documents', label: `Dossier Files (${documents.length})`, icon: FileCheck2 },
          { id: 'history', label: `Status Audit (${history.length})`, icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                backgroundColor: isActive ? 'var(--action-primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Tab Content: Vertical Timeline */}
      {activeTab === 'timeline' && (
        <div className="bento-card" style={{ padding: '2rem', backgroundColor: '#ffffff' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-charcoal)', margin: 0 }}>
              Multi-Stage Procedural Timeline
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
              Progressing independently according to {country.toUpperCase()} statutory admission procedures. Later stages require staff unlocking.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {stages.map((stage, idx) => {
              const isCompleted = stage.status === 'completed';
              const isCurrent = stage.status === 'current';
              const isLocked = stage.status === 'locked';

              return (
                <div
                  key={stage.index}
                  style={{
                    display: 'flex',
                    gap: '1.25rem',
                    opacity: isLocked ? 0.65 : 1,
                    position: 'relative',
                  }}
                >
                  {/* Step Circle & Connector */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '36px', flexShrink: 0 }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: isCompleted
                          ? 'var(--color-success)'
                          : isCurrent
                          ? 'var(--action-primary)'
                          : 'var(--surface-recessed)',
                        color: isCompleted || isCurrent ? '#ffffff' : 'var(--text-muted)',
                        border: isLocked ? '2px dashed var(--border-refined)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                      }}
                    >
                      {isCompleted ? <CheckCircle2 size={18} /> : isLocked ? <Lock size={16} /> : stage.index}
                    </div>

                    {idx < stages.length - 1 && (
                      <div
                        style={{
                          width: '2px',
                          flex: 1,
                          backgroundColor: isCompleted ? 'var(--color-success)' : 'var(--border-subtle)',
                          minHeight: '40px',
                          margin: '0.5rem 0',
                        }}
                      />
                    )}
                  </div>

                  {/* Step Content */}
                  <div
                    style={{
                      flex: 1,
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-card-sm)',
                      backgroundColor: isCurrent ? 'var(--surface-canvas)' : 'var(--surface-recessed)',
                      border: isCurrent ? '1px solid var(--action-primary)' : '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-charcoal)' }}>
                        Stage {stage.index}: {stage.title}
                      </span>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: isCompleted ? 'var(--color-success-bg)' : isCurrent ? 'var(--accent-peach-bg)' : '#F3F4F6',
                          color: isCompleted ? 'var(--color-success)' : isCurrent ? 'var(--action-primary)' : '#6B7280',
                        }}
                      >
                        {isCompleted ? 'COMPLETED' : isCurrent ? 'IN PROGRESS' : 'LOCKED'}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                      {stage.description}
                    </p>

                    {isLocked && stage.lockedReason && (
                      <div
                        style={{
                          marginTop: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.75rem',
                          color: '#B78103',
                          backgroundColor: '#FFF9E6',
                          padding: '0.35rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <Lock size={12} />
                        <span>{stage.lockedReason}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Tab Content: Tasks */}
      {activeTab === 'tasks' && (
        <div className="bento-card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>
            Action Items & Attestation Deadlines
          </h2>
          {tasks.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No tasks assigned yet. Your counsellor will schedule attestation milestones.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tasks.map((t: CaseTask) => (
                <div
                  key={t.id}
                  style={{
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius-card-sm)',
                    backgroundColor: 'var(--surface-recessed)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.875rem', display: 'block', color: 'var(--text-charcoal)' }}>
                      {t.title}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Due: {t.dueDate || 'Not set'} • Assigned to: {t.assignedToRole}
                    </span>
                  </div>
                  <span
                    className="badge-semantic"
                    style={{
                      backgroundColor: t.status === 'completed' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                      color: t.status === 'completed' ? 'var(--color-success)' : 'var(--color-warning)',
                    }}
                  >
                    {t.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. Tab Content: Documents */}
      {activeTab === 'documents' && (
        <div className="bento-card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>
              Dossier Files & Verification Status
            </h2>
            <Link to="/student/documents" className="btn-pill btn-pill-primary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', textDecoration: 'none' }}>
              <Upload size={12} />
              <span>Upload Document</span>
            </Link>
          </div>
          {documents.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No documents uploaded yet. Submit your transcripts and passport scan.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {documents.map((doc: CaseDocument) => (
                <div
                  key={doc.id}
                  style={{
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius-card-sm)',
                    backgroundColor: 'var(--surface-recessed)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.875rem', display: 'block', color: 'var(--text-charcoal)' }}>
                      {doc.documentType.replace(/_/g, ' ').toUpperCase()}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      File: {doc.fileName} • Uploaded: {doc.uploadedAt ? doc.uploadedAt.split('T')[0] : 'Recently'}
                    </span>
                  </div>
                  <span
                    className="badge-semantic"
                    style={{
                      backgroundColor:
                        doc.verificationStatus === 'verified'
                          ? 'var(--color-success-bg)'
                          : doc.verificationStatus === 'rejected'
                          ? 'var(--color-danger-bg)'
                          : 'var(--color-warning-bg)',
                      color:
                        doc.verificationStatus === 'verified'
                          ? 'var(--color-success)'
                          : doc.verificationStatus === 'rejected'
                          ? 'var(--color-danger)'
                          : 'var(--color-warning)',
                    }}
                  >
                    {doc.verificationStatus.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. Tab Content: History */}
      {activeTab === 'history' && (
        <div className="bento-card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>
            Official Audit Trail & Milestones
          </h2>
          {history.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No status transitions recorded yet. Changes will be audited here by counsellors.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {history.map((h, i) => (
                <div
                  key={i}
                  style={{
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius-card-sm)',
                    backgroundColor: 'var(--surface-recessed)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.875rem' }}>{(h.toStatus || h.eventType).replace(/_/g, ' ').toUpperCase()}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h.createdAt?.split('T')[0]}</span>
                  </div>
                  {h.reason && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginBottom: 0 }}>
                      {h.reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

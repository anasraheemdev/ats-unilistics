import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckSquare,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Send,
  ChevronRight,
  MessageSquare,
  Upload,
  Calendar,
} from 'lucide-react';
import { CaseDocument, CaseTask, Application } from '@/types';

export const StudentOverviewPage: React.FC = () => {
  const {
    data: studentCase,
    isLoading: caseLoading,
    error: caseError,
  } = useQuery({
    queryKey: ['student-case-overview'],
    queryFn: () => api.student.getOverviewCase(),
  });

  const {
    data: tasks = [],
    isLoading: tasksLoading,
    refetch: refetchTasks,
  } = useQuery({
    queryKey: ['student-tasks'],
    queryFn: () => api.student.getTasks(),
  });

  const {
    data: documents = [],
    isLoading: docsLoading,
  } = useQuery({
    queryKey: ['student-documents'],
    queryFn: () => api.student.getDocuments(),
  });

  const {
    data: applications = [],
    isLoading: appsLoading,
  } = useQuery({
    queryKey: ['student-applications'],
    queryFn: () => api.student.getApplications(),
  });

  const {
    data: messages = [],
  } = useQuery({
    queryKey: ['student-case-messages', studentCase?.id],
    queryFn: () => (studentCase?.id ? api.messages.getCaseMessages(studentCase.id) : Promise.resolve([])),
    enabled: Boolean(studentCase?.id),
  });

  const handleToggleTask = async (taskId: string) => {
    await api.student.toggleTask(taskId);
    refetchTasks();
  };

  if (caseLoading || tasksLoading || docsLoading || appsLoading) {
    return <LoadingState message="Loading your managed case room..." />;
  }

  if (caseError || !studentCase) {
    return (
      <EmptyState
        title="No active student case found"
        description="You do not have an active managed student case yet. If you recently requested support, your application may still be under administrative review."
        actionLabel="Request Managed Support"
        onAction={() => window.location.assign('/request-access?service=managed')}
        imageSrc="/images/unilistics/empty_applications.webp"
        imageAlt="No active case illustration"
      />
    );
  }

  // Derive genuine dynamic metrics
  const completedTasksCount = tasks.filter((t: CaseTask) => t.status === 'completed').length;
  const totalTasksCount = tasks.length;
  const pendingTasks = tasks.filter((t: CaseTask) => t.status === 'pending');
  const priorityTask = pendingTasks[0] || null;

  // Latest note from counsellor
  const counsellorNotes = messages.filter((m) => m.senderRole === 'counsellor' || m.senderRole === 'admin');
  const latestCounsellorNote = counsellorNotes[counsellorNotes.length - 1] || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Top Welcome Banner (Matching screen(3).png) */}
      <section
        className="bento-card"
        style={{
          padding: '2rem 1.75rem',
          backgroundColor: '#ffffff',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                backgroundColor: 'var(--accent-peach-bg)',
                color: 'var(--action-primary)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--accent-peach-border)',
              }}
            >
              {studentCase.targetIntakeSeason.toUpperCase()} {studentCase.targetIntakeYear} Admissions Cycle
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Case Ref: #{studentCase.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h1
              style={{
                fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)',
                fontWeight: 800,
                color: 'var(--text-charcoal)',
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
              }}
            >
              Welcome back, {studentCase.studentName}!
            </h1>
            <span style={{ fontSize: '1.75rem' }} role="img" aria-label="Graduation Cap">🎓</span>
          </div>

          <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: '580px' }}>
            Your university applications and visa attestations are tracked in this verified case room. You have{' '}
            <strong style={{ color: 'var(--action-primary)' }}>{pendingTasks.length} pending actions</strong> to complete.
          </p>
        </div>

        {/* Assigned Advisor Info Card */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              backgroundColor: 'var(--surface-recessed)',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-card-sm)',
              border: '1px solid var(--border-subtle)',
              width: '100%',
              maxWidth: '360px',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--action-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.125rem',
                flexShrink: 0,
              }}
            >
              {studentCase.assignedCounsellorName ? studentCase.assignedCounsellorName.charAt(0) : 'A'}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {studentCase.assignedCounsellorName || 'Adviser Pending Assignment'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {studentCase.assignedCounsellorName ? 'Senior Admissions Adviser' : 'Unallocated to Staff'}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                <ShieldCheck size={12} />
                <span>Assigned Case Lead</span>
              </div>
            </div>

            <Link
              to="/student/messages"
              className="btn-pill btn-pill-secondary"
              style={{
                padding: '0.4rem 0.75rem',
                fontSize: '0.75rem',
                minHeight: '36px',
                textDecoration: 'none',
              }}
              title="Message your assigned adviser"
              aria-label="Message your assigned adviser"
            >
              <MessageSquare size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile Quick Action Buttons (Matching screen(6).png) */}
      <div
        className="md:hidden"
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem',
        }}
      >
        <Link to="/student/documents" className="btn-pill btn-pill-primary" style={{ fontSize: '0.8125rem', flex: 1, textDecoration: 'none' }}>
          <Upload size={14} />
          <span>Upload File</span>
        </Link>
        <Link to="/student/messages" className="btn-pill btn-pill-secondary" style={{ fontSize: '0.8125rem', flex: 1, textDecoration: 'none' }}>
          <MessageSquare size={14} />
          <span>Message Adviser</span>
        </Link>
        <Link to="/student/applications" className="btn-pill btn-pill-secondary" style={{ fontSize: '0.8125rem', flex: 1, textDecoration: 'none' }}>
          <Clock size={14} />
          <span>Timeline</span>
        </Link>
      </div>

      {/* 2. Main Bento Two-Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.75rem',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: Actions, Active Applications, Milestones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Card: Priority Requirement Pending */}
          <div className="bento-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--action-primary)', letterSpacing: '0.04em' }}>
                Admissions Action Center
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--surface-recessed)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-pill)',
                  color: 'var(--text-muted)',
                }}
              >
                {completedTasksCount} of {totalTasksCount} tasks completed
              </span>
            </div>

            {priorityTask ? (
              <div
                style={{
                  backgroundColor: 'var(--surface-recessed)',
                  borderRadius: 'var(--radius-card-sm)',
                  padding: '1.25rem',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      backgroundColor: 'var(--color-warning-bg)',
                      color: 'var(--color-warning)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-pill)',
                      border: '1px solid var(--color-warning-border)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Clock size={11} />
                    <span>Next Action Required</span>
                  </span>
                  {priorityTask.dueDate && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Due: {priorityTask.dueDate}
                    </span>
                  )}
                </div>

                <h3
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: 'var(--text-charcoal)',
                    marginBottom: '0.5rem',
                    lineHeight: 1.3,
                  }}
                >
                  {priorityTask.title}
                </h3>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  {priorityTask.description || 'This document or task is required by your target institution and consular regulations.'}
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link
                    to="/student/documents"
                    className="btn-pill btn-pill-primary"
                    style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', textDecoration: 'none' }}
                  >
                    <Upload size={14} />
                    <span>Upload Required File</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleToggleTask(priorityTask.id)}
                    className="btn-pill btn-pill-secondary"
                    style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
                  >
                    <CheckSquare size={14} />
                    <span>Mark Finished</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <CheckCircle2 size={32} style={{ color: 'var(--color-success)', margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-charcoal)' }}>
                  All procedural tasks up to date!
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Your assigned adviser is tracking external university deadlines.
                </div>
              </div>
            )}
          </div>

          {/* Card: Target Universities / Active Applications */}
          <div className="bento-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-charcoal)', margin: 0 }}>
                  Target Universities ({applications.length} Active)
                </h2>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Multi-application tracking with real-time stage progression
                </span>
              </div>
              <Link to="/student/applications" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--action-primary)', textDecoration: 'none' }}>
                Manage All
              </Link>
            </div>

            {applications.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {applications.map((app: Application) => (
                  <Link
                    key={app.id}
                    to="/student/applications"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-card-sm)',
                      backgroundColor: 'var(--surface-recessed)',
                      border: '1px solid var(--border-subtle)',
                      textDecoration: 'none',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#ffffff',
                          border: '1px solid var(--border-refined)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.875rem',
                          color: 'var(--action-primary)',
                          flexShrink: 0,
                        }}
                      >
                        {(app.universitySnapshot?.name || 'UNI').slice(0, 3).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-charcoal)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {app.universitySnapshot?.name || 'University'}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {app.programSnapshot?.title || 'Degree Program'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                      <span
                        className="badge-semantic"
                        style={{
                          backgroundColor:
                            app.externalStatus === 'accepted_offer' || app.externalStatus === 'conditional_offer'
                              ? 'var(--color-success-bg)'
                              : app.externalStatus === 'submitted' || app.externalStatus === 'awaiting_decision'
                              ? 'var(--color-info-bg)'
                              : 'var(--color-warning-bg)',
                          color:
                            app.externalStatus === 'accepted_offer' || app.externalStatus === 'conditional_offer'
                              ? 'var(--color-success)'
                              : app.externalStatus === 'submitted' || app.externalStatus === 'awaiting_decision'
                              ? 'var(--color-info)'
                              : 'var(--color-warning)',
                          border: '1px solid currentColor',
                        }}
                      >
                        {app.externalStatus.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No active university applications yet"
                description="Browse accredited European degree programs in the catalogue and select target institutions with your counsellor."
                actionLabel="Explore European Catalogue"
                onAction={() => window.location.assign('/student/explore')}
                imageSrc="/images/unilistics/empty_applications.webp"
                imageAlt="Empty applications illustration"
              />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Counsellor Quick Note, Recent Documents, Critical Deadlines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Card: Counsellor Quick Note (Matching screen(3).png) */}
          <div className="bento-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={16} style={{ color: 'var(--action-primary)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-charcoal)', margin: 0 }}>
                  Adviser Quick Note
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {latestCounsellorNote ? 'Recent Advice' : 'Case Thread'}
              </span>
            </div>

            {latestCounsellorNote ? (
              <div
                style={{
                  backgroundColor: 'var(--accent-peach-bg)',
                  border: '1px solid var(--accent-peach-border)',
                  borderRadius: 'var(--radius-card-sm)',
                  padding: '1rem 1.125rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--action-primary)', marginBottom: '0.35rem' }}>
                  From {latestCounsellorNote.senderName}:
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-charcoal)', fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>
                  "{latestCounsellorNote.messageBody || (latestCounsellorNote as any).content}"
                </p>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: 'var(--surface-recessed)',
                  borderRadius: 'var(--radius-card-sm)',
                  padding: '1rem',
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                  marginBottom: '1rem',
                }}
              >
                No direct messages yet. Send an inquiry or clarification to your assigned adviser below.
              </div>
            )}

            <Link
              to="/student/messages"
              className="btn-pill btn-pill-secondary"
              style={{ width: '100%', fontSize: '0.8125rem', textDecoration: 'none' }}
            >
              <Send size={14} />
              <span>Open Case Messaging Room</span>
            </Link>
          </div>

          {/* Card: Verification Vault / Recent Documents */}
          <div className="bento-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-charcoal)', margin: 0 }}>
                  Recent Documents
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Verified Document Vault ({documents.length} Files)
                </span>
              </div>
              <Link to="/student/documents" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--action-primary)', textDecoration: 'none' }}>
                View All
              </Link>
            </div>

            {documents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {documents.slice(0, 4).map((doc: CaseDocument) => (
                  <div
                    key={doc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 0.875rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--surface-recessed)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
                      <FileText size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-charcoal)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {doc.documentType.replace('_', ' ').toUpperCase()}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          {(doc.fileSizeBytes / 1024 / 1024).toFixed(1)} MB • {doc.fileName}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`badge-semantic ${
                        doc.quarantineStatus === 'approved' || doc.verificationStatus === 'verified'
                          ? 'badge-emerald'
                          : doc.quarantineStatus === 'needs_replacement' || doc.quarantineStatus === 'rejected' || doc.verificationStatus === 'rejected'
                          ? 'badge-rose'
                          : 'badge-blue'
                      }`}
                      style={{ fontSize: '0.6875rem', flexShrink: 0 }}
                    >
                      {(doc.quarantineStatus || doc.verificationStatus || 'pending').replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  No documents uploaded yet.
                </div>
                <Link to="/student/documents" className="btn-pill btn-pill-primary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.875rem', textDecoration: 'none' }}>
                  Upload First Document
                </Link>
              </div>
            )}
          </div>

          {/* Card: Critical Deadlines */}
          <div className="bento-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} style={{ color: 'var(--action-primary)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-charcoal)', margin: 0 }}>
                  Upcoming Deadlines
                </h3>
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Central CET Sync
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.625rem 0.75rem',
                  backgroundColor: 'var(--surface-recessed)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-charcoal)' }}>
                    German APS Verification
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    Mandatory for German Student Visa
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--action-primary)' }}>
                  Active Queue
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.625rem 0.75rem',
                  backgroundColor: 'var(--surface-recessed)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-charcoal)' }}>
                    Italian Pre-Enrollment (Universitaly)
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    Intake Window Closing
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-warning)' }}>
                  Due 30 Nov
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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

  // Latest genuine note from assigned counsellor or admin
  const counsellorNotes = messages.filter((m) => m.senderRole === 'counsellor' || m.senderRole === 'admin');
  const latestCounsellorNote = counsellorNotes[counsellorNotes.length - 1] || null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        fontFamily: 'var(--font-family-base, "DM Sans", sans-serif)',
      }}
    >
      {/* 1. Top Welcome Banner Card */}
      <section
        style={{
          padding: '1.75rem',
          backgroundColor: 'var(--surface-card, #FFFFFF)',
          borderRadius: '24px',
          border: '1px solid var(--border-subtle, #E1E8DE)',
          boxShadow: 'var(--shadow-subtle, 0 1px 3px rgba(0, 0, 0, 0.04))',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
                backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                color: 'var(--action-primary, #245B42)',
                padding: '0.25rem 0.625rem',
                borderRadius: '9999px',
                border: '1px solid var(--border-subtle, #E1E8DE)',
              }}
            >
              {studentCase.targetIntakeSeason.toUpperCase()} {studentCase.targetIntakeYear} Admissions Cycle
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-foreground-muted, #58695E)' }}>
              Case Ref: #{studentCase.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h1
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 700,
                color: 'var(--color-foreground, #19261F)',
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              Welcome back, {studentCase.studentName}!
            </h1>
          </div>

          <p style={{ fontSize: '0.9375rem', color: 'var(--color-foreground-muted, #58695E)', lineHeight: 1.5, maxWidth: '580px', margin: 0 }}>
            Your university applications and visa documents are tracked in this verified workspace. You have{' '}
            <strong style={{ color: 'var(--action-primary, #245B42)' }}>{pendingTasks.length} pending actions</strong> to complete.
          </p>
        </div>

        {/* Assigned Advisor Info Card (Genuine Data or Unassigned State) */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              backgroundColor: 'var(--surface-recessed, #EDF2E9)',
              padding: '1rem 1.25rem',
              borderRadius: '16px',
              border: '1px solid var(--border-subtle, #E1E8DE)',
              width: '100%',
              maxWidth: '380px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: studentCase.assignedCounsellorName ? 'var(--action-primary, #245B42)' : '#8DA394',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1rem',
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              {studentCase.assignedCounsellorName ? studentCase.assignedCounsellorName.charAt(0) : '?'}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: 'var(--color-foreground, #19261F)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {studentCase.assignedCounsellorName || 'Adviser Pending Assignment'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #58695E)' }}>
                {studentCase.assignedCounsellorName ? 'Admissions Adviser' : 'Unallocated to Staff'}
              </div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  color: studentCase.assignedCounsellorName ? 'var(--color-success, #245B42)' : 'var(--color-foreground-muted, #58695E)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  marginTop: '0.15rem',
                }}
              >
                {studentCase.assignedCounsellorName ? (
                  <>
                    <ShieldCheck size={13} aria-hidden={true} />
                    <span>Assigned Case Lead</span>
                  </>
                ) : (
                  <>
                    <Clock size={13} aria-hidden={true} />
                    <span>Admin Reviewing Allocation</span>
                  </>
                )}
              </div>
            </div>

            {studentCase.assignedCounsellorName && (
              <Link
                to="/student/messages"
                style={{
                  padding: '0.5rem',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--surface-card, #FFFFFF)',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                  color: 'var(--action-primary, #245B42)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '38px',
                  minWidth: '38px',
                  textDecoration: 'none',
                }}
                title="Message your assigned adviser"
                aria-label="Message your assigned adviser"
              >
                <MessageSquare size={16} aria-hidden={true} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Mobile Quick Action Strip (Tappable Navigation) */}
      <div
        className="md:hidden"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
        }}
      >
        <Link
          to="/student/documents"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            padding: '0.625rem 0.5rem',
            borderRadius: '16px',
            backgroundColor: 'var(--action-primary, #245B42)',
            color: '#FFFFFF',
            fontSize: '0.75rem',
            fontWeight: 600,
            textDecoration: 'none',
            minHeight: '44px',
          }}
        >
          <Upload size={14} aria-hidden={true} />
          <span>Upload</span>
        </Link>
        <Link
          to="/student/messages"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            padding: '0.625rem 0.5rem',
            borderRadius: '16px',
            backgroundColor: 'var(--surface-card, #FFFFFF)',
            border: '1px solid var(--border-subtle, #E1E8DE)',
            color: 'var(--color-foreground, #19261F)',
            fontSize: '0.75rem',
            fontWeight: 600,
            textDecoration: 'none',
            minHeight: '44px',
          }}
        >
          <MessageSquare size={14} aria-hidden={true} />
          <span>Messages</span>
        </Link>
        <Link
          to="/student/applications"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            padding: '0.625rem 0.5rem',
            borderRadius: '16px',
            backgroundColor: 'var(--surface-card, #FFFFFF)',
            border: '1px solid var(--border-subtle, #E1E8DE)',
            color: 'var(--color-foreground, #19261F)',
            fontSize: '0.75rem',
            fontWeight: 600,
            textDecoration: 'none',
            minHeight: '44px',
          }}
        >
          <Clock size={14} aria-hidden={true} />
          <span>Casework</span>
        </Link>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.75rem',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: Actions & Active Applications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Card: Priority Requirement / Next Action */}
          <section
            style={{
              padding: '1.75rem',
              backgroundColor: 'var(--surface-card, #FFFFFF)',
              borderRadius: '24px',
              border: '1px solid var(--border-subtle, #E1E8DE)',
              boxShadow: 'var(--shadow-subtle, 0 1px 3px rgba(0, 0, 0, 0.04))',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--action-primary, #245B42)',
                  letterSpacing: '0.04em',
                }}
              >
                Next Action Center
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                  padding: '0.25rem 0.625rem',
                  borderRadius: '9999px',
                  color: 'var(--color-foreground-muted, #58695E)',
                }}
              >
                {completedTasksCount} of {totalTasksCount} tasks completed
              </span>
            </div>

            {priorityTask ? (
              <div
                style={{
                  backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      backgroundColor: 'rgba(36, 91, 66, 0.1)',
                      color: 'var(--action-primary, #245B42)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Clock size={12} aria-hidden={true} />
                    <span>Next Action Required</span>
                  </span>
                  {priorityTask.dueDate && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-foreground-muted, #58695E)' }}>
                      Due: {priorityTask.dueDate}
                    </span>
                  )}
                </div>

                <h3
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: 'var(--color-foreground, #19261F)',
                    marginBottom: '0.5rem',
                    lineHeight: 1.3,
                    margin: 0,
                  }}
                >
                  {priorityTask.title}
                </h3>

                <p style={{ fontSize: '0.875rem', color: 'var(--color-foreground-muted, #58695E)', margin: '0.5rem 0 1.25rem', lineHeight: 1.5 }}>
                  {priorityTask.description || 'This item is required by your target institution and consular regulations.'}
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link
                    to="/student/documents"
                    style={{
                      fontSize: '0.8125rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      backgroundColor: 'var(--action-primary, #245B42)',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      minHeight: '38px',
                    }}
                  >
                    <Upload size={14} aria-hidden={true} />
                    <span>Upload Required File</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleToggleTask(priorityTask.id)}
                    style={{
                      fontSize: '0.8125rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      backgroundColor: 'var(--surface-card, #FFFFFF)',
                      border: '1px solid var(--border-subtle, #E1E8DE)',
                      color: 'var(--color-foreground, #19261F)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      minHeight: '38px',
                    }}
                  >
                    <CheckSquare size={14} aria-hidden={true} />
                    <span>Mark Finished</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <CheckCircle2 size={36} style={{ color: 'var(--action-primary, #245B42)', margin: '0 auto 0.5rem' }} aria-hidden={true} />
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-foreground, #19261F)' }}>
                  All procedural tasks up to date!
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted, #58695E)', marginTop: '0.25rem' }}>
                  Your assigned adviser is tracking external university deadlines and portal queues.
                </div>
              </div>
            )}
          </section>

          {/* Card: Active University Applications */}
          <section
            style={{
              padding: '1.75rem',
              backgroundColor: 'var(--surface-card, #FFFFFF)',
              borderRadius: '24px',
              border: '1px solid var(--border-subtle, #E1E8DE)',
              boxShadow: 'var(--shadow-subtle, 0 1px 3px rgba(0, 0, 0, 0.04))',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-foreground, #19261F)', margin: 0 }}>
                  Active Applications ({applications.length})
                </h2>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted, #58695E)' }}>
                  Track admissions status across target European universities
                </span>
              </div>
              <Link
                to="/student/applications"
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--action-primary, #245B42)',
                  textDecoration: 'none',
                }}
              >
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
                      borderRadius: '16px',
                      backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                      border: '1px solid var(--border-subtle, #E1E8DE)',
                      textDecoration: 'none',
                      transition: 'all 150ms ease-out',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid var(--border-subtle, #E1E8DE)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: 'var(--action-primary, #245B42)',
                          flexShrink: 0,
                        }}
                        aria-hidden={true}
                      >
                        {(app.universitySnapshot?.name || 'UNI').slice(0, 3).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '0.9375rem',
                            fontWeight: 700,
                            color: 'var(--color-foreground, #19261F)',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {app.universitySnapshot?.name || 'University'}
                        </div>
                        <div
                          style={{
                            fontSize: '0.8125rem',
                            color: 'var(--color-foreground-muted, #58695E)',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {app.programSnapshot?.title || 'Degree Program'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.625rem',
                          borderRadius: '9999px',
                          textTransform: 'uppercase',
                          backgroundColor:
                            app.externalStatus === 'accepted_offer' || app.externalStatus === 'conditional_offer'
                              ? 'rgba(36, 91, 66, 0.12)'
                              : app.externalStatus === 'submitted' || app.externalStatus === 'awaiting_decision'
                              ? 'rgba(74, 108, 182, 0.12)'
                              : 'rgba(215, 238, 131, 0.4)',
                          color:
                            app.externalStatus === 'accepted_offer' || app.externalStatus === 'conditional_offer'
                              ? 'var(--action-primary, #245B42)'
                              : app.externalStatus === 'submitted' || app.externalStatus === 'awaiting_decision'
                              ? '#2B5797'
                              : '#19261F',
                          border: '1px solid currentColor',
                        }}
                      >
                        {app.externalStatus.replace(/_/g, ' ')}
                      </span>
                      <ChevronRight size={18} style={{ color: 'var(--color-foreground-muted, #58695E)' }} aria-hidden={true} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No active applications yet"
                description="Browse accredited European degree programs in the catalogue and select target institutions with your counsellor."
                actionLabel="Explore European Catalogue"
                onAction={() => window.location.assign('/student/explore')}
                imageSrc="/images/unilistics/empty_applications.webp"
                imageAlt="Empty applications illustration"
              />
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: Counsellor Note, Document Vault, Upcoming Deadlines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Card: Counsellor Quick Note */}
          <section
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--surface-card, #FFFFFF)',
              borderRadius: '24px',
              border: '1px solid var(--border-subtle, #E1E8DE)',
              boxShadow: 'var(--shadow-subtle, 0 1px 3px rgba(0, 0, 0, 0.04))',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={16} style={{ color: 'var(--action-primary, #245B42)' }} aria-hidden={true} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-foreground, #19261F)', margin: 0 }}>
                  Adviser Quick Note
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #58695E)' }}>
                {latestCounsellorNote ? 'Recent Guidance' : 'Case Thread'}
              </span>
            </div>

            {latestCounsellorNote ? (
              <div
                style={{
                  backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                  borderRadius: '16px',
                  padding: '1rem 1.125rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--action-primary, #245B42)', marginBottom: '0.35rem' }}>
                  From {latestCounsellorNote.senderName}:
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-foreground, #19261F)', fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>
                  "{latestCounsellorNote.messageBody || (latestCounsellorNote as any).content}"
                </p>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                  borderRadius: '16px',
                  padding: '1rem',
                  fontSize: '0.8125rem',
                  color: 'var(--color-foreground-muted, #58695E)',
                  marginBottom: '1rem',
                }}
              >
                No direct messages yet. Send an inquiry or clarification to your assigned adviser below.
              </div>
            )}

            <Link
              to="/student/messages"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                border: '1px solid var(--border-subtle, #E1E8DE)',
                color: 'var(--action-primary, #245B42)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                textDecoration: 'none',
                minHeight: '40px',
              }}
            >
              <Send size={14} aria-hidden={true} />
              <span>Open Case Messaging Room</span>
            </Link>
          </section>

          {/* Card: Document Vault / Recent Files */}
          <section
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--surface-card, #FFFFFF)',
              borderRadius: '24px',
              border: '1px solid var(--border-subtle, #E1E8DE)',
              boxShadow: 'var(--shadow-subtle, 0 1px 3px rgba(0, 0, 0, 0.04))',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-foreground, #19261F)', margin: 0 }}>
                  Recent Documents
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #58695E)' }}>
                  Verified Document Vault ({documents.length} Files)
                </span>
              </div>
              <Link
                to="/student/documents"
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--action-primary, #245B42)',
                  textDecoration: 'none',
                }}
              >
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
                      borderRadius: '12px',
                      backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                      border: '1px solid var(--border-subtle, #E1E8DE)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
                      <FileText size={16} style={{ color: 'var(--color-foreground-muted, #58695E)', flexShrink: 0 }} aria-hidden={true} />
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: 'var(--color-foreground, #19261F)',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {doc.documentType.replace('_', ' ').toUpperCase()}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-foreground-muted, #58695E)' }}>
                          {(doc.fileSizeBytes / 1024 / 1024).toFixed(1)} MB • {doc.fileName}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        textTransform: 'uppercase',
                        backgroundColor:
                          doc.quarantineStatus === 'approved' || doc.verificationStatus === 'verified'
                            ? 'rgba(36, 91, 66, 0.12)'
                            : doc.quarantineStatus === 'needs_replacement' || doc.verificationStatus === 'rejected'
                            ? 'rgba(220, 38, 38, 0.1)'
                            : 'rgba(74, 108, 182, 0.12)',
                        color:
                          doc.quarantineStatus === 'approved' || doc.verificationStatus === 'verified'
                            ? 'var(--action-primary, #245B42)'
                            : doc.quarantineStatus === 'needs_replacement' || doc.verificationStatus === 'rejected'
                            ? '#DC2626'
                            : '#2B5797',
                        flexShrink: 0,
                      }}
                    >
                      {(doc.quarantineStatus || doc.verificationStatus || 'pending').replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-foreground-muted, #58695E)', marginBottom: '0.75rem' }}>
                  No documents uploaded yet.
                </div>
                <Link
                  to="/student/documents"
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.4rem 0.875rem',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--action-primary, #245B42)',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Upload size={12} aria-hidden={true} />
                  <span>Upload First Document</span>
                </Link>
              </div>
            )}
          </section>

          {/* Card: Procedural Milestones & Deadlines */}
          <section
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--surface-card, #FFFFFF)',
              borderRadius: '24px',
              border: '1px solid var(--border-subtle, #E1E8DE)',
              boxShadow: 'var(--shadow-subtle, 0 1px 3px rgba(0, 0, 0, 0.04))',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} style={{ color: 'var(--action-primary, #245B42)' }} aria-hidden={true} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-foreground, #19261F)', margin: 0 }}>
                  Upcoming Deadlines
                </h3>
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-foreground-muted, #58695E)', textTransform: 'uppercase', fontWeight: 600 }}>
                Central CET Sync
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 0.875rem',
                  backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-foreground, #19261F)' }}>
                    German APS Verification
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-foreground-muted, #58695E)' }}>
                    Mandatory for German Student Visa
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--action-primary, #245B42)',
                  }}
                >
                  Active Queue
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 0.875rem',
                  backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-foreground, #19261F)' }}>
                    Italian Pre-Enrollment (Universitaly)
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-foreground-muted, #58695E)' }}>
                    Intake Window Closing
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#8A5A00',
                  }}
                >
                  Due 30 Nov
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default StudentOverviewPage;

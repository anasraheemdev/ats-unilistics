import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import {
  OperationalWorklistCategory,
  StudentCase,
} from '@/types';
import {
  Users,
  FileCheck2,
  Clock,
  Inbox,
  RefreshCw,
  ArrowRight,
  Search,
  Upload,
  Send,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StaffDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<OperationalWorklistCategory>('overdue_tasks');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [targetStage, setTargetStage] = useState<string>('stage_3_portal_submission');
  const [counsellorNote, setCounsellorNote] = useState<string>('');
  const [searchRoster, setSearchRoster] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Live operational metrics from real authorized query
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useQuery({
    queryKey: ['operational-workspace-metrics'],
    queryFn: () => api.operational.getMetrics(),
    refetchInterval: 15000,
  });

  // 2. Staff assigned cases for the candidate roster
  const {
    data: cases = [],
    isLoading: casesLoading,
    refetch: refetchCases,
  } = useQuery({
    queryKey: ['staff-assigned-cases'],
    queryFn: () => api.staff.getCases(),
  });

  // Select first case by default if none selected
  const activeSelectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  // Mutation: Quick Update Case Timeline Note
  const updateTimelineMutation = useMutation({
    mutationFn: async () => {
      if (!activeSelectedCase) throw new Error('No candidate case selected.');
      const noteContent = counsellorNote.trim()
        ? counsellorNote.trim()
        : `Admissions status progression: updated to ${targetStage.replace(/_/g, ' ')}.`;
      return api.staff.sendStaffNote(activeSelectedCase.id, noteContent);
    },
    onSuccess: () => {
      setFeedbackMsg({
        type: 'success',
        text: `Timeline milestone recorded for ${activeSelectedCase?.studentName || 'student'}. Recorded in audit history.`,
      });
      setCounsellorNote('');
      queryClient.invalidateQueries({ queryKey: ['staff-assigned-cases'] });
      queryClient.invalidateQueries({ queryKey: ['operational-workspace-metrics'] });
    },
    onError: (err: any) => {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Failed to record case timeline note.' });
    },
  });

  if (metricsLoading || casesLoading) {
    return <LoadingState message="Loading admissions operations queues..." />;
  }

  if (metricsError || !metrics) {
    return <ErrorState message="Could not load admissions metrics." onRetry={() => refetchMetrics()} />;
  }

  const isCounsellor = metrics.userRole === 'counsellor';

  const cards = [
    {
      category: 'requests_awaiting_review' as OperationalWorklistCategory,
      title: 'Requests Awaiting Review',
      count: metrics.requestsAwaitingReview,
      icon: Inbox,
      badge: 'Live Queue',
      color: '#B72301',
      visible: !isCounsellor,
    },
    {
      category: 'unassigned_cases' as OperationalWorklistCategory,
      title: 'Unassigned Active Cases',
      count: metrics.unassignedCases,
      icon: Users,
      badge: 'Unallocated',
      color: '#3B82F6',
      visible: !isCounsellor,
    },
    {
      category: 'overdue_tasks' as OperationalWorklistCategory,
      title: 'Overdue Action Tasks',
      count: metrics.overdueTasks,
      icon: Clock,
      badge: 'Urgent',
      color: '#F59E0B',
      visible: true,
    },
    {
      category: 'documents_awaiting_review' as OperationalWorklistCategory,
      title: 'Documents in Verifier',
      count: metrics.documentsAwaitingReview,
      icon: FileCheck2,
      badge: 'Vault Intake',
      color: '#10B981',
      visible: true,
    },
  ].filter((c) => c.visible);

  const filteredCases = cases.filter((c) => {
    if (!searchRoster.trim()) return true;
    const term = searchRoster.toLowerCase();
    return (
      c.studentName?.toLowerCase().includes(term) ||
      c.targetCountry?.toLowerCase().includes(term) ||
      c.id.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Workspace Header matching screen.png & screen(4).png */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '9999px',
                backgroundColor: '#FFEFEA',
                color: '#B72301',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Admissions Operations Hub
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
              • {isCounsellor ? 'Assigned Cases Queue' : 'Global Institutional Queue'}
            </span>
          </div>

          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--color-foreground)', margin: 0 }}>
            Counsellor Control Center
          </h1>
          <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.9375rem', marginTop: '0.25rem', marginBottom: 0 }}>
            {isCounsellor
              ? 'Real-time operational queue scoped strictly to your assigned student dossiers.'
              : 'Institutional admissions intake monitoring, milestone validation, and queue dispatch.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-pill"
            onClick={() => {
              refetchMetrics();
              refetchCases();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '8px 16px',
              fontSize: '0.8125rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #EBE6DE',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} /> Refresh Queues
          </button>

          <Link to="/staff/cases" style={{ textDecoration: 'none' }}>
            <button
              type="button"
              className="btn-pill-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '8px 18px',
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              Case Advisory Desk <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      </div>

      {feedbackMsg && (
        <Alert variant={feedbackMsg.type === 'success' ? 'success' : 'destructive'} title="Operational Notice">
          {feedbackMsg.text}
        </Alert>
      )}

      {/* 4 Top KPI Queue Cards matching screen.png & screen(4).png */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {cards.map((card) => {
          const Icon = card.icon;
          const isSelected = activeCategory === card.category;

          return (
            <div
              key={card.category}
              className="bento-card"
              onClick={() => setActiveCategory(card.category)}
              style={{
                padding: '1.5rem',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                border: isSelected ? `2px solid ${card.color}` : '1px solid #EBE6DE',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: '#F9F6F0',
                    color: card.color,
                  }}
                >
                  {card.badge}
                </span>
                <Icon size={18} style={{ color: card.color }} />
              </div>

              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-foreground)', lineHeight: 1 }}>
                {card.count}
              </div>

              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-foreground)' }}>
                {card.title}
              </div>

              {/* Progress bottom accent line */}
              <div
                style={{
                  height: '4px',
                  borderRadius: '9999px',
                  backgroundColor: card.color,
                  width: '40%',
                  marginTop: '0.25rem',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* 2-Column Responsive Roster & Update Panel matching screen.png & screen(4).png */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.5fr) minmax(320px, 1fr)',
          gap: '1.75rem',
          alignItems: 'start',
        }}
        className="staff-hub-grid"
      >
        {/* Left: Active Candidate Roster */}
        <div
          className="bento-card"
          style={{
            padding: '1.75rem',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-foreground)' }}>
                Active Candidate Roster
              </h2>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
                {filteredCases.length} assigned candidate dossiers in active cycle
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#F9F6F0',
                borderRadius: '9999px',
                padding: '4px 12px',
                border: '1px solid #EBE6DE',
                gap: '0.5rem',
              }}
            >
              <Search size={14} style={{ color: 'var(--color-foreground-muted)' }} />
              <input
                type="text"
                value={searchRoster}
                onChange={(e) => setSearchRoster(e.target.value)}
                placeholder="Search student, ID, country..."
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '0.8125rem',
                  outline: 'none',
                  width: '180px',
                }}
              />
            </div>
          </div>

          {filteredCases.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <Users size={36} style={{ color: 'var(--color-foreground-muted)', margin: '0 auto 0.5rem', opacity: 0.7 }} />
              <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.875rem' }}>
                No active student cases match the current filter.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredCases.map((c: StudentCase) => {
                const isSelected = activeSelectedCase?.id === c.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '16px',
                      backgroundColor: isSelected ? '#FFF5F2' : '#FDFBF7',
                      border: isSelected ? '2px solid #FF5733' : '1px solid #EBE6DE',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.625rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #EBE6DE',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.9375rem',
                            color: '#1A1A1A',
                          }}
                        >
                          {c.studentName ? c.studentName.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.9375rem', color: 'var(--color-foreground)' }}>
                            {c.studentName}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)', display: 'block' }}>
                            {c.targetCountry.toUpperCase()} • {c.targetDegree.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          backgroundColor: '#E0F2FE',
                          color: '#0369A1',
                        }}
                      >
                        {c.currentStage.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--color-foreground-muted)', borderTop: '1px solid #F0ECE4', paddingTop: '0.5rem' }}>
                      <span>Next: <strong>{c.nextRequiredAction || 'Dossier Review'}</strong></span>
                      <span style={{ color: '#B72301', fontWeight: 600 }}>Select for Update →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Update Application & Case Timeline matching screen.png & screen(4).png */}
        <div
          className="bento-card"
          style={{
            padding: '1.75rem',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            position: 'sticky',
            top: '5.5rem',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: '#FFEFEA',
                color: '#B72301',
                textTransform: 'uppercase',
              }}
            >
              Fast Action Terminal
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-foreground)', margin: '4px 0 0 0' }}>
              Update Case Timeline
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', margin: '2px 0 0 0' }}>
              Target: <strong>{activeSelectedCase?.studentName || 'Select a candidate'}</strong> (
              <code style={{ fontSize: '0.75rem' }}>{activeSelectedCase?.id ? `#${activeSelectedCase.id.slice(0, 8)}` : ''}</code>)
            </p>
          </div>

          {activeSelectedCase ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Admissions Lifecycle Stage Selector */}
              <div>
                <label
                  htmlFor="lifecycle-stage-select"
                  style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.375rem' }}
                >
                  Admissions Lifecycle Stage
                </label>
                <select
                  id="lifecycle-stage-select"
                  value={targetStage}
                  onChange={(e) => setTargetStage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: '1px solid #EBE6DE',
                    backgroundColor: '#F9F6F0',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="profile_shortlist">Stage 1: Profile & Shortlist Selection</option>
                  <option value="dossier_assembly">Stage 2: Document Prep & Attestation</option>
                  <option value="stage_3_portal_submission">Stage 3: University Portal Submission</option>
                  <option value="university_review">Stage 4: Awaiting University Decision</option>
                  <option value="visa_prep">Stage 5: Visa Documentation & Lodging</option>
                </select>
              </div>

              {/* Official Evidence Upload Dropzone */}
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.375rem' }}>
                  Official Evidence / Submission Confirmation
                </label>
                <div
                  style={{
                    padding: '1.25rem 1rem',
                    border: '2px dashed #E2DCD5',
                    borderRadius: '16px',
                    textAlign: 'center',
                    backgroundColor: '#FDFBF7',
                    cursor: 'pointer',
                  }}
                >
                  <Upload size={22} style={{ color: '#B72301', margin: '0 auto 0.25rem' }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block' }}>
                    Upload Confirmation Slip or SWIFT Receipt
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-foreground-muted)' }}>
                    Drag & drop PDF or screenshot (Max 15MB)
                  </span>
                </div>
              </div>

              {/* Counsellor Narrative Notes */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                  <label htmlFor="counsellor-narrative" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                    Counsellor Narrative &amp; Portal Notes
                  </label>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-foreground-muted)' }}>
                    Student will see this
                  </span>
                </div>
                <textarea
                  id="counsellor-narrative"
                  value={counsellorNote}
                  onChange={(e) => setCounsellorNote(e.target.value)}
                  placeholder="e.g. Application submitted via direct institutional portal. Reference #UNI-8492. Awaiting faculty evaluation."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: '1px solid #EBE6DE',
                    backgroundColor: '#F9F6F0',
                    fontSize: '0.8125rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Publish Button matching screen(4).png */}
              <button
                type="button"
                onClick={() => updateTimelineMutation.mutate()}
                disabled={updateTimelineMutation.isPending}
                className="btn-pill-primary"
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  fontSize: '0.9375rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: updateTimelineMutation.isPending ? 'not-allowed' : 'pointer',
                }}
              >
                <Send size={16} />
                {updateTimelineMutation.isPending ? 'Publishing...' : 'Publish Timeline Update & Notify Student'}
              </button>
            </div>
          ) : (
            <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.8125rem' }}>
              Please select a candidate case from the roster to update their timeline.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

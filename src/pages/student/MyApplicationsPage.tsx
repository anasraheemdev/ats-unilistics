import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { Application } from '@/types';
import { Link } from 'react-router-dom';
import {
  ExternalLink,
  Clock,
  ShieldCheck,
  History,
  FileCheck,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Upload,
  MessageSquare,
  Calendar,
} from 'lucide-react';

export const MyApplicationsPage: React.FC = () => {
  const [expandedHistoryAppId, setExpandedHistoryAppId] = useState<string | null>(null);

  // Fetch student profile for authentic greeting
  const { data: userProfile } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: () => api.auth.getCurrentUser(),
  });

  // Fetch applications
  const {
    data: applications = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['student-target-applications'],
    queryFn: () => api.student.getApplications(),
  });

  // Fetch case for counsellor details
  const { data: studentCase } = useQuery({
    queryKey: ['student-overview-case'],
    queryFn: () => api.student.getOverviewCase(),
  });

  const toggleHistory = (appId: string) => {
    setExpandedHistoryAppId((prev) => (prev === appId ? null : appId));
  };

  const studentFirstName = userProfile?.fullName ? userProfile.fullName.split(' ')[0] : 'Scholar';
  const counsellorName = studentCase?.assignedCounsellorName || 'Assigned Counsellor';

  if (isLoading) {
    return <LoadingState message="Loading your university applications..." />;
  }

  if (error) {
    return <ErrorState message="Could not load your applications." onRetry={() => refetch()} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner matching screen(6).png */}
      <div
        className="bento-card"
        style={{
          padding: '2rem',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '9999px',
                backgroundColor: '#FFEFEA',
                color: '#B72301',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#B72301' }} />
              Active Intake Cycle
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
              Updated recently
            </span>
          </div>

          <span style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
            Adviser: <strong style={{ color: 'var(--color-foreground)' }}>{counsellorName}</strong>
          </span>
        </div>

        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--color-foreground)', margin: 0 }}>
            Good day, {studentFirstName}
          </h1>
          <p style={{ color: 'var(--color-foreground-muted)', fontSize: '1rem', marginTop: '0.375rem', marginBottom: 0 }}>
            {applications.length > 0
              ? `Tracking ${applications.length} active university ${applications.length === 1 ? 'admission' : 'admissions'} and visa milestone journeys.`
              : 'Your study preferences are recorded. Your assigned counsellor will assemble target applications here.'}
          </p>
        </div>

        {/* Quick Action Pills matching screen(6).png */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/student/documents" style={{ textDecoration: 'none' }}>
            <button
              type="button"
              className="btn-pill-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '8px 18px',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              <Upload size={16} /> Upload Document
            </button>
          </Link>

          <Link to="/student/messages" style={{ textDecoration: 'none' }}>
            <button
              type="button"
              className="btn-pill"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '8px 18px',
                fontSize: '0.875rem',
                backgroundColor: '#F9F6F0',
                color: 'var(--color-foreground)',
                cursor: 'pointer',
                border: '1px solid #EBE6DE',
              }}
            >
              <MessageSquare size={16} /> Contact {counsellorName.split(' ')[0]}
            </button>
          </Link>

          <Link to="/student/tasks" style={{ textDecoration: 'none' }}>
            <button
              type="button"
              className="btn-pill"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '8px 18px',
                fontSize: '0.875rem',
                backgroundColor: '#F9F6F0',
                color: 'var(--color-foreground)',
                cursor: 'pointer',
                border: '1px solid #EBE6DE',
              }}
            >
              <Calendar size={16} /> Action Deadlines
            </button>
          </Link>
        </div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <EmptyState
          imageSrc="/images/unilistics/empty_applications.webp"
          title="No target applications yet"
          description="Your dedicated educational counsellor will curate your university applications based on your verified transcripts and country preferences."
          actionLabel="Explore European Degree Programs"
          actionLink="/student/explore"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {applications.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              counsellorName={counsellorName}
              isHistoryExpanded={expandedHistoryAppId === app.id}
              onToggleHistory={() => toggleHistory(app.id)}
            />
          ))}
        </div>
      )}

      {/* Advisory Question Callout matching screen(6).png */}
      <div
        className="bento-card"
        style={{
          padding: '1.5rem 2rem',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#FFEFEA',
              color: '#B72301',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <MessageSquare size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-foreground)' }}>
              Have questions on conditional terms or visa requirements?
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', margin: '0.25rem 0 0 0' }}>
              Coordinate directly with your advisory team to review offer letters and visa appointment slots.
            </p>
          </div>
        </div>

        <Link to="/student/messages" style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="md">
            Message Advisory Team
          </Button>
        </Link>
      </div>
    </div>
  );
};

interface ApplicationCardProps {
  application: Application;
  counsellorName: string;
  isHistoryExpanded: boolean;
  onToggleHistory: () => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  counsellorName,
  isHistoryExpanded,
  onToggleHistory,
}) => {
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['application-history', application.id],
    queryFn: () => api.student.getApplicationHistory(application.id),
    enabled: isHistoryExpanded,
  });

  // Calculate simulated stage index for the milestone journey (1 to 5)
  let activeStep = 3;
  if (application.externalStatus === 'not_submitted' || application.dossierReviewStatus === 'pending_documents') {
    activeStep = 1;
  } else if (application.dossierReviewStatus === 'under_counsellor_review' || application.dossierReviewStatus === 'revision_requested') {
    activeStep = 2;
  } else if (application.externalStatus === 'submitted' || application.externalStatus === 'awaiting_decision') {
    activeStep = 3;
  } else if (application.externalStatus === 'conditional_offer' || application.externalStatus === 'unconditional_offer' || application.externalStatus === 'accepted_offer') {
    activeStep = 4;
  } else if (application.externalStatus === 'visa_processing' || application.externalStatus === 'visa_approved') {
    activeStep = 5;
  }

  return (
    <div
      className="bento-card"
      style={{
        padding: '2rem',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* Header matching screen(6).png */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: '#F9F6F0',
              border: '1px solid #EBE6DE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.125rem',
              color: '#1A1A1A',
              flexShrink: 0,
            }}
          >
            {application.universitySnapshot.name.slice(0, 2).toUpperCase()}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: '#E0F2FE',
                  color: '#0369A1',
                }}
              >
                Stage {activeStep}: {activeStep === 3 ? 'University Submission' : activeStep === 2 ? 'Document Prep' : activeStep === 4 ? 'Offer & Decision' : 'Visa Filing'}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: '#F9F6F0',
                  color: 'var(--color-foreground-muted)',
                }}
              >
                {application.universitySnapshot.country?.toUpperCase()}
              </span>
            </div>

            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-foreground)', margin: 0 }}>
              {application.universitySnapshot.name}
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--color-foreground-muted)', margin: '2px 0 0 0' }}>
              {application.programSnapshot.title} • {application.programSnapshot.degree_level?.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Portal Reference badge */}
        <div style={{ textAlign: 'right' }}>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>
            Official Dossier Ref
          </span>
          <span style={{ fontSize: '0.9375rem', fontWeight: 700, fontFamily: 'var(--font-family-mono)', color: 'var(--color-foreground)' }}>
            {application.portalApplicationNumber || 'EDIN-PG-99214'}
          </span>
        </div>
      </div>

      {/* Application Progress Bar */}
      <div
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#FDFBF7',
          borderRadius: '16px',
          border: '1px solid #F0ECE4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <CheckCircle size={18} style={{ color: '#065F46' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-foreground)' }}>
            Application Progress
          </span>
        </div>
        <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-foreground)' }}>
          {activeStep} of 5 milestones completed
        </span>
      </div>

      {/* Next Action Required Box matching screen(6).png */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#92400E' }}>
            Next Action Required
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '9999px',
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Clock size={13} /> Due {new Date(application.submissionDeadline).toLocaleDateString()}
          </span>
        </div>

        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-foreground)', margin: 0 }}>
          {application.nextAction || 'Upload Certified Transcripts & Verify Attestation'}
        </h4>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
            Assigned by {counsellorName}
          </span>
          <Link to="/student/documents" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#B72301', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              Complete Action →
            </span>
          </Link>
        </div>
      </div>

      {/* Milestones & Journey (Vertical timeline matching screen(6).png) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-foreground)', margin: 0 }}>
            Milestones & Journey
          </h3>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0369A1' }}>
            Step {activeStep} active
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', position: 'relative' }}>
          {/* Milestone 1 */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              padding: '1rem',
              borderRadius: '16px',
              backgroundColor: activeStep >= 1 ? '#FFFFFF' : '#F9F6F0',
              border: '1px solid #EBE6DE',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: activeStep > 1 ? '#E8F8F2' : '#FFEFEA',
                color: activeStep > 1 ? '#065F46' : '#B72301',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px',
              }}
            >
              {activeStep > 1 ? <CheckCircle size={16} /> : <Clock size={16} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.9375rem', color: 'var(--color-foreground)' }}>
                  Profile & Shortlist Selection
                </strong>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#065F46' }}>
                  Approved
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', margin: '4px 0 0 0' }}>
                Academic profile verified and initial 4-university tier list locked.
              </p>
            </div>
          </div>

          {/* Milestone 2 */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              padding: '1rem',
              borderRadius: '16px',
              backgroundColor: activeStep >= 2 ? '#FFFFFF' : '#F9F6F0',
              border: '1px solid #EBE6DE',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: activeStep > 2 ? '#E8F8F2' : activeStep === 2 ? '#FFEFEA' : '#F3F4F6',
                color: activeStep > 2 ? '#065F46' : activeStep === 2 ? '#B72301' : '#9CA3AF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px',
              }}
            >
              {activeStep > 2 ? <CheckCircle size={16} /> : <FileCheck size={16} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.9375rem', color: 'var(--color-foreground)' }}>
                  Document Preparation & Attestation
                </strong>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: activeStep > 2 ? '#065F46' : '#92400E' }}>
                  {activeStep > 2 ? 'Verified' : 'In Progress'}
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', margin: '4px 0 0 0' }}>
                Transcripts, Statement of Purpose, and language verification bundle validated.
              </p>
            </div>
          </div>

          {/* Milestone 3 */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              padding: '1rem',
              borderRadius: '16px',
              backgroundColor: activeStep === 3 ? '#FFF5F2' : activeStep > 3 ? '#FFFFFF' : '#F9F6F0',
              border: activeStep === 3 ? '1px solid #FFD9CF' : '1px solid #EBE6DE',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: activeStep === 3 ? '#B72301' : activeStep > 3 ? '#E8F8F2' : '#F3F4F6',
                color: activeStep === 3 ? '#FFFFFF' : activeStep > 3 ? '#065F46' : '#9CA3AF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px',
              }}
            >
              {activeStep > 3 ? <CheckCircle size={16} /> : <Clock size={16} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.9375rem', color: 'var(--color-foreground)' }}>
                  University Portal Submission
                </strong>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: activeStep === 3 ? '#B72301' : '#F9F6F0',
                    color: activeStep === 3 ? '#FFFFFF' : 'var(--color-foreground-muted)',
                  }}
                >
                  {activeStep === 3 ? 'Active Stage' : activeStep > 3 ? 'Submitted' : 'Pending'}
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', margin: '4px 0 0 0' }}>
                Submitted on official institutional portal. Portal Ref: {application.portalApplicationNumber || 'EDIN-PG-99214'}
              </p>
            </div>
          </div>

          {/* Milestone 4 */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              padding: '1rem',
              borderRadius: '16px',
              backgroundColor: activeStep === 4 ? '#FFF5F2' : activeStep > 4 ? '#FFFFFF' : '#F9F6F0',
              border: '1px solid #EBE6DE',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: activeStep > 4 ? '#E8F8F2' : '#F3F4F6',
                color: activeStep > 4 ? '#065F46' : '#9CA3AF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px',
              }}
            >
              <Clock size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.9375rem', color: 'var(--color-foreground)' }}>
                  Awaiting University Decision / Conditional Offer
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>
                  {activeStep >= 4 ? 'Decision Arrived' : 'Expected: 4–6 weeks'}
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', margin: '4px 0 0 0' }}>
                {application.offerConditions || 'Faculty admission committee evaluation window underway.'}
              </p>
            </div>
          </div>

          {/* Milestone 5 */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              padding: '1rem',
              borderRadius: '16px',
              backgroundColor: '#F9F6F0',
              border: '1px solid #EBE6DE',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#F3F4F6',
                color: '#9CA3AF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px',
              }}
            >
              <ShieldCheck size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.9375rem', color: 'var(--color-foreground)' }}>
                  Visa Documentation & Embassy Lodging
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>
                  Upcoming
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', margin: '4px 0 0 0' }}>
                Unlocks automatically upon admission confirmation and financial guarantee issuance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* History toggle & footer actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #EBE6DE' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {application.portalUrl && (
            <a
              href={application.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Button variant="outline" size="sm" leftIcon={<ExternalLink size={14} />}>
                Official Portal Link
              </Button>
            </a>
          )}

          <Link to="/student/documents" style={{ textDecoration: 'none' }}>
            <Button variant="ghost" size="sm" leftIcon={<FileCheck size={14} />}>
              View Dossier Files
            </Button>
          </Link>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onToggleHistory}
          leftIcon={<History size={14} />}
          rightIcon={isHistoryExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        >
          {isHistoryExpanded ? 'Hide Full Audit Trail' : 'View Audit Trail'}
        </Button>
      </div>

      {/* Chronological History Drawer */}
      {isHistoryExpanded && (
        <div
          style={{
            marginTop: '0.5rem',
            padding: '1.25rem',
            borderRadius: '16px',
            backgroundColor: '#F9F6F0',
            border: '1px solid #EBE6DE',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, margin: 0 }}>Audited Timeline Records</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>
              Verified counsellor-recorded timeline
            </span>
          </div>

          {historyLoading ? (
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>Loading history records...</p>
          ) : !history || history.length === 0 ? (
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>No historical transitions recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {history.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    fontSize: '0.8125rem',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid #E2DCD5',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#B72301',
                      marginTop: '6px',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>
                        {item.eventType === 'created'
                          ? 'Application Initialized'
                          : item.eventType === 'correction'
                          ? 'Authorised Record Correction'
                          : item.eventType === 'external_report'
                          ? 'External Institutional Submission'
                          : `Status Transition: ${item.toStatus?.replace(/_/g, ' ').toUpperCase()}`}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>
                        {new Date(item.reportedAt).toLocaleString()}
                      </span>
                    </div>
                    {item.reason && (
                      <p style={{ margin: '0.25rem 0', color: 'var(--color-foreground)' }}>
                        {item.reason}
                      </p>
                    )}
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>
                      Recorded by: {item.actorName} ({item.actorRole})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

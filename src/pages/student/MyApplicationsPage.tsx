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
  Map as MapIcon,
  ArrowRight,
} from 'lucide-react';
import { StudentJourneyNav } from '@/components/layout/StudentJourneyNav';

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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        fontFamily: 'var(--font-family-base, "DM Sans", sans-serif)',
      }}
    >
      <StudentJourneyNav />

      {/* Top Banner with DESIGN_SYSTEM_V2 styling */}
      <div
        className="bento-card"
        style={{
          padding: '2rem',
          backgroundColor: 'var(--surface-card, #FFFFFF)',
          borderRadius: '24px',
          border: '1px solid var(--border-subtle, #E1E8DE)',
          boxShadow: 'var(--shadow-subtle, 0 1px 3px rgba(0, 0, 0, 0.04))',
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
                backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                color: 'var(--action-primary, #245B42)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                border: '1px solid var(--border-subtle, #E1E8DE)',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--action-primary, #245B42)' }} />
              Active Admissions Cycle
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted, #58695E)' }}>
              Updated recently
            </span>
          </div>

          <span style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted, #58695E)' }}>
            Adviser: <strong style={{ color: 'var(--color-foreground, #19261F)' }}>{counsellorName}</strong>
          </span>
        </div>

        <div>
          <h1
            style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--color-foreground, #19261F)',
              margin: 0,
            }}
          >
            Good day, {studentFirstName}
          </h1>
          <p style={{ color: 'var(--color-foreground-muted, #58695E)', fontSize: '1rem', marginTop: '0.375rem', marginBottom: 0 }}>
            {applications.length > 0
              ? `Tracking ${applications.length} active university ${applications.length === 1 ? 'admission' : 'admissions'} and visa milestone journeys.`
              : 'Your study preferences are recorded. Your assigned counsellor will assemble target applications here.'}
          </p>
        </div>

        {/* Action Controls including direct Journey Map link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/student/journey" style={{ textDecoration: 'none' }}>
            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.25rem',
                borderRadius: 'var(--radius-pill, 9999px)',
                fontSize: '0.875rem',
                fontWeight: 700,
                backgroundColor: 'var(--brand-citron, #D7EE83)',
                color: '#19261F',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 150ms ease-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-citron-hover, #C8E26C)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--brand-citron, #D7EE83)';
              }}
            >
              <MapIcon size={16} />
              <span>Interactive Journey Map</span>
              <ArrowRight size={14} />
            </button>
          </Link>

          <Link to="/student/documents" style={{ textDecoration: 'none' }}>
            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.25rem',
                borderRadius: 'var(--radius-pill, 9999px)',
                fontSize: '0.875rem',
                fontWeight: 600,
                backgroundColor: 'var(--action-primary, #245B42)',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Upload size={16} /> Upload Document
            </button>
          </Link>

          <Link to="/student/messages" style={{ textDecoration: 'none' }}>
            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.25rem',
                borderRadius: 'var(--radius-pill, 9999px)',
                fontSize: '0.875rem',
                fontWeight: 600,
                backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                color: 'var(--color-foreground, #19261F)',
                border: '1px solid var(--border-subtle, #E1E8DE)',
                cursor: 'pointer',
              }}
            >
              <MessageSquare size={16} /> Contact {counsellorName.split(' ')[0]}
            </button>
          </Link>

          <Link to="/student/tasks" style={{ textDecoration: 'none' }}>
            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.25rem',
                borderRadius: 'var(--radius-pill, 9999px)',
                fontSize: '0.875rem',
                fontWeight: 600,
                backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                color: 'var(--color-foreground, #19261F)',
                border: '1px solid var(--border-subtle, #E1E8DE)',
                cursor: 'pointer',
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

      {/* Advisory Question Callout */}
      <div
        className="bento-card"
        style={{
          padding: '1.5rem 2rem',
          backgroundColor: 'var(--surface-card, #FFFFFF)',
          borderRadius: '24px',
          border: '1px solid var(--border-subtle, #E1E8DE)',
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
              backgroundColor: 'var(--surface-recessed, #EDF2E9)',
              color: 'var(--action-primary, #245B42)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <MessageSquare size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-foreground, #19261F)' }}>
              Have questions on conditional terms or visa requirements?
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted, #58695E)', margin: '0.25rem 0 0 0' }}>
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
  } else if (
    application.externalStatus === 'conditional_offer' ||
    application.externalStatus === 'unconditional_offer' ||
    application.externalStatus === 'accepted_offer'
  ) {
    activeStep = 4;
  } else if (application.externalStatus === 'visa_processing' || application.externalStatus === 'visa_approved') {
    activeStep = 5;
  }

  return (
    <div
      className="bento-card"
      style={{
        padding: '2rem',
        backgroundColor: 'var(--surface-card, #FFFFFF)',
        borderRadius: '24px',
        border: '1px solid var(--border-subtle, #E1E8DE)',
        boxShadow: 'var(--shadow-subtle, 0 1px 3px rgba(0, 0, 0, 0.04))',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'var(--surface-recessed, #EDF2E9)',
              border: '1px solid var(--border-subtle, #E1E8DE)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.125rem',
              color: 'var(--action-primary, #245B42)',
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
                  backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                  color: 'var(--action-primary, #245B42)',
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
                  backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                  color: 'var(--color-foreground-muted, #58695E)',
                }}
              >
                {application.universitySnapshot.country?.toUpperCase()}
              </span>
            </div>

            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-foreground, #19261F)', margin: 0 }}>
              {application.universitySnapshot.name}
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--color-foreground-muted, #58695E)', margin: '2px 0 0 0' }}>
              {application.programSnapshot.title} • {application.programSnapshot.degree_level?.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Portal Reference and Map action */}
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-foreground-muted, #58695E)' }}>
              Official Dossier Ref
            </span>
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-foreground, #19261F)' }}>
              {application.portalApplicationNumber || 'EDIN-PG-99214'}
            </span>
          </div>

          <Link to={`/student/applications/${application.id}`} style={{ textDecoration: 'none' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--action-primary, #245B42)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              Full Details <ArrowRight size={12} />
            </span>
          </Link>
        </div>
      </div>

      {/* Application Progress Bar */}
      <div
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--surface-recessed, #EDF2E9)',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle, #E1E8DE)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <CheckCircle size={18} style={{ color: 'var(--action-primary, #245B42)' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-foreground, #19261F)' }}>
            Application Progress
          </span>
        </div>
        <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--action-primary, #245B42)' }}>
          {activeStep} of 5 milestones completed
        </span>
      </div>

      {/* Next Action Required Box */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: 'rgba(215, 238, 131, 0.12)',
          border: '1px solid rgba(215, 238, 131, 0.35)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--action-primary, #245B42)' }}>
            Next Action Required
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(215, 238, 131, 0.25)',
              color: 'var(--action-primary, #245B42)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Clock size={13} /> Due {new Date(application.submissionDeadline).toLocaleDateString()}
          </span>
        </div>

        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-foreground, #19261F)', margin: 0 }}>
          {application.nextAction || 'Upload Certified Transcripts & Verify Attestation'}
        </h4>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted, #58695E)' }}>
            Assigned by {counsellorName}
          </span>
          <Link to="/student/documents" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--action-primary, #245B42)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              Complete Action →
            </span>
          </Link>
        </div>
      </div>

      {/* Milestones & Journey */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-foreground, #19261F)', margin: 0 }}>
            Milestones & Journey
          </h3>
          <Link to="/student/journey" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--action-primary, #245B42)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <MapIcon size={14} /> Open in Map View
            </span>
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', position: 'relative' }}>
          {/* Milestone 1 */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              padding: '1rem',
              borderRadius: '16px',
              backgroundColor: activeStep >= 1 ? 'var(--surface-card, #FFFFFF)' : 'var(--surface-recessed, #EDF2E9)',
              border: '1px solid var(--border-subtle, #E1E8DE)',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: activeStep > 1 ? 'var(--brand-citron, #D7EE83)' : 'var(--action-primary, #245B42)',
                color: activeStep > 1 ? '#19261F' : '#FFFFFF',
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
                <strong style={{ fontSize: '0.9375rem', color: 'var(--color-foreground, #19261F)' }}>
                  Profile & Shortlist Selection
                </strong>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--action-primary, #245B42)' }}>
                  Approved
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted, #58695E)', margin: '4px 0 0 0' }}>
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
              backgroundColor: activeStep >= 2 ? 'var(--surface-card, #FFFFFF)' : 'var(--surface-recessed, #EDF2E9)',
              border: '1px solid var(--border-subtle, #E1E8DE)',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: activeStep > 2 ? 'var(--brand-citron, #D7EE83)' : activeStep === 2 ? 'var(--action-primary, #245B42)' : 'var(--surface-recessed, #EDF2E9)',
                color: activeStep > 2 ? '#19261F' : activeStep === 2 ? '#FFFFFF' : '#8DA394',
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
                <strong style={{ fontSize: '0.9375rem', color: 'var(--color-foreground, #19261F)' }}>
                  Document Preparation & Attestation
                </strong>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: activeStep > 2 ? 'var(--action-primary, #245B42)' : '#B45309' }}>
                  {activeStep > 2 ? 'Verified' : 'In Progress'}
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted, #58695E)', margin: '4px 0 0 0' }}>
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
              backgroundColor: activeStep === 3 ? 'var(--surface-recessed, #EDF2E9)' : activeStep > 3 ? 'var(--surface-card, #FFFFFF)' : 'var(--surface-recessed, #EDF2E9)',
              border: activeStep === 3 ? '1px solid var(--action-primary, #245B42)' : '1px solid var(--border-subtle, #E1E8DE)',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: activeStep === 3 ? 'var(--action-primary, #245B42)' : activeStep > 3 ? 'var(--brand-citron, #D7EE83)' : 'var(--surface-recessed, #EDF2E9)',
                color: activeStep === 3 ? '#FFFFFF' : activeStep > 3 ? '#19261F' : '#8DA394',
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
                <strong style={{ fontSize: '0.9375rem', color: 'var(--color-foreground, #19261F)' }}>
                  University Portal Submission
                </strong>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: activeStep === 3 ? 'var(--action-primary, #245B42)' : 'var(--surface-recessed, #EDF2E9)',
                    color: activeStep === 3 ? '#FFFFFF' : 'var(--color-foreground-muted, #58695E)',
                  }}
                >
                  {activeStep === 3 ? 'Active Stage' : activeStep > 3 ? 'Submitted' : 'Pending'}
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted, #58695E)', margin: '4px 0 0 0' }}>
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
              backgroundColor: activeStep === 4 ? 'var(--surface-recessed, #EDF2E9)' : activeStep > 4 ? 'var(--surface-card, #FFFFFF)' : 'var(--surface-recessed, #EDF2E9)',
              border: '1px solid var(--border-subtle, #E1E8DE)',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: activeStep > 4 ? 'var(--brand-citron, #D7EE83)' : '#E2E8F0',
                color: activeStep > 4 ? '#19261F' : '#64748B',
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
                <strong style={{ fontSize: '0.9375rem', color: 'var(--color-foreground, #19261F)' }}>
                  Awaiting University Decision / Conditional Offer
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #58695E)' }}>
                  {activeStep >= 4 ? 'Decision Arrived' : 'Expected: 4–6 weeks'}
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted, #58695E)', margin: '4px 0 0 0' }}>
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
              backgroundColor: 'var(--surface-recessed, #EDF2E9)',
              border: '1px solid var(--border-subtle, #E1E8DE)',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#E2E8F0',
                color: '#64748B',
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
                <strong style={{ fontSize: '0.9375rem', color: 'var(--color-foreground, #19261F)' }}>
                  Visa Documentation & Embassy Lodging
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #58695E)' }}>
                  Upcoming
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted, #58695E)', margin: '4px 0 0 0' }}>
                Unlocks automatically upon admission confirmation and financial guarantee issuance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* History toggle & footer actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle, #E1E8DE)' }}>
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
            backgroundColor: 'var(--surface-recessed, #EDF2E9)',
            border: '1px solid var(--border-subtle, #E1E8DE)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, margin: 0, color: 'var(--color-foreground, #19261F)' }}>Audited Timeline Records</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #58695E)' }}>
              Verified counsellor-recorded timeline
            </span>
          </div>

          {historyLoading ? (
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted, #58695E)' }}>Loading history records...</p>
          ) : !history || history.length === 0 ? (
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted, #58695E)' }}>No historical transitions recorded yet.</p>
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
                    borderBottom: '1px solid var(--border-subtle, #E1E8DE)',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--action-primary, #245B42)',
                      marginTop: '6px',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: 'var(--color-foreground, #19261F)' }}>
                        {item.eventType === 'created'
                          ? 'Application Initialized'
                          : item.eventType === 'correction'
                          ? 'Authorised Record Correction'
                          : item.eventType === 'external_report'
                          ? 'External Institutional Submission'
                          : `Status Transition: ${item.toStatus?.replace(/_/g, ' ').toUpperCase()}`}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #58695E)' }}>
                        {new Date(item.reportedAt).toLocaleString()}
                      </span>
                    </div>
                    {item.reason && (
                      <p style={{ margin: '0.25rem 0', color: 'var(--color-foreground, #19261F)' }}>
                        {item.reason}
                      </p>
                    )}
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #58695E)' }}>
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

export default MyApplicationsPage;

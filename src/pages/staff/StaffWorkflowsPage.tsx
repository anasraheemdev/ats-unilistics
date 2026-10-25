import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/common/LoadingState';
import { api } from '@/lib/api';
import {
  WorkflowTemplate,
  WorkflowStep,
  PublicationStatus,
  UserProfile,
  WorkflowMigrationPreview,
} from '@/types';
import {
  GitBranch,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  FileText,
  History,
  RefreshCw,
  Sliders,
} from 'lucide-react';

const COUNTRY_OPTIONS = [
  { value: 'all', label: 'All Countries' },
  { value: 'de', label: '🇩🇪 Germany' },
  { value: 'it', label: '🇮🇹 Italy' },
  { value: 'fr', label: '🇫🇷 France' },
  { value: 'ro', label: '🇷🇴 Romania' },
];

const OUTCOME_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  academic_admission: { label: 'University Admission', color: '#0284c7' },
  visa_processing: { label: 'Visa & Consular', color: '#7c3aed' },
  scholarship: { label: 'Scholarship / DSU', color: '#16a34a' },
  attestation: { label: 'Document Attestation', color: '#ea580c' },
};

export const StaffWorkflowsPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedDegree, setSelectedDegree] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [templateSteps, setTemplateSteps] = useState<WorkflowStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSteps, setIsLoadingSteps] = useState(false);

  // Notifications
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Review & Publish Modal
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [targetPublicationStatus, setTargetPublicationStatus] = useState<PublicationStatus>('published');
  const [auditSummary, setAuditSummary] = useState('');
  const [disclaimerConfirmed, setDisclaimerConfirmed] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Preview Migration Modal
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
  const [migrationPreview, setMigrationPreview] = useState<WorkflowMigrationPreview | null>(null);
  const [isLoadingMigration, setIsLoadingMigration] = useState(false);

  // Case Step Simulator Modal
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simStepKey, setSimStepKey] = useState<string>('');
  const [simStatus, setSimStatus] = useState<string>('completed');
  const [simReason, setSimReason] = useState<string>('');
  const [simFeedback, setSimFeedback] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

  useEffect(() => {
    loadUserAndTemplates();
  }, [selectedCountry, selectedDegree]);

  const loadUserAndTemplates = async () => {
    setIsLoading(true);
    setFeedbackError(null);
    try {
      const user = await api.auth.getCurrentUser();
      setCurrentUser(user);

      const countryFilter = selectedCountry === 'all' ? undefined : selectedCountry;
      const degreeFilter = selectedDegree === 'all' ? undefined : selectedDegree;
      const data = await api.workflows.getTemplates({
        country: countryFilter,
        degreeLevel: degreeFilter,
      });
      setTemplates(data);

      if (data.length > 0) {
        const toSelect = selectedTemplate && data.some((t) => t.id === selectedTemplate.id)
          ? selectedTemplate
          : data[0];
        handleSelectTemplate(toSelect);
      } else {
        setSelectedTemplate(null);
        setTemplateSteps([]);
      }
    } catch (err: any) {
      setFeedbackError(err.message || 'Failed to load workflow templates.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = async (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setIsLoadingSteps(true);
    try {
      const details = await api.workflows.getTemplateDetails(template.id);
      setTemplateSteps(details.steps);
    } catch (err: any) {
      setFeedbackError(err.message || 'Failed to load template steps.');
    } finally {
      setIsLoadingSteps(false);
    }
  };

  const handleOpenPublishModal = (status: PublicationStatus) => {
    setTargetPublicationStatus(status);
    setAuditSummary('');
    setDisclaimerConfirmed(false);
    setIsPublishModalOpen(true);
  };

  const handleConfirmPublish = async () => {
    if (!selectedTemplate) return;
    if (targetPublicationStatus === 'published' && !disclaimerConfirmed) {
      setFeedbackError('You must confirm the official verification disclaimer before publishing.');
      return;
    }
    if (!auditSummary.trim()) {
      setFeedbackError('An audit summary explaining this publication action is mandatory.');
      return;
    }

    setIsPublishing(true);
    setFeedbackError(null);
    try {
      await api.workflows.updateTemplatePublicationStatus(
        selectedTemplate.id,
        targetPublicationStatus,
        auditSummary
      );

      setFeedbackSuccess(
        `Template "${selectedTemplate.name}" successfully updated to ${targetPublicationStatus.toUpperCase()}.`
      );
      setIsPublishModalOpen(false);
      loadUserAndTemplates();
    } catch (err: any) {
      setFeedbackError(err.message || 'Failed to update publication status.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleOpenMigrationPreview = async () => {
    if (!selectedTemplate) return;
    setIsLoadingMigration(true);
    setIsMigrationModalOpen(true);
    try {
      const preview = await api.workflows.previewWorkflowMigration('demo-case-1', 'ver-target');
      setMigrationPreview(preview);
    } catch (err: any) {
      setFeedbackError(err.message || 'Failed to generate migration preview.');
    } finally {
      setIsLoadingMigration(false);
    }
  };

  const handleSimulateStepTransition = async () => {
    if ((simStatus === 'not_applicable' || simStatus === 'reopened') && (!simReason || simReason.trim().length < 5)) {
      setSimFeedback('Transition rejected: Reasons for not-applicable or reopened states must be at least 5 characters long.');
      return;
    }

    try {
      await api.workflows.transitionCaseStepStatus(
        'simulated-case-step-id',
        simStatus as any,
        simReason
      );
      setSimFeedback(`Step "${simStepKey}" simulated transition to "${simStatus}" passed validation!`);
    } catch (err: any) {
      setSimFeedback(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Header & Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                display: 'inline-flex',
                padding: '0.375rem',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <GitBranch size={22} aria-hidden="true" />
            </span>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>
              Country Workflow Templates
            </h1>
          </div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9375rem', maxWidth: '820px' }}>
            Editable candidate routes for European higher education. Every template models procedural candidate steps,
            dependencies, parallel tasks, and source provenance. Templates default to <strong>Draft</strong> and require
            authorized staff review before publication.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="outline"
            onClick={loadUserAndTemplates}
            leftIcon={<RefreshCw size={16} />}
            id="btn-refresh-workflows"
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setSimStepKey(templateSteps[0]?.stepKey || 'step_1');
              setSimFeedback(null);
              setIsSimulatorOpen(true);
            }}
            leftIcon={<Sliders size={16} />}
            id="btn-open-simulator"
          >
            Step Transition Simulator
          </Button>
        </div>
      </div>

      {/* 2. Critical Legal & Verification Notice */}
      <Alert
        variant="warning"
        title="Candidate Routes Grounded in Source Guides — Statutory Verification Required"
      >
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', lineHeight: 1.5 }}>
          The procedures below are candidate procedural pathways sourced from draft country guides (
          <code>complete_application_procedures/</code>) and <code>docs/COUNTRY_WORKFLOWS.md</code>. They do not constitute
          universal requirements or guaranteed statutory advice. Financial thresholds (e.g. Blocked Account amounts),
          visa queue mechanics, attestation sequences, and intake deadlines are tagged with verification flags and must be
          reviewed against current embassy/consular rules before advising students.
        </p>
      </Alert>

      {/* Notifications */}
      {feedbackSuccess && (
        <Alert variant="success">
          {feedbackSuccess}
        </Alert>
      )}
      {feedbackError && (
        <Alert variant="destructive">
          {feedbackError}
        </Alert>
      )}

      {/* 3. Filters & Controls */}
      <Card style={{ padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <Select
            label="Destination Country"
            id="filter-workflow-country"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            options={COUNTRY_OPTIONS}
          />

          <Select
            label="Degree Level"
            id="filter-workflow-degree"
            value={selectedDegree}
            onChange={(e) => setSelectedDegree(e.target.value)}
            options={[
              { value: 'all', label: 'All Degrees' },
              { value: 'masters', label: "Master's Degree" },
              { value: 'bachelors', label: "Bachelor's Degree" },
            ]}
          />
        </div>
      </Card>

      {/* 4. Main Two-Column Layout: Template List + Active Workflow Canvas */}
      {isLoading ? (
        <LoadingState message="Loading candidate workflow templates..." />
      ) : templates.length === 0 ? (
        <Card style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>No workflow templates found for the selected criteria.</p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(500px, 2fr)', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left Column: Template Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              Candidate Routes ({templates.length})
            </h2>

            {templates.map((tpl) => {
              const isSelected = selectedTemplate?.id === tpl.id;
              const isPublished = tpl.publicationStatus === 'published';
              const cCode = tpl.countryCode.toLowerCase();
              const badgeVariant =
                cCode === 'de' || cCode.includes('germany')
                  ? 'primary'
                  : cCode === 'it' || cCode.includes('italy')
                  ? 'success'
                  : cCode === 'fr' || cCode.includes('france')
                  ? 'info'
                  : 'warning';

              return (
                <div
                  key={tpl.id}
                  id={`tpl-card-${tpl.id}`}
                  onClick={() => handleSelectTemplate(tpl)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectTemplate(tpl);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                    boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.08)' : 'var(--shadow-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease-in-out',
                    outline: 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                      <Badge variant={badgeVariant}>
                        {tpl.countryCode.toUpperCase()}
                      </Badge>
                      <Badge variant="default">{tpl.degreeLevel.toUpperCase()}</Badge>
                      <Badge variant="default">Route: {tpl.applicationRoute}</Badge>
                    </div>

                    <Badge variant={isPublished ? 'success' : 'warning'}>
                      {tpl.publicationStatus.toUpperCase()}
                    </Badge>
                  </div>

                  <h3 style={{ margin: '0 0 0.375rem 0', fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>
                    {tpl.name}
                  </h3>

                  <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.4 }}>
                    {tpl.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <span>Jurisdiction: <strong>{tpl.jurisdiction}</strong></span>
                    <span>Review: <strong style={{ color: tpl.reviewStatus === 'staff_verified' ? '#16a34a' : '#d97706' }}>{tpl.reviewStatus}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Active Workflow Canvas & Step Visualizer */}
          {selectedTemplate && (
            <Card style={{ padding: '1.75rem' }} id="workflow-details-panel">
              {/* Canvas Header */}
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                      <h2 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 700, color: '#0f172a' }}>
                        {selectedTemplate.name}
                      </h2>
                      <Badge variant={selectedTemplate.publicationStatus === 'published' ? 'success' : 'warning'}>
                        {selectedTemplate.publicationStatus.toUpperCase()}
                      </Badge>
                    </div>
                    <p style={{ margin: 0, color: '#475569', fontSize: '0.875rem' }}>
                      {selectedTemplate.description}
                    </p>
                  </div>

                  {/* Actions for Authorized Staff */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenMigrationPreview}
                      leftIcon={<History size={15} />}
                      id="btn-preview-migration"
                    >
                      Preview Case Migration
                    </Button>

                    {isAdmin && (
                      selectedTemplate.publicationStatus === 'published' ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleOpenPublishModal('draft')}
                          id="btn-revert-to-draft"
                        >
                          Revert to Draft
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenPublishModal('published')}
                          leftIcon={<ShieldCheck size={15} />}
                          id="btn-review-and-publish"
                        >
                          Review & Publish
                        </Button>
                      )
                    )}
                  </div>
                </div>

                {/* Provenance Box */}
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.875rem',
                    backgroundColor: '#f1f5f9',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.375rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155', fontWeight: 600 }}>
                    <FileText size={15} color="#0284c7" />
                    <span>Source Guide Provenance:</span>
                    <span style={{ color: '#0369a1', fontFamily: 'monospace' }}>
                      {selectedTemplate.sourceFile || 'docs/COUNTRY_WORKFLOWS.md'}
                    </span>
                  </div>
                  {selectedTemplate.sourceSection && (
                    <div style={{ color: '#64748b' }}>
                      Section: <strong>{selectedTemplate.sourceSection}</strong>
                    </div>
                  )}
                  {selectedTemplate.provenance?.verification_flags && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <span style={{ color: '#b45309', fontWeight: 600 }}>Verification Flags:</span>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {selectedTemplate.provenance.verification_flags.map((flag: string) => (
                          <span
                            key={flag}
                            style={{
                              backgroundColor: '#fef3c7',
                              color: '#92400e',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step Sequence & Dependencies Flow */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 600, color: '#0f172a' }}>
                    Workflow Sequence & Dependency Graph ({templateSteps.length} Candidate Steps)
                  </h3>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                    Non-Linear • Parallel Tasks Enabled • Independent Visa & Academic Outcomes
                  </span>
                </div>

                {isLoadingSteps ? (
                  <LoadingState message="Loading candidate workflow steps..." />
                ) : templateSteps.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No steps configured for this template.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {templateSteps.map((step, idx) => {
                      const outcomeConfig = OUTCOME_TYPE_LABELS[step.targetOutcomeType] || {
                        label: step.targetOutcomeType,
                        color: '#64748b',
                      };

                      return (
                        <div
                          key={step.id || step.stepKey}
                          id={`step-card-${step.stepKey}`}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: 'var(--radius-md)',
                            padding: '1.125rem',
                            backgroundColor: '#ffffff',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.625rem',
                          }}
                        >
                          {/* Step Index & Outcome Pill */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                              <span
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  backgroundColor: '#0f172a',
                                  color: '#ffffff',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                {idx + 1}
                              </span>
                              <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a' }}>
                                {step.title}
                              </h4>
                              <code style={{ fontSize: '0.75rem', color: '#64748b', backgroundColor: '#f8fafc', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>
                                {step.stepKey}
                              </code>
                            </div>

                            <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                              {step.isParallel && (
                                <Badge variant="info">
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Sparkles size={12} /> Parallel Task
                                  </span>
                                </Badge>
                              )}
                              <span
                                style={{
                                  backgroundColor: outcomeConfig.color,
                                  color: '#ffffff',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                }}
                              >
                                {outcomeConfig.label}
                              </span>
                            </div>
                          </div>

                          <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.45 }}>
                            {step.description}
                          </p>

                          {/* Technical & Operational Attributes */}
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                              gap: '0.5rem',
                              fontSize: '0.8125rem',
                              backgroundColor: '#f8fafc',
                              padding: '0.75rem',
                              borderRadius: 'var(--radius-sm)',
                            }}
                          >
                            <div>
                              <span style={{ color: '#64748b' }}>Responsible Actor:</span>{' '}
                              <strong style={{ textTransform: 'capitalize', color: '#0f172a' }}>
                                {step.responsibleActor.replace('_', ' ')}
                              </strong>
                            </div>

                            <div>
                              <span style={{ color: '#64748b' }}>Stage:</span>{' '}
                              <strong style={{ color: '#0f172a' }}>{step.stage}</strong>
                            </div>

                            <div>
                              <span style={{ color: '#64748b' }}>Visibility:</span>{' '}
                              <strong style={{ color: '#0f172a' }}>{step.visibility}</strong>
                            </div>
                          </div>

                          {/* Dependencies & Required Evidence */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.8125rem' }}>
                            {step.dependsOnStepKeys && step.dependsOnStepKeys.length > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ color: '#64748b', fontWeight: 600 }}>Depends on:</span>
                                {step.dependsOnStepKeys.map((dep) => (
                                  <span
                                    key={dep}
                                    style={{
                                      backgroundColor: '#e2e8f0',
                                      color: '#1e293b',
                                      padding: '0.125rem 0.375rem',
                                      borderRadius: '4px',
                                      fontFamily: 'monospace',
                                      fontSize: '0.75rem',
                                    }}
                                  >
                                    {dep}
                                  </span>
                                ))}
                              </div>
                            )}

                            {step.requiredEvidence && step.requiredEvidence.length > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ color: '#64748b', fontWeight: 600 }}>Required Evidence:</span>
                                {step.requiredEvidence.map((ev) => (
                                  <Badge key={ev} variant="default">
                                    {ev}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {step.verificationFlags && step.verificationFlags.length > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                <AlertTriangle size={14} color="#d97706" />
                                <span style={{ color: '#b45309', fontWeight: 600 }}>Review Flags:</span>
                                {step.verificationFlags.map((flag) => (
                                  <span
                                    key={flag}
                                    style={{
                                      backgroundColor: '#fffbeb',
                                      border: '1px solid #fef3c7',
                                      color: '#b45309',
                                      padding: '0.125rem 0.375rem',
                                      borderRadius: '4px',
                                      fontSize: '0.75rem',
                                    }}
                                  >
                                    {flag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL 1: Authorized Review & Publication Modal (Admin Only)
      ========================================================================= */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title={targetPublicationStatus === 'published' ? 'Review & Publish Workflow Template' : 'Revert Workflow Template to Draft'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
            You are changing the publication status of{' '}
            <strong>{selectedTemplate?.name}</strong> to{' '}
            <strong style={{ textTransform: 'uppercase', color: targetPublicationStatus === 'published' ? '#16a34a' : '#d97706' }}>
              {targetPublicationStatus}
            </strong>.
          </p>

          {targetPublicationStatus === 'published' && (
            <div
              style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                padding: '0.875rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                color: '#1e40af',
              }}
            >
              <strong>Administrative Rule:</strong> Publishing a template makes it active for new student case
              instantiations. It will <em>never</em> automatically mutate or silently overwrite existing student cases.
            </div>
          )}

          <Textarea
            label="Publication Audit Summary"
            id="audit-summary-input"
            required
            placeholder="Explain the source verification checks performed (e.g., verified German blocked account amount against BAMF/Auswärtiges Amt update)..."
            value={auditSummary}
            onChange={(e) => setAuditSummary(e.target.value)}
            rows={3}
          />

          {targetPublicationStatus === 'published' && (
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.625rem',
                fontSize: '0.8125rem',
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                id="chk-verify-disclaimer"
                checked={disclaimerConfirmed}
                onChange={(e) => setDisclaimerConfirmed(e.target.checked)}
                style={{ marginTop: '0.1875rem' }}
              />
              <span>
                I confirm this template has been reviewed against current procedural guidelines and contains no statutory claims or promises of guaranteed admissions/visas.
              </span>
            </label>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="outline" onClick={() => setIsPublishModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={targetPublicationStatus === 'published' ? 'primary' : 'destructive'}
              onClick={handleConfirmPublish}
              isLoading={isPublishing}
              id="btn-confirm-publish-action"
            >
              Confirm Status Change
            </Button>
          </div>
        </div>
      </Modal>

      {/* =========================================================================
          MODAL 2: Non-Destructive Case Migration Preview Modal
      ========================================================================= */}
      <Modal
        isOpen={isMigrationModalOpen}
        onClose={() => setIsMigrationModalOpen(false)}
        title="Live Case Migration Preview (Non-Destructive)"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
            Unilistics enforces immutable case versioning. When a template is upgraded, live cases must be previewed
            before applying migrations. Completed student milestones are never deleted or rewritten.
          </p>

          {isLoadingMigration ? (
            <LoadingState message="Calculating non-destructive diff..." />
          ) : migrationPreview ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Diff summary box */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 0.375rem 0', fontSize: '0.875rem', fontWeight: 600, color: '#16a34a' }}>
                    ✓ Completed Steps Preserved ({migrationPreview.completedPreserved.length})
                  </h4>
                  {migrationPreview.completedPreserved.map((s) => (
                    <div key={s.step_key} style={{ fontSize: '0.8125rem', color: '#334155', paddingLeft: '1rem' }}>
                      • {s.title} (<code>{s.step_key}</code>)
                    </div>
                  ))}
                </div>

                <div>
                  <h4 style={{ margin: '0 0 0.375rem 0', fontSize: '0.875rem', fontWeight: 600, color: '#0284c7' }}>
                    + Added Steps ({migrationPreview.addedSteps.length})
                  </h4>
                  {migrationPreview.addedSteps.map((s) => (
                    <div key={s.step_key} style={{ fontSize: '0.8125rem', color: '#334155', paddingLeft: '1rem' }}>
                      • {s.title} (Stage: {s.stage})
                    </div>
                  ))}
                </div>

                <div>
                  <h4 style={{ margin: '0 0 0.375rem 0', fontSize: '0.875rem', fontWeight: 600, color: '#d97706' }}>
                    - Retired / Removed Steps ({migrationPreview.removedSteps.length})
                  </h4>
                  {migrationPreview.removedSteps.map((s) => (
                    <div key={s.step_key} style={{ fontSize: '0.8125rem', color: '#334155', paddingLeft: '1rem' }}>
                      • {s.title} (Previous Status: {s.status})
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <Button variant="primary" onClick={() => setIsMigrationModalOpen(false)}>
                  Close Preview
                </Button>
              </div>
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No migration preview available.</p>
          )}
        </div>
      </Modal>

      {/* =========================================================================
          MODAL 3: Case Step Transition Simulator Modal
      ========================================================================= */}
      <Modal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        title="Workflow Step State Transition Simulator"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
            Simulate the enforcement of step state rules. State transitions to <code>not_applicable</code> or{' '}
            <code>reopened</code> require a mandatory recorded reason (at least 5 characters) for audit trail integrity.
          </p>

          <Select
            label="Step to Transition"
            id="sim-step-select"
            value={simStepKey}
            onChange={(e) => setSimStepKey(e.target.value)}
            options={templateSteps.map((s) => ({ value: s.stepKey, label: `${s.title} (${s.stepKey})` }))}
          />

          <Select
            label="Target Status"
            id="sim-target-status"
            value={simStatus}
            onChange={(e) => setSimStatus(e.target.value)}
            options={[
              { value: 'completed', label: 'Completed' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'needs_action', label: 'Needs Action' },
              { value: 'blocked', label: 'Blocked' },
              { value: 'not_applicable', label: 'Not Applicable (Reason Required)' },
              { value: 'reopened', label: 'Reopened (Reason Required)' },
            ]}
          />

          {(simStatus === 'not_applicable' || simStatus === 'reopened') && (
            <Textarea
              label="Recorded Reason (Minimum 5 characters)"
              id="sim-reason-input"
              required
              placeholder="State the procedural reason why this candidate step is not applicable or being reopened..."
              value={simReason}
              onChange={(e) => setSimReason(e.target.value)}
              rows={2}
            />
          )}

          {simFeedback && (
            <Alert
              variant={simFeedback.includes('rejected') || simFeedback.includes('Error') ? 'destructive' : 'success'}
            >
              {simFeedback}
            </Alert>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="outline" onClick={() => setIsSimulatorOpen(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSimulateStepTransition} id="btn-submit-sim-transition">
              Execute Transition
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, validateClientFileSecurity, FileSecurityValidation, formatUtcInTimezone } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import {
  UploadCloud,
  CheckCircle,
  ShieldCheck,
  ShieldAlert,
  Download,
  RefreshCw,
  Clock,
  Send,
  FileText,
} from 'lucide-react';
import { StudentJourneyNav } from '@/components/layout/StudentJourneyNav';
import { CaseDocument, AuthorizedDownloadTicket, CaseMessage } from '@/types';

const CHECKLIST_CATEGORIES = [
  { value: 'matric_certificate', label: 'Secondary School (Matric) Certificate', group: 'academic' },
  { value: 'fsc_certificate', label: 'Higher Secondary (FSc / Intermediate) Certificate', group: 'academic' },
  { value: 'bachelors_transcript', label: "Bachelor's 8-Semester Consolidated Transcript", group: 'academic' },
  { value: 'bachelors_degree', label: "Bachelor's Degree Scroll", group: 'academic' },
  { value: 'hec_attestation', label: 'HEC Attestation Ticket & QR Stamped Documents', group: 'academic' },
  { value: 'mofa_apostille', label: 'MOFA Apostille Barcode & Stamped Documents', group: 'academic' },
  { value: 'passport_scan', label: 'Passport Bio Pages (Full Color, 4 Corners Visible)', group: 'identity' },
  { value: 'cv_resume', label: 'Curriculum Vitae (Europass / Academic Format)', group: 'identity' },
  { value: 'motivation_letter', label: 'Statement of Purpose / Motivation Letter', group: 'identity' },
  { value: 'recommendation_letter', label: 'Academic / Professional Recommendation Letter', group: 'identity' },
  { value: 'ielts_academic', label: 'IELTS Academic / Language Test Report Form', group: 'identity' },
  { value: 'language_certificate', label: 'German / Italian / French Language Certificate', group: 'identity' },
  { value: 'admission_offer', label: 'University Conditional / Unconditional Offer Letter', group: 'financial' },
  { value: 'blocked_account_proof', label: 'Blocked Account / Financial Guarantee Certificate', group: 'financial' },
  { value: 'visa_application_form', label: 'Embassy National Visa Application Form', group: 'financial' },
  { value: 'embassy_appointment_slip', label: 'Embassy Visa Appointment Confirmation Slip', group: 'financial' },
  { value: 'tuition_receipt', label: 'University Tuition Wire / SWIFT Payment Receipt', group: 'financial' },
  { value: 'other', label: 'Other Supporting Dossier Record', group: 'other' },
];

export const StudentDocumentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active filter tab
  const [activeTab, setActiveTab] = useState<'all' | 'academic' | 'identity' | 'financial'>('all');

  // Modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<CaseDocument | null>(null);
  const [downloadTicket, setDownloadTicket] = useState<AuthorizedDownloadTicket | null>(null);
  const [isLoadingTicket, setIsLoadingTicket] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);

  // Upload Form state
  const [docCategory, setDocCategory] = useState<string>('hec_attestation');
  const [docTitle, setDocTitle] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<FileSecurityValidation | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [scannerSimulation, setScannerSimulation] = useState<'clean' | 'infected' | 'failed'>('clean');

  // Chat state
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatError, setChatError] = useState<string | null>(null);

  // Query student case to retrieve authoritative caseId and counsellor details
  const { data: studentCase } = useQuery({
    queryKey: ['student-overview-case'],
    queryFn: () => api.student.getOverviewCase(),
  });

  const caseId = studentCase?.id || 'case-primary-active';
  const counsellorName = studentCase?.assignedCounsellorName || 'Senior Admissions Advisor';

  // Query documents for current case
  const {
    data: documents = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['student-documents', caseId],
    queryFn: () => api.student.getDocuments(caseId),
  });

  // Query messages for current case
  const { data: messages = [] } = useQuery({
    queryKey: ['student-case-messages', caseId],
    queryFn: () => api.student.getMessages(false, caseId),
  });

  // Message mutation
  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      setChatError(null);
      return api.student.sendMessage({
        caseId,
        content,
      });
    },
    onSuccess: () => {
      setChatMessage('');
      queryClient.invalidateQueries({ queryKey: ['student-case-messages', caseId] });
    },
    onError: (err: any) => {
      setChatError(err?.message || 'Failed to send message.');
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    sendMutation.mutate(chatMessage.trim());
  };

  const handleOpenUpload = (preselectedCategory?: string) => {
    if (preselectedCategory) {
      setDocCategory(preselectedCategory);
      const cat = CHECKLIST_CATEGORIES.find((c) => c.value === preselectedCategory);
      setDocTitle(cat ? cat.label : '');
    } else {
      setDocCategory('hec_attestation');
      setDocTitle('HEC Attestation Ticket & Documents');
    }
    setSelectedFile(null);
    setValidationResult(null);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadError(null);
    setUploadSuccessMessage(null);
    setScannerSimulation('clean');
    setIsUploadOpen(true);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setValidationResult(null);
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
    setUploadSuccessMessage(null);

    // Instant client-side binary header inspection
    const validation = await validateClientFileSecurity(file);
    setValidationResult(validation);

    if (!validation.valid) {
      setUploadError(validation.error || 'Selected file violates security policy.');
    }
  };

  const handleCancelUpload = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError('Upload cancelled by user.');
  };

  const handleStartUpload = async () => {
    if (!selectedFile || !validationResult?.valid) {
      setUploadError('Please select a valid PDF, JPG, or PNG file within size limits.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setUploadError(null);
    setUploadSuccessMessage(null);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const res = await api.documents.uploadDocument({
        caseId,
        documentType: docCategory,
        file: selectedFile,
        title: docTitle || selectedFile.name,
        onProgress: (p) => setUploadProgress(p),
        signal: controller.signal,
        simulateScanResult: scannerSimulation,
      });

      setUploadSuccessMessage(res.message);
      queryClient.invalidateQueries({ queryKey: ['student-documents', caseId] });

      // Reset form after short delay
      setTimeout(() => {
        setIsUploadOpen(false);
        setIsUploading(false);
        setUploadProgress(0);
        setSelectedFile(null);
      }, 1600);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed. File remains quarantined or blocked.');
      setIsUploading(false);
    } finally {
      setAbortController(null);
    }
  };

  const handleViewDocument = async (doc: CaseDocument) => {
    setSelectedDoc(doc);
    setDownloadTicket(null);
    setTicketError(null);
    setIsLoadingTicket(true);

    try {
      const ticket = await api.documents.getAuthorizedDownloadTicket(doc.id, doc.currentVersionNumber);
      setDownloadTicket(ticket);
    } catch (err: any) {
      setTicketError(err.message || 'Could not issue short-lived authorized download ticket.');
    } finally {
      setIsLoadingTicket(false);
    }
  };

  // Filter documents by tab
  const filteredDocuments = documents.filter((doc) => {
    if (activeTab === 'all') return true;
    const cat = CHECKLIST_CATEGORIES.find((c) => c.value === doc.documentType);
    const group = cat?.group || 'other';
    return group === activeTab;
  });

  // Calculate verification counts
  const approvedCount = documents.filter((d) => d.verificationStatus === 'verified' || d.quarantineStatus === 'approved').length;
  const underReviewCount = documents.filter(
    (d) => d.verificationStatus === 'pending' || d.quarantineStatus === 'ready_for_review' || d.quarantineStatus === 'quarantine_scanning' || d.quarantineStatus === 'uploaded_quarantined'
  ).length;
  const needsReplacementCount = documents.filter(
    (d) => d.verificationStatus === 'rejected' || d.quarantineStatus === 'needs_replacement' || d.quarantineStatus === 'rejected' || d.quarantineStatus === 'malware_detected'
  ).length;
  const totalCount = documents.length;
  const percentApproved = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <StudentJourneyNav />
      {/* Editorial Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '9999px',
              backgroundColor: 'var(--surface-recessed, #EDF2E9)',
              color: 'var(--action-primary, #245B42)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              border: '1px solid var(--border-subtle, #E1E8DE)',
            }}
          >
            Verified Document Storage
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
            • Admissions Case Ref: <code style={{ fontWeight: 600, color: 'var(--color-foreground)' }}>{studentCase?.id ? `#${studentCase.id.slice(0, 10).toUpperCase()}` : '#UNI-ACTIVE'}</code>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--color-foreground)' }}>
              Verified Document Vault & Advisory Channel
            </h1>
            <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.9375rem', marginTop: '0.25rem', maxWidth: '720px' }}>
              Upload academic dossiers, track official staff verifications, and coordinate attestation requirements directly with your assigned counsellor.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: '#E8F8F2',
                color: '#065F46',
                border: '1px solid #A7F3D0',
              }}
            >
              <CheckCircle size={14} /> Direct Sync Active
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Bento Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.6fr) minmax(320px, 1fr)',
          gap: '1.75rem',
          alignItems: 'start',
        }}
        className="vault-grid-responsive"
      >
        {/* Left Column: Document Vault */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Upload Official Records Card (Dashed Bento Dropzone matching screen(1).png) */}
          <div
            className="bento-card"
            style={{
              padding: '1.75rem',
              border: '2px dashed #E2DCD5',
              backgroundColor: '#FFFFFF',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease, transform 0.15s ease',
            }}
            onClick={() => handleOpenUpload()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOpenUpload();
              }
            }}
            aria-label="Upload official records to vault"
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                color: 'var(--action-primary, #245B42)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <UploadCloud size={28} />
            </div>

            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-foreground)', marginBottom: '0.375rem' }}>
              Drag & drop official documents here, or <span style={{ color: 'var(--action-primary, #245B42)', textDecoration: 'underline' }}>browse files</span>
            </h3>

            <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', maxWidth: '480px', margin: '0 auto 1.25rem' }}>
              Supported formats: PDF, JPEG, PNG (max 15MB per file). Transcripts and diplomas must be clear, 4-corner visible scans.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['HEC Attestation', 'Matric & FSc', 'Bachelor Transcript', 'IELTS / English', 'Financial Guarantee'].map((item) => (
                <span
                  key={item}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    backgroundColor: '#F9F6F0',
                    border: '1px solid #EBE6DE',
                    color: 'var(--color-foreground-muted)',
                  }}
                >
                  ✓ {item}
                </span>
              ))}
            </div>
          </div>

          {/* Filter Pills Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: activeTab === 'all' ? '#1A1A1A' : '#FFFFFF',
                  color: activeTab === 'all' ? '#FFFFFF' : 'var(--color-foreground-muted)',
                  boxShadow: activeTab === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'inset 0 0 0 1px #EBE6DE',
                  transition: 'all 0.15s ease',
                }}
              >
                All ({documents.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('academic')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: activeTab === 'academic' ? '#1A1A1A' : '#FFFFFF',
                  color: activeTab === 'academic' ? '#FFFFFF' : 'var(--color-foreground-muted)',
                  boxShadow: activeTab === 'academic' ? '0 1px 3px rgba(0,0,0,0.1)' : 'inset 0 0 0 1px #EBE6DE',
                  transition: 'all 0.15s ease',
                }}
              >
                Academic & Transcripts
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('identity')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: activeTab === 'identity' ? '#1A1A1A' : '#FFFFFF',
                  color: activeTab === 'identity' ? '#FFFFFF' : 'var(--color-foreground-muted)',
                  boxShadow: activeTab === 'identity' ? '0 1px 3px rgba(0,0,0,0.1)' : 'inset 0 0 0 1px #EBE6DE',
                  transition: 'all 0.15s ease',
                }}
              >
                Identity & Language
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('financial')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: activeTab === 'financial' ? '#1A1A1A' : '#FFFFFF',
                  color: activeTab === 'financial' ? '#FFFFFF' : 'var(--color-foreground-muted)',
                  boxShadow: activeTab === 'financial' ? '0 1px 3px rgba(0,0,0,0.1)' : 'inset 0 0 0 1px #EBE6DE',
                  transition: 'all 0.15s ease',
                }}
              >
                Financial & Visa
              </button>
            </div>

            <Button
              variant="primary"
              size="sm"
              id="btn-upload-direct"
              leftIcon={<UploadCloud size={14} />}
              onClick={() => handleOpenUpload()}
            >
              Upload Document
            </Button>
          </div>

          {/* Loading / Error states */}
          {isLoading && <LoadingState message="Loading your verified documents from Supabase storage..." />}
          {error && <ErrorState message="Could not load your document vault records." onRetry={() => refetch()} />}

          {/* Empty State with Visual Illustration */}
          {!isLoading && !error && filteredDocuments.length === 0 && (
            <EmptyState
              imageSrc="/images/unilistics/empty_vault.webp"
              title={activeTab === 'all' ? 'Your document vault is ready' : 'No documents in this category'}
              description={
                activeTab === 'all'
                  ? 'Upload your degree transcripts, attestation slips, or language scores to start counsellor review.'
                  : 'You have not uploaded any files under this category yet. Upload a document to continue your dossier verification.'
              }
              actionLabel="Upload First Document"
              onAction={() => handleOpenUpload()}
            />
          )}

          {/* Document List */}
          {!isLoading && !error && filteredDocuments.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {filteredDocuments.map((doc) => {
                const formattedSize = (doc.fileSizeBytes / (1024 * 1024)).toFixed(2) + ' MB';
                const isNeedsReplacement =
                  doc.quarantineStatus === 'needs_replacement' || doc.quarantineStatus === 'rejected' || doc.verificationStatus === 'rejected';
                const isApproved = doc.verificationStatus === 'verified' || doc.quarantineStatus === 'approved';

                return (
                  <div
                    key={doc.id}
                    className="bento-card"
                    style={{
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            backgroundColor: isApproved ? 'rgba(215, 238, 131, 0.2)' : isNeedsReplacement ? 'rgba(239, 68, 68, 0.15)' : 'var(--surface-recessed, #EDF2E9)',
                            color: isApproved ? 'var(--action-primary, #245B42)' : isNeedsReplacement ? '#DC2626' : 'var(--action-primary, #245B42)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <FileText size={22} />
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-foreground)', margin: 0 }}>
                            {doc.title || doc.safeDisplayName || doc.fileName}
                          </h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)', margin: '2px 0 0 0' }}>
                            {doc.safeDisplayName || doc.fileName} • {formattedSize} • v{doc.currentVersionNumber || 1}
                            {doc.verifiedBy && ` • Verified by ${doc.verifiedBy}`}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <StatusBadge status={doc.quarantineStatus || doc.verificationStatus} size="sm" />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDocument(doc)}
                          aria-label={`View ${doc.title}`}
                        >
                          View File
                        </Button>
                      </div>
                    </div>

                    {/* Replacement Note Callout */}
                    {isNeedsReplacement && (
                      <div
                        style={{
                          padding: '0.75rem 1rem',
                          backgroundColor: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ fontSize: '0.8125rem', color: '#DC2626' }}>
                          <strong>Note from Counsellor:</strong>{' '}
                          {doc.replacementInstructions || doc.verificationNotes || 'Document requires re-upload with clear 4-corner scan.'}
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<RefreshCw size={13} />}
                          onClick={() => handleOpenUpload(doc.documentType)}
                        >
                          Upload Fresh Copy
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Compliance & Dossier Overview Bar */}
          {documents.length > 0 && (
            <div
              className="bento-card"
              style={{
                padding: '1.25rem 1.5rem',
                backgroundColor: 'var(--surface-card, #FFFFFF)',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle, #E1E8DE)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-foreground, #19261F)' }}>Dossier Verification Status</span>
                <span style={{ fontWeight: 800, color: 'var(--action-primary, #245B42)' }}>{percentApproved}% Verified</span>
              </div>

              {/* Multi-segment progress bar */}
              <div
                style={{
                  height: '8px',
                  borderRadius: '9999px',
                  backgroundColor: '#F9F6F0',
                  display: 'flex',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${percentApproved}%`,
                    backgroundColor: '#10B981',
                    transition: 'width 0.3s ease',
                  }}
                  title={`${approvedCount} Approved`}
                />
                <div
                  style={{
                    width: `${totalCount > 0 ? (underReviewCount / totalCount) * 100 : 0}%`,
                    backgroundColor: '#3B82F6',
                    transition: 'width 0.3s ease',
                  }}
                  title={`${underReviewCount} Under Review`}
                />
                <div
                  style={{
                    width: `${totalCount > 0 ? (needsReplacementCount / totalCount) * 100 : 0}%`,
                    backgroundColor: '#EF4444',
                    transition: 'width 0.3s ease',
                  }}
                  title={`${needsReplacementCount} Needs Action`}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                  {approvedCount} Approved
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3B82F6' }} />
                  {underReviewCount} In Review
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                  {needsReplacementCount} Flagged for Action
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Contextual Adviser Conversation (matching screen(1).png) */}
        <div
          className="bento-card"
          style={{
            padding: '1.5rem',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            height: 'fit-content',
            position: 'sticky',
            top: '5.5rem',
          }}
        >
          {/* Advisor Card Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle, #E1E8DE)' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--action-primary, #245B42)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1rem',
                border: '2px solid #FFFFFF',
                boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                flexShrink: 0,
              }}
            >
              {counsellorName.charAt(0)}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, margin: 0, color: 'var(--color-foreground, #19261F)' }}>
                  {counsellorName}
                </h3>
                <CheckCircle size={14} style={{ color: 'var(--action-primary, #245B42)' }} />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #58695E)', margin: '2px 0 0 0' }}>
                Assigned Educational Counsellor
              </p>
            </div>
          </div>

          {/* Quick Context Topics */}
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {['⚡ Visa timeline', '📝 SOP feedback', '📅 Live check-in'].map((topic) => (
              <span
                key={topic}
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                  color: 'var(--color-foreground-muted, #58695E)',
                }}
              >
                {topic}
              </span>
            ))}
          </div>

          {/* Messages Thread */}
          <div
            style={{
              maxHeight: '380px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              padding: '0.5rem 0',
            }}
          >
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
                <img
                  src="/images/unilistics/empty_messages.webp"
                  alt=""
                  style={{ width: '80px', height: '80px', objectFit: 'contain', margin: '0 auto 0.75rem', opacity: 0.85 }}
                />
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-foreground, #19261F)' }}>Advisory Channel Open</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #58695E)', margin: '0.25rem 0 0 0' }}>
                  Have a question about document certification or your next deadline? Send a note directly to your counsellor.
                </p>
              </div>
            ) : (
              messages.map((m: CaseMessage) => {
                const isStudent = m.senderRole === 'managed_student' || (m.senderRole as string) === 'student';
                const body = m.messageBody || (m as any).content || '';
                const dateStr = m.createdAt || (m as any).sentAt || new Date().toISOString();
                return (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isStudent ? 'flex-end' : 'flex-start',
                      gap: '0.25rem',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '85%',
                        padding: '0.75rem 1rem',
                        borderRadius: isStudent ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        backgroundColor: isStudent ? 'var(--action-primary, #245B42)' : 'var(--surface-recessed, #EDF2E9)',
                        color: isStudent ? '#FFFFFF' : 'var(--color-foreground, #19261F)',
                        fontSize: '0.8125rem',
                        lineHeight: 1.45,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      }}
                    >
                      {body}
                    </div>

                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-foreground-muted)', padding: '0 4px' }}>
                      {formatUtcInTimezone(dateStr)} • {(m as any).isRead ? 'Delivered' : 'Sent'}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Composer Form */}
          <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {chatError && <Alert variant="destructive" title="Message Error">{chatError}</Alert>}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#F9F6F0',
                borderRadius: '9999px',
                padding: '4px 6px 4px 14px',
                border: '1px solid #EBE6DE',
              }}
            >
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Write a note to your advisor..."
                style={{
                  flex: 1,
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '0.8125rem',
                  outline: 'none',
                  color: 'var(--color-foreground)',
                }}
              />

              <button
                type="submit"
                disabled={!chatMessage.trim() || sendMutation.isPending}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: chatMessage.trim() ? 'var(--action-primary, #245B42)' : '#E5E0D8',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: chatMessage.trim() ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.15s ease',
                  flexShrink: 0,
                }}
                aria-label="Send message to advisor"
              >
                <Send size={15} />
              </button>
            </div>

            <p style={{ fontSize: '0.6875rem', color: 'var(--color-foreground-muted)', textAlign: 'center', margin: 0 }}>
              Official communications are archived for visa verification compliance.
            </p>
          </form>
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => {
          if (!isUploading) setIsUploadOpen(false);
        }}
        title="Upload Required Document to Vault"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
            {isUploading ? (
              <Button variant="destructive" size="sm" onClick={handleCancelUpload}>
                Cancel Upload
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsUploadOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  id="btn-confirm-vault-upload"
                  disabled={!selectedFile || !validationResult?.valid}
                  onClick={handleStartUpload}
                >
                  Upload to Private Vault
                </Button>
              </>
            )}
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label
              htmlFor="doc-category-select"
              style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}
            >
              Checklist Document Category <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <select
              id="doc-category-select"
              value={docCategory}
              disabled={isUploading}
              onChange={(e) => {
                setDocCategory(e.target.value);
                const match = CHECKLIST_CATEGORIES.find((c) => c.value === e.target.value);
                if (match && !docTitle) setDocTitle(match.label);
              }}
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.875rem',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              {CHECKLIST_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="doc-title-input"
              style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}
            >
              Document Display Title (Optional)
            </label>
            <input
              id="doc-title-input"
              type="text"
              value={docTitle}
              disabled={isUploading}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="e.g. HEC Attested Bachelor Degree Scroll"
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.875rem',
              }}
            />
          </div>

          {/* Interactive File Dropzone */}
          <input
            ref={fileInputRef}
            id="file-input-vault"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />

          <div
            onClick={() => {
              if (!isUploading) fileInputRef.current?.click();
            }}
            style={{
              padding: '1.75rem 1rem',
              border: '2px dashed #E2DCD5',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              backgroundColor: selectedFile ? 'rgba(15, 23, 42, 0.02)' : 'var(--color-surface-hover)',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <UploadCloud size={36} style={{ color: 'var(--action-primary, #245B42)', margin: '0 auto 0.5rem' }} />
            <span style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600 }}>
              {selectedFile ? selectedFile.name : 'Click to select PDF or image file'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>
              Allowed types: PDF, JPG, PNG (Max 15MB). Scanned 4-corner documents recommended.
            </span>
          </div>

          {/* Client-Side Signature & Validation Card */}
          {selectedFile && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: validationResult?.valid ? 'rgba(34, 197, 94, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                border: `1px solid ${validationResult?.valid ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                fontSize: '0.8125rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.375rem' }}>
                {validationResult?.valid ? (
                  <>
                    <ShieldCheck size={16} style={{ color: 'var(--color-success)' }} />
                    <span style={{ color: 'var(--color-success)' }}>Binary Header Validated ({validationResult.magicSignature?.toUpperCase()})</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert size={16} style={{ color: 'var(--color-destructive)' }} />
                    <span style={{ color: 'var(--color-destructive)' }}>Security Validation Error</span>
                  </>
                )}
              </div>
              <div>
                <strong>File Size:</strong> {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </div>
            </div>
          )}

          {/* Upload Progress Bar */}
          {isUploading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                <span>Uploading to secure private storage...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'var(--color-surface-hover)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${uploadProgress}%`,
                    height: '100%',
                    backgroundColor: 'var(--action-primary, #245B42)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          )}

          {uploadError && <Alert variant="destructive" title="Upload Failed">{uploadError}</Alert>}
          {uploadSuccessMessage && <Alert variant="success" title="Vault Secure Update">{uploadSuccessMessage}</Alert>}
        </div>
      </Modal>

      {/* Document View & Download Ticket Modal */}
      <Modal
        isOpen={Boolean(selectedDoc)}
        onClose={() => {
          setSelectedDoc(null);
          setDownloadTicket(null);
          setTicketError(null);
        }}
        title={selectedDoc?.title || 'Document Record'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedDoc(null);
                setDownloadTicket(null);
              }}
            >
              Close
            </Button>
            {downloadTicket && (
              <a
                href={downloadTicket.downloadUrl || '#'}
                download={downloadTicket.safeDisplayName}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <Button
                  variant="primary"
                  size="sm"
                  id="btn-authorized-download-file"
                  leftIcon={<Download size={14} />}
                >
                  Download File (120s TTL)
                </Button>
              </a>
            )}
          </div>
        }
      >
        {selectedDoc && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div>
                <span style={{ color: 'var(--color-foreground-muted)', display: 'block' }}>Display Name:</span>
                <strong>{selectedDoc.safeDisplayName || selectedDoc.fileName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-foreground-muted)', display: 'block' }}>Version:</span>
                <strong>v{selectedDoc.currentVersionNumber || 1}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-foreground-muted)', display: 'block' }}>Category:</span>
                <strong style={{ textTransform: 'capitalize' }}>{selectedDoc.documentType.replace(/_/g, ' ')}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-foreground-muted)', display: 'block' }}>Review Status:</span>
                <StatusBadge status={selectedDoc.quarantineStatus || selectedDoc.verificationStatus} size="sm" />
              </div>
            </div>

            {selectedDoc.replacementInstructions && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  color: '#DC2626',
                }}
              >
                <strong>Replacement Action Required by Counsellor:</strong>
                <p style={{ marginTop: '0.25rem', marginBottom: 0 }}>{selectedDoc.replacementInstructions}</p>
              </div>
            )}

            {selectedDoc.verificationNotes && !selectedDoc.replacementInstructions && (
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
                <strong>Staff Reviewer Note:</strong>
                <p style={{ marginTop: '0.25rem', marginBottom: 0 }}>{selectedDoc.verificationNotes}</p>
                {selectedDoc.verifiedBy && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)', display: 'block', marginTop: '0.25rem' }}>
                    Reviewed by {selectedDoc.verifiedBy}
                  </span>
                )}
              </div>
            )}

            {isLoadingTicket && <LoadingState message="Requesting authorized download ticket..." />}
            {ticketError && <Alert variant="destructive" title="Download Blocked">{ticketError}</Alert>}

            {downloadTicket && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(15, 23, 42, 0.03)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem', color: 'var(--action-primary, #245B42)' }}>
                  <Clock size={16} />
                  <span style={{ fontWeight: 700 }}>Authorized Ephemeral Download Ticket</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)', margin: 0 }}>
                  {downloadTicket.securityNotice} This token is short-lived ({downloadTicket.expiresInSeconds}s lifetime)
                  and tied to active case assignment.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

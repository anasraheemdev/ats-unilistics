import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, formatUtcInTimezone } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { Send, ShieldCheck, Paperclip, FileText, Download, X, CheckCircle } from 'lucide-react';
import { CaseMessage, CaseDocument } from '@/types';

export const StudentMessagesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [newMsg, setNewMsg] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Fetch student's case to get authorized caseId
  const { data: studentCase } = useQuery({
    queryKey: ['student-overview-case'],
    queryFn: () => api.student.getOverviewCase(),
  });

  const caseId = studentCase?.id || 'case-primary-active';
  const counsellorName = studentCase?.assignedCounsellorName || 'Senior Admissions Advisor';

  // Fetch messages (student view = false, hides internal staff notes)
  const {
    data: messages = [],
    isLoading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ['student-case-messages', caseId],
    queryFn: () => api.student.getMessages(false, caseId),
  });

  // Fetch student's documents from vault for authorized attachments
  const { data: documents = [] } = useQuery({
    queryKey: ['student-case-documents', caseId],
    queryFn: () => api.documents.getDocuments(caseId),
  });

  // Safe documents eligible for attachment (exclude infected/rejected)
  const eligibleDocs = documents.filter(
    (d: CaseDocument) => d.quarantineStatus !== 'malware_detected' && d.quarantineStatus !== 'rejected'
  );

  const sendMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(null);
      return api.student.sendMessage({
        caseId,
        content: newMsg,
        attachmentDocumentId: selectedDocId || undefined,
      });
    },
    onSuccess: () => {
      setNewMsg('');
      setSelectedDocId('');
      queryClient.invalidateQueries({ queryKey: ['student-case-messages', caseId] });
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || 'Failed to send message.');
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    sendMutation.mutate();
  };

  const handleDownloadAttachment = async (docId: string, fileName: string) => {
    try {
      const ticket = await api.documents.getAuthorizedDownloadTicket(docId);
      setDownloadSuccess(`Authorized download generated for ${fileName} (valid for ${ticket.expiresInSeconds}s).`);
      setTimeout(() => setDownloadSuccess(null), 5000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not generate download ticket.');
    }
  };

  const selectedDoc = eligibleDocs.find((d: CaseDocument) => d.id === selectedDocId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '880px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
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
            Direct Advisory Channel
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
            • Case Ref: <code style={{ fontWeight: 600 }}>{studentCase?.id ? `#${studentCase.id.slice(0, 10).toUpperCase()}` : '#UNI-ACTIVE'}</code>
          </span>
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--color-foreground)', margin: 0 }}>
          Advisory Communications & Dossier Notes
        </h1>
        <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.9375rem', marginTop: '0.25rem', marginBottom: 0 }}>
          Auditable direct correspondence with your assigned educational counsellor. All guidance is permanently recorded.
        </p>
      </div>

      {errorMsg && <Alert variant="destructive" title="Message Error">{errorMsg}</Alert>}
      {downloadSuccess && <Alert variant="success" title="File Ready">{downloadSuccess}</Alert>}

      {/* Main Conversation Bento Card */}
      <div
        className="bento-card"
        style={{
          padding: '2rem',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          minHeight: '520px',
        }}
      >
        {/* Advisor Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid #EBE6DE',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#FFEFEA',
                color: '#B72301',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.125rem',
                border: '2px solid #FFFFFF',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                flexShrink: 0,
              }}
            >
              {counsellorName.charAt(0)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-foreground)', margin: 0 }}>
                  {counsellorName}
                </h3>
                <CheckCircle size={15} style={{ color: '#065F46' }} />
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', margin: '2px 0 0 0' }}>
                Senior Educational Counsellor • Assigned to your dossier
              </p>
            </div>
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '4px 12px',
              borderRadius: '9999px',
              backgroundColor: '#E8F8F2',
              color: '#065F46',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            Active Case Thread
          </span>
        </div>

        {/* Messages Feed */}
        {messagesLoading && <LoadingState message="Loading your correspondence..." />}
        {messagesError && <ErrorState message="Could not load messages." onRetry={() => refetchMessages()} />}

        {!messagesLoading && !messagesError && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              maxHeight: '480px',
              overflowY: 'auto',
              padding: '0.5rem 0',
              flex: 1,
            }}
          >
            {messages.length === 0 ? (
              <EmptyState
                imageSrc="/images/unilistics/empty_messages.webp"
                title="Advisory Channel Open"
                description="Have a question about document certification, admissions deadlines, or visa requirements? Send an inquiry directly to your counsellor below."
              />
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
                      alignSelf: isStudent ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                      gap: '0.25rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        fontSize: '0.75rem',
                        color: 'var(--color-foreground-muted)',
                        justifyContent: isStudent ? 'flex-end' : 'flex-start',
                        padding: '0 4px',
                      }}
                    >
                      {!isStudent && <ShieldCheck size={13} style={{ color: '#065F46' }} />}
                      <strong>{m.senderName}</strong>
                      <span>• {formatUtcInTimezone(dateStr)}</span>
                    </div>

                    <div
                      style={{
                        padding: '0.875rem 1.25rem',
                        borderRadius: isStudent ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                        backgroundColor: isStudent ? '#B72301' : '#F9F6F0',
                        color: isStudent ? '#FFFFFF' : 'var(--color-foreground)',
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.625rem',
                      }}
                    >
                      <div>{body}</div>

                      {/* Authorized Attachment */}
                      {m.attachmentDocumentId && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '12px',
                            backgroundColor: isStudent ? 'rgba(255,255,255,0.18)' : '#FFFFFF',
                            border: isStudent ? '1px solid rgba(255,255,255,0.3)' : '1px solid #EBE6DE',
                            fontSize: '0.75rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: 0 }}>
                            <FileText size={15} />
                            <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {m.attachmentDocumentTitle || m.attachmentFileName || 'Attached Case Document'}
                            </span>
                          </div>

                          <Button
                            variant={isStudent ? 'secondary' : 'outline'}
                            size="sm"
                            onClick={() =>
                              handleDownloadAttachment(
                                m.attachmentDocumentId!,
                                m.attachmentFileName || 'dossier-document.pdf'
                              )
                            }
                            leftIcon={<Download size={12} />}
                          >
                            Download
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Message Composition Form */}
        <form
          onSubmit={handleSend}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            borderTop: '1px solid #EBE6DE',
            paddingTop: '1.25rem',
            marginTop: 'auto',
          }}
        >
          {/* Attachment preview if selected */}
          {selectedDoc && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 1rem',
                backgroundColor: '#F9F6F0',
                borderRadius: '12px',
                border: '1px solid #EBE6DE',
                fontSize: '0.8125rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Paperclip size={14} style={{ color: '#B72301' }} />
                <span>
                  Attached from Vault: <strong>{selectedDoc.title}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocId('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-foreground-muted)' }}
                aria-label="Remove attachment"
              >
                <X size={15} />
              </button>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              backgroundColor: '#F9F6F0',
              borderRadius: '16px',
              padding: '0.75rem 1rem',
              border: '1px solid #EBE6DE',
            }}
          >
            <textarea
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Inquire about attestation status, university deadlines, or blocked account procedures..."
              rows={3}
              style={{
                width: '100%',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '0.875rem',
                outline: 'none',
                color: 'var(--color-foreground)',
                resize: 'none',
                fontFamily: 'inherit',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #EAE5DC' }}>
              {/* Attachment selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label
                  htmlFor="attachment-select"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--color-foreground-muted)', cursor: 'pointer' }}
                >
                  <Paperclip size={14} />
                  <span>Attach Vault Document:</span>
                </label>
                <select
                  id="attachment-select"
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    border: '1px solid #EBE6DE',
                    backgroundColor: '#FFFFFF',
                    maxWidth: '240px',
                  }}
                  aria-label="Select verified document from student vault to attach"
                >
                  <option value="">No attachment</option>
                  {eligibleDocs.map((doc: CaseDocument) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={sendMutation.isPending || !newMsg.trim()}
                className="btn-pill-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '8px 20px',
                  fontSize: '0.875rem',
                  cursor: newMsg.trim() ? 'pointer' : 'not-allowed',
                  opacity: newMsg.trim() ? 1 : 0.6,
                }}
              >
                {sendMutation.isPending ? 'Sending...' : 'Send Message'}
                <Send size={15} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

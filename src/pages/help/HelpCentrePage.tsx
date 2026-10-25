import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, formatUtcInTimezone } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import {
  HelpArticle,
  HelpArticleTopic,
  UserRole,
  AiAssistantMessage,
} from '@/types';
import {
  BookOpen,
  ExternalLink,
  MessageSquare,
  Bot,
  Send,
  HelpCircle,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HelpCentrePageProps {
  currentRole?: UserRole;
}

export function isSafeExternalUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}


export const HelpCentrePage: React.FC<HelpCentrePageProps> = ({ currentRole = 'visitor' }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<HelpArticleTopic | 'all'>('all');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  // AI Assistant state (Feature-flagged)
  const aiConfig = api.aiAssistant.getConfig();
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiHistory, setAiHistory] = useState<AiAssistantMessage[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // 1. Fetch published help articles matching filters
  const {
    data: articles,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['help-articles', searchQuery, selectedCountry, selectedTopic],
    queryFn: () =>
      api.help.searchArticles({
        query: searchQuery,
        countryCode: selectedCountry === 'all' ? undefined : selectedCountry,
        topic: selectedTopic === 'all' ? undefined : selectedTopic,
      }),
  });

  const isManagedStudent = currentRole === 'managed_student';

  const handleAskCounsellor = (contextArticle?: HelpArticle | null) => {
    if (isManagedStudent) {
      navigate('/student/messages', {
        state: {
          prefilledContext: contextArticle
            ? `Inquiry regarding "${contextArticle.title}" (${contextArticle.sourceSection}): `
            : 'Advisory inquiry regarding application procedures: ',
        },
      });
    } else {
      navigate('/support', {
        state: {
          prefilledSubject: contextArticle
            ? `Question regarding ${contextArticle.title}`
            : 'General Application Procedure Inquiry',
          prefilledCategory: 'catalogue',
        },
      });
    }
  };

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || aiLoading) return;
    setAiError(null);
    setAiLoading(true);

    const userMsg: AiAssistantMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: aiQuestion,
      timestamp: new Date().toISOString(),
    };
    setAiHistory((prev) => [...prev, userMsg]);
    const currentQ = aiQuestion;
    setAiQuestion('');

    try {
      const resp = await api.aiAssistant.askQuestion(currentQ, { userRole: currentRole });
      setAiHistory((prev) => [...prev, resp]);
    } catch (err: any) {
      setAiError(err?.message || 'AI helper request failed.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1080px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <BookOpen size={26} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Procedural Help & Knowledge Centre</h1>
          </div>
          <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.9375rem', margin: 0 }}>
            Reviewed procedural guidance for Pakistani students applying to higher education in Germany, France, Italy, and Romania.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => handleAskCounsellor(null)}
          leftIcon={<MessageSquare size={16} />}
        >
          {isManagedStudent ? 'Ask My Assigned Counsellor' : 'Submit Support Inquiry'}
        </Button>
      </div>

      {/* Statutory Source Warning */}
      <Alert variant="warning" title="Authoritative Source Disclaimer">
        The articles in this Help Centre are extracted from reviewed procedural guides. Statutory benchmarks (such as visa financial thresholds, embassy appointment queuing rules, and attestation protocols) are operational guidelines and must be confirmed with your counsellor or official diplomatic missions before submitting files.
      </Alert>

      {/* Search & Filter Bar */}
      <Card padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <Input
            label="Search Knowledge Base & Procedural Guides"
            placeholder="Search procedures, attestation steps, blocked account rules, VPD, Universitaly, or visas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Country Row (Hungary strictly omitted) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-foreground-muted)', minWidth: '70px' }}>
              Country:
            </span>
            {[
              { id: 'all', label: 'All Destinations' },
              { id: 'de', label: 'Germany 🇩🇪' },
              { id: 'fr', label: 'France 🇫🇷' },
              { id: 'it', label: 'Italy 🇮🇹' },
              { id: 'ro', label: 'Romania 🇷🇴' },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCountry(c.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  border: '1px solid',
                  borderColor: selectedCountry === c.id ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: selectedCountry === c.id ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: selectedCountry === c.id ? '#ffffff' : 'var(--color-foreground)',
                  fontSize: '0.8125rem',
                  fontWeight: selectedCountry === c.id ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Topic Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-foreground-muted)', minWidth: '70px' }}>
              Topic:
            </span>
            {[
              { id: 'all', label: 'All Topics' },
              { id: 'attestation', label: 'Attestation & Apostille' },
              { id: 'admissions', label: 'University Admissions & VPD' },
              { id: 'blocked_account', label: 'Blocked Account / Financial Proof' },
              { id: 'pre_enrollment', label: 'Pre-Enrollment (Universitaly / EEF)' },
              { id: 'visa_processing', label: 'Visa Execution' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTopic(t.id as any)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  border: '1px solid',
                  borderColor: selectedTopic === t.id ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: selectedTopic === t.id ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  color: selectedTopic === t.id ? 'var(--color-primary)' : 'var(--color-foreground)',
                  fontSize: '0.75rem',
                  fontWeight: selectedTopic === t.id ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Results Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
            Reviewed Procedural Articles ({articles?.length || 0})
          </h2>
        </div>

        {isLoading ? (
          <LoadingState message="Searching verified knowledge base..." />
        ) : error ? (
          <ErrorState message="Could not load help articles." onRetry={() => refetch()} />
        ) : (articles || []).length === 0 ? (
          <Card padding="lg" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <HelpCircle size={40} style={{ margin: '0 auto 1rem', color: 'var(--color-foreground-muted)' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>No Reviewed Articles Match Your Criteria</h3>
            <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.875rem', maxWidth: '480px', margin: '0.5rem auto 1.5rem' }}>
              We could not find published guidance matching "{searchQuery}". Unpublished internal guide drafts are strictly excluded to prevent procedural misinformation.
            </p>
            <Button variant="primary" onClick={() => handleAskCounsellor(null)} leftIcon={<MessageSquare size={16} />}>
              {isManagedStudent ? 'Ask My Assigned Counsellor' : 'Submit Support Inquiry'}
            </Button>
          </Card>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {(articles || []).map((art) => (
              <Card
                key={art.id}
                padding="md"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onClick={() => setSelectedArticle(art)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                      <Badge variant="primary" size="sm">
                        {art.countryCode === 'all' ? 'All EU' : art.countryCode.toUpperCase()}
                      </Badge>
                      <Badge variant={art.verificationStatus === 'verified' ? 'success' : 'warning'} size="sm">
                        {art.verificationStatus === 'verified' ? 'Verified' : 'Provisional'}
                      </Badge>
                      {art.isStale && (
                        <Badge variant="destructive" size="sm">
                          Review Stale (&gt;180d)
                        </Badge>
                      )}
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-foreground-muted)' }}>
                      v{art.version}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0, color: 'var(--color-foreground)' }}>
                    {art.title}
                  </h3>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', lineHeight: 1.5, margin: 0 }}>
                    {art.summary}
                  </p>
                </div>

                <div
                  style={{
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--color-border)',
                    fontSize: '0.6875rem',
                    color: 'var(--color-foreground-muted)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                    {art.sourceSection}
                  </span>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Read Article &rarr;</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Feature-Flagged AI Assistant Subsystem */}
      <Card padding="lg" style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Bot size={20} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>
              Grounded AI Guide Assistant (Feature-Flagged)
            </h3>
          </div>
          <Badge variant={aiConfig.enabled ? 'success' : 'default'} size="sm">
            {aiConfig.enabled ? 'Enabled' : 'Disabled (Default Policy)'}
          </Badge>
        </div>

        {!aiConfig.enabled ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Alert variant="info" title="Autonomous Agent Restriction">
              {aiConfig.blockerReason}
            </Alert>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', margin: 0 }}>
              Platform operating contracts strictly forbid autonomous agent speculation on statutory matters. All applicants are routed to reviewed articles above and direct human counsellor support.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', margin: 0 }}>
              Server-side retrieval strictly grounded in published, reviewed guide sections. Does not modify application state or process student files. Rate limit: 5 queries/hour.
            </p>

            {aiError && <Alert variant="destructive">{aiError}</Alert>}

            {/* Conversation Log */}
            {aiHistory.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.875rem',
                  maxHeight: '320px',
                  overflowY: 'auto',
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-surface-hover)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {aiHistory.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      padding: '0.625rem 0.875rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: m.sender === 'user' ? 'var(--color-primary)' : 'var(--color-surface)',
                      color: m.sender === 'user' ? '#ffffff' : 'var(--color-foreground)',
                      fontSize: '0.8125rem',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                    {m.citedArticles && m.citedArticles.length > 0 && (
                      <div style={{ marginTop: '0.5rem', paddingTop: '0.375rem', borderTop: '1px solid var(--color-border)', fontSize: '0.6875rem' }}>
                        <strong>Citations:</strong>
                        <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0 }}>
                          {m.citedArticles.map((c, i) => (
                            <li key={i}>
                              {c.title} — <em>{c.sourceSection}</em>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {m.requiresHumanEscalation && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <Button variant="outline" size="sm" onClick={() => handleAskCounsellor(null)}>
                          {isManagedStudent ? 'Ask My Counsellor' : 'Contact Support'}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* AI Input Form */}
            <form onSubmit={handleAskAi} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Input
                  label="Question for Guide Assistant"
                  placeholder="Ask procedural questions (e.g. What is the German blocked account threshold?)..."
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  disabled={aiLoading}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <Button type="submit" variant="primary" disabled={aiLoading || !aiQuestion.trim()} rightIcon={<Send size={15} />}>
                  {aiLoading ? 'Retrieving...' : 'Ask'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </Card>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setSelectedArticle(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '720px',
              width: '100%',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxShadow: 'var(--shadow-xl)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                  <Badge variant="primary" size="sm">
                    {selectedArticle.countryCode === 'all' ? 'All EU' : selectedArticle.countryCode.toUpperCase()}
                  </Badge>
                  <Badge variant={selectedArticle.verificationStatus === 'verified' ? 'success' : 'warning'} size="sm">
                    {selectedArticle.verificationStatus === 'verified' ? 'Verified Statutory Policy' : 'Provisional Draft'}
                  </Badge>
                  {selectedArticle.isStale && (
                    <Badge variant="destructive" size="sm">
                      Review Stale (&gt;180 Days)
                    </Badge>
                  )}
                  <Badge variant="default" size="sm">
                    v{selectedArticle.version}
                  </Badge>
                </div>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 800, margin: 0 }}>
                  {selectedArticle.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-foreground-muted)' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Summary */}
            <div
              style={{
                padding: '0.875rem 1rem',
                backgroundColor: 'rgba(56, 189, 248, 0.08)',
                borderLeft: '4px solid var(--color-primary)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                lineHeight: 1.5,
              }}
            >
              {selectedArticle.summary}
            </div>

            {/* Sanitized Content */}
            <div
              style={{
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: 'var(--color-foreground)',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
              }}
            >
              {selectedArticle.content}
            </div>

            {/* Metadata Footer */}
            <div
              style={{
                padding: '0.875rem',
                backgroundColor: 'var(--color-surface-hover)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.375rem',
                color: 'var(--color-foreground-muted)',
              }}
            >
              <div>
                <strong>Source Material:</strong> {selectedArticle.sourceFile}
              </div>
              <div>
                <strong>Guide Section:</strong> {selectedArticle.sourceSection}
              </div>
              {selectedArticle.lastReviewedAt && (
                <div>
                  <strong>Last Editorial Review:</strong> {formatUtcInTimezone(selectedArticle.lastReviewedAt)}
                </div>
              )}
              {selectedArticle.officialSourceUrl && isSafeExternalUrl(selectedArticle.officialSourceUrl) && (
                <div style={{ marginTop: '0.25rem' }}>
                  <a
                    href={selectedArticle.officialSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'var(--color-primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <span>Official Authority Reference</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            {/* Statutory Disclaimer */}
            <Alert variant="warning" title="Statutory Verification Notice">
              Rules and financial thresholds are subject to consular updates. Never make bank transfers or attestation filings without counsellor confirmation.
            </Alert>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <Button variant="outline" size="sm" onClick={() => setSelectedArticle(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAskCounsellor(selectedArticle)}
                leftIcon={<MessageSquare size={14} />}
              >
                {isManagedStudent ? 'Ask My Counsellor About This' : 'Submit Support Inquiry'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

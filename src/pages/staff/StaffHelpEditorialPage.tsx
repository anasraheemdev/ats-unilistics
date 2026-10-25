import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, formatUtcInTimezone } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import {
  HelpArticle,
  HelpArticleEditorialStatus,
  HelpArticleTopic,
  HelpArticleVerificationStatus,
} from '@/types';
import {
  PlusCircle,
  Edit3,
  CheckCircle2,
  Archive,
  X,
} from 'lucide-react';

export const StaffHelpEditorialPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<HelpArticleEditorialStatus | 'all'>('all');
  const [editingArticle, setEditingArticle] = useState<Partial<HelpArticle> | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCountry, setFormCountry] = useState<'de' | 'fr' | 'it' | 'ro' | 'all'>('de');
  const [formTopic, setFormTopic] = useState<HelpArticleTopic>('attestation');
  const [formStage, setFormStage] = useState('');
  const [formDocCat, setFormDocCat] = useState('');
  const [formSourceSection, setFormSourceSection] = useState('');
  const [formOfficialUrl, setFormOfficialUrl] = useState('');
  const [formVerification, setFormVerification] = useState<HelpArticleVerificationStatus>('provisional');
  const [formEditorialStatus, setFormEditorialStatus] = useState<HelpArticleEditorialStatus>('draft');

  // Fetch articles for staff editorial overview
  const {
    data: articles,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['editorial-help-articles', statusFilter],
    queryFn: () =>
      api.help.listEditorialArticles({
        status: statusFilter === 'all' ? undefined : statusFilter,
      }),
  });

  const editorialMutation = useMutation({
    mutationFn: async ({ articleId, action }: { articleId: string; action: any }) => {
      return api.help.manageEditorial({ articleId, action });
    },
    onSuccess: (_, vars) => {
      setFeedbackMsg({
        type: 'success',
        text: `Article status updated to ${vars.action === 'publish' ? 'published' : vars.action}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['editorial-help-articles'] });
      setTimeout(() => setFeedbackMsg(null), 4000);
    },
    onError: (err: any) => {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Failed to update editorial status.' });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      return api.help.upsertArticle({
        id: editingArticle?.id,
        title: formTitle,
        slug: formSlug || formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        summary: formSummary,
        content: formContent,
        countryCode: formCountry,
        topic: formTopic,
        stageApplicability: formStage || null,
        documentCategoryApplicability: formDocCat || null,
        sourceSection: formSourceSection,
        officialSourceUrl: formOfficialUrl || null,
        verificationStatus: formVerification,
        editorialStatus: formEditorialStatus,
      });
    },
    onSuccess: () => {
      setFeedbackMsg({ type: 'success', text: 'Help article saved successfully.' });
      setIsEditorOpen(false);
      queryClient.invalidateQueries({ queryKey: ['editorial-help-articles'] });
      setTimeout(() => setFeedbackMsg(null), 4000);
    },
    onError: (err: any) => {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Failed to save help article.' });
    },
  });

  const openEditor = (article?: HelpArticle) => {
    if (article) {
      setEditingArticle(article);
      setFormTitle(article.title);
      setFormSlug(article.slug);
      setFormSummary(article.summary);
      setFormContent(article.content);
      setFormCountry(article.countryCode);
      setFormTopic(article.topic);
      setFormStage(article.stageApplicability || '');
      setFormDocCat(article.documentCategoryApplicability || '');
      setFormSourceSection(article.sourceSection);
      setFormOfficialUrl(article.officialSourceUrl || '');
      setFormVerification(article.verificationStatus);
      setFormEditorialStatus(article.editorialStatus);
    } else {
      setEditingArticle(null);
      setFormTitle('');
      setFormSlug('');
      setFormSummary('');
      setFormContent('');
      setFormCountry('de');
      setFormTopic('attestation');
      setFormStage('');
      setFormDocCat('');
      setFormSourceSection('');
      setFormOfficialUrl('');
      setFormVerification('provisional');
      setFormEditorialStatus('draft');
    }
    setIsEditorOpen(true);
  };

  const staleCount = (articles || []).filter((a) => a.isStale).length;
  const unverifiedCount = (articles || []).filter((a) => a.verificationStatus !== 'verified').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Help Centre Editorial Desk</h1>
            <Badge variant="primary" size="sm">
              Staff Knowledge Management
            </Badge>
          </div>
          <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.875rem', margin: 0 }}>
            Curate, review, verify, and publish statutory guidance from the four national higher education procedural guides.
          </p>
        </div>

        <Button variant="primary" onClick={() => openEditor()} leftIcon={<PlusCircle size={16} />}>
          New Knowledge Article
        </Button>
      </div>

      {/* Warnings & Integrity Alerts */}
      {(staleCount > 0 || unverifiedCount > 0) && (
        <Alert variant="warning" title="Editorial Review Alerts">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8125rem' }}>
            {staleCount > 0 && (
              <span>
                <strong>{staleCount} article(s)</strong> have not undergone editorial review in the last 180 days. Please verify statutory fee benchmarks and waitlist rules.
              </span>
            )}
            {unverifiedCount > 0 && (
              <span>
                <strong>{unverifiedCount} article(s)</strong> are marked as provisional or unverified draft material. Ensure official authority verification before relying on them for case advisory decisions.
              </span>
            )}
          </div>
        </Alert>
      )}

      {feedbackMsg && (
        <Alert variant={feedbackMsg.type === 'success' ? 'success' : 'destructive'}>
          {feedbackMsg.text}
        </Alert>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All Articles' },
          { id: 'draft', label: 'Drafts' },
          { id: 'in_review', label: 'In Review' },
          { id: 'published', label: 'Published' },
          { id: 'archived', label: 'Archived' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id as any)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid',
              borderColor: statusFilter === tab.id ? 'var(--action-primary)' : 'var(--border-subtle)',
              backgroundColor: statusFilter === tab.id ? 'rgba(36, 91, 66, 0.08)' : 'var(--surface-card)',
              color: statusFilter === tab.id ? 'var(--action-primary)' : 'var(--color-foreground)',
              fontWeight: statusFilter === tab.id ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Article List Table */}
      <Card padding="none" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '2rem' }}>
            <LoadingState message="Loading editorial desk catalog..." />
          </div>
        ) : error ? (
          <div style={{ padding: '2rem' }}>
            <ErrorState message="Could not load editorial articles." onRetry={() => refetch()} />
          </div>
        ) : (articles || []).length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-foreground-muted)' }}>
            No articles found matching the current editorial filter.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-surface-hover)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Article Title & Section</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Country</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Topic</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Verification</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Last Reviewed</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(articles || []).map((art) => (
                  <tr key={art.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-foreground)' }}>{art.title}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-foreground-muted)', marginTop: '0.125rem' }}>
                        {art.sourceSection} (v{art.version})
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <Badge variant="primary" size="sm">
                        {art.countryCode.toUpperCase()}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textTransform: 'capitalize' }}>
                      {art.topic.replace(/_/g, ' ')}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <Badge
                        variant={
                          art.editorialStatus === 'published'
                            ? 'success'
                            : art.editorialStatus === 'in_review'
                            ? 'warning'
                            : art.editorialStatus === 'archived'
                            ? 'destructive'
                            : 'default'
                        }
                        size="sm"
                      >
                        {art.editorialStatus.toUpperCase()}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <Badge variant={art.verificationStatus === 'verified' ? 'success' : 'warning'} size="sm">
                        {art.verificationStatus}
                      </Badge>
                      {art.isStale && (
                        <span style={{ display: 'block', fontSize: '0.625rem', color: '#ef4444', fontWeight: 700, marginTop: '2px' }}>
                          STALE &gt;180D
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--color-foreground-muted)', fontSize: '0.75rem' }}>
                      {art.lastReviewedAt ? formatUtcInTimezone(art.lastReviewedAt) : 'Never'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                        <Button variant="ghost" size="sm" onClick={() => openEditor(art)} leftIcon={<Edit3 size={13} />}>
                          Edit
                        </Button>

                        {art.editorialStatus !== 'published' && (
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={editorialMutation.isPending}
                            onClick={() =>
                              editorialMutation.mutate({ articleId: art.id, action: 'publish' })
                            }
                            leftIcon={<CheckCircle2 size={13} />}
                          >
                            Publish
                          </Button>
                        )}

                        {art.editorialStatus === 'published' && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={editorialMutation.isPending}
                            onClick={() =>
                              editorialMutation.mutate({ articleId: art.id, action: 'archive' })
                            }
                            leftIcon={<Archive size={13} />}
                          >
                            Archive
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Article Editor Modal */}
      {isEditorOpen && (
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
          onClick={() => setIsEditorOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '780px',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                {editingArticle?.id ? 'Edit Knowledge Article' : 'Draft New Knowledge Article'}
              </h2>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-foreground-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate();
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <Input
                label="Article Title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
                placeholder="e.g. HEC & MOFA Attestation Protocol for Germany"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Select
                  label="Destination Country"
                  value={formCountry}
                  onChange={(e) => setFormCountry(e.target.value as any)}
                  options={[
                    { value: 'de', label: 'Germany' },
                    { value: 'fr', label: 'France' },
                    { value: 'it', label: 'Italy' },
                    { value: 'ro', label: 'Romania' },
                    { value: 'all', label: 'All EU Corridors' },
                  ]}
                />

                <Select
                  label="Topic Category"
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value as any)}
                  options={[
                    { value: 'attestation', label: 'Attestation & Legalization' },
                    { value: 'admissions', label: 'University Admissions & VPD' },
                    { value: 'blocked_account', label: 'Blocked Account / Financial Proof' },
                    { value: 'pre_enrollment', label: 'Pre-Enrollment (Universitaly / EEF)' },
                    { value: 'visa_processing', label: 'Visa Execution' },
                    { value: 'language_proficiency', label: 'Language Benchmarks' },
                    { value: 'general', label: 'General Framework' },
                  ]}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input
                  label="Contextual Workflow Stage Link"
                  value={formStage}
                  onChange={(e) => setFormStage(e.target.value)}
                  placeholder="e.g. attestation, university_admissions, visa_filing"
                />
                <Input
                  label="Contextual Document Category Link"
                  value={formDocCat}
                  onChange={(e) => setFormDocCat(e.target.value)}
                  placeholder="e.g. hec_attestation, blocked_account_proof"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input
                  label="Source Guide Section"
                  value={formSourceSection}
                  onChange={(e) => setFormSourceSection(e.target.value)}
                  placeholder="e.g. Section 3: Educational Document Attestation Protocol"
                  required
                />
                <Input
                  label="Official Source Verification URL"
                  value={formOfficialUrl}
                  onChange={(e) => setFormOfficialUrl(e.target.value)}
                  placeholder="https://www.hec.gov.pk or https://pakistan.diplo.de"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Select
                  label="Verification Quality Status"
                  value={formVerification}
                  onChange={(e) => setFormVerification(e.target.value as any)}
                  options={[
                    { value: 'verified', label: 'Verified Statutory Policy' },
                    { value: 'provisional', label: 'Provisional Draft Guidance' },
                    { value: 'unverified', label: 'Unverified / Draft Benchmark' },
                  ]}
                />

                <Select
                  label="Editorial State"
                  value={formEditorialStatus}
                  onChange={(e) => setFormEditorialStatus(e.target.value as any)}
                  options={[
                    { value: 'draft', label: 'Draft (Internal Only)' },
                    { value: 'in_review', label: 'In Review' },
                    { value: 'published', label: 'Published (Publicly Visible)' },
                    { value: 'archived', label: 'Archived' },
                  ]}
                />
              </div>

              <Textarea
                label="Plain Language Summary"
                value={formSummary}
                onChange={(e) => setFormSummary(e.target.value)}
                required
                rows={2}
                placeholder="Brief high-level explanation visible in search cards and contextual tooltips..."
              />

              <Textarea
                label="Markdown Content (HTML scripts & unsafe links will be sanitized automatically)"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                required
                rows={8}
                placeholder="Full procedural guidance, official steps, and warnings in Markdown..."
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button variant="outline" type="button" onClick={() => setIsEditorOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : 'Save Knowledge Article'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

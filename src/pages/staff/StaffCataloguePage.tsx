import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/common/LoadingState';
import { api } from '@/lib/api';
import {
  University,
  Program,
  Scholarship,
  PublicationStatus,
  CatalogueImportBatch,
  CatalogueImportDryRunResult,
  UserProfile,
  CatalogueCountry,
  CatalogueIntake,
} from '@/types';
import {
  CatalogueEntityType,
  CSV_TEMPLATES,
  downloadCsvTemplate,
  parseCsvText,
  exportToCsvSafely,
  FICTIONAL_DEMO_IMPORT_FIXTURE,
} from '@/lib/catalogueImportExport';
import {
  Upload,
  Download,
  RefreshCw,
  BookOpen,
  GraduationCap,
  Award,
  Layers,
  Calendar,
  Globe,
} from 'lucide-react';

export const StaffCataloguePage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<CatalogueEntityType | 'batches'>('universities');
  const [statusFilter, setStatusFilter] = useState<PublicationStatus | 'all'>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  // Data states
  const [universities, setUniversities] = useState<University[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [intakes, setIntakes] = useState<CatalogueIntake[]>([]);
  const [countries, setCountries] = useState<CatalogueCountry[]>([]);
  const [batches, setBatches] = useState<CatalogueImportBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Notifications
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importType, setImportType] = useState<CatalogueEntityType>('universities');
  const [sourceUrl, setSourceUrl] = useState('');
  const [fetchedDate, setFetchedDate] = useState(new Date().toISOString().split('T')[0]);
  const [importText, setImportText] = useState('');
  const [dryRunResult, setDryRunResult] = useState<CatalogueImportDryRunResult | null>(null);
  const [isProcessingImport, setIsProcessingImport] = useState(false);

  // Destructive Confirmation Modal State
  const [pendingArchiveItem, setPendingArchiveItem] = useState<{ type: CatalogueEntityType; id: string; name: string } | null>(null);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

  useEffect(() => {
    loadUserAndData();
  }, [activeTab, statusFilter]);

  const loadUserAndData = async () => {
    setIsLoading(true);
    setFeedbackError(null);
    try {
      const user = await api.auth.getCurrentUser();
      setCurrentUser(user);

      if (activeTab === 'universities') {
        const data = await api.catalogueAdmin.getAdminUniversities(statusFilter);
        setUniversities(data);
      } else if (activeTab === 'programs') {
        const data = await api.catalogueAdmin.getAdminPrograms(statusFilter);
        setPrograms(data);
      } else if (activeTab === 'scholarships') {
        const data = await api.catalogueAdmin.getAdminScholarships(statusFilter);
        setScholarships(data);
      } else if (activeTab === 'intakes') {
        const data = await api.catalogueAdmin.getAdminIntakes(statusFilter);
        setIntakes(data);
      } else if (activeTab === 'countries') {
        const data = await api.catalogueAdmin.getAdminCountries(statusFilter);
        setCountries(data);
      } else if (activeTab === 'batches') {
        const data = await api.catalogueAdmin.getImportBatches();
        setBatches(data);
      }
    } catch (err: any) {
      setFeedbackError(err?.message || 'Failed to load catalogue records.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (type: CatalogueEntityType, id: string, newStatus: PublicationStatus) => {
    if (!isAdmin) {
      setFeedbackError('Ordinary counsellors cannot edit the global catalogue.');
      return;
    }

    try {
      if (type === 'countries') {
        await api.catalogueAdmin.updateCountryStatus(id, newStatus);
        setFeedbackSuccess(`Country corridor "${id.toUpperCase()}" status updated to "${newStatus}".`);
      } else {
        await api.catalogueAdmin.updatePublicationStatus(type, id, newStatus);
        setFeedbackSuccess(`Status updated to "${newStatus}".`);
      }
      loadUserAndData();
    } catch (err: any) {
      setFeedbackError(err?.message || 'Failed to update publication status.');
    }
  };

  const handleOpenArchiveModal = (type: CatalogueEntityType, id: string, name: string) => {
    setPendingArchiveItem({ type, id, name });
  };

  const handleConfirmArchive = async () => {
    if (!pendingArchiveItem) return;
    try {
      if (pendingArchiveItem.type === 'countries') {
        await api.catalogueAdmin.updateCountryStatus(pendingArchiveItem.id, 'archived');
      } else {
        await api.catalogueAdmin.updatePublicationStatus(pendingArchiveItem.type, pendingArchiveItem.id, 'archived');
      }
      setFeedbackSuccess(`Archived "${pendingArchiveItem.name}". Existing historical cases retain references.`);
      setPendingArchiveItem(null);
      loadUserAndData();
    } catch (err: any) {
      setFeedbackError(err?.message || 'Failed to archive item.');
    }
  };

  const handleDryRun = async () => {
    if (!importText.trim()) {
      setFeedbackError('Please upload a file or paste CSV/JSON rows to validate.');
      return;
    }

    setIsProcessingImport(true);
    setDryRunResult(null);
    setFeedbackError(null);

    try {
      let parsedRows: Record<string, any>[];
      const trimmed = importText.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const json = JSON.parse(trimmed);
        parsedRows = Array.isArray(json) ? json : [json];
      } else {
        parsedRows = parseCsvText(trimmed);
      }

      if (parsedRows.length === 0) {
        throw new Error('No valid records parsed from input.');
      }

      const result = await api.catalogueAdmin.importBatch(importType, sourceUrl, fetchedDate, parsedRows, true);
      setDryRunResult(result);
    } catch (err: any) {
      setFeedbackError(err?.message || 'Validation failed. Please verify syntax.');
    } finally {
      setIsProcessingImport(false);
    }
  };

  const handleApplyImport = async () => {
    if (!dryRunResult || dryRunResult.valid_rows === 0) return;
    setIsProcessingImport(true);
    setFeedbackError(null);

    try {
      let parsedRows: Record<string, any>[];
      const trimmed = importText.trim();
      if (trimmed.startsWith('[')) {
        parsedRows = JSON.parse(trimmed);
      } else {
        parsedRows = parseCsvText(trimmed);
      }

      const result = await api.catalogueAdmin.importBatch(importType, sourceUrl, fetchedDate, parsedRows, false);
      setFeedbackSuccess(
        `Successfully imported ${result.valid_rows} records in "Draft" state. Administrative review is required before publishing.`
      );
      setIsImportModalOpen(false);
      setImportText('');
      setDryRunResult(null);
      loadUserAndData();
    } catch (err: any) {
      setFeedbackError(err?.message || 'Failed to apply import batch.');
    } finally {
      setIsProcessingImport(false);
    }
  };

  const handleLoadFictionalFixture = () => {
    const fixtureData = FICTIONAL_DEMO_IMPORT_FIXTURE[importType];
    setImportText(JSON.stringify(fixtureData, null, 2));
    setSourceUrl('https://www.fictional-academics-sample.de');
  };

  const handleExport = async () => {
    if (!isAdmin) {
      setFeedbackError('Ordinary counsellors cannot bulk export the global catalogue.');
      return;
    }

    try {
      const res = await api.catalogueAdmin.exportCatalogue(activeTab as CatalogueEntityType);
      const headers = CSV_TEMPLATES[activeTab as CatalogueEntityType]?.headers || ['id', 'name'];
      exportToCsvSafely(`unilistics_${activeTab}_export.csv`, headers, res.data);
      setFeedbackSuccess(`Exported ${res.data.length} records safely (protected against formula injection).`);
    } catch (err: any) {
      setFeedbackError(err?.message || 'Failed to export catalogue data.');
    }
  };

  const getStatusBadge = (status: PublicationStatus = 'published') => {
    switch (status) {
      case 'published':
        return <Badge variant="success">Published</Badge>;
      case 'review':
        return <Badge variant="warning">In Review</Badge>;
      case 'draft':
        return <Badge variant="default">Draft</Badge>;
      case 'archived':
        return <Badge variant="destructive">Archived</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Higher Education Catalogue Management
          </h1>
          <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.875rem' }}>
            Curate universities, degree programs, intakes, and scholarships across Germany, France, Italy, and Romania.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {isAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                leftIcon={<Download size={15} />}
                disabled={activeTab === 'batches'}
              >
                Export CSV (Audited)
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsImportModalOpen(true);
                  setDryRunResult(null);
                }}
                leftIcon={<Upload size={15} />}
              >
                Import CSV / JSON
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 2. Counsellor Read-Only Notice Banner */}
      {!isAdmin && (
        <Alert variant="warning" title="Read-Only Catalogue Access">
          Ordinary counsellors have read-only access to the global catalogue. Import, editing, and bulk export require Administrator privileges.
        </Alert>
      )}

      {/* Feedback Messages */}
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

      {/* 3. Entity Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', overflowX: 'auto' }}>
        <button
          type="button"
          onClick={() => setActiveTab('universities')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: activeTab === 'universities' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'universities' ? '#ffffff' : 'var(--color-foreground)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <BookOpen size={16} />
          <span>Universities ({universities.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('programs')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: activeTab === 'programs' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'programs' ? '#ffffff' : 'var(--color-foreground)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <GraduationCap size={16} />
          <span>Programs ({programs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('scholarships')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: activeTab === 'scholarships' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'scholarships' ? '#ffffff' : 'var(--color-foreground)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Award size={16} />
          <span>Scholarships ({scholarships.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('intakes')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: activeTab === 'intakes' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'intakes' ? '#ffffff' : 'var(--color-foreground)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Calendar size={16} />
          <span>Intakes ({intakes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('countries')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: activeTab === 'countries' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'countries' ? '#ffffff' : 'var(--color-foreground)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Globe size={16} />
          <span>Corridors ({countries.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('batches')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: activeTab === 'batches' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'batches' ? '#ffffff' : 'var(--color-foreground)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Layers size={16} />
          <span>Import Batches & Audits</span>
        </button>
      </div>

      {/* 4. Filter Toolbar (Active for catalogue entities) */}
      {activeTab !== 'batches' && (
        <Card padding="sm" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', fontWeight: 600 }}>
              Publication Status:
            </span>
            {(['all', 'draft', 'review', 'published', 'archived'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '0.25rem 0.625rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: statusFilter === st ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: statusFilter === st ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: statusFilter === st ? '#ffffff' : 'var(--color-foreground)',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {st}
              </button>
            ))}
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Select
              label=""
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Corridors' },
                { value: 'germany', label: 'Germany' },
                { value: 'france', label: 'France' },
                { value: 'italy', label: 'Italy' },
                { value: 'romania', label: 'Romania' },
              ]}
              style={{ minWidth: '140px' }}
            />
            <Button variant="ghost" size="sm" onClick={loadUserAndData}>
              <RefreshCw size={14} aria-hidden="true" />
              <span>Refresh</span>
            </Button>
          </div>
        </Card>
      )}

      {/* 5. Main Content Area */}
      {isLoading ? (
        <LoadingState message="Loading catalogue records..." />
      ) : activeTab === 'universities' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {universities.map((uni) => (
            <Card key={uni.id} padding="md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>{uni.name}</h3>
                  {getStatusBadge(uni.publicationStatus)}
                  {uni.isPreview && (
                    <Badge variant="primary" size="sm">
                      Public Preview (Allowlisted)
                    </Badge>
                  )}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
                  {uni.city}, {uni.country?.toUpperCase()} • {uni.institutionalType} • {uni.tuitionBracket}
                  {uni.originalName && ` • Native: ${uni.originalName}`}
                </div>
              </div>

              {isAdmin && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {uni.publicationStatus !== 'published' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStatusChange('universities', uni.id, 'published')}
                    >
                      Publish
                    </Button>
                  )}
                  {uni.publicationStatus === 'draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange('universities', uni.id, 'review')}
                    >
                      Submit Review
                    </Button>
                  )}
                  {uni.publicationStatus !== 'draft' && uni.publicationStatus !== 'archived' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusChange('universities', uni.id, 'draft')}
                    >
                      Revert Draft
                    </Button>
                  )}
                  {uni.publicationStatus !== 'archived' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleOpenArchiveModal('universities', uni.id, uni.name)}
                    >
                      Archive
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : activeTab === 'programs' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {programs.map((prog) => (
            <Card key={prog.id} padding="md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>{prog.title}</h3>
                  {getStatusBadge(prog.publicationStatus)}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
                  {prog.universityName} • {prog.degreeLevel?.toUpperCase()} • Language: {prog.instructionLanguage} • Tuition: €{prog.tuitionPerYearEur || 0}/yr
                </div>
              </div>

              {isAdmin && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {prog.publicationStatus !== 'published' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStatusChange('programs', prog.id, 'published')}
                    >
                      Publish
                    </Button>
                  )}
                  {prog.publicationStatus === 'draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange('programs', prog.id, 'review')}
                    >
                      Submit Review
                    </Button>
                  )}
                  {prog.publicationStatus !== 'archived' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleOpenArchiveModal('programs', prog.id, prog.title)}
                    >
                      Archive
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : activeTab === 'scholarships' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {scholarships.map((sch) => (
            <Card key={sch.id} padding="md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>{sch.title}</h3>
                  {getStatusBadge(sch.publicationStatus)}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
                  Provider: {sch.provider} • Coverage: {sch.coverageType} • Country: {sch.country?.toUpperCase()}
                </div>
              </div>

              {isAdmin && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {sch.publicationStatus !== 'published' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStatusChange('scholarships', sch.id, 'published')}
                    >
                      Publish
                    </Button>
                  )}
                  {sch.publicationStatus !== 'archived' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleOpenArchiveModal('scholarships', sch.id, sch.title)}
                    >
                      Archive
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : activeTab === 'intakes' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {intakes.map((intake) => (
            <Card key={intake.id} padding="md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>
                    {intake.programName || `Intake for Program ${intake.programId.slice(0, 8)}`}
                  </h3>
                  {getStatusBadge(intake.publicationStatus)}
                  <Badge variant="default" size="sm">
                    {intake.season.toUpperCase()} {intake.academicYear}
                  </Badge>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
                  Application Deadline: <strong>{intake.deadlineDate}</strong>
                  {intake.portalOpenDate && ` • Portal Opens: ${intake.portalOpenDate}`}
                </div>
              </div>

              {isAdmin && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {intake.publicationStatus !== 'published' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStatusChange('intakes', intake.id, 'published')}
                    >
                      Publish
                    </Button>
                  )}
                  {intake.publicationStatus === 'draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange('intakes', intake.id, 'review')}
                    >
                      Submit Review
                    </Button>
                  )}
                  {intake.publicationStatus !== 'archived' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleOpenArchiveModal('intakes', intake.id, `${intake.season} ${intake.academicYear}`)}
                    >
                      Archive
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : activeTab === 'countries' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Alert variant="info" title="Destination Corridor Scope">
            Unilistics actively manages application, attestation, and visa tracking for <strong>Germany, France, Italy, and Romania</strong>. Hungary is deferred future scope and strictly disabled.
          </Alert>

          {countries.map((c) => (
            <Card key={c.code} padding="md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>
                    {c.name} ({c.code.toUpperCase()})
                  </h3>
                  {getStatusBadge(c.publicationStatus)}
                  {c.isDeferred ? (
                    <Badge variant="destructive" size="sm">
                      Deferred Future Scope (Disabled)
                    </Badge>
                  ) : (
                    <Badge variant="success" size="sm">
                      Active Corridor
                    </Badge>
                  )}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
                  Corridor Currency: {c.currency} • Attestation Requirements: Verified
                  {c.isDeferred && ' • Statutory Procedure Review Pending'}
                </div>
              </div>

              {isAdmin && !c.isDeferred && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {c.publicationStatus !== 'published' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStatusChange('countries', c.code, 'published')}
                    >
                      Publish
                    </Button>
                  )}
                  {c.publicationStatus !== 'archived' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleOpenArchiveModal('countries', c.code, c.name)}
                    >
                      Archive
                    </Button>
                  )}
                </div>
              )}
              {c.isDeferred && (
                <span style={{ fontSize: '0.75rem', color: 'var(--color-destructive)', fontWeight: 600 }}>
                  Locked per Section 3.1 Contract
                </span>
              )}
            </Card>
          ))}
        </div>
      ) : (
        /* Batches View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Alert variant="info" title="Provenance & Audit History">
            All catalogue imports record provenance including import batch ID, source URL, fetched date, and reviewer ID. A successful import places records in Draft/Review without automatically approving facts.
          </Alert>

          {batches.map((batch) => (
            <Card key={batch.id} padding="md">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                      Batch: {batch.id} ({batch.importType.toUpperCase()})
                    </h3>
                    <Badge variant={batch.status === 'applied' ? 'success' : batch.status === 'failed' ? 'destructive' : 'warning'}>
                      {batch.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', marginTop: '0.25rem' }}>
                    Source URL: {batch.sourceUrl || 'Manual Input'} • Fetched: {batch.fetchedDate} • Created: {new Date(batch.createdAt).toLocaleString()}
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>{batch.validRows} valid</span> /{' '}
                  <span style={{ color: 'var(--color-destructive)', fontWeight: 700 }}>{batch.errorRows} errors</span> (Total: {batch.totalRows})
                </div>
              </div>

              {batch.rowErrors && batch.rowErrors.length > 0 && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--color-destructive-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-destructive-border)' }}>
                  <strong style={{ fontSize: '0.75rem', color: 'var(--color-destructive)' }}>Row-Level Errors Encountered:</strong>
                  <ul style={{ fontSize: '0.75rem', margin: '0.25rem 0 0 1.25rem', color: 'var(--color-foreground)' }}>
                    {batch.rowErrors.slice(0, 5).map((err, i) => (
                      <li key={i}>
                        Row {err.row}: {err.field ? `[${err.field}] ` : ''}{err.error}
                      </li>
                    ))}
                    {batch.rowErrors.length > 5 && <li>...and {batch.rowErrors.length - 5} more errors.</li>}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* 6. CSV / JSON Import Wizard Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Higher Education Catalogue Data"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Alert variant="info" title="Strict Import Invariants">
            Imports are processed within atomic transaction boundaries. Dry run validates schema, references, and deduplication without modifying live catalogue data.
          </Alert>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <Select
              label="Entity Type"
              value={importType}
              onChange={(e) => {
                setImportType(e.target.value as CatalogueEntityType);
                setDryRunResult(null);
              }}
              options={[
                { value: 'universities', label: 'Universities' },
                { value: 'programs', label: 'Degree Programs' },
                { value: 'scholarships', label: 'Scholarships' },
                { value: 'intakes', label: 'Intakes & Deadlines' },
                { value: 'countries', label: 'Country Corridors' },
              ]}
            />

            <Input
              label="Fetched Date"
              type="date"
              value={fetchedDate}
              onChange={(e) => setFetchedDate(e.target.value)}
              required
            />
          </div>

          <Input
            label="Source Provenance URL"
            placeholder="e.g. https://www.hochschulkompass.de/en/universities.html"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            helperText="Public HTTP/HTTPS URL. Local/Internal IP addresses are rejected by SSRF filters."
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Data Payload (CSV or JSON):</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCsvTemplate(importType)}
              >
                Download CSV Template
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoadFictionalFixture}
                style={{ color: 'var(--color-primary)' }}
              >
                Load Fictional Fixture
              </Button>
            </div>
          </div>

          <textarea
            rows={7}
            value={importText}
            onChange={(e) => {
              setImportText(e.target.value);
              setDryRunResult(null);
            }}
            placeholder={`Paste CSV with headers or JSON array here...\n${CSV_TEMPLATES[importType]?.headers.join(',')}`}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontFamily: 'monospace',
              fontSize: '0.8125rem',
            }}
          />

          {/* Dry Run Validation Results */}
          {dryRunResult && (
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: dryRunResult.error_rows === 0 ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                border: `1px solid ${dryRunResult.error_rows === 0 ? 'var(--color-success-border)' : 'var(--color-warning-border)'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Dry Run Validation Summary:</span>
                <span style={{ fontSize: '0.8125rem' }}>
                  <strong>{dryRunResult.valid_rows}</strong> valid / <strong>{dryRunResult.error_rows}</strong> errors (Total: {dryRunResult.total_rows})
                </span>
              </div>

              {dryRunResult.row_errors && dryRunResult.row_errors.length > 0 && (
                <div style={{ maxHeight: '120px', overflowY: 'auto', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  <strong style={{ color: 'var(--color-destructive)' }}>Row Validation Errors:</strong>
                  <ul style={{ margin: '0.25rem 0 0 1.25rem' }}>
                    {dryRunResult.row_errors.map((err, i) => (
                      <li key={i}>
                        Row {err.row}: {err.field ? `[${err.field}] ` : ''}{err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleDryRun}
              disabled={isProcessingImport || !importText.trim()}
            >
              {isProcessingImport && !dryRunResult ? 'Validating...' : 'Dry Run & Validate'}
            </Button>
            <Button
              variant="primary"
              onClick={handleApplyImport}
              disabled={isProcessingImport || !dryRunResult || dryRunResult.valid_rows === 0}
            >
              {isProcessingImport && dryRunResult ? 'Applying...' : `Apply Import (${dryRunResult?.valid_rows || 0} Records)`}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 7. Destructive Action Confirmation Modal */}
      <Modal
        isOpen={Boolean(pendingArchiveItem)}
        onClose={() => setPendingArchiveItem(null)}
        title="Confirm Catalogue Archival"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Alert variant="warning" title="Application Reference Protection">
            Archiving <strong>"{pendingArchiveItem?.name}"</strong> will remove it from active catalogue discovery and search.
            Historical student cases and applications referencing this record will remain intact and will not be broken.
          </Alert>

          <p style={{ fontSize: '0.875rem', color: 'var(--color-foreground-muted)' }}>
            Are you sure you want to transition this record to the <strong>Archived</strong> state?
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="outline" onClick={() => setPendingArchiveItem(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmArchive}>
              Confirm Archival
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

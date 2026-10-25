import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Button } from './Button';

export interface FileUploadProps {
  label: string;
  accept?: string;
  maxSizeBytes?: number; // e.g. 10MB = 10 * 1024 * 1024
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  selectedFile?: File | null;
  selectedFileName?: string;
  uploadProgress?: number; // 0 to 100
  isUploading?: boolean;
  error?: string;
  helperText?: string;
  id?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSizeBytes = 10 * 1024 * 1024,
  onFileSelect,
  onFileRemove,
  selectedFile,
  selectedFileName,
  uploadProgress,
  isUploading = false,
  error: externalError,
  helperText = 'PDF, PNG, or JPEG up to 10MB. Certified official scans only.',
  id,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadId = id || `upload-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  const error = externalError || internalError;

  const validateAndProcess = (file: File) => {
    setInternalError(null);
    if (file.size > maxSizeBytes) {
      setInternalError(`File size exceeds maximum limit of ${(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB.`);
      return;
    }
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcess(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndProcess(file);
    }
  };

  const activeFileName = selectedFile?.name || selectedFileName;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%', marginBottom: '1.25rem' }}>
      <label
        htmlFor={uploadId}
        style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          fontFamily: 'var(--font-family-base)',
          color: 'var(--color-foreground)',
        }}
      >
        {label}
      </label>

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        id={uploadId}
        accept={accept}
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />

      {/* Upload Dropzone Container */}
      {!activeFileName ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`Upload ${label}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1.5rem',
            borderRadius: 'var(--radius-card, 24px)',
            border: `2px dashed ${
              error
                ? 'var(--color-destructive)'
                : isDragOver
                ? 'var(--action-primary)'
                : 'var(--border-refined)'
            }`,
            backgroundColor: isDragOver ? 'var(--surface-selected)' : 'var(--surface-card)',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'border-color var(--transition-fast), background-color var(--transition-fast)',
            outline: 'none',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'var(--surface-recessed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--action-primary)',
              marginBottom: '1rem',
            }}
            aria-hidden="true"
          >
            <UploadCloud size={26} strokeWidth={2} />
          </div>

          <div
            style={{
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'var(--color-foreground)',
              marginBottom: '0.25rem',
            }}
          >
            Choose a file or drag & drop it here
          </div>

          <span
            style={{
              fontSize: '0.8125rem',
              color: 'var(--color-foreground-muted)',
              maxWidth: '380px',
              lineHeight: 1.5,
            }}
          >
            {helperText}
          </span>
        </div>
      ) : (
        /* Selected File Card */
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-control, 16px)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--surface-panel)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--action-primary)',
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              <FileText size={20} strokeWidth={2} />
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--color-foreground)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {activeFileName}
              </div>
              {selectedFile?.size && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {uploadProgress !== undefined && uploadProgress === 100 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  color: 'var(--color-success)',
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={16} /> Ready
              </span>
            )}

            {onFileRemove && !isUploading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInternalError(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                  onFileRemove();
                }}
                aria-label={`Remove file ${activeFileName}`}
                style={{ minHeight: '36px', minWidth: '36px', padding: '0.25rem' }}
              >
                <X size={18} strokeWidth={2} aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {isUploading && uploadProgress !== undefined && (
        <div
          style={{
            width: '100%',
            height: '6px',
            backgroundColor: 'var(--surface-recessed)',
            borderRadius: 'var(--radius-pill)',
            overflow: 'hidden',
            marginTop: '0.375rem',
          }}
          aria-label="Upload progress"
          role="progressbar"
          aria-valuenow={uploadProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            style={{
              width: `${uploadProgress}%`,
              height: '100%',
              backgroundColor: 'var(--action-primary)',
              transition: 'width 200ms ease-out',
            }}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.8125rem',
            color: 'var(--color-destructive)',
            fontWeight: 500,
            marginTop: '0.25rem',
          }}
        >
          <AlertCircle size={14} strokeWidth={2} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

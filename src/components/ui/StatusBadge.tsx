import React from 'react';
import { Badge } from './Badge';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { CaseStage, DocVerificationStatus, TaskStatus, CaseStatus } from '@/types';
import { en } from '@/lib/i18n';

interface StatusBadgeProps {
  status: CaseStage | DocVerificationStatus | TaskStatus | CaseStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const iconSize = size === 'sm' ? 12 : 14;

  switch (status) {
    case 'verified':
    case 'completed':
      return (
        <Badge variant="success" size={size}>
          <CheckCircle2 size={iconSize} aria-hidden="true" />
          <span>{status === 'verified' ? en.status.verified : en.status.completed}</span>
        </Badge>
      );

    case 'pending':
      return (
        <Badge variant="warning" size={size}>
          <Clock size={iconSize} aria-hidden="true" />
          <span>{en.status.pending}</span>
        </Badge>
      );

    case 'in_progress':
      return (
        <Badge variant="info" size={size}>
          <Clock size={iconSize} aria-hidden="true" />
          <span>{en.status.in_progress}</span>
        </Badge>
      );

    case 'blocked':
    case 'rejected':
      return (
        <Badge variant="destructive" size={size}>
          <XCircle size={iconSize} aria-hidden="true" />
          <span>{status === 'rejected' ? en.status.rejected : en.status.blocked}</span>
        </Badge>
      );

    case 'active':
      return (
        <Badge variant="primary" size={size}>
          <ShieldCheck size={iconSize} aria-hidden="true" />
          <span>{en.status.active}</span>
        </Badge>
      );

    case 'on_hold':
      return (
        <Badge variant="warning" size={size}>
          <AlertTriangle size={iconSize} aria-hidden="true" />
          <span>{en.status.on_hold}</span>
        </Badge>
      );

    case 'uploaded_quarantined':
      return (
        <Badge variant="warning" size={size}>
          <Clock size={iconSize} aria-hidden="true" />
          <span>Quarantined</span>
        </Badge>
      );

    case 'quarantine_scanning':
      return (
        <Badge variant="info" size={size}>
          <Clock size={iconSize} aria-hidden="true" />
          <span>Scanning File...</span>
        </Badge>
      );

    case 'ready_for_review':
      return (
        <Badge variant="info" size={size}>
          <FileText size={iconSize} aria-hidden="true" />
          <span>Ready for Review</span>
        </Badge>
      );

    case 'malware_detected':
      return (
        <Badge variant="destructive" size={size}>
          <XCircle size={iconSize} aria-hidden="true" />
          <span>Malware Blocked</span>
        </Badge>
      );

    case 'approved':
      return (
        <Badge variant="success" size={size}>
          <CheckCircle2 size={iconSize} aria-hidden="true" />
          <span>Approved by Staff</span>
        </Badge>
      );

    case 'needs_replacement':
      return (
        <Badge variant="warning" size={size}>
          <AlertTriangle size={iconSize} aria-hidden="true" />
          <span>Needs Replacement</span>
        </Badge>
      );

    default:
      return (
        <Badge variant="default" size={size}>
          <FileText size={iconSize} aria-hidden="true" />
          <span>{status}</span>
        </Badge>
      );
  }
};

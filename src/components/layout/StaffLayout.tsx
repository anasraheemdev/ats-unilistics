import React from 'react';
import { CounsellorLayout } from './CounsellorLayout';
import { AdminLayout } from './AdminLayout';
import { UserRole } from '@/types';

interface StaffLayoutProps {
  currentRole: UserRole;
  onRoleChange: (newRole: UserRole) => void;
}

/**
 * Backward-compatible staff layout resolving to CounsellorLayout or AdminLayout.
 */
export const StaffLayout: React.FC<StaffLayoutProps> = ({ currentRole, onRoleChange }) => {
  if (currentRole === 'counsellor') {
    return <CounsellorLayout currentRole={currentRole} onRoleChange={onRoleChange} />;
  }
  return <AdminLayout currentRole={currentRole} onRoleChange={onRoleChange} />;
};

export default StaffLayout;

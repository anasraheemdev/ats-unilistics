import React from 'react';
import { ExplorerLayout } from './ExplorerLayout';
import { UserRole } from '@/types';

interface DiscoveryLayoutProps {
  currentRole: UserRole;
  onRoleChange: (newRole: UserRole) => void;
}

/**
 * Backward compatibility alias for ExplorerLayout.
 * Consolidates all discovery and catalogue routes onto the unified role-aware shell.
 */
export const DiscoveryLayout: React.FC<DiscoveryLayoutProps> = ({ currentRole, onRoleChange }) => {
  return <ExplorerLayout currentRole={currentRole} onRoleChange={onRoleChange} />;
};

export default DiscoveryLayout;

import React from 'react';
import { en } from '@/lib/i18n';

interface SkipLinkProps {
  targetId?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ targetId = 'main-content' }) => {
  return (
    <a href={`#${targetId}`} className="skip-link">
      {en.app.skipToMain}
    </a>
  );
};
